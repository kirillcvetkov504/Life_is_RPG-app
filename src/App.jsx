import React, { useState, useEffect } from 'react';
import { 
  Zap, ShieldAlert, Calendar, CheckCircle2, Clock, 
  HelpCircle, Plus, Trophy, Crown, Lock, RefreshCw, Trash2
} from 'lucide-react';

// Ссылка на твой сервер на Render (без слэша в конце!)
const API_BASE = "https://rpg-bot-v4s3.onrender.com";
const ADMIN_ID = 1210391242;

const QUESTIONS_16 = [
  "Чем бы я занимался, если бы у меня уже было 100 миллионов долларов?",
  "Что забирает у меня энергию?",
  "Кто в моём окружении тянет меня вниз и почему я это терплю?",
  "Кто в моём окружении заряжает меня энергией и почему я провожу с этими людьми так мало времени?",
  "Что наполняет меня энергией?",
  "В какие моменты жизни я полностью забываю про время?",
  "Что я лично для себя считаю успехом?",
  "Если бы я действительно наплевал на мнение окружающих, чем бы я занимался?",
  "Сколько денег мне на самом деле нужно, чтобы чувствовать себя свободным?",
  "Как выглядит мой идеальный обычный день?",
  "Какое моё убеждение о самом себе мешает мне больше всего?",
  "О чём я буду сожалеть через 10 лет, если не сделаю этого сегодня?",
  "Как выглядит самое простое действие, которое двигает меня вперёд прямо сейчас?",
  "Если бы у меня был всего один час в день для достижения цели, что бы я делал?",
  "Как бы я действовал, если бы знал, что в конце концов всё равно получится?",
  "Какой совет я могу дать самому себе прямо сейчас?"
];

export default function App() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const userId = tg?.initDataUnsafe?.user?.id || ADMIN_ID;

  const [activeTab, setActiveTab] = useState('quests');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    id: userId,
    nickname: "Загрузка...",
    level: 0,
    xp: 0
  });

  const [activeQuest, setActiveQuest] = useState({
    title: "ПРОТОКОЛ ВОСКРЕСЕНЬЯ",
    description: "Выделите время на дисциплину, физическую форму и фокус.",
    tasks: [
      "Интенсивная тренировка (спортзал, бег или 100 отжиманий)",
      "1 час без смартфона (полный фокус на важном деле)",
      "Прочитать 20 страниц книги"
    ],
    xp_reward: 100,
    award_name: "Лидер Протокола",
    award_icon: "🏆"
  });

  const [leaderboard, setLeaderboard] = useState([]);
  const [weeklyDone, setWeeklyDone] = useState(false);
  const [answers, setAnswers] = useState({});
  const [badHabits, setBadHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitMotiv, setNewHabitMotiv] = useState("");
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  // 1. Загрузка данных из БД Neon (через Render API) + резервный кэш
  useEffect(() => {
    tg?.ready();
    tg?.expand();

    // Сначала мгновенно показываем локальный кэш, если есть
    const cached = localStorage.getItem(`godmode_${userId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.user) setCurrentUser(parsed.user);
        if (parsed.weeklyDone !== undefined) setWeeklyDone(parsed.weeklyDone);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.badHabits) setBadHabits(parsed.badHabits);
      } catch (e) {}
    }

    // Затем синхронизируем с облачной БД (чтобы на ПК и телефоне было одно и то же!)
    fetch(`${API_BASE}/api/sync/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setCurrentUser({
            id: userId,
            nickname: data.user.nickname,
            level: data.user.level,
            xp: data.user.xp
          });
          const st = data.user.app_state || {};
          if (st.answers) setAnswers(st.answers);
          if (st.badHabits) setBadHabits(st.badHabits);
        }
        if (data.quest_stat) {
          setWeeklyDone(Boolean(data.quest_stat.weekly_done));
        }
        if (data.active_quest && data.active_quest.title) {
          setActiveQuest(data.active_quest);
        }
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  // Сохранение в облако при изменении привычек или ответов
  const saveStateToCloud = (nextHabits, nextAnswers) => {
    setSyncing(true);
    localStorage.setItem(`godmode_${userId}`, JSON.stringify({
      user: currentUser,
      weeklyDone,
      badHabits: nextHabits,
      answers: nextAnswers
    }));

    fetch(`${API_BASE}/api/sync/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_state",
        app_state: { badHabits: nextHabits, answers: nextAnswers }
      })
    }).finally(() => setSyncing(false));
  };

  // Таймер до воскресенья 10:00 МСК
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const mskNow = new Date(utc + (3600000 * 3));
      const target = new Date(mskNow);
      const day = target.getDay();
      const diffDays = (7 - day) % 7;
      target.setDate(target.getDate() + diffDays);
      target.setHours(10, 0, 0, 0);
      if (target <= mskNow) target.setDate(target.getDate() + 7);

      const diff = target - mskNow;
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Выполнение квеста с сохранением в базу данных
  const handleCompleteQuest = () => {
    if (weeklyDone) return;
    const reward = activeQuest.xp_reward || 100;
    const updatedUser = { ...currentUser, xp: currentUser.xp + reward };

    setWeeklyDone(true);
    setCurrentUser(updatedUser);
    setLeaderboard(prev => prev.map(u => 
      u.telegram_id === userId ? { ...u, quests: (u.quests || 0) + 1, weekly_done: true } : u
    ));

    localStorage.setItem(`godmode_${userId}`, JSON.stringify({
      user: updatedUser,
      weeklyDone: true,
      badHabits,
      answers
    }));

    fetch(`${API_BASE}/api/sync/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete_quest", xp_reward: reward })
    });

    tg?.HapticFeedback?.notificationOccurred('success');
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    const next = [
      ...badHabits,
      { id: Date.now(), name: newHabitName.trim(), start: Date.now(), motivation: newHabitMotiv.trim() }
    ];
    setBadHabits(next);
    setNewHabitName("");
    setNewHabitMotiv("");
    saveStateToCloud(next, answers);
  };

  const handleDeleteHabit = (id) => {
    const next = badHabits.filter(h => h.id !== id);
    setBadHabits(next);
    saveStateToCloud(next, answers);
  };

  const formatTimer = (startTime) => {
    const totalSec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return `${d}д ${h}ч ${m}м`;
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 pb-20 select-none">
      {/* Шапка */}
      <header className="p-4 bg-[#111827] border-b border-emerald-500/20 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-black shadow-lg">
            {currentUser.level}
          </div>
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span>{currentUser.nickname}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                LVL {currentUser.level}
              </span>
            </div>
            <div className="text-xs text-slate-400">{currentUser.xp} XP • SYSTEM PROTOCOL</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">Облако</div>
          <div className="text-xs text-emerald-400 font-bold flex items-center gap-1 justify-end">
            <RefreshCw className={`w-3 h-3 ${syncing || loading ? "animate-spin text-amber-400" : ""}`} />
            {syncing ? "Сохранение..." : "Синхронизировано"}
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        {activeTab === 'quests' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161f30] to-[#0f172a] border border-emerald-500/30 text-center shadow-xl">
              <div className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-1 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" /> До завершения протокола недели:
              </div>
              <div className="text-3xl font-mono font-black tracking-tight text-white py-1">
                {timeLeft.d}д {timeLeft.h}ч {timeLeft.m}м {timeLeft.s}с
              </div>
              <div className="text-[11px] text-slate-400">Воскресенье 10:00 МСК — автоматическое подведение итогов</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    ПРОТОКОЛ НЕДЕЛИ
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">{activeQuest.title}</h2>
                </div>
                <div className="text-2xl p-2 bg-slate-800 rounded-xl border border-slate-700">
                  {activeQuest.award_icon || "🏆"}
                </div>
              </div>
              <p className="text-sm text-slate-300">{activeQuest.description}</p>

              <div className="space-y-2 pt-1">
                {(activeQuest.tasks || []).map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                <span>Награда: <b className="text-amber-400">{activeQuest.award_name || "Герой Недели"}</b></span>
                <span className="text-emerald-400 font-bold">+{activeQuest.xp_reward || 100} XP</span>
              </div>

              <button
                onClick={handleCompleteQuest}
                disabled={weeklyDone}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  weeklyDone
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg shadow-emerald-500/25 active:scale-95"
                }`}
              >
                {weeklyDone ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ПРОТОКОЛ ВЫПОЛНЕН (СОХРАНЕНО В ОБЛАКО)
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    ПОДТВЕРДИТЬ ВЫПОЛНЕНИЕ
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-200">
                <span className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> Состав участников ({leaderboard.length})
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {leaderboard.map((u, i) => (
                  <div 
                    key={u.telegram_id}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                      u.telegram_id === userId 
                        ? "bg-emerald-950/30 border-emerald-500/40" 
                        : "bg-slate-900/40 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 w-5">{i + 1}.</span>
                      <span className="font-bold text-slate-200">{u.nickname}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 rounded">LVL {u.level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{u.quests} вып.</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.weekly_done ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                      }`}>
                        {u.weekly_done ? "Готово" : "Ждем"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'habits' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-4 h-4" /> Контроль дофамина и воздержания
              </h3>
              {badHabits.length === 0 && (
                <div className="text-xs text-slate-500 py-4 text-center">Добавь привычку ниже, чтобы запустить облачный таймер.</div>
              )}
              <div className="space-y-3">
                {badHabits.map(h => (
                  <div key={h.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-white">{h.name}</div>
                      {h.motivation && <div className="text-[11px] text-slate-400">«{h.motivation}»</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-emerald-400 font-bold text-xs bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20">
                        {formatTimer(h.start)}
                      </div>
                      <button onClick={() => handleDeleteHabit(h.id)} className="text-slate-500 hover:text-rose-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <input
                  type="text"
                  placeholder="От чего отказываемся? (например: Сахар / Никотин)"
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Твоя цель (зачем?)"
                  value={newHabitMotiv}
                  onChange={e => setNewHabitMotiv(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <button
                  onClick={handleAddHabit}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Запустить таймер (сохранится в облаке)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workbook' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#111827] border border-emerald-500/30 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-sm text-emerald-400">16 вопросов для калибровки</h2>
                <p className="text-[11px] text-slate-400">Автоматически синхронизируется между твоим ПК и телефоном.</p>
              </div>
              <button
                onClick={() => saveStateToCloud(badHabits, answers)}
                className="px-3 py-1.5 bg-emerald-500 text-black font-bold rounded-lg text-xs"
              >
                Сохранить
              </button>
            </div>

            <div className="space-y-3">
              {QUESTIONS_16.map((q, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400">Вопрос #{i + 1}</div>
                  <div className="text-sm font-semibold text-white">{q}</div>
                  <textarea
                    rows={2}
                    placeholder="Твой ответ..."
                    value={answers[i] || ""}
                    onChange={e => {
                      const next = { ...answers, [i]: e.target.value };
                      setAnswers(next);
                    }}
                    onBlur={() => saveStateToCloud(badHabits, answers)}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="space-y-4">
            {userId !== ADMIN_ID ? (
              <div className="p-8 text-center bg-rose-950/20 border border-rose-500/40 rounded-2xl space-y-3">
                <Lock className="w-12 h-12 text-rose-500 mx-auto" />
                <h2 className="text-lg font-bold text-white">Вы не обладаете необходимыми правами</h2>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#111827] border border-amber-500/40 space-y-3">
                  <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
                    <Crown className="w-4 h-4" /> Управление протоколом недели
                  </h3>
                  <input
                    type="text"
                    value={activeQuest.title}
                    onChange={e => setActiveQuest({ ...activeQuest, title: e.target.value })}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    value={activeQuest.description}
                    onChange={e => setActiveQuest({ ...activeQuest, description: e.target.value })}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      fetch(`${API_BASE}/api/sync/${userId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "admin_update", active_quest: activeQuest })
                      }).then(() => alert("Сохранено в БД для всех игроков!"));
                    }}
                    className="w-full py-2.5 bg-amber-500 text-black font-bold rounded-lg text-xs"
                  >
                    Опубликовать новый протокол в облако
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">Участники (нажми на уровень, чтобы изменить в БД):</h4>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {leaderboard.map(u => (
                      <div key={u.telegram_id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{u.nickname}</div>
                          <div className="text-[10px] text-slate-500">ID: {u.telegram_id}</div>
                        </div>
                        <button
                          onClick={() => {
                            const newLvl = prompt(`Новый уровень для ${u.nickname}:`, u.level);
                            if (newLvl !== null) {
                              const parsedLvl = parseInt(newLvl) || 0;
                              setLeaderboard(prev => prev.map(x => x.telegram_id === u.telegram_id ? { ...x, level: parsedLvl } : x));
                              fetch(`${API_BASE}/api/sync/${userId}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ action: "admin_update", target_id: u.telegram_id, level: parsedLvl })
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-800 rounded text-emerald-400 font-bold"
                        >
                          LVL {u.level} ✏️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 flex justify-around p-2 z-30">
        <button onClick={() => setActiveTab('quests')} className={`flex flex-col items-center p-2 text-xs font-semibold ${activeTab === 'quests' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <Calendar className="w-5 h-5 mb-1" />
          <span>Протокол</span>
        </button>
        <button onClick={() => setActiveTab('habits')} className={`flex flex-col items-center p-2 text-xs font-semibold ${activeTab === 'habits' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <ShieldAlert className="w-5 h-5 mb-1" />
          <span>Привычки</span>
        </button>
        <button onClick={() => setActiveTab('workbook')} className={`flex flex-col items-center p-2 text-xs font-semibold ${activeTab === 'workbook' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <HelpCircle className="w-5 h-5 mb-1" />
          <span>16 Вопросов</span>
        </button>
        <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center p-2 text-xs font-semibold ${activeTab === 'admin' ? 'text-amber-400' : 'text-slate-500'}`}>
          <Crown className="w-5 h-5 mb-1" />
          <span>Создатель</span>
        </button>
      </nav>
    </div>
  );
}
