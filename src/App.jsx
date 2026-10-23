import React, { useState, useEffect } from 'react';
import { 
  Zap, Flame, ShieldAlert, Award, Calendar, CheckCircle2, Clock, 
  HelpCircle, ChevronRight, Activity, Brain, Dumbbell, Users, Plus, 
  Trash2, RefreshCw, Trophy, Crown, Camera, Sparkles, Send, Lock
} from 'lucide-react';

// Твой Telegram ID администратора
const ADMIN_ID = 1210391242;

// 16 вопросов из твоей рабочей тетради
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

// 21 игрок из базы канала со скриншота (стартовый уровень 0)
const INITIAL_LEADERBOARD = [
  { telegram_id: 136817688, nickname: "KirillLER_Admin", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 293711858, nickname: "Andrew555", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 498964039, nickname: "S3rg_01", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 652752102, nickname: "Новобранец #652", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 759057193, nickname: "Новобранец #759", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 850687187, nickname: "казуальный воин маг", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 898567623, nickname: "Новобранец #898", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 1044569384, nickname: "Новобранец #104", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 1072476386, nickname: "Renkr", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 1075973613, nickname: "Euphoria", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 1210391242, nickname: "KirillLER", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 1238518555, nickname: "Новобранец #123", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 1245394414, nickname: "Новобранец #124", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 1568273769, nickname: "Риланор", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 1596901353, nickname: "Новобранец #159", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 5104319032, nickname: "Новобранец #510", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 5118398726, nickname: "Новобранец #511", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 5448273774, nickname: "Новобранец #544", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 6051895639, nickname: "Новобранец #605", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 6302234811, nickname: "Новобранец #630", level: 0, quests: 0, weekly_done: false },
  { telegram_id: 6556671091, nickname: "Panterolla", level: 0, quests: 0, weekly_done: false }
];

export default function App() {
  // Получаем Telegram ID пользователя через WebApp SDK
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const realUserId = tg?.initDataUnsafe?.user?.id || ADMIN_ID;
  const realUserName = tg?.initDataUnsafe?.user?.first_name || "KirillLER";

  const [activeTab, setActiveTab] = useState('quests');
  const [currentUser, setCurrentUser] = useState({
    id: realUserId,
    nickname: realUserName,
    level: 0,
    xp: 0
  });

  // Состояние еженедельного квеста
  const [activeQuest, setActiveQuest] = useState({
    title: "ЭПИЧЕСКИЙ КВЕСТ ВОСКРЕСЕНЬЯ",
    description: "Выделите время на себя и свою прокачку в реальной жизни: спорт, хобби и режим.",
    tasks: [
      "Интенсивная тренировка (спортзал, бег или 100 отжиманий)",
      "1 час без смартфона (полный фокус на важном деле)",
      "Прочитать 20 страниц книги по саморазвитию"
    ],
    xpReward: 100,
    awardName: "Герой Недели",
    awardIcon: "🏆"
  });

  const [leaderboard, setLeaderboard] = useState(INITIAL_LEADERBOARD);
  const [weeklyDone, setWeeklyDone] = useState(false);
  const [answers, setAnswers] = useState({});
  const [badHabits, setBadHabits] = useState([
    { id: 1, name: "Курение / Вейп", start: Date.now() - 3600000 * 54, motivation: "Чистые легкие и выносливость" },
    { id: 2, name: "Думскроллинг Reels/TikTok", start: Date.now() - 3600000 * 18, motivation: "Фокус внимания в моих руках" }
  ]);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitMotiv, setNewHabitMotiv] = useState("");

  // Расчет времени до воскресенья 10:00 по МСК
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    tg?.ready();
    tg?.expand();

    const interval = setInterval(() => {
      const now = new Date();
      // Переводим текущее время в MSK (UTC+3)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const mskNow = new Date(utc + (3600000 * 3));
      
      const target = new Date(mskNow);
      const day = target.getDay(); // 0 - воскресенье
      const diffDays = (7 - day) % 7;
      target.setDate(target.getDate() + diffDays);
      target.setHours(10, 0, 0, 0);

      if (target <= mskNow) {
        target.setDate(target.getDate() + 7);
      }

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

  const handleCompleteQuest = () => {
    if (weeklyDone) return;
    setWeeklyDone(true);
    setCurrentUser(prev => ({
      ...prev,
      xp: prev.xp + activeQuest.xpReward,
      level: Math.floor((prev.xp + activeQuest.xpReward) / 500)
    }));
    setLeaderboard(prev => prev.map(u => 
      u.telegram_id === currentUser.id 
        ? { ...u, quests: u.quests + 1, weekly_done: true, level: Math.floor((u.quests + 1) / 3) } 
        : u
    ));
    tg?.HapticFeedback?.notificationOccurred('success');
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    setBadHabits(prev => [
      ...prev,
      { id: Date.now(), name: newHabitName.trim(), start: Date.now(), motivation: newHabitMotiv.trim() }
    ]);
    setNewHabitName("");
    setNewHabitMotiv("");
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
      {/* Шапка профиля */}
      <header className="p-4 bg-[#111827] border-b border-emerald-500/20 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-black shadow-lg shadow-emerald-500/20">
            {currentUser.level}
          </div>
          <div>
            <div className="font-bold flex items-center gap-1">
              <span>{currentUser.nickname}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                LVL {currentUser.level}
              </span>
            </div>
            <div className="text-xs text-slate-400">{currentUser.xp} XP • Режим GOD MODE</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest">Статус</div>
          <div className="text-xs text-emerald-400 font-bold flex items-center gap-1 justify-end">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </div>
        </div>
      </header>

      {/* Контент вкладок */}
      <main className="p-4 max-w-lg mx-auto">
        {/* ВКЛАДКА 1: КВЕСТЫ */}
        {activeTab === 'quests' && (
          <div className="space-y-4">
            {/* Таймер до воскресенья 10:00 */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161f30] to-[#0f172a] border border-emerald-500/30 text-center shadow-xl">
              <div className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-1 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" /> До подведения итогов квеста:
              </div>
              <div className="text-3xl font-mono font-black tracking-tight text-white py-1">
                {timeLeft.d}д {timeLeft.h}ч {timeLeft.m}м {timeLeft.s}с
              </div>
              <div className="text-[11px] text-slate-400">Каждое воскресенье в 10:00 МСК авто-розыгрыш награды!</div>
            </div>

            {/* Карточка текущего квеста */}
            <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-4 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    ЕЖЕНЕДЕЛЬНЫЙ ВЫЗОВ
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">{activeQuest.title}</h2>
                </div>
                <div className="text-2xl p-2 bg-slate-800 rounded-xl border border-slate-700">
                  {activeQuest.awardIcon}
                </div>
              </div>
              <p className="text-sm text-slate-300">{activeQuest.description}</p>
              
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-slate-400">ЗАДАНИЯ НА ЭТУ НЕДЕЛЮ:</div>
                {activeQuest.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                <span>Награда недели: <b className="text-amber-400">{activeQuest.awardName}</b></span>
                <span className="text-emerald-400 font-bold">+{activeQuest.xpReward} XP</span>
              </div>

              <button
                onClick={handleCompleteQuest}
                disabled={weeklyDone}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  weeklyDone
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95"
                }`}
              >
                {weeklyDone ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    КВЕСТ ВЫПОЛНЕН! ОЖИДАЙТЕ ИТОГОВ
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    ОТМЕТИТЬ ВЫПОЛНЕНИЕ КВЕСТА
                  </>
                )}
              </button>
            </div>

            {/* Рейтинг игроков недели */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-200">
                <span className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> Таблица участников ({leaderboard.length})
                </span>
                <span className="text-xs text-slate-500">Уровень 0</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {leaderboard.map((u, i) => (
                  <div 
                    key={u.telegram_id}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                      u.telegram_id === currentUser.id 
                        ? "bg-emerald-950/30 border-emerald-500/40" 
                        : "bg-slate-900/40 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 w-4">{i + 1}.</span>
                      <span className="font-bold text-slate-200">{u.nickname}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{u.quests} квестов</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.weekly_done ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                      }`}>
                        {u.weekly_done ? "Готово" : "В процессе"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА 2: ПРИВЫЧКИ И АСКЕЗЫ */}
        {activeTab === 'habits' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-4 h-4" /> Таймеры воздержания от вредных привычек
              </h3>
              <div className="space-y-3">
                {badHabits.map(h => (
                  <div key={h.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm text-white">{h.name}</div>
                        <div className="text-[11px] text-slate-400 italic">«{h.motivation}»</div>
                      </div>
                      <div className="font-mono text-emerald-400 font-bold text-sm bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20">
                        {formatTimer(h.start)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Добавить привычку */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <input
                  type="text"
                  placeholder="От какой привычки избавляемся?"
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                />
                <input
                  type="text"
                  placeholder="Мотивация для себя (зачем?)"
                  value={newHabitMotiv}
                  onChange={e => setNewHabitMotiv(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                />
                <button
                  onClick={handleAddHabit}
                  className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Запустить новый счетчик воздержания
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА 3: 16 ВОПРОСОВ ИЗ ТЕТРАДИ */}
        {activeTab === 'workbook' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-slate-900 border border-purple-500/30">
              <h2 className="font-bold text-base text-purple-300">16 неудобных вопросов самому себе</h2>
              <p className="text-xs text-slate-300 mt-1">
                Ответы на эти вопросы формируют твою новую личность и вектор прокачки в GOD MODE.
              </p>
            </div>

            <div className="space-y-3">
              {QUESTIONS_16.map((q, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#111827] border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400">Вопрос #{i + 1}</div>
                  <div className="text-sm font-semibold text-white">{q}</div>
                  <textarea
                    rows={2}
                    placeholder="Ваш честный ответ..."
                    value={answers[i] || ""}
                    onChange={e => setAnswers({ ...answers, [i]: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ВКЛАДКА 4: РАЗРАБОТЧИК (Только для твоего ID 1210391242) */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            {currentUser.id !== ADMIN_ID ? (
              <div className="p-8 text-center bg-rose-950/20 border border-rose-500/40 rounded-2xl space-y-3">
                <Lock className="w-12 h-12 text-rose-500 mx-auto" />
                <h2 className="text-lg font-bold text-white">Вы не обладаете необходимыми правами</h2>
                <p className="text-xs text-slate-400">
                  Этот терминал зарезервирован исключительно для создателя системы (ID: {ADMIN_ID}).
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#111827] border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
                      <Crown className="w-4 h-4" /> Терминал создателя (KirillLER)
                    </h3>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">ID: {ADMIN_ID}</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-xs text-slate-400">Название квеста на неделю:</label>
                    <input
                      type="text"
                      value={activeQuest.title}
                      onChange={e => setActiveQuest({ ...activeQuest, title: e.target.value })}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                    />

                    <label className="text-xs text-slate-400">Награда недели:</label>
                    <input
                      type="text"
                      value={activeQuest.awardName}
                      onChange={e => setActiveQuest({ ...activeQuest, awardName: e.target.value })}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                    />

                    <button
                      onClick={() => alert("Новый квест успешно сохранен и отправлен игрокам!")}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs mt-2"
                    >
                      Сохранить и обновить квест для всех
                    </button>
                  </div>
                </div>

                {/* Управление уровнями 21 игрока */}
                <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">Управление 21 игроком канала:</h4>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {leaderboard.map(u => (
                      <div key={u.telegram_id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{u.nickname}</div>
                          <div className="text-[10px] text-slate-500">ID: {u.telegram_id}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newLvl = prompt(`Задать уровень для ${u.nickname}:`, u.level);
                              if (newLvl !== null) {
                                setLeaderboard(prev => prev.map(x => x.telegram_id === u.telegram_id ? { ...x, level: parseInt(newLvl) || 0 } : x));
                              }
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-emerald-400 font-bold"
                          >
                            LVL {u.level} ✏️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Нижняя навигационная панель Telegram Mini App */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 flex justify-around p-2 z-30">
        <button
          onClick={() => setActiveTab('quests')}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-semibold ${
            activeTab === 'quests' ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span>Квесты</span>
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-semibold ${
            activeTab === 'habits' ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <ShieldAlert className="w-5 h-5 mb-1" />
          <span>Привычки</span>
        </button>

        <button
          onClick={() => setActiveTab('workbook')}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-semibold ${
            activeTab === 'workbook' ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <HelpCircle className="w-5 h-5 mb-1" />
          <span>16 Вопросов</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center p-2 rounded-xl text-xs font-semibold ${
            activeTab === 'admin' ? 'text-amber-400' : 'text-slate-500'
          }`}
        >
          <Crown className="w-5 h-5 mb-1" />
          <span>Создатель</span>
        </button>
      </nav>
    </div>
  );
}
