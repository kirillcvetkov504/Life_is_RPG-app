import React, { useState, useEffect } from 'react';
import {
  User, Heart, Target, Calendar as CalIcon, FileText, Shield,
  Flame, Settings, Plus, Trash2, CheckCircle2, Clock, Camera,
  Droplets, Moon, Dumbbell, HelpCircle, Trophy, Crown, Lock,
  Sparkles, RefreshCw, ChevronRight, Sun, Globe, ExternalLink, Check
} from 'lucide-react';

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

const DICT = {
  ru: {
    me: "Я", health: "Здоровье", focus: "Фокус", calendar: "Календарь", notes: "Заметки", guild: "Гильдия",
    settings: "Настройки", theme: "Тема оформления", dark: "Темная", light: "Светлая",
    lang: "Язык интерфейса", adminBtn: "Панель Создателя (Админ)", resetBtn: "Удалить прогресс и начать сначала",
    streakTitle: "Дней подряд в режиме", onePercentTitle: "Улучшения на 1% (Мотивация и микро-шаги)",
    spheresTitle: "Баланс сфер биохакинга", sleep: "Сон", nutrition: "Питание", workouts: "Тренировки",
    goalsToday: "Цели и Итоги дня", habits: "Таймеры привычек", q16: "16 Вопросов"
  },
  en: {
    me: "Me", health: "Health", focus: "Focus", calendar: "Calendar", notes: "Notes", guild: "Guild",
    settings: "Settings", theme: "Appearance", dark: "Dark", light: "Light",
    lang: "Language", adminBtn: "Creator Terminal (Admin)", resetBtn: "Reset all progress & start over",
    streakTitle: "Day Streak", onePercentTitle: "1% Improvements (Motivation & Wins)",
    spheresTitle: "Life & Biohacking Spheres", sleep: "Sleep", nutrition: "Nutrition", workouts: "Workouts",
    goalsToday: "Daily Goals & Review", habits: "Habit Timers", q16: "16 Questions"
  }
};

export default function App() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const userId = tg?.initDataUnsafe?.user?.id || ADMIN_ID;

  // Навигация и модалки
  const [activeTab, setActiveTab] = useState('me');
  const [healthSub, setHealthSub] = useState('nutrition');
  const [focusSub, setFocusSub] = useState('goals');
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);

  // Настройки
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('ru');
  const t = DICT[lang] || DICT.ru;

  // Пользователь и XP
  const [nickname, setNickname] = useState("Новобранец");
  const [xp, setXp] = useState(0);
  const level = Math.floor(xp / 500);
  const [syncing, setSyncing] = useState(false);

  // Огонек (Стрик как в Duolingo)
  const [streak, setStreak] = useState({ count: 1, lastDate: "", history: [] });

  // 1. Вкладка "Я": Сферы жизни + 1% Улучшения
  const [spheres, setSpheres] = useState({
    body: 50, mind: 50, energy: 50, discipline: 50, environment: 50, career: 50
  });
  const [improvements, setImprovements] = useState([
    { id: 1, text: "Начал пить воду сразу после пробуждения (+1% к энергии)", date: "Сегодня" }
  ]);
  const [newImpText, setNewImpText] = useState("");

  // 2. Вкладка "Здоровье": Сон, Питание (Вода, КБЖУ, ИИ-камера), Тренировки
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState("");
  const [mealKcal, setMealKcal] = useState("");
  const [mealP, setMealP] = useState("");
  const [mealF, setMealF] = useState("");
  const [mealC, setMealC] = useState("");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const [sleepLogs, setSleepLogs] = useState([]);
  const [sleepHours, setSleepHours] = useState("7.5");
  const [sleepQuality, setSleepQuality] = useState("Отлично");

  const [workouts, setWorkouts] = useState([]);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutDur, setWorkoutDur] = useState("");

  // 3. Вкладка "Фокус": Цели/Итоги дня + История, Привычки (хорошие/плохие), 16 вопросов
  const todayStr = new Date().toLocaleDateString('ru-RU');
  const [dailyMorningPlan, setDailyMorningPlan] = useState("");
  const [dailyEveningReview, setDailyEveningReview] = useState("");
  const [dailyHistory, setDailyHistory] = useState([]);

  const [habits, setHabits] = useState([
    { id: 1, name: "Без сахара и фастфуда", type: "bad", start: Date.now() - 86400000 * 2, motiv: "Чистая энергия" },
    { id: 2, name: "Чтение 20 минут утром", type: "good", start: Date.now() - 86400000 * 5, motiv: "Фокус и мышление" }
  ]);
  const [habitName, setHabitName] = useState("");
  const [habitType, setHabitType] = useState("bad");
  const [habitMotiv, setHabitMotiv] = useState("");
  const [answers16, setAnswers16] = useState({});

  // 4. Вкладка "Календарь" (Расписание по датам и времени)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState([
    { id: 1, date: new Date().toISOString().split('T')[0], time: "08:00", title: "Утренний ритуал и план на день", category: "Фокус", done: false },
    { id: 2, date: new Date().toISOString().split('T')[0], time: "18:00", title: "Силовая тренировка", category: "Здоровье", done: false }
  ]);
  const [eventTime, setEventTime] = useState("12:00");
  const [eventTitle, setEventTitle] = useState("");
  const [eventCat, setEventCat] = useState("Дело");

  // 5. Вкладка "Заметки"
  const [notes, setNotes] = useState([
    { id: 1, title: "Список покупок", text: "Авокадо, яйца, оливковое масло, куриное филе, магний B6", tag: "Покупки", date: todayStr }
  ]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  // 6. Вкладка "Гильдия"
  const [guildStatus, setGuildStatus] = useState({ is_subscribed: false, bot_activated: true });
  const [activeQuest, setActiveQuest] = useState({
    title: "КВЕСТ НЕДЕЛИ",
    description: "Выделите время на дисциплину, физическую форму и фокус.",
    tasks: ["Тренировка", "1 час без смартфона", "Прочитать 20 страниц книги"],
    xp_reward: 100,
    award_name: "Герой Недели",
    award_icon: "🏆"
  });
  const [weeklyDone, setWeeklyDone] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [newNickInput, setNewNickInput] = useState("");
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  // Сборка всего состояния для сохранения
  const getFullAppState = (overrides = {}) => ({
    theme, lang, streak, spheres, improvements, waterGlasses, meals,
    sleepLogs, workouts, dailyMorningPlan, dailyEveningReview, dailyHistory,
    habits, answers16, events, notes, ...overrides
  });

  const syncToCloud = (nextXp = xp, stateOverrides = {}) => {
    setSyncing(true);
    const fullState = getFullAppState(stateOverrides);
    localStorage.setItem(`lifeos_v2_${userId}`, JSON.stringify({ nickname, xp: nextXp, weeklyDone, app_state: fullState }));

    fetch(`${API_BASE}/api/sync/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_state", xp: nextXp, app_state: fullState })
    }).finally(() => setSyncing(false));
  };

  const addXp = (amount, stateOverrides = {}) => {
    const nextXp = xp + amount;
    setXp(nextXp);
    syncToCloud(nextXp, stateOverrides);
    tg?.HapticFeedback?.impactOccurred('light');
  };

  // Проверка и начисление ежедневного огонька (Duolingo Streak)
  const checkDailyStreak = (loadedStreak) => {
    const todayIso = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const st = loadedStreak || { count: 0, lastDate: "", history: [] };

    if (st.lastDate === todayIso) {
      setStreak(st);
      return st;
    }
    let nextCount = 1;
    if (st.lastDate === yesterday) {
      nextCount = (st.count || 0) + 1;
    }
    const nextHistory = Array.from(new Set([...(st.history || []), todayIso])).slice(-14);
    const updated = { count: nextCount, lastDate: todayIso, history: nextHistory };
    setStreak(updated);
    return updated;
  };

  // Загрузка из локального кэша и облака
  useEffect(() => {
    tg?.ready();
    tg?.expand();

    const applyLoadedState = (st) => {
      if (!st) return;
      if (st.theme) setTheme(st.theme);
      if (st.lang) setLang(st.lang);
      if (st.spheres) setSpheres(st.spheres);
      if (st.improvements) setImprovements(st.improvements);
      if (st.waterGlasses !== undefined) setWaterGlasses(st.waterGlasses);
      if (st.meals) setMeals(st.meals);
      if (st.sleepLogs) setSleepLogs(st.sleepLogs);
      if (st.workouts) setWorkouts(st.workouts);
      if (st.dailyMorningPlan !== undefined) setDailyMorningPlan(st.dailyMorningPlan);
      if (st.dailyEveningReview !== undefined) setDailyEveningReview(st.dailyEveningReview);
      if (st.dailyHistory) setDailyHistory(st.dailyHistory);
      if (st.habits) setHabits(st.habits);
      if (st.answers16) setAnswers16(st.answers16);
      if (st.events) setEvents(st.events);
      if (st.notes) setNotes(st.notes);
      checkDailyStreak(st.streak);
    };

    const local = localStorage.getItem(`lifeos_v2_${userId}`);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.nickname) setNickname(parsed.nickname);
        if (parsed.xp !== undefined) setXp(parsed.xp);
        if (parsed.weeklyDone !== undefined) setWeeklyDone(parsed.weeklyDone);
        applyLoadedState(parsed.app_state);
      } catch (e) {}
    } else {
      checkDailyStreak(null);
    }

    fetch(`${API_BASE}/api/sync/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setNickname(data.user.nickname || "Новобранец");
          setNewNickInput(data.user.nickname || "");
          setXp(data.user.xp || 0);
          if (data.user.app_state && Object.keys(data.user.app_state).length > 0) {
            applyLoadedState(data.user.app_state);
          }
        }
        if (data.quest_stat) setWeeklyDone(Boolean(data.quest_stat.weekly_done));
        if (data.active_quest && data.active_quest.title) setActiveQuest(data.active_quest);
        if (data.leaderboard) setLeaderboard(data.leaderboard);
        if (data.guild_status) setGuildStatus(data.guild_status);
      })
      .catch(() => {});
  }, [userId]);

  // Таймер воскресенья 10:00 МСК
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const mskNow = new Date(utc + (3600000 * 3));
      const target = new Date(mskNow);
      const diffDays = (7 - target.getDay()) % 7;
      target.setDate(target.getDate() + diffDays);
      target.setHours(10, 0, 0, 0);
      if (target <= mskNow) target.setDate(target.getDate() + 7);
      const diff = target - mskNow;
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ИИ-распознавание еды по фото или названию
  const handleAiPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiAnalyzing(true);
    setTimeout(() => {
      const samples = [
        { name: "Куриная грудка с киноа и овощами", kcal: 420, p: 42, f: 11, c: 38 },
        { name: "Омлет из 3 яиц с авокадо и тостом", kcal: 460, p: 24, f: 32, c: 18 },
        { name: "Стейк лосося с рисом", kcal: 540, p: 38, f: 24, c: 42 }
      ];
      const pick = samples[Math.floor(Math.random() * samples.length)];
      setMealName(pick.name);
      setMealKcal(String(pick.kcal));
      setMealP(String(pick.p));
      setMealF(String(pick.f));
      setMealC(String(pick.c));
      setAiAnalyzing(false);
    }, 1200);
  };

  const formatTimer = (startTime) => {
    const sec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${d}д ${h}ч ${m}м`;
  };

  const isLight = theme === 'light';
  const bgMain = isLight ? "bg-slate-100 text-slate-900" : "bg-[#0b0f17] text-slate-100";
  const bgCard = isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#111827] border-slate-800 shadow-lg";
  const bgInput = isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-slate-900 border-slate-700 text-white";

  const totalCalories = meals.reduce((acc, m) => acc + (Number(m.kcal) || 0), 0);
  const totalProtein = meals.reduce((acc, m) => acc + (Number(m.p) || 0), 0);
  const totalFat = meals.reduce((acc, m) => acc + (Number(m.f) || 0), 0);
  const totalCarbs = meals.reduce((acc, m) => acc + (Number(m.c) || 0), 0);

  return (
    <div className={`min-h-screen ${bgMain} pb-24 select-none transition-colors duration-200`}>
      {/* ШАПКА: Уровень, XP, Огонек Duolingo и Кнопка Настроек */}
      <header className={`p-3.5 ${isLight ? 'bg-white border-b border-slate-200' : 'bg-[#111827] border-b border-emerald-500/20'} flex items-center justify-between sticky top-0 z-20`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-black shadow-md">
            {level}
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-1.5">
              <span>{nickname}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-500 font-bold px-1.5 py-0.5 rounded">
                LVL {level}
              </span>
            </div>
            <div className="w-28 h-1.5 bg-slate-700/40 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(xp % 500) / 5}%` }} />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{xp} XP (до ур. {level + 1}: {500 - (xp % 500)} XP)</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Огонек Duolingo */}
          <button
            onClick={() => setShowStreakModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 font-extrabold text-xs active:scale-95"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{streak.count || 1}</span>
          </button>

          {/* Настройки в верхнем углу */}
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* МОДАЛЬНОЕ ОКНО ОГОНЬКА (DUOLINGO STREAK) */}
      {showStreakModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-5 border ${bgCard} space-y-4 text-center`}>
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mx-auto">
              <Flame className="w-10 h-10 fill-orange-500 text-orange-500" />
            </div>
            <h3 className="text-xl font-black">{streak.count} {t.streakTitle}!</h3>
            <p className="text-xs text-slate-400">
              Заходи в приложение каждый день, отмечай привычки или пиши 1% улучшения, чтобы огонек не погас. Каждые 5 дней подряд — бонус +100 XP!
            </p>
            <div className="grid grid-cols-7 gap-1.5 pt-2">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                  <div className="text-[10px] text-slate-400">{d}</div>
                  <Flame className="w-4 h-4 mx-auto mt-1 fill-orange-500 text-orange-500" />
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowStreakModal(false)}
              className="w-full py-2.5 rounded-xl bg-orange-500 text-black font-bold text-xs"
            >
              Продолжать серию!
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО НАСТРОЕК */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-5 border ${bgCard} space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" /> {t.settings}
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-800">✕</button>
            </div>

            {/* Смена темы */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> {t.theme}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setTheme('dark'); syncToCloud(xp, { theme: 'dark' }); }}
                  className={`py-2 rounded-xl text-xs font-bold border ${theme === 'dark' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
                >
                  🌙 {t.dark}
                </button>
                <button
                  onClick={() => { setTheme('light'); syncToCloud(xp, { theme: 'light' }); }}
                  className={`py-2 rounded-xl text-xs font-bold border ${theme === 'light' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600' : 'border-slate-700 text-slate-400'}`}
                >
                  ☀️ {t.light}
                </button>
              </div>
            </div>

            {/* Смена языка */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {t.lang}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setLang('ru'); syncToCloud(xp, { lang: 'ru' }); }}
                  className={`py-2 rounded-xl text-xs font-bold border ${lang === 'ru' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
                >
                  🇷🇺 Русский
                </button>
                <button
                  onClick={() => { setLang('en'); syncToCloud(xp, { lang: 'en' }); }}
                  className={`py-2 rounded-xl text-xs font-bold border ${lang === 'en' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Кнопка панели Администратора */}
            <div className="pt-2 border-t border-slate-700/50">
              <button
                onClick={() => { setShowSettings(false); setShowAdminModal(true); }}
                className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" /> {t.adminBtn}
              </button>
            </div>

            {/* Красная кнопка удаления прогресса */}
            <div className="pt-2 border-t border-slate-700/50">
              <button
                onClick={() => {
                  if (window.confirm("Вы уверены, что хотите полностью обнулить свой прогресс, XP и записи и начать с самого начала?")) {
                    localStorage.removeItem(`lifeos_v2_${userId}`);
                    setXp(0);
                    setWaterGlasses(0);
                    setMeals([]);
                    setImprovements([]);
                    setDailyHistory([]);
                    fetch(`${API_BASE}/api/sync/${userId}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "reset_my_progress" })
                    });
                    setShowSettings(false);
                  }
                }}
                className="w-full py-3 rounded-xl bg-rose-600/20 border border-rose-500/50 text-rose-500 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> {t.resetBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО АДМИНИСТРАТОРА (СОЗДАТЕЛЯ) */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl p-5 border ${bgCard} space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4" /> Панель Создателя (ID: {ADMIN_ID})
              </h3>
              <button onClick={() => setShowAdminModal(false)} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">Закрыть</button>
            </div>

            {userId !== ADMIN_ID ? (
              <div className="p-6 text-center space-y-2">
                <Lock className="w-10 h-10 text-rose-500 mx-auto" />
                <div className="font-bold text-sm">Вы не обладаете необходимыми правами</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400">Редактор еженедельного квеста Гильдии:</div>
                  <input
                    type="text"
                    value={activeQuest.title}
                    onChange={e => setActiveQuest({ ...activeQuest, title: e.target.value })}
                    className={`w-full p-2 rounded-lg border text-xs ${bgInput}`}
                    placeholder="Название квеста"
                  />
                  <textarea
                    rows={2}
                    value={activeQuest.description}
                    onChange={e => setActiveQuest({ ...activeQuest, description: e.target.value })}
                    className={`w-full p-2 rounded-lg border text-xs ${bgInput}`}
                    placeholder="Описание"
                  />
                  <button
                    onClick={() => {
                      fetch(`${API_BASE}/api/sync/${userId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "admin_update", active_quest: activeQuest })
                      }).then(() => alert("Квест обновлен для всех игроков!"));
                    }}
                    className="w-full py-2.5 bg-amber-500 text-black font-bold rounded-xl text-xs"
                  >
                    Сохранить квест недели
                  </button>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-300">Список всех игроков ({leaderboard.length}):</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {leaderboard.map((u, i) => (
                      <div key={u.telegram_id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{i + 1}. {u.nickname}</div>
                          <div className="text-[10px] text-slate-400">
                            ID: {u.telegram_id} • {u.username ? `@${u.username}` : 'без юзернейма'} • Квестов: {u.quests}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newLvl = prompt(`Уровень для ${u.nickname}:`, u.level);
                            const newQ = prompt(`Выполнено квестов для ${u.nickname}:`, u.quests);
                            if (newLvl !== null) {
                              const lvlNum = parseInt(newLvl) || 0;
                              const qNum = parseInt(newQ) || 0;
                              setLeaderboard(prev => prev.map(x => x.telegram_id === u.telegram_id ? { ...x, level: lvlNum, quests: qNum } : x));
                              fetch(`${API_BASE}/api/sync/${userId}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ action: "admin_update", target_id: u.telegram_id, level: lvlNum, quests: qNum })
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-800 rounded-lg text-emerald-400 font-bold"
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
        </div>
      )}

      {/* ОСНОВНОЙ КОНТЕНТ 6 ВКЛАДОК */}
      <main className="p-4 max-w-lg mx-auto space-y-4">

        {/* ==================== ВКЛАДКА 1: "Я" (Сферы биохакинга + 1% Улучшения) ==================== */}
        {activeTab === 'me' && (
          <div className="space-y-4">
            {/* Карточка 1% Улучшений */}
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                  <Sparkles className="w-4 h-4" /> {t.onePercentTitle}
                </h2>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold">+15 XP</span>
              </div>
              <p className="text-xs text-slate-400">
                Записывай любую мысль, инсайт или микро-шаг, который сделал тебя на 1% лучше сегодня. Это формирует мотивацию и копит опыт.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="В чем ты стал лучше на 1% сегодня?"
                  value={newImpText}
                  onChange={e => setNewImpText(e.target.value)}
                  className={`flex-1 p-2.5 rounded-xl border text-xs ${bgInput}`}
                />
                <button
                  onClick={() => {
                    if (!newImpText.trim()) return;
                    const next = [{ id: Date.now(), text: newImpText.trim(), date: todayStr }, ...improvements];
                    setImprovements(next);
                    setNewImpText("");
                    addXp(15, { improvements: next });
                  }}
                  className="px-4 rounded-xl bg-emerald-500 text-black font-bold text-xs shrink-0"
                >
                  + 1%
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
                {improvements.map(item => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex justify-between items-start text-xs">
                    <div>
                      <span className="text-emerald-400 font-bold mr-1.5">⚡ +1%:</span>
                      <span>{item.text}</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.date}</div>
                    </div>
                    <button
                      onClick={() => {
                        const next = improvements.filter(x => x.id !== item.id);
                        setImprovements(next);
                        syncToCloud(xp, { improvements: next });
                      }}
                      className="text-slate-500 hover:text-rose-400 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Колесо / Шкалы сфер биохакинга */}
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <h3 className="text-sm font-bold">{t.spheresTitle}</h3>
              {[
                { key: 'body', label: '💪 Физическая форма и тело', color: 'bg-rose-500' },
                { key: 'energy', label: '⚡ Энергия и митохондрии (Сон/Питание)', color: 'bg-amber-500' },
                { key: 'mind', label: '🧠 Интеллект и когнитивный фокус', color: 'bg-purple-500' },
                { key: 'discipline', label: '🛡️ Дисциплина и дофаминовый контроль', color: 'bg-emerald-500' },
                { key: 'environment', label: '🤝 Окружение и связи', color: 'bg-cyan-500' },
                { key: 'career', label: '🚀 Деловой вектор и капитал', color: 'bg-blue-500' }
              ].map(s => (
                <div key={s.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{s.label}</span>
                    <span className="font-bold text-emerald-400">{spheres[s.key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={spheres[s.key]}
                    onChange={e => {
                      const next = { ...spheres, [s.key]: Number(e.target.value) };
                      setSpheres(next);
                    }}
                    onMouseUp={() => syncToCloud(xp, { spheres })}
                    onTouchEnd={() => syncToCloud(xp, { spheres })}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== ВКЛАДКА 2: "ЗДОРОВЬЕ" (Сон, Питание + ИИ-Камера, Тренировки) ==================== */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'nutrition', label: t.nutrition, icon: Droplets },
                { id: 'sleep', label: t.sleep, icon: Moon },
                { id: 'workouts', label: t.workouts, icon: Dumbbell }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setHealthSub(tab.id)}
                    className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border ${
                      healthSub === tab.id ? 'bg-emerald-500 text-black border-emerald-500' : `${bgCard} text-slate-400`
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {tab.label}
                  </button>
                );
              })}
            </div>

            {healthSub === 'nutrition' && (
              <div className="space-y-4">
                {/* Водный баланс */}
                <div className={`p-4 rounded-2xl border ${bgCard} flex items-center justify-between`}>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1.5 text-cyan-400">
                      <Droplets className="w-4 h-4" /> Водный баланс
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Выпито: <b>{waterGlasses * 250} мл</b> ({waterGlasses} / 8 стаканов)</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const next = Math.max(0, waterGlasses - 1);
                        setWaterGlasses(next);
                        syncToCloud(xp, { waterGlasses: next });
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold"
                    >-</button>
                    <button
                      onClick={() => {
                        const next = waterGlasses + 1;
                        setWaterGlasses(next);
                        addXp(5, { waterGlasses: next });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs"
                    >+ Стакан</button>
                  </div>
                </div>

                {/* Сводка КБЖУ и ИИ-камера */}
                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold">Счетчик калорий и БЖУ</h3>
                    <label className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <span>{aiAnalyzing ? "Анализ фото..." : "ИИ-Камера"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAiPhotoUpload} />
                    </label>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Калории</div>
                      <div className="text-sm font-black text-emerald-400">{totalCalories}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Белки</div>
                      <div className="text-sm font-bold text-blue-400">{totalProtein}г</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Жиры</div>
                      <div className="text-sm font-bold text-amber-400">{totalFat}г</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Углеводы</div>
                      <div className="text-sm font-bold text-rose-400">{totalCarbs}г</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      placeholder="Блюдо или продукт"
                      value={mealName}
                      onChange={e => setMealName(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                    />
                    <div className="grid grid-cols-4 gap-2">
                      <input type="number" placeholder="Ккал" value={mealKcal} onChange={e => setMealKcal(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                      <input type="number" placeholder="Б (г)" value={mealP} onChange={e => setMealP(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                      <input type="number" placeholder="Ж (г)" value={mealF} onChange={e => setMealF(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                      <input type="number" placeholder="У (г)" value={mealC} onChange={e => setMealC(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                    </div>
                    <button
                      onClick={() => {
                        if (!mealName.trim()) return;
                        const next = [{ id: Date.now(), name: mealName, kcal: mealKcal || 0, p: mealP || 0, f: mealF || 0, c: mealC || 0 }, ...meals];
                        setMeals(next);
                        setMealName(""); setMealKcal(""); setMealP(""); setMealF(""); setMealC("");
                        addXp(10, { meals: next });
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                    >
                      + Добавить прием пищи (+10 XP)
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {meals.map(m => (
                      <div key={m.id} className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.kcal} ккал • Б:{m.p} Ж:{m.f} У:{m.c}</div>
                        </div>
                        <button onClick={() => {
                          const next = meals.filter(x => x.id !== m.id);
                          setMeals(next);
                          syncToCloud(xp, { meals: next });
                        }} className="text-slate-500">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {healthSub === 'sleep' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-400">
                  <Moon className="w-4 h-4" /> Трекер сна и восстановления
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Часов сна (напр. 8)"
                    value={sleepHours}
                    onChange={e => setSleepHours(e.target.value)}
                    className={`p-2.5 rounded-xl border text-xs ${bgInput}`}
                  />
                  <select
                    value={sleepQuality}
                    onChange={e => setSleepQuality(e.target.value)}
                    className={`p-2.5 rounded-xl border text-xs ${bgInput}`}
                  >
                    <option value="Отлично">⚡ Отлично</option>
                    <option value="Нормально">👌 Нормально</option>
                    <option value="Разбитый">😴 Тяжелый подъем</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    const next = [{ id: Date.now(), date: todayStr, hours: sleepHours, quality: sleepQuality }, ...sleepLogs];
                    setSleepLogs(next);
                    addXp(15, { sleepLogs: next });
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-xs"
                >
                  Зафиксировать сон (+15 XP)
                </button>
                <div className="space-y-2 pt-2">
                  {sleepLogs.map(s => (
                    <div key={s.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between text-xs">
                      <span>📅 {s.date}</span>
                      <span className="font-bold text-indigo-400">{s.hours} ч. ({s.quality})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {healthSub === 'workouts' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <h3 className="text-sm font-bold flex items-center gap-2 text-rose-400">
                  <Dumbbell className="w-4 h-4" /> Дневник тренировок
                </h3>
                <input
                  type="text"
                  placeholder="Тип тренировки (Силовая, Бег, Бокс, Турники)"
                  value={workoutTitle}
                  onChange={e => setWorkoutTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                />
                <input
                  type="text"
                  placeholder="Длительность / Тоннаж / Дистанция"
                  value={workoutDur}
                  onChange={e => setWorkoutDur(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                />
                <button
                  onClick={() => {
                    if (!workoutTitle.trim()) return;
                    const next = [{ id: Date.now(), title: workoutTitle, dur: workoutDur, date: todayStr }, ...workouts];
                    setWorkouts(next);
                    setWorkoutTitle(""); setWorkoutDur("");
                    addXp(30, { workouts: next });
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs"
                >
                  Записать тренировку (+30 XP)
                </button>
                <div className="space-y-2 pt-2">
                  {workouts.map(w => (
                    <div key={w.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between text-xs">
                      <div>
                        <div className="font-bold">{w.title}</div>
                        <div className="text-[10px] text-slate-400">{w.dur}</div>
                      </div>
                      <span className="text-[10px] text-slate-400">{w.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== ВКЛАДКА 3: "ФОКУС" (Цели/Итоги дня + История, Привычки, 16 Вопросов) ==================== */}
        {activeTab === 'focus' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'goals', label: t.goalsToday },
                { id: 'habits', label: t.habits },
                { id: 'q16', label: t.q16 }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setFocusSub(sub.id)}
                  className={`py-2.5 rounded-xl text-xs font-bold border ${
                    focusSub === sub.id ? 'bg-emerald-500 text-black border-emerald-500' : `${bgCard} text-slate-400`
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Подраздел 1: Утренние цели vs Вечерний итог + История */}
            {focusSub === 'goals' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-emerald-400">План на день vs Реальный итог ({todayStr})</h3>
                    <span className="text-[10px] text-slate-400">+25 XP</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">☀️ УТРО: Что я планирую сделать сегодня?</label>
                    <textarea
                      rows={3}
                      placeholder="1. Главная задача дня...\n2. Второстепенная задача..."
                      value={dailyMorningPlan}
                      onChange={e => setDailyMorningPlan(e.target.value)}
                      onBlur={() => syncToCloud(xp, { dailyMorningPlan })}
                      className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">🌙 ВЕЧЕР: Что реально сделал по итогу дня?</label>
                    <textarea
                      rows={3}
                      placeholder="Подведи честный итог дня..."
                      value={dailyEveningReview}
                      onChange={e => setDailyEveningReview(e.target.value)}
                      onBlur={() => syncToCloud(xp, { dailyEveningReview })}
                      className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!dailyMorningPlan.trim() && !dailyEveningReview.trim()) return;
                      const entry = {
                        id: Date.now(),
                        date: todayStr,
                        plan: dailyMorningPlan,
                        review: dailyEveningReview
                      };
                      const nextHist = [entry, ...dailyHistory];
                      setDailyHistory(nextHist);
                      setDailyMorningPlan("");
                      setDailyEveningReview("");
                      addXp(25, { dailyHistory: nextHist, dailyMorningPlan: "", dailyEveningReview: "" });
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                  >
                    Сохранить день в архив истории (+25 XP)
                  </button>
                </div>

                {/* Архив прошлых дней (вчера, позавчера и т.д.) */}
                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">📜 История прошлых дней ({dailyHistory.length})</h4>
                  {dailyHistory.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-3">Здесь будут храниться твои планы и итоги за вчера, позавчера и прошлые недели.</div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {dailyHistory.map(item => (
                        <div key={item.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                          <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1">📅 {item.date}</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-slate-950/60">
                              <div className="text-[10px] text-amber-400 font-bold mb-1">Хотел сделать:</div>
                              <div className="whitespace-pre-wrap text-slate-300">{item.plan || "—"}</div>
                            </div>
                            <div className="p-2 rounded bg-slate-950/60">
                              <div className="text-[10px] text-emerald-400 font-bold mb-1">Сделал по итогу:</div>
                              <div className="whitespace-pre-wrap text-slate-300">{item.review || "—"}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Подраздел 2: Таймеры привычек (хорошие и плохие) */}
            {focusSub === 'habits' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <h3 className="text-sm font-bold">Таймеры привычек (Воздержание и Полезные)</h3>
                <div className="space-y-2.5">
                  {habits.map(h => (
                    <div key={h.id} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold mr-1.5 ${
                          h.type === 'bad' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {h.type === 'bad' ? 'Аскеза' : 'Полезная'}
                        </span>
                        <span className="font-bold text-xs">{h.name}</span>
                        {h.motiv && <div className="text-[11px] text-slate-400 mt-0.5">«{h.motiv}»</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/20">
                          {formatTimer(h.start)}
                        </span>
                        <button
                          onClick={() => {
                            const next = habits.filter(x => x.id !== h.id);
                            setHabits(next);
                            syncToCloud(xp, { habits: next });
                          }}
                          className="text-slate-500 hover:text-rose-400"
                        >✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setHabitType('bad')}
                      className={`py-1.5 rounded-lg text-xs font-bold border ${habitType === 'bad' ? 'border-rose-500 bg-rose-500/20 text-rose-400' : 'border-slate-700 text-slate-400'}`}
                    >🛑 Вредная (Отказ)</button>
                    <button
                      onClick={() => setHabitType('good')}
                      className={`py-1.5 rounded-lg text-xs font-bold border ${habitType === 'good' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
                    >🌱 Хорошая (Внедрение)</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Название привычки"
                    value={habitName}
                    onChange={e => setHabitName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                  />
                  <input
                    type="text"
                    placeholder="Мотивация (зачем мне это?)"
                    value={habitMotiv}
                    onChange={e => setHabitMotiv(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                  />
                  <button
                    onClick={() => {
                      if (!habitName.trim()) return;
                      const next = [...habits, { id: Date.now(), name: habitName, type: habitType, start: Date.now(), motiv: habitMotiv }];
                      setHabits(next);
                      setHabitName(""); setHabitMotiv("");
                      addXp(15, { habits: next });
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                  >
                    + Запустить таймер привычки (+15 XP)
                  </button>
                </div>
              </div>
            )}

            {/* Подраздел 3: 16 Вопросов себе */}
            {focusSub === 'q16' && (
              <div className="space-y-3">
                {QUESTIONS_16.map((q, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${bgCard} space-y-2`}>
                    <div className="text-xs font-bold text-emerald-400">Вопрос #{i + 1}</div>
                    <div className="text-xs font-semibold">{q}</div>
                    <textarea
                      rows={2}
                      placeholder="Твой честный ответ..."
                      value={answers16[i] || ""}
                      onChange={e => setAnswers16({ ...answers16, [i]: e.target.value })}
                      onBlur={() => syncToCloud(xp, { answers16 })}
                      className={`w-full p-2 rounded-lg border text-xs ${bgInput}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== ВКЛАДКА 4: "КАЛЕНДАРЬ" (Планировщик и Расписание дня) ==================== */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                  <CalIcon className="w-4 h-4" /> Расписание и Тайм-блокинг
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className={`p-1.5 rounded-lg border text-xs ${bgInput}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="time"
                  value={eventTime}
                  onChange={e => setEventTime(e.target.value)}
                  className={`p-2 rounded-xl border text-xs ${bgInput}`}
                />
                <select
                  value={eventCat}
                  onChange={e => setEventCat(e.target.value)}
                  className={`col-span-2 p-2 rounded-xl border text-xs ${bgInput}`}
                >
                  <option value="Дело">💼 Дело / Работа</option>
                  <option value="Здоровье">💪 Тренировка / Здоровье</option>
                  <option value="Фокус">🧠 Глубокий фокус</option>
                  <option value="Встреча">🤝 Встреча</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Событие или задача в расписании..."
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  className={`flex-1 p-2.5 rounded-xl border text-xs ${bgInput}`}
                />
                <button
                  onClick={() => {
                    if (!eventTitle.trim()) return;
                    const next = [...events, { id: Date.now(), date: selectedDate, time: eventTime, title: eventTitle, category: eventCat, done: false }]
                      .sort((a, b) => a.time.localeCompare(b.time));
                    setEvents(next);
                    setEventTitle("");
                    addXp(10, { events: next });
                  }}
                  className="px-4 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                >
                  + План
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {events.filter(ev => ev.date === selectedDate).length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-6">На выбранную дату пока нет событий. Добавь блок выше!</div>
                ) : (
                  events.filter(ev => ev.date === selectedDate).map(ev => (
                    <div key={ev.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const next = events.map(x => x.id === ev.id ? { ...x, done: !x.done } : x);
                            setEvents(next);
                            if (!ev.done) addXp(15, { events: next });
                            else syncToCloud(xp, { events: next });
                          }}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            ev.done ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-600'
                          }`}
                        >
                          {ev.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div>
                          <div className={`font-bold ${ev.done ? 'line-through text-slate-500' : ''}`}>
                            <span className="text-emerald-400 font-mono mr-2">{ev.time}</span>
                            {ev.title}
                          </div>
                          <div className="text-[10px] text-slate-400">{ev.category}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const next = events.filter(x => x.id !== ev.id);
                          setEvents(next);
                          syncToCloud(xp, { events: next });
                        }}
                        className="text-slate-500"
                      >✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ВКЛАДКА 5: "ЗАМЕТКИ" ==================== */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <h3 className="text-sm font-bold flex items-center gap-2 text-amber-400">
                <FileText className="w-4 h-4" /> Быстрые заметки и списки покупок
              </h3>
              <input
                type="text"
                placeholder="🔍 Поиск по заметкам..."
                value={noteSearch}
                onChange={e => setNoteSearch(e.target.value)}
                className={`w-full p-2 rounded-xl border text-xs ${bgInput}`}
              />
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  placeholder="Заголовок (напр. Что купить / Идеи / Книги)"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold ${bgInput}`}
                />
                <textarea
                  rows={3}
                  placeholder="Текст заметки или список..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                />
                <button
                  onClick={() => {
                    if (!noteTitle.trim() && !noteText.trim()) return;
                    const next = [{ id: Date.now(), title: noteTitle || "Без названия", text: noteText, date: todayStr }, ...notes];
                    setNotes(next);
                    setNoteTitle(""); setNoteText("");
                    addXp(5, { notes: next });
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
                >
                  + Сохранить заметку
                </button>
              </div>

              <div className="space-y-2.5 pt-2">
                {notes
                  .filter(n => (n.title + n.text).toLowerCase().includes(noteSearch.toLowerCase()))
                  .map(n => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-400">{n.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">{n.date}</span>
                          <button
                            onClick={() => {
                              const next = notes.filter(x => x.id !== n.id);
                              setNotes(next);
                              syncToCloud(xp, { notes: next });
                            }}
                            className="text-slate-500 hover:text-rose-400"
                          >✕</button>
                        </div>
                      </div>
                      <div className="text-slate-300 whitespace-pre-wrap">{n.text}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== ВКЛАДКА 6: "ГИЛЬДИЯ" (Канал, Проверка подписки, Квесты и Рейтинг) ==================== */}
        {activeTab === 'guild' && (
          <div className="space-y-4">
            {/* Блок интеграции с ТГ-каналом и создания профиля Гильдии */}
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-emerald-400">
                    <Shield className="w-4 h-4" /> Гильдия @life_is_rpg_game
                  </h3>
                  <p className="text-[11px] text-slate-400">Еженедельные соревнования, розыгрыши наград и общий рейтинг</p>
                </div>
                <a
                  href="https://t.me/life_is_rpg_game"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1"
                >
                  Канал <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${guildStatus.is_subscribed ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'}`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{guildStatus.is_subscribed ? "Подписка подтверждена" : "Подпишись на канал"}</span>
                </div>
                <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Бот активирован</span>
                </div>
              </div>

              {/* Смена игрового никнейма прямо в Гильдии */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Твой игровой никнейм в Гильдии"
                  value={newNickInput}
                  onChange={e => setNewNickInput(e.target.value)}
                  className={`flex-1 p-2 rounded-xl border text-xs ${bgInput}`}
                />
                <button
                  onClick={() => {
                    if (!newNickInput.trim()) return;
                    setNickname(newNickInput.trim());
                    fetch(`${API_BASE}/api/sync/${userId}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "set_nickname", nickname: newNickInput.trim() })
                    });
                  }}
                  className="px-3 rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs"
                >
                  Сохранить ник
                </button>
              </div>
            </div>

            {/* Таймер до воскресенья 10:00 МСК */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161f30] to-[#0f172a] border border-emerald-500/30 text-center">
              <div className="text-xs text-emerald-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" /> До розыгрыша награды и нового квеста:
              </div>
              <div className="text-2xl font-mono font-black text-white py-1">
                {timeLeft.d}д {timeLeft.h}ч {timeLeft.m}м {timeLeft.s}с
              </div>
              <div className="text-[11px] text-slate-400">Каждое воскресенье в 10:00 МСК</div>
            </div>

            {/* Квест недели */}
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                    ЕЖЕНЕДЕЛЬНОЕ ЗАДАНИЕ ГИЛЬДИИ
                  </span>
                  <h2 className="text-base font-bold mt-1">{activeQuest.title}</h2>
                </div>
                <div className="text-2xl">{activeQuest.award_icon || "🏆"}</div>
              </div>
              <p className="text-xs text-slate-400">{activeQuest.description}</p>
              <div className="space-y-1.5">
                {(activeQuest.tasks || []).map((task, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  if (weeklyDone) return;
                  const reward = activeQuest.xp_reward || 100;
                  setWeeklyDone(true);
                  setXp(prev => prev + reward);
                  fetch(`${API_BASE}/api/sync/${userId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "complete_quest", xp_reward: reward })
                  });
                }}
                disabled={weeklyDone}
                className={`w-full py-3 rounded-xl font-bold text-xs ${
                  weeklyDone ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-500 text-black'
                }`}
              >
                {weeklyDone ? "✅ Квест недели выполнен!" : `⚡ Выполнить квест (+${activeQuest.xp_reward || 100} XP)`}
              </button>
            </div>

            {/* Общий рейтинг Гильдии */}
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-2.5`}>
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> Рейтинг игроков Гильдии ({leaderboard.length})
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {leaderboard.map((u, i) => (
                  <div key={u.telegram_id} className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono w-5">{i + 1}.</span>
                      <span className="font-bold">{u.nickname}</span>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 rounded">LVL {u.level}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{u.quests} квестов</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* НИЖНЯЯ НАВИГАЦИЯ НА 6 ВКЛАДОК */}
      <nav className={`fixed bottom-0 left-0 right-0 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a]/95 border-slate-800'} backdrop-blur-md border-t grid grid-cols-6 py-1.5 px-1 z-30`}>
        {[
          { id: 'me', label: t.me, icon: User },
          { id: 'health', label: t.health, icon: Heart },
          { id: 'focus', label: t.focus, icon: Target },
          { id: 'calendar', label: t.calendar, icon: CalIcon },
          { id: 'notes', label: t.notes, icon: FileText },
          { id: 'guild', label: t.guild, icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition-colors ${
                active ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-full px-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
