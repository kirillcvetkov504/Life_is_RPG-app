import React, { useState, useEffect } from 'react';
import {
  User, Heart, Target, Calendar as CalIcon, Bot, Shield,
  Flame, Settings, Plus, Trash2, CheckCircle2, Clock, Camera,
  Droplets, Moon, Dumbbell, Trophy, Crown, Lock, Sparkles,
  Sun, Globe, ExternalLink, Check, RotateCcw, Send, Scale, AlertCircle
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
    me: "Я", health: "Здоровье", focus: "Фокус", calendar: "Календарь", ai: "ИИ", guild: "Гильдия",
    settings: "Настройки", theme: "Тема оформления", dark: "Темная", light: "Светлая",
    lang: "Язык интерфейса", adminBtn: "Панель Создателя (Админ)", resetBtn: "Удалить весь прогресс и начать сначала",
    streakTitle: "Дней подряд в режиме", onePercentTitle: "Улучшения на 1% (Мотивация и микро-шаги)",
    spheresTitle: "Баланс сфер (прокачивается автоматически от действий)",
    sleep: "Сон", nutrition: "Питание и Вес", workouts: "Тренировки",
    goalsToday: "Цели и Итоги дня", habits: "Таймеры привычек", q16: "16 Вопросов"
  },
  en: {
    me: "Me", health: "Health", focus: "Focus", calendar: "Calendar", ai: "AI Coach", guild: "Guild",
    settings: "Settings", theme: "Appearance", dark: "Dark", light: "Light",
    lang: "Language", adminBtn: "Creator Terminal (Admin)", resetBtn: "Reset all progress & start over",
    streakTitle: "Day Streak", onePercentTitle: "1% Improvements (Motivation & Wins)",
    spheresTitle: "Biohacking Spheres (grows automatically from actions)",
    sleep: "Sleep", nutrition: "Nutrition & Weight", workouts: "Workouts",
    goalsToday: "Daily Goals & Review", habits: "Habit Timers", q16: "16 Questions"
  }
};

export default function App() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const userId = tg?.initDataUnsafe?.user?.id || ADMIN_ID;
  const todayIso = new Date().toISOString().split('T')[0];
  const todayStr = new Date().toLocaleDateString('ru-RU');

  // Навигация
  const [activeTab, setActiveTab] = useState('me');
  const [healthSub, setHealthSub] = useState('nutrition');
  const [focusSub, setFocusSub] = useState('goals');
  const [calSub, setCalSub] = useState('schedule');
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);

  // Настройки
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('ru');
  const t = DICT[lang] || DICT.ru;

  // Профиль и XP
  const [nickname, setNickname] = useState("Новобранец");
  const [xp, setXp] = useState(0);
  const level = Math.floor(xp / 500);
  const [syncing, setSyncing] = useState(false);

  // Реестр полученных наград XP (защита от повторного накликивания!)
  const [xpClaims, setXpClaims] = useState({});

  // Огонек (Стрик)
  const [streak, setStreak] = useState({ count: 1, lastDate: "", history: [] });

  // 1. Вкладка "Я": Сферы жизни (растут по долям процента автоматически!) + 1% Улучшения
  const [spheres, setSpheres] = useState({
    body: 10.0, energy: 10.0, mind: 10.0, discipline: 10.0, environment: 10.0, career: 10.0
  });
  const [improvements, setImprovements] = useState([]);
  const [newImpText, setNewImpText] = useState("");

  // 2. Вкладка "Здоровье": Анкета тела, Калькулятор БЖУ, График веса, Вода, Еда, Сон, Тренировки
  const [bodyProfile, setBodyProfile] = useState({
    weight: 70, height: 182, age: 22,
    activity: "hard3", // light, med3, hard3, athlete
    metabolism: "fast", // slow, normal, fast
    goal: "gain", // lose, maintain, gain
    targetWeight: 78,
    targetWeeks: 16
  });
  const [weightLogs, setWeightLogs] = useState([
    { date: todayStr, weight: 70 }
  ]);
  const [newWeightInput, setNewWeightInput] = useState("");

  const [waterByDate, setWaterByDate] = useState({});
  const waterGlasses = waterByDate[todayIso] || 0;

  const [meals, setMeals] = useState([]);
  const [mealName, setMealName] = useState("");
  const [mealKcal, setMealKcal] = useState("");
  const [mealP, setMealP] = useState("");
  const [mealF, setMealF] = useState("");
  const [mealC, setMealC] = useState("");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const [sleepLogs, setSleepLogs] = useState([]);
  const [sleepHours, setSleepHours] = useState("8");
  const [sleepQuality, setSleepQuality] = useState("Отлично");

  const [workouts, setWorkouts] = useState([]);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutDur, setWorkoutDur] = useState("");
  const [workoutComment, setWorkoutComment] = useState("");

  // 3. Вкладка "Фокус": План/Итог (1 раз в день), Таймеры привычек (с попытками и рекордами), 16 вопросов
  const [dailyMorningPlan, setDailyMorningPlan] = useState("");
  const [dailyEveningReview, setDailyEveningReview] = useState("");
  const [dailyHistory, setDailyHistory] = useState([]);

  const [habits, setHabits] = useState([
    {
      id: 1, name: "Без сахара и фастфуда", type: "bad",
      start: Date.now() - 86400000 * 2, motiv: "Чистая энергия",
      attempts: 1, maxRecordDays: 2, claimedMilestones: [1, 2]
    }
  ]);
  const [habitName, setHabitName] = useState("");
  const [habitType, setHabitType] = useState("bad");
  const [habitMotiv, setHabitMotiv] = useState("");
  const [answers16, setAnswers16] = useState({});

  // 4. Вкладка "Календарь и Заметки" (Без XP, с отображением дат)
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [events, setEvents] = useState([]);
  const [eventTime, setEventTime] = useState("12:00");
  const [eventTitle, setEventTitle] = useState("");
  const [eventCat, setEventCat] = useState("Дело");

  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  // 5. Вкладка "ИИ" (Персональный нейро-ментор, анализирующий профиль, календарь и заметки)
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      text: "Привет! Я твой ИИ-ассистент. Я вижу твой режим, задачи в календаре, заметки и прогресс по БЖУ. Спроси меня, что нужно сделать сегодня, попроси совет по питанию/тренировкам или просто напиши, как проходит день!"
    }
  ]);
  const [aiInput, setAiInput] = useState("");

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

  // -------------------- РАСЧЕТ ДНЕВНОЙ НОРМЫ КБЖУ И ПЛАНА ВЕСА --------------------
  const calculateNutritionPlan = () => {
    const w = Number(bodyProfile.weight) || 70;
    const h = Number(bodyProfile.height) || 180;
    const a = Number(bodyProfile.age) || 22;

    // Базовый обмен Миффлина - Сан-Жеора
    const bmr = 10 * w + 6.25 * h - 5 * a + 5;
    const actMap = { light: 1.35, med3: 1.5, hard3: 1.65, athlete: 1.85 };
    const metaMap = { slow: 0.92, normal: 1.0, fast: 1.12 };

    let tdee = bmr * (actMap[bodyProfile.activity] || 1.55) * (metaMap[bodyProfile.metabolism] || 1.0);
    if (bodyProfile.goal === 'gain') tdee += 380;
    if (bodyProfile.goal === 'lose') tdee -= 400;

    const targetKcal = Math.round(tdee);
    const targetP = Math.round(w * (bodyProfile.goal === 'gain' ? 2.0 : 1.8));
    const targetF = Math.round(w * 1.0);
    const targetC = Math.max(100, Math.round((targetKcal - targetP * 4 - targetF * 9) / 4));

    const weightDiff = Math.abs((Number(bodyProfile.targetWeight) || w) - w);
    const weeks = Math.max(1, Number(bodyProfile.targetWeeks) || 12);
    const kgPerWeek = +(weightDiff / weeks).toFixed(2);
    const safeWeeks = Math.max(1, Math.ceil(weightDiff / 0.6)); // 0.5-0.6 кг в неделю безопасно для ЖКТ и гормонов

    return { targetKcal, targetP, targetF, targetC, kgPerWeek, safeWeeks };
  };

  const macroPlan = calculateNutritionPlan();
  const todayMeals = meals.filter(m => m.dateIso === todayIso);
  const totalCalories = todayMeals.reduce((acc, m) => acc + (Number(m.kcal) || 0), 0);
  const totalProtein = todayMeals.reduce((acc, m) => acc + (Number(m.p) || 0), 0);
  const totalFat = todayMeals.reduce((acc, m) => acc + (Number(m.f) || 0), 0);
  const totalCarbs = todayMeals.reduce((acc, m) => acc + (Number(m.c) || 0), 0);

  // Проверка закрытия нормы БЖУ (Главное: Калории, Белки и Углеводы >= 95% от нормы)
  const isMacrosCompleted =
    totalCalories >= macroPlan.targetKcal * 0.95 &&
    totalProtein >= macroPlan.targetP * 0.95 &&
    totalCarbs >= macroPlan.targetC * 0.95;

  // -------------------- СИНХРОНИЗАЦИЯ И ОДНОРАЗОВОЕ НАЧИСЛЕНИЕ XP --------------------
  const getFullAppState = (overrides = {}) => ({
    theme, lang, streak, xpClaims, spheres, improvements,
    bodyProfile, weightLogs, waterByDate, meals, sleepLogs, workouts,
    dailyMorningPlan, dailyEveningReview, dailyHistory,
    habits, answers16, events, notes, ...overrides
  });

  const syncToCloud = (nextXp = xp, stateOverrides = {}) => {
    setSyncing(true);
    const fullState = getFullAppState(stateOverrides);
    localStorage.setItem(`lifeos_v3_${userId}`, JSON.stringify({
      nickname, xp: nextXp, weeklyDone, app_state: fullState
    }));

    // Мгновенно обновляем свой уровень в локальном списке Гильдии!
    const nextLvl = Math.floor(nextXp / 500);
    setLeaderboard(prev => prev.map(u =>
      u.telegram_id === userId ? { ...u, xp: nextXp, level: Math.max(u.level || 0, nextLvl) } : u
    ));

    fetch(`${API_BASE}/api/sync/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_state", xp: nextXp, app_state: fullState })
    })
      .then(r => r.json())
      .then(res => {
        if (res.leaderboard) setLeaderboard(res.leaderboard);
      })
      .catch(() => {})
      .finally(() => setSyncing(false));
  };

  // Начисляет XP и доли % к сферам СТРОГО 1 РАЗ по уникальному ключу claimKey
  const grantRewardOnce = (claimKey, xpAmount, sphereDeltas = {}, extraState = {}) => {
    if (xpClaims[claimKey]) {
      syncToCloud(xp, extraState);
      return false;
    }
    const nextClaims = { ...xpClaims, [claimKey]: true };
    const nextSpheres = { ...spheres };
    Object.keys(sphereDeltas).forEach(k => {
      nextSpheres[k] = Math.min(100, +( (nextSpheres[k] || 10) + sphereDeltas[k] ).toFixed(2));
    });
    const nextXp = xp + xpAmount;

    setXpClaims(nextClaims);
    setSpheres(nextSpheres);
    setXp(nextXp);
    syncToCloud(nextXp, { ...extraState, xpClaims: nextClaims, spheres: nextSpheres });
    tg?.HapticFeedback?.notificationOccurred('success');
    return true;
  };

  // Автоматическая проверка закрытия БЖУ за сегодня
  useEffect(() => {
    if (isMacrosCompleted && !xpClaims[`macros_${todayIso}`]) {
      grantRewardOnce(`macros_${todayIso}`, 40, { energy: 0.4, body: 0.3 });
    }
  }, [totalCalories, totalProtein, totalCarbs]);

  // Автоматическая проверка рубежей привычек (1, 2, 7, 30 дней)
  useEffect(() => {
    let xpEarned = 0;
    let changed = false;
    const milestones = [
      { days: 1, xp: 15 },
      { days: 2, xp: 25 },
      { days: 7, xp: 70 },
      { days: 30, xp: 250 }
    ];
    const updatedHabits = habits.map(h => {
      const elapsedDays = Math.floor((Date.now() - h.start) / 86400000);
      const claimed = h.claimedMilestones || [];
      let newClaimed = [...claimed];
      milestones.forEach(m => {
        if (elapsedDays >= m.days && !newClaimed.includes(m.days)) {
          newClaimed.push(m.days);
          xpEarned += m.xp;
          changed = true;
        }
      });
      const maxRec = Math.max(h.maxRecordDays || 0, elapsedDays);
      if (maxRec !== h.maxRecordDays) changed = true;
      return { ...h, claimedMilestones: newClaimed, maxRecordDays: maxRec };
    });

    if (changed) {
      setHabits(updatedHabits);
      const nextXp = xp + xpEarned;
      const nextSpheres = {
        ...spheres,
        discipline: Math.min(100, +(spheres.discipline + (xpEarned > 0 ? 0.4 : 0)).toFixed(2))
      };
      if (xpEarned > 0) setXp(nextXp);
      setSpheres(nextSpheres);
      syncToCloud(nextXp, { habits: updatedHabits, spheres: nextSpheres });
    }
  }, [activeTab]);

  // Загрузка данных при входе (защита от потери прогресса)
  useEffect(() => {
    tg?.ready();
    tg?.expand();

    const applyState = (st) => {
      if (!st) return;
      if (st.theme) setTheme(st.theme);
      if (st.lang) setLang(st.lang);
      if (st.xpClaims) setXpClaims(st.xpClaims);
      if (st.spheres) setSpheres(st.spheres);
      if (st.improvements) setImprovements(st.improvements);
      if (st.bodyProfile) setBodyProfile(st.bodyProfile);
      if (st.weightLogs) setWeightLogs(st.weightLogs);
      if (st.waterByDate) setWaterByDate(st.waterByDate);
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
    };

    let localXp = 0;
    let localState = null;
    const saved = localStorage.getItem(`lifeos_v3_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nickname) setNickname(parsed.nickname);
        if (parsed.xp !== undefined) {
          localXp = Number(parsed.xp) || 0;
          setXp(localXp);
        }
        if (parsed.weeklyDone !== undefined) setWeeklyDone(parsed.weeklyDone);
        if (parsed.app_state) {
          localState = parsed.app_state;
          applyState(localState);
        }
      } catch (e) {}
    }

    fetch(`${API_BASE}/api/sync/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setNickname(data.user.nickname || "Новобранец");
          setNewNickInput(data.user.nickname || "");
          const serverXp = Number(data.user.xp) || 0;
          const bestXp = Math.max(localXp, serverXp);
          setXp(bestXp);

          const serverState = data.user.app_state || {};
          if (Object.keys(serverState).length > 0 && serverXp >= localXp) {
            applyState(serverState);
          } else if (localXp > serverXp && localState) {
            // Если локальный прогресс выше серверного — пушим его на сервер!
            fetch(`${API_BASE}/api/sync/${userId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "save_state", xp: bestXp, app_state: localState })
            });
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

  // Генератор умного ответа ИИ на основе данных пользователя
  const handleSendAiMessage = (customPrompt) => {
    const text = (customPrompt || aiInput).trim();
    if (!text) return;
    const userMsg = { role: 'user', text };
    const todayEvents = events.filter(e => e.date === todayIso);
    const pendingEvents = todayEvents.filter(e => !e.done);

    let reply = "";
    const low = text.toLowerCase();

    if (low.includes("сегодня") || low.includes("сделать") || low.includes("план") || low.includes("задач")) {
      const tasksStr = pendingEvents.length > 0
        ? pendingEvents.map(e => `• ${e.time} (${e.date}) — ${e.title}`).join("\n")
        : "В календаре на сегодня все задачи закрыты (или еще не добавлены).";
      reply =
        `📋 Сводка твоих задач на сегодня (${todayStr}):\n\n` +
        `${tasksStr}\n\n` +
        `💧 Вода: ${waterGlasses}/8 стаканов.\n` +
        `🍽️ БЖУ: ${totalCalories}/${macroPlan.targetKcal} ккал (Белки: ${totalProtein}/${macroPlan.targetP}г, Углеводы: ${totalCarbs}/${macroPlan.targetC}г).\n` +
        `${dailyMorningPlan ? `🎯 Главный фокус утра: «${dailyMorningPlan}»` : "💡 Совет: заполни утренний план во вкладке «Фокус»!"}`;
    } else if (low.includes("питани") || low.includes("калор") || low.includes("вес") || low.includes("бжу")) {
      reply =
        `⚖️ Твой текущий вес: ${bodyProfile.weight} кг (цель: ${bodyProfile.targetWeight} кг за ${bodyProfile.targetWeeks} нед.).\n` +
        `Для цели (${bodyProfile.goal === 'gain' ? 'Набор массы' : bodyProfile.goal === 'lose' ? 'Рельеф/Сушка' : 'Поддержание'}) без перегрузки ЖКТ твоя норма:\n` +
        `• Калории: ${macroPlan.targetKcal} ккал\n• Белки: ${macroPlan.targetP} г\n• Углеводы: ${macroPlan.targetC} г\n• Жиры: ${macroPlan.targetF} г\n\n` +
        `Сегодня осталось добрать: ${Math.max(0, macroPlan.targetKcal - totalCalories)} ккал и ${Math.max(0, macroPlan.targetP - totalProtein)} г белка.`;
    } else if (low.includes("заметк") || low.includes("купить")) {
      const notesList = notes.slice(0, 3).map(n => `📌 ${n.title}: ${n.text}`).join("\n");
      reply = notes.length > 0
        ? `Вот твои актуальные заметки:\n\n${notesList}`
        : "У тебя пока нет сохраненных заметок во вкладке «Календарь -> Заметки».";
    } else {
      reply =
        `Я проанализировал твой профиль (${nickname}, LVL ${level}):\n` +
        `• Твоя самая прокачанная сфера сейчас — ${Object.entries(spheres).sort((a,b)=>b[1]-a[1])[0][0]} (${Object.entries(spheres).sort((a,b)=>b[1]-a[1])[0][1]}%).\n` +
        `• Чтобы ускорить прогресс сегодня: выпей норму из 8 стаканов воды, закрой норму белка (${macroPlan.targetP}г) и зафиксируй 1% улучшение на главной вкладке. Ты на верном пути!`;
    }

    setAiMessages(prev => [...prev, userMsg, { role: 'assistant', text: reply }]);
    if (!customPrompt) setAiInput("");
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

  const todaySleepAlreadyLogged = sleepLogs.some(s => s.dateIso === todayIso);
  const todayPlanAlreadyArchived = dailyHistory.some(h => h.dateIso === todayIso);

  return (
    <div className={`min-h-screen ${bgMain} pb-24 select-none transition-colors duration-200`}>
      {/* ШАПКА */}
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
            <div className="text-[10px] text-slate-400 mt-0.5">{xp} XP (след. ур: {500 - (xp % 500)} XP)</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStreakModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 font-extrabold text-xs"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span>{streak.count || 1}</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800/80 border-slate-700 text-slate-300'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* МОДАЛКА НАСТРОЕК */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-5 border ${bgCard} space-y-4`}>
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" /> {t.settings}
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-800">✕</button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> {t.theme}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setTheme('dark'); syncToCloud(xp, { theme: 'dark' }); }}
                  className={`py-2 rounded-xl text-xs font-bold border ${theme === 'dark' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
                >🌙 {t.dark}</button>
                <button
                  onClick={() => { setTheme('light'); syncToCloud(xp, { theme: 'light' }); }}
                  className={`py-2 rounded-xl text-xs font-bold border ${theme === 'light' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600' : 'border-slate-700 text-slate-400'}`}
                >☀️ {t.light}</button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {t.lang}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setLang('ru'); syncToCloud(xp, { lang: 'ru' }); }}
                  className={`py-2 rounded-xl text-xs font-bold border ${lang === 'ru' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
                >🇷🇺 Русский</button>
                <button
                  onClick={() => { setLang('en'); syncToCloud(xp, { lang: 'en' }); }}
                  className={`py-2 rounded-xl text-xs font-bold border ${lang === 'en' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-400'}`}
                >🇬🇧 English</button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/50">
              <button
                onClick={() => { setShowSettings(false); setShowAdminModal(true); }}
                className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" /> {t.adminBtn}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-700/50">
              <button
                onClick={() => {
                  if (window.confirm("Вы точно хотите обнулить весь свой прогресс, XP, сферы и начать с чистого листа?")) {
                    localStorage.removeItem(`lifeos_v3_${userId}`);
                    setXp(0);
                    setXpClaims({});
                    setSpheres({ body: 10, energy: 10, mind: 10, discipline: 10, environment: 10, career: 10 });
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

      {/* МОДАЛКА АДМИНА */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl p-5 border ${bgCard} space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4" /> Панель Создателя
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
                  <div className="text-xs font-bold text-slate-400">Редактор квеста Гильдии:</div>
                  <input
                    type="text"
                    value={activeQuest.title}
                    onChange={e => setActiveQuest({ ...activeQuest, title: e.target.value })}
                    className={`w-full p-2 rounded-lg border text-xs ${bgInput}`}
                  />
                  <textarea
                    rows={2}
                    value={activeQuest.description}
                    onChange={e => setActiveQuest({ ...activeQuest, description: e.target.value })}
                    className={`w-full p-2 rounded-lg border text-xs ${bgInput}`}
                  />
                  <button
                    onClick={() => {
                      fetch(`${API_BASE}/api/sync/${userId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "admin_update", active_quest: activeQuest })
                      }).then(() => alert("Квест обновлен!"));
                    }}
                    className="w-full py-2.5 bg-amber-500 text-black font-bold rounded-xl text-xs"
                  >
                    Сохранить квест недели
                  </button>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-300">Список игроков ({leaderboard.length}):</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {leaderboard.map((u, i) => (
                      <div key={u.telegram_id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{i + 1}. {u.nickname}</div>
                          <div className="text-[10px] text-slate-400">
                            ID: {u.telegram_id} • {u.username ? `@${u.username}` : '—'} • {u.xp || 0} XP
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newLvl = prompt(`Уровень для ${u.nickname}:`, u.level);
                            if (newLvl !== null) {
                              const lvlNum = parseInt(newLvl) || 0;
                              fetch(`${API_BASE}/api/sync/${userId}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ action: "admin_update", target_id: u.telegram_id, level: lvlNum, quests: u.quests })
                              })
                                .then(r => r.json())
                                .then(res => { if (res.leaderboard) setLeaderboard(res.leaderboard); });
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

      <main className="p-4 max-w-lg mx-auto space-y-4">

        {/* ==================== 1. ВКЛАДКА "Я" ==================== */}
        {activeTab === 'me' && (
          <div className="space-y-4">
            {/* Сферы биохакинга (ТОЛЬКО АВТОМАТИЧЕСКИЙ РОСТ ПО ДОЛЯМ ПРОЦЕНТА!) */}
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <div>
                <h3 className="text-sm font-bold">{t.spheresTitle}</h3>
                <p className="text-[11px] text-slate-400">
                  Шкалы нельзя крутить вручную — они растут на +0.1% ... +0.5% за закрытие сна, БЖУ, тренировок, планов дня и квестов.
                </p>
              </div>
              {[
                { key: 'body', label: '💪 Сила и Тело (тренировки, БЖУ)', color: 'bg-rose-500' },
                { key: 'energy', label: '⚡ Энергия и Тонус (сон 7-9ч, 8 стаканов воды)', color: 'bg-amber-500' },
                { key: 'mind', label: '🧠 Интеллект и Фокус (16 вопросов, итоги дня)', color: 'bg-purple-500' },
                { key: 'discipline', label: '🛡️ Дисциплина (выдержка таймеров привычек)', color: 'bg-emerald-500' },
                { key: 'environment', label: '🤝 Окружение и Гильдия (квесты недели)', color: 'bg-cyan-500' },
                { key: 'career', label: '🚀 Продуктивность и 1% улучшения', color: 'bg-blue-500' }
              ].map(s => {
                const val = Number(spheres[s.key] || 10).toFixed(1);
                return (
                  <div key={s.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{s.label}</span>
                      <span className="font-mono font-bold text-emerald-400">{val}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} transition-all duration-500`} style={{ width: `${Math.min(100, val)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 1% Улучшения (XP дается максимум 1 раз в день!) */}
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                  <Sparkles className="w-4 h-4" /> {t.onePercentTitle}
                </h2>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  {xpClaims[`imp_${todayIso}`] ? "✅ Бонус дня получен" : "+15 XP (1 раз в день)"}
                </span>
              </div>
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
                    grantRewardOnce(`imp_${todayIso}`, 15, { career: 0.2 }, { improvements: next });
                  }}
                  className="px-4 rounded-xl bg-emerald-500 text-black font-bold text-xs shrink-0"
                >
                  + 1%
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {improvements.map(item => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex justify-between items-start text-xs">
                    <div>
                      <span className="text-emerald-400 font-bold mr-1.5">⚡ +1%:</span>
                      <span>{item.text}</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. ВКЛАДКА "ЗДОРОВЬЕ" ==================== */}
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
                {/* Параметры тела и ИИ-план БЖУ и веса */}
                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                    <Scale className="w-4 h-4" /> Параметры тела и Индивидуальный план БЖУ
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400">Вес (кг)</label>
                      <input type="number" value={bodyProfile.weight} onChange={e => setBodyProfile({ ...bodyProfile, weight: e.target.value })} onBlur={() => syncToCloud(xp, { bodyProfile })} className={`w-full p-2 rounded-lg border ${bgInput}`} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Рост (см)</label>
                      <input type="number" value={bodyProfile.height} onChange={e => setBodyProfile({ ...bodyProfile, height: e.target.value })} onBlur={() => syncToCloud(xp, { bodyProfile })} className={`w-full p-2 rounded-lg border ${bgInput}`} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Желаемый вес</label>
                      <input type="number" value={bodyProfile.targetWeight} onChange={e => setBodyProfile({ ...bodyProfile, targetWeight: e.target.value })} onBlur={() => syncToCloud(xp, { bodyProfile })} className={`w-full p-2 rounded-lg border ${bgInput}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400">Активность</label>
                      <select value={bodyProfile.activity} onChange={e => { const next = { ...bodyProfile, activity: e.target.value }; setBodyProfile(next); syncToCloud(xp, { bodyProfile: next }); }} className={`w-full p-2 rounded-lg border ${bgInput}`}>
                        <option value="light">Низкая</option>
                        <option value="med3">3 тр/нед средние</option>
                        <option value="hard3">3 тр/нед тяжелые</option>
                        <option value="athlete">5+ тр/нед</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Метаболизм</label>
                      <select value={bodyProfile.metabolism} onChange={e => { const next = { ...bodyProfile, metabolism: e.target.value }; setBodyProfile(next); syncToCloud(xp, { bodyProfile: next }); }} className={`w-full p-2 rounded-lg border ${bgInput}`}>
                        <option value="slow">Медленный</option>
                        <option value="normal">Средний</option>
                        <option value="fast">Быстрый</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Моя цель</label>
                      <select value={bodyProfile.goal} onChange={e => { const next = { ...bodyProfile, goal: e.target.value }; setBodyProfile(next); syncToCloud(xp, { bodyProfile: next }); }} className={`w-full p-2 rounded-lg border ${bgInput}`}>
                        <option value="gain">Набор массы</option>
                        <option value="maintain">Поддержание</option>
                        <option value="lose">Похудение</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
                    <div className="font-bold text-emerald-400">
                      🎯 Расчетная норма: {macroPlan.targetKcal} ккал | Б: {macroPlan.targetP}г | У: {macroPlan.targetC}г | Ж: {macroPlan.targetF}г
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Безопасный срок достижения {bodyProfile.targetWeight} кг без перегрузки ЖКТ: <b>~{macroPlan.safeWeeks} недель</b> (по 0.5–0.6 кг/нед).
                    </div>
                  </div>

                  {/* Взвешивание и График веса */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Записать текущий вес (кг)..."
                        value={newWeightInput}
                        onChange={e => setNewWeightInput(e.target.value)}
                        className={`flex-1 p-2 rounded-lg border text-xs ${bgInput}`}
                      />
                      <button
                        onClick={() => {
                          if (!newWeightInput) return;
                          const wVal = Number(newWeightInput);
                          const nextLogs = [...weightLogs.slice(-9), { date: todayStr.slice(0, 5), weight: wVal }];
                          const nextProf = { ...bodyProfile, weight: wVal };
                          setWeightLogs(nextLogs);
                          setBodyProfile(nextProf);
                          setNewWeightInput("");
                          syncToCloud(xp, { weightLogs: nextLogs, bodyProfile: nextProf });
                        }}
                        className="px-3 rounded-lg bg-emerald-500 text-black font-bold text-xs"
                      >
                        + Вес
                      </button>
                    </div>
                    {/* Визуальный график веса */}
                    <div className="flex items-end gap-2 h-20 pt-4 px-2 bg-slate-900/50 rounded-xl border border-slate-800">
                      {weightLogs.map((wl, i) => {
                        const minW = Math.min(...weightLogs.map(x => x.weight)) - 2;
                        const maxW = Math.max(...weightLogs.map(x => x.weight)) + 2;
                        const pct = Math.max(15, Math.min(100, ((wl.weight - minW) / (maxW - minW || 1)) * 100));
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <span className="text-[9px] text-emerald-400 font-bold mb-0.5">{wl.weight}</span>
                            <div className="w-full max-w-[20px] bg-emerald-500/70 rounded-t" style={{ height: `${pct * 0.45}px` }} />
                            <span className="text-[8px] text-slate-500 mt-0.5">{wl.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Водный баланс (XP только при достижении 8 стаканов 1 раз в день!) */}
                <div className={`p-4 rounded-2xl border ${bgCard} flex items-center justify-between`}>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1.5 text-cyan-400">
                      <Droplets className="w-4 h-4" /> Вода: {waterGlasses} / 8 стаканов
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {xpClaims[`water_${todayIso}`]
                        ? "✅ +20 XP за 8 стаканов сегодня получено!"
                        : "Награда +20 XP начисляется только по достижении 8 стаканов (1 раз в день)"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const nextVal = Math.max(0, waterGlasses - 1);
                        const nextMap = { ...waterByDate, [todayIso]: nextVal };
                        setWaterByDate(nextMap);
                        syncToCloud(xp, { waterByDate: nextMap });
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold"
                    >-</button>
                    <button
                      onClick={() => {
                        const nextVal = waterGlasses + 1;
                        const nextMap = { ...waterByDate, [todayIso]: nextVal };
                        setWaterByDate(nextMap);
                        if (nextVal >= 8) {
                          grantRewardOnce(`water_${todayIso}`, 20, { energy: 0.2 }, { waterByDate: nextMap });
                        } else {
                          syncToCloud(xp, { waterByDate: nextMap });
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs"
                    >+ Стакан</button>
                  </div>
                </div>

                {/* Счетчик БЖУ (XP дается ТОЛЬКО когда закрыта дневная норма по Калориям, Белкам и Углеводам!) */}
                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold">Дневник питания за сегодня</h3>
                      <div className="text-[10px] text-slate-400">
                        {xpClaims[`macros_${todayIso}`]
                          ? "✅ Дневная норма КБЖУ закрыта (+40 XP получено!)"
                          : "Закрой норму Калорий, Белков и Углеводов для получения +40 XP"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Ккал</div>
                      <div className="text-xs font-black text-emerald-400">{totalCalories} / {macroPlan.targetKcal}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Белки (главное)</div>
                      <div className="text-xs font-bold text-blue-400">{totalProtein} / {macroPlan.targetP}г</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Углеводы</div>
                      <div className="text-xs font-bold text-rose-400">{totalCarbs} / {macroPlan.targetC}г</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Жиры</div>
                      <div className="text-xs font-bold text-amber-400">{totalFat} / {macroPlan.targetF}г</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <input type="text" placeholder="Блюдо или продукт" value={mealName} onChange={e => setMealName(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
                    <div className="grid grid-cols-4 gap-2">
                      <input type="number" placeholder="Ккал" value={mealKcal} onChange={e => setMealKcal(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                      <input type="number" placeholder="Белки (г)" value={mealP} onChange={e => setMealP(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                      <input type="number" placeholder="Углев (г)" value={mealC} onChange={e => setMealC(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                      <input type="number" placeholder="Жиры (г)" value={mealF} onChange={e => setMealF(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                    </div>
                    <button
                      onClick={() => {
                        if (!mealName.trim()) return;
                        const next = [{ id: Date.now(), dateIso: todayIso, name: mealName, kcal: mealKcal || 0, p: mealP || 0, c: mealC || 0, f: mealF || 0 }, ...meals];
                        setMeals(next);
                        setMealName(""); setMealKcal(""); setMealP(""); setMealC(""); setMealF("");
                        syncToCloud(xp, { meals: next });
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                    >
                      + Записать прием пищи (XP дается по закрытию нормы дня)
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {todayMeals.map(m => (
                      <div key={m.id} className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.kcal} ккал • Б:{m.p}г У:{m.c}г Ж:{m.f}г</div>
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

            {/* СОН: только 1 раз в день, XP только если спал от 7 до 9 часов! */}
            {healthSub === 'sleep' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-400">
                  <Moon className="w-4 h-4" /> Сон (1 запись в сутки, бонус за 7–9 часов)
                </h3>
                {todaySleepAlreadyLogged ? (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300">
                    ✅ Сон за сегодня ({todayStr}) уже зафиксирован! Следующая запись будет доступна завтра.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" step="0.5" placeholder="Часов сна" value={sleepHours} onChange={e => setSleepHours(e.target.value)} className={`p-2.5 rounded-xl border text-xs ${bgInput}`} />
                      <select value={sleepQuality} onChange={e => setSleepQuality(e.target.value)} className={`p-2.5 rounded-xl border text-xs ${bgInput}`}>
                        <option value="Отлично">⚡ Отлично</option>
                        <option value="Нормально">👌 Нормально</option>
                        <option value="Тяжело">😴 Не выспался</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        const hrs = Number(sleepHours) || 0;
                        const next = [{ id: Date.now(), dateIso: todayIso, date: todayStr, hours: hrs, quality: sleepQuality }, ...sleepLogs];
                        setSleepLogs(next);
                        if (hrs >= 7 && hrs <= 9) {
                          grantRewardOnce(`sleep_${todayIso}`, 25, { energy: 0.3, mind: 0.2 }, { sleepLogs: next });
                        } else {
                          syncToCloud(xp, { sleepLogs: next });
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-xs"
                    >
                      Зафиксировать сон за сегодня (7–9 ч = +25 XP и рост Фокуса)
                    </button>
                  </>
                )}
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

            {/* ТРЕНИРОВКИ: Тип, длительность + Комментарий/Рекорд */}
            {healthSub === 'workouts' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <h3 className="text-sm font-bold flex items-center gap-2 text-rose-400">
                  <Dumbbell className="w-4 h-4" /> Дневник тренировок и личных рекордов
                </h3>
                <input
                  type="text"
                  placeholder="Тип тренировки (Зал, Бег, Борьба, Воркаут)"
                  value={workoutTitle}
                  onChange={e => setWorkoutTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                />
                <input
                  type="text"
                  placeholder="Длительность (напр. 60 мин)"
                  value={workoutDur}
                  onChange={e => setWorkoutDur(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                />
                <textarea
                  rows={2}
                  placeholder="Комментарий / Личный рекорд (для себя, без XP)"
                  value={workoutComment}
                  onChange={e => setWorkoutComment(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                />
                <button
                  onClick={() => {
                    if (!workoutTitle.trim()) return;
                    const next = [{ id: Date.now(), title: workoutTitle, dur: workoutDur, comment: workoutComment, date: todayStr }, ...workouts];
                    setWorkouts(next);
                    setWorkoutTitle(""); setWorkoutDur(""); setWorkoutComment("");
                    grantRewardOnce(`workout_${todayIso}`, 30, { body: 0.4 }, { workouts: next });
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs"
                >
                  Сохранить тренировку (+0.4% к Силе тела)
                </button>
                <div className="space-y-2 pt-2">
                  {workouts.map(w => (
                    <div key={w.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="font-bold text-rose-400">{w.title} ({w.dur})</span>
                        <span className="text-[10px] text-slate-400">{w.date}</span>
                      </div>
                      {w.comment && <div className="text-slate-300 italic">🏆 {w.comment}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. ВКЛАДКА "ФОКУС" ==================== */}
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

            {/* План на день vs Итог (СТРОГО 1 РАЗ В ДЕНЬ!) */}
            {focusSub === 'goals' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-emerald-400">План на день vs Реальный итог ({todayStr})</h3>
                    <span className="text-[10px] text-slate-400">1 раз в сутки</span>
                  </div>

                  {todayPlanAlreadyArchived ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                      ✅ Итоги за {todayStr} уже подведены и сохранены в истории ниже! Новая запись откроется завтра.
                    </div>
                  ) : (
                    <>
                      <textarea
                        rows={3}
                        placeholder="☀️ УТРО: Что я планирую сделать сегодня?"
                        value={dailyMorningPlan}
                        onChange={e => setDailyMorningPlan(e.target.value)}
                        onBlur={() => syncToCloud(xp, { dailyMorningPlan })}
                        className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                      />
                      <textarea
                        rows={3}
                        placeholder="🌙 ВЕЧЕР: Что реально сделал по итогу дня?"
                        value={dailyEveningReview}
                        onChange={e => setDailyEveningReview(e.target.value)}
                        onBlur={() => syncToCloud(xp, { dailyEveningReview })}
                        className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                      />
                      <button
                        onClick={() => {
                          if (!dailyMorningPlan.trim() || !dailyEveningReview.trim()) {
                            alert("Заполни и утренний план, и вечерний итог перед закрытием дня!");
                            return;
                          }
                          const entry = {
                            id: Date.now(),
                            dateIso: todayIso,
                            date: todayStr,
                            plan: dailyMorningPlan,
                            review: dailyEveningReview
                          };
                          const nextHist = [entry, ...dailyHistory];
                          setDailyHistory(nextHist);
                          grantRewardOnce(`plan_${todayIso}`, 25, { discipline: 0.3, mind: 0.2 }, {
                            dailyHistory: nextHist,
                            dailyMorningPlan: "",
                            dailyEveningReview: ""
                          });
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                      >
                        Подвести итог дня и сохранить в архив (+25 XP)
                      </button>
                    </>
                  )}
                </div>

                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">📜 История прошлых дней ({dailyHistory.length})</h4>
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {dailyHistory.map(item => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                        <div className="font-bold text-emerald-400">📅 {item.date}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-slate-950/60">
                            <div className="text-[10px] text-amber-400 font-bold">Хотел сделать:</div>
                            <div className="whitespace-pre-wrap">{item.plan}</div>
                          </div>
                          <div className="p-2 rounded bg-slate-950/60">
                            <div className="text-[10px] text-emerald-400 font-bold">Сделал по итогу:</div>
                            <div className="whitespace-pre-wrap">{item.review}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Таймеры привычек: XP только за 1д, 2д, 7д, 30д + Кнопка сброса с подтверждением, Попыткой #N и Рекордом */}
            {focusSub === 'habits' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <div>
                  <h3 className="text-sm font-bold">Таймеры привычек и воздержания</h3>
                  <p className="text-[11px] text-slate-400">
                    За создание таймера XP не дается. Опыт начисляется автоматически за выдержку: 1 день, 2 дня, 1 неделя, 1 месяц.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {habits.map(h => {
                    const currentDays = Math.floor((Date.now() - h.start) / 86400000);
                    const bestRec = Math.max(h.maxRecordDays || 0, currentDays);
                    return (
                      <div key={h.id} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold mr-1.5 ${
                              h.type === 'bad' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {h.type === 'bad' ? 'Отказ' : 'Привычка'}
                            </span>
                            <span className="font-bold text-xs">{h.name}</span>
                            {h.motiv && <div className="text-[11px] text-slate-400 mt-0.5">«{h.motiv}»</div>}
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-amber-400 font-bold">
                              Попытка #{h.attempts || 1} • Рекорд: {bestRec} дн.
                            </div>
                            <div className="font-mono text-xs font-bold text-emerald-400 mt-0.5">
                              {formatTimer(h.start)}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => {
                              if (window.confirm(`Вы точно хотите сбросить прогресс по привычке «${h.name}» и начать сначала?`)) {
                                const next = habits.map(x => x.id === h.id ? {
                                  ...x,
                                  start: Date.now(),
                                  attempts: (x.attempts || 1) + 1,
                                  maxRecordDays: bestRec
                                } : x);
                                setHabits(next);
                                syncToCloud(xp, { habits: next });
                              }
                            }}
                            className="text-[11px] text-rose-400 flex items-center gap-1 font-semibold"
                          >
                            <RotateCcw className="w-3 h-3" /> Сбросить прогресс (срыв)
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Удалить этот таймер полностью?")) {
                                const next = habits.filter(x => x.id !== h.id);
                                setHabits(next);
                                syncToCloud(xp, { habits: next });
                              }
                            }}
                            className="text-[11px] text-slate-500 hover:text-rose-400"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setHabitType('bad')} className={`py-1.5 rounded-lg text-xs font-bold border ${habitType === 'bad' ? 'border-rose-500 bg-rose-500/20 text-rose-400' : 'border-slate-700 text-slate-400'}`}>🛑 Вредная (Отказ)</button>
                    <button onClick={() => setHabitType('good')} className={`py-1.5 rounded-lg text-xs font-bold border ${habitType === 'good' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-400'}`}>🌱 Хорошая (Внедрение)</button>
                  </div>
                  <input type="text" placeholder="Название привычки" value={habitName} onChange={e => setHabitName(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
                  <input type="text" placeholder="Мотивация (зачем?)" value={habitMotiv} onChange={e => setHabitMotiv(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
                  <button
                    onClick={() => {
                      if (!habitName.trim()) return;
                      const next = [...habits, {
                        id: Date.now(), name: habitName, type: habitType,
                        start: Date.now(), motiv: habitMotiv, attempts: 1, maxRecordDays: 0, claimedMilestones: []
                      }];
                      setHabits(next);
                      setHabitName(""); setHabitMotiv("");
                      syncToCloud(xp, { habits: next });
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                  >
                    + Запустить таймер
                  </button>
                </div>
              </div>
            )}

            {focusSub === 'q16' && (
              <div className="space-y-3">
                {QUESTIONS_16.map((q, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${bgCard} space-y-2`}>
                    <div className="text-xs font-bold text-emerald-400">Вопрос #{i + 1}</div>
                    <div className="text-xs font-semibold">{q}</div>
                    <textarea
                      rows={2}
                      placeholder="Твой ответ..."
                      value={answers16[i] || ""}
                      onChange={e => setAnswers16({ ...answers16, [i]: e.target.value })}
                      onBlur={() => {
                        if ((answers16[i] || "").trim().length > 10) {
                          grantRewardOnce(`q16_${i}`, 10, { mind: 0.2 }, { answers16 });
                        } else {
                          syncToCloud(xp, { answers16 });
                        }
                      }}
                      className={`w-full p-2 rounded-lg border text-xs ${bgInput}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== 4. ВКЛАДКА "КАЛЕНДАРЬ И ЗАМЕТКИ" (Без XP, с отображением дат событий) ==================== */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCalSub('schedule')}
                className={`py-2.5 rounded-xl text-xs font-bold border ${calSub === 'schedule' ? 'bg-emerald-500 text-black border-emerald-500' : `${bgCard} text-slate-400`}`}
              >
                📅 Расписание и События
              </button>
              <button
                onClick={() => setCalSub('notes')}
                className={`py-2.5 rounded-xl text-xs font-bold border ${calSub === 'notes' ? 'bg-emerald-500 text-black border-emerald-500' : `${bgCard} text-slate-400`}`}
              >
                📝 Заметки и Списки
              </button>
            </div>

            {calSub === 'schedule' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-emerald-400">Планировщик событий</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className={`p-1.5 rounded-lg border text-xs ${bgInput}`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                  <select value={eventCat} onChange={e => setEventCat(e.target.value)} className={`col-span-2 p-2 rounded-xl border text-xs ${bgInput}`}>
                    <option value="Дело">💼 Дело / Работа</option>
                    <option value="Здоровье">💪 Тренировка</option>
                    <option value="Фокус">🧠 Учеба / Фокус</option>
                    <option value="Встреча">🤝 Встреча</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Событие на ${selectedDate}...`}
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    className={`flex-1 p-2.5 rounded-xl border text-xs ${bgInput}`}
                  />
                  <button
                    onClick={() => {
                      if (!eventTitle.trim()) return;
                      const next = [...events, { id: Date.now(), date: selectedDate, time: eventTime, title: eventTitle, category: eventCat, done: false }]
                        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
                      setEvents(next);
                      setEventTitle("");
                      syncToCloud(xp, { events: next });
                    }}
                    className="px-4 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                  >
                    + Добавить
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {events.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-6">Событий пока нет. Выбери дату и добавь задачу!</div>
                  ) : (
                    events.map(ev => (
                      <div key={ev.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const next = events.map(x => x.id === ev.id ? { ...x, done: !x.done } : x);
                              setEvents(next);
                              syncToCloud(xp, { events: next });
                            }}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                              ev.done ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-600'
                            }`}
                          >
                            {ev.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <div className={`font-bold ${ev.done ? 'line-through text-slate-500' : ''}`}>
                              {ev.title}
                            </div>
                            {/* Отображение точной даты и времени события */}
                            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                              📅 {ev.date} в {ev.time} • <span className="text-slate-400">{ev.category}</span>
                            </div>
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
            )}

            {calSub === 'notes' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <h3 className="text-sm font-bold text-amber-400">Заметки и списки</h3>
                <input
                  type="text"
                  placeholder="🔍 Поиск по заметкам..."
                  value={noteSearch}
                  onChange={e => setNoteSearch(e.target.value)}
                  className={`w-full p-2 rounded-xl border text-xs ${bgInput}`}
                />
                <input
                  type="text"
                  placeholder="Заголовок заметки"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold ${bgInput}`}
                />
                <textarea
                  rows={3}
                  placeholder="Текст заметки или список покупок..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`}
                />
                <button
                  onClick={() => {
                    if (!noteTitle.trim() && !noteText.trim()) return;
                    const next = [{ id: Date.now(), title: noteTitle || "Заметка", text: noteText, date: todayStr }, ...notes];
                    setNotes(next);
                    setNoteTitle(""); setNoteText("");
                    syncToCloud(xp, { notes: next });
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
                >
                  + Сохранить заметку
                </button>
                <div className="space-y-2 pt-2">
                  {notes
                    .filter(n => (n.title + n.text).toLowerCase().includes(noteSearch.toLowerCase()))
                    .map(n => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="font-bold text-amber-400">{n.title}</span>
                          <button onClick={() => {
                            const next = notes.filter(x => x.id !== n.id);
                            setNotes(next);
                            syncToCloud(xp, { notes: next });
                          }} className="text-slate-500">✕</button>
                        </div>
                        <div className="text-slate-300 whitespace-pre-wrap">{n.text}</div>
                        <div className="text-[10px] text-slate-500">{n.date}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 5. ВКЛАДКА "ИИ" (Персональный нейро-ассистент) ==================== */}
        {activeTab === 'ai' && (
          <div className={`p-4 rounded-2xl border ${bgCard} flex flex-col h-[72vh]`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">Нейро-Ментор LIFE OS</div>
                  <div className="text-[10px] text-emerald-400">Анализирует твой календарь, БЖУ, заметки и цели</div>
                </div>
              </div>
            </div>

            {/* Быстрые кнопки запросов к ИИ */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 shrink-0">
              <button onClick={() => handleSendAiMessage("Что мне нужно сегодня сделать по календарю и режиму?")} className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[11px] text-emerald-400 whitespace-nowrap border border-slate-700">
                📋 Что мне сегодня сделать?
              </button>
              <button onClick={() => handleSendAiMessage("Разбери мое питание и норму БЖУ на сегодня")} className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[11px] text-amber-400 whitespace-nowrap border border-slate-700">
                🍽️ Анализ моего БЖУ
              </button>
              <button onClick={() => handleSendAiMessage("Покажи мои заметки и дай совет")} className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[11px] text-cyan-400 whitespace-nowrap border border-slate-700">
                📝 Мои заметки и фокус
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {aiMessages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-emerald-500 text-black font-semibold'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-3 mt-2 border-t border-slate-800">
              <input
                type="text"
                placeholder="Напиши ИИ (спроси совет, план на день, разбор)..."
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendAiMessage()}
                className={`flex-1 p-2.5 rounded-xl border text-xs ${bgInput}`}
              />
              <button
                onClick={() => handleSendAiMessage()}
                className="px-4 rounded-xl bg-emerald-500 text-black font-bold flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================== 6. ВКЛАДКА "ГИЛЬДИЯ" ==================== */}
        {activeTab === 'guild' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 text-emerald-400">
                    <Shield className="w-4 h-4" /> Гильдия @life_is_rpg_game
                  </h3>
                  <p className="text-[11px] text-slate-400">Твой уровень ({level} LVL) и опыт ({xp} XP) синхронизированы</p>
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

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Твой ник в Гильдии"
                  value={newNickInput}
                  onChange={e => setNewNickInput(e.target.value)}
                  className={`flex-1 p-2 rounded-xl border text-xs ${bgInput}`}
                />
                <button
                  onClick={() => {
                    if (!newNickInput.trim()) return;
                    const clean = newNickInput.trim();
                    setNickname(clean);
                    setLeaderboard(prev => prev.map(u => u.telegram_id === userId ? { ...u, nickname: clean } : u));
                    fetch(`${API_BASE}/api/sync/${userId}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "set_nickname", nickname: clean })
                    });
                  }}
                  className="px-3 rounded-xl bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs"
                >
                  Сохранить ник
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161f30] to-[#0f172a] border border-emerald-500/30 text-center">
              <div className="text-xs text-emerald-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" /> До розыгрыша награды и нового квеста:
              </div>
              <div className="text-2xl font-mono font-black text-white py-1">
                {timeLeft.d}д {timeLeft.h}ч {timeLeft.m}м {timeLeft.s}с
              </div>
              <div className="text-[11px] text-slate-400">Каждое воскресенье в 10:00 МСК</div>
            </div>

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
                  const nextXp = xp + reward;
                  setWeeklyDone(true);
                  setXp(nextXp);
                  const nextSpheres = {
                    ...spheres,
                    environment: Math.min(100, +(spheres.environment + 0.5).toFixed(2))
                  };
                  setSpheres(nextSpheres);
                  localStorage.setItem(`lifeos_v3_${userId}`, JSON.stringify({
                    nickname, xp: nextXp, weeklyDone: true, app_state: getFullAppState({ spheres: nextSpheres })
                  }));
                  fetch(`${API_BASE}/api/sync/${userId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "complete_quest", xp_reward: reward })
                  })
                    .then(r => r.json())
                    .then(res => { if (res.leaderboard) setLeaderboard(res.leaderboard); });
                }}
                disabled={weeklyDone}
                className={`w-full py-3 rounded-xl font-bold text-xs ${
                  weeklyDone ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-500 text-black'
                }`}
              >
                {weeklyDone ? "✅ Квест недели выполнен!" : `⚡ Выполнить квест (+${activeQuest.xp_reward || 100} XP)`}
              </button>
            </div>

            {/* Общий рейтинг Гильдии с актуальными уровнями */}
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-2.5`}>
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> Рейтинг игроков Гильдии ({leaderboard.length})
              </h4>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {leaderboard.map((u, i) => {
                  const displayLvl = u.telegram_id === userId ? Math.max(u.level || 0, level) : (u.level || 0);
                  const displayXp = u.telegram_id === userId ? Math.max(u.xp || 0, xp) : (u.xp || 0);
                  return (
                    <div
                      key={u.telegram_id}
                      className={`p-2.5 rounded-xl border flex justify-between items-center text-xs ${
                        u.telegram_id === userId ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-slate-900/50 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono w-5">{i + 1}.</span>
                        <span className="font-bold">{u.nickname}</span>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                          LVL {displayLvl}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{displayXp} XP • {u.quests} кв.</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* НИЖНЯЯ ПАНЕЛЬ НА 6 ВКЛАДОК (С ИИ ВМЕСТО ОТДЕЛЬНЫХ ЗАМЕТОК) */}
      <nav className={`fixed bottom-0 left-0 right-0 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a]/95 border-slate-800'} backdrop-blur-md border-t grid grid-cols-6 py-1.5 px-1 z-30`}>
        {[
          { id: 'me', label: t.me, icon: User },
          { id: 'health', label: t.health, icon: Heart },
          { id: 'focus', label: t.focus, icon: Target },
          { id: 'calendar', label: t.calendar, icon: CalIcon },
          { id: 'ai', label: t.ai, icon: Bot },
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
