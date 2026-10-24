import React, { useState, useEffect } from 'react';
import {
  User, Heart, Target, Calendar as CalIcon, Bot, Shield,
  Flame, Settings, Trash2, Clock, Droplets, Moon, Dumbbell,
  Trophy, Crown, Lock, Sparkles, Sun, Globe, ExternalLink,
  Check, RotateCcw, Send, Scale
} from 'lucide-react';

const API_BASE = "https://rpg-bot-v4s3.onrender.com";
const ADMIN_ID = 1210391242;

const QUESTIONS_16_DATA = {
  ru: [
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
  ],
  en: [
    "What would I do if I already had $100 million?",
    "What drains my energy?",
    "Who in my circle pulls me down and why do I tolerate it?",
    "Who charges me with energy and why do I spend so little time with them?",
    "What fills me with energy?",
    "In what moments of life do I completely lose track of time?",
    "What do I personally consider success?",
    "If I truly didn't care about others' opinions, what would I do?",
    "How much money do I actually need to feel free?",
    "What does my ideal ordinary day look like?",
    "Which belief about myself holds me back the most?",
    "What will I regret in 10 years if I don't do it today?",
    "What is the simplest action that moves me forward right now?",
    "If I only had one hour a day to achieve my goal, what would I do?",
    "How would I act if I knew it would work out in the end anyway?",
    "What advice can I give myself right now?"
  ]
};

const DICT = {
  ru: {
    me: "Я", health: "Здоровье", focus: "Фокус", calendar: "Календарь", ai: "ИИ", guild: "Гильдия",
    nextLvl: "след. ур:",
    settings: "Настройки", close: "Закрыть",
    theme: "Тема оформления", dark: "Темная", light: "Светлая",
    lang: "Язык интерфейса",
    adminBtn: "Панель Создателя (Админ)",
    resetBtn: "Удалить весь прогресс и начать сначала",
    resetConfirm: "Вы точно хотите обнулить весь свой прогресс, XP, сферы и начать с чистого листа?",
    streakTitle: "Дней подряд в режиме",
    streakDesc: "Заходи каждый день, чтобы огонек не погас!",
    streakBtn: "Продолжать серию!",
    spheresTitle: "Баланс сфер биохакинга",
    spheresSubtitle: "Шкала растет за закрытие сна, БЖУ, тренировок, планов дня и квестов.",
    spBody: "💪 Сила и Тело (тренировки, БЖУ)",
    spEnergy: "⚡ Энергия и Тонус (сон 7-9ч, 8 стаканов воды)",
    spMind: "🧠 Интеллект и Фокус (16 вопросов, итоги дня)",
    spDiscipline: "🛡️ Дисциплина (выдержка таймеров привычек)",
    spEnv: "🤝 Окружение и Гильдия (квесты недели)",
    spCareer: "🚀 Продуктивность и 1% улучшения",
    onePercentTitle: "Улучшения на 1% (Мотивация и микро-шаги)",
    bonusDone: "✅ Бонус дня получен",
    oncePerDay15: "+15 XP (1 раз в день)",
    onePercentPlaceholder: "В чем ты стал лучше на 1% сегодня?",
    sleep: "Сон", nutrition: "Питание и Вес", workouts: "Тренировки",
    bodyParamsTitle: "Параметры тела и Индивидуальный план БЖУ",
    weightKg: "Вес (кг)", heightCm: "Рост (см)", targetWeight: "Желаемый вес",
    activity: "Активность", actLight: "Низкая", actMed: "3 тр/нед средние", actHard: "3 тр/нед тяжелые", actAth: "5+ тр/нед",
    metabolism: "Метаболизм", metaSlow: "Медленный", metaNorm: "Средний", metaFast: "Быстрый",
    myGoal: "Моя цель", goalGain: "Набор массы", goalMaint: "Поддержание", goalLose: "Похудение",
    calcNorm: "🎯 Расчетная норма:", kcal: "ккал", pShort: "Б", cShort: "У", fShort: "Ж",
    safeTerm1: "Безопасный срок достижения", safeTerm2: "кг без перегрузки ЖКТ:", weeks: "недель (по 0.5–0.6 кг/нед).",
    logWeightPlaceholder: "Записать текущий вес (кг)...", addWeightBtn: "+ Вес",
    weightChartHint: "↔️ Листай график влево-вправо (нажми на столбик, чтобы удалить ошибку)",
    waterTitle: "Вода:", glasses: "стаканов",
    waterDone: "✅ +20 XP за 8 стаканов сегодня получено!",
    waterHint: "Награда +20 XP начисляется по достижении 8 стаканов (1 раз в день)",
    addGlass: "+ Стакан",
    foodDiaryTitle: "Дневник питания за сегодня",
    macrosDone: "✅ Дневная норма КБЖУ закрыта (+40 XP получено!)",
    macrosHint: "Закрой норму Калорий, Белков и Углеводов для получения +40 XP",
    proteinsMain: "Белки", carbs: "Углеводы", fats: "Жиры",
    mealPlaceholder: "Блюдо или продукт",
    addMealBtn: "+ Записать прием пищи (XP по закрытию нормы)",
    sleepTitle: "Сон (1 запись в сутки, бонус за 7–9 часов)",
    sleepAlready: "✅ Сон за сегодня уже зафиксирован! Следующая запись завтра.",
    sleepHoursPlaceholder: "Часов сна",
    sleepExc: "⚡ Отлично", sleepOk: "👌 Нормально", sleepBad: "😴 Не выспался",
    saveSleepBtn: "Зафиксировать сон за сегодня (7–9 ч = +25 XP)",
    workoutsTitle: "Дневник тренировок и личных рекордов",
    workoutTypePlaceholder: "Тип тренировки (Зал, Бег, Борьба, Воркаут)",
    workoutDurPlaceholder: "Длительность (напр. 60 мин)",
    workoutCommPlaceholder: "Комментарий / Личный рекорд (для себя, без XP)",
    saveWorkoutBtn: "Сохранить тренировку (+0.4% к Силе тела)",
    goalsToday: "Цели и Итоги дня", habits: "Таймеры привычек", q16: "16 Вопросов",
    planVsReview: "План на день vs Реальный итог", oncePerDay: "1 раз в сутки",
    planArchivedMsg: "✅ Итоги за сегодня уже подведены и сохранены в истории ниже!",
    morningPlaceholder: "☀️ УТРО: Что я планирую сделать сегодня?",
    eveningPlaceholder: "🌙 ВЕЧЕР: Что реально сделал по итогу дня?",
    saveDayArchiveBtn: "Подвести итог дня и сохранить в архив (+25 XP)",
    historyDays: "📜 История прошлых дней", wantedToDo: "Хотел сделать:", didInFact: "Сделал по итогу:",
    habitsTitle: "Таймеры привычек и воздержания",
    habitsSub: "Опыт начисляется автоматически за выдержку: 1 день, 2 дня, 1 неделя, 1 месяц.",
    tagBad: "Отказ", tagGood: "Привычка", attempt: "Попытка", record: "Рекорд:", daysShort: "дн.",
    resetHabitBtn: "Сбросить прогресс (срыв)", deleteBtn: "Удалить",
    badHabitBtn: "🛑 Вредная (Отказ)", goodHabitBtn: "🌱 Хорошая (Внедрение)",
    habitNamePh: "Название привычки", habitMotivPh: "Мотивация (зачем?)", startTimerBtn: "+ Запустить таймер",
    questionNum: "Вопрос #", answerPh: "Твой ответ...",
    schedTab: "📅 Расписание и События", notesTab: "📝 Заметки и Списки",
    schedTitle: "Планировщик событий",
    catWork: "💼 Дело / Работа", catHealth: "💪 Тренировка", catFocus: "🧠 Учеба / Фокус", catMeet: "🤝 Встреча",
    eventPh: "Событие на", addBtn: "+ Добавить", noEvents: "Событий пока нет. Выбери дату и добавь задачу!",
    notesTitle: "Заметки и списки", searchNotesPh: "🔍 Поиск по заметкам...",
    noteTitlePh: "Заголовок заметки", noteTextPh: "Текст заметки или список покупок...", saveNoteBtn: "+ Сохранить заметку",
    aiTitle: "Нейро-Ментор LIFE OS", aiSub: "Анализирует твой календарь, БЖУ, заметки и цели",
    aiQuick1: "📋 Что мне сегодня сделать?", aiQuick2: "🍽️ Анализ моего БЖУ", aiQuick3: "📝 Мои заметки и фокус",
    aiInputPh: "Напиши ИИ (спроси совет, план на день, разбор)...",
    guildTitle: "Гильдия @life_is_rpg_game", guildSub: "Твой уровень и опыт синхронизированы",
    channelBtn: "Канал", nickPh: "Твой ник в Гильдии", saveNickBtn: "Сохранить ник",
    timerTitle: "До розыгрыша награды и нового квеста:", sunday10: "Каждое воскресенье в 10:00 МСК",
    weeklyQuestBadge: "ЕЖЕНЕДЕЛЬНОЕ ЗАДАНИЕ ГИЛЬДИИ",
    questDoneBtn: "✅ Квест недели выполнен!", questDoBtn: "⚡ Выполнить квест",
    leaderboardTitle: "Рейтинг игроков Гильдии", questsShort: "кв.",
    adminPanelTitle: "Панель Создателя", noRights: "Вы не обладаете необходимыми правами",
    questEditor: "Редактор квеста Гильдии:", saveQuestBtn: "Сохранить квест недели", playersList: "Список игроков"
  },
  en: {
    me: "Me", health: "Health", focus: "Focus", calendar: "Calendar", ai: "AI Coach", guild: "Guild",
    nextLvl: "next lvl:",
    settings: "Settings", close: "Close",
    theme: "Appearance", dark: "Dark", light: "Light",
    lang: "Interface Language",
    adminBtn: "Creator Panel (Admin)",
    resetBtn: "Reset all progress & start over",
    resetConfirm: "Are you sure you want to reset all your progress, XP, spheres and start from scratch?",
    streakTitle: "Day Streak",
    streakDesc: "Open the app every day to keep your streak alive!",
    streakBtn: "Keep Going!",
    spheresTitle: "Biohacking Spheres Balance",
    spheresSubtitle: "Grows from completing sleep, macros, workouts, daily plans, and quests.",
    spBody: "💪 Strength & Body (workouts, macros)",
    spEnergy: "⚡ Energy & Tone (7-9h sleep, 8 glasses of water)",
    spMind: "🧠 Intellect & Focus (16 questions, daily review)",
    spDiscipline: "🛡️ Discipline (habit timer streaks)",
    spEnv: "🤝 Environment & Guild (weekly quests)",
    spCareer: "🚀 Productivity & 1% improvements",
    onePercentTitle: "1% Improvements (Motivation & Micro-wins)",
    bonusDone: "✅ Daily bonus claimed",
    oncePerDay15: "+15 XP (once a day)",
    onePercentPlaceholder: "How did you become 1% better today?",
    sleep: "Sleep", nutrition: "Nutrition & Weight", workouts: "Workouts",
    bodyParamsTitle: "Body Metrics & Custom Macro Plan",
    weightKg: "Weight (kg)", heightCm: "Height (cm)", targetWeight: "Target Weight",
    activity: "Activity", actLight: "Low", actMed: "3x/wk medium", actHard: "3x/wk heavy", actAth: "5+x/wk",
    metabolism: "Metabolism", metaSlow: "Slow", metaNorm: "Normal", metaFast: "Fast",
    myGoal: "My Goal", goalGain: "Muscle Gain", goalMaint: "Maintain", goalLose: "Fat Loss",
    calcNorm: "🎯 Daily Target:", kcal: "kcal", pShort: "P", cShort: "C", fShort: "F",
    safeTerm1: "Safe timeline to reach", safeTerm2: "kg without gut overload:", weeks: "weeks (0.5–0.6 kg/wk).",
    logWeightPlaceholder: "Log current weight (kg)...", addWeightBtn: "+ Weight",
    weightChartHint: "↔️ Scroll chart left/right (tap a bar to delete an entry)",
    waterTitle: "Water:", glasses: "glasses",
    waterDone: "✅ +20 XP for 8 glasses claimed today!",
    waterHint: "+20 XP is awarded upon reaching 8 glasses (once per day)",
    addGlass: "+ Glass",
    foodDiaryTitle: "Today's Nutrition Log",
    macrosDone: "✅ Daily Macro Target hit (+40 XP claimed!)",
    macrosHint: "Hit your Calories, Protein, and Carbs target to earn +40 XP",
    proteinsMain: "Protein", carbs: "Carbs", fats: "Fats",
    mealPlaceholder: "Meal or food item",
    addMealBtn: "+ Log Meal (XP awarded when daily target is met)",
    sleepTitle: "Sleep (1 log/day, bonus for 7–9 hours)",
    sleepAlready: "✅ Today's sleep is already logged! Next entry tomorrow.",
    sleepHoursPlaceholder: "Hours slept",
    sleepExc: "⚡ Excellent", sleepOk: "👌 Good", sleepBad: "😴 Tired",
    saveSleepBtn: "Log Today's Sleep (7–9h = +25 XP)",
    workoutsTitle: "Workout & Personal Records Log",
    workoutTypePlaceholder: "Workout type (Gym, Run, Boxing, Calisthenics)",
    workoutDurPlaceholder: "Duration (e.g. 60 min)",
    workoutCommPlaceholder: "Notes / Personal Record (for yourself, no XP)",
    saveWorkoutBtn: "Save Workout (+0.4% to Body Strength)",
    goalsToday: "Daily Plan & Review", habits: "Habit Timers", q16: "16 Questions",
    planVsReview: "Morning Plan vs Evening Review", oncePerDay: "Once a day",
    planArchivedMsg: "✅ Today's review is already saved in the history below!",
    morningPlaceholder: "☀️ MORNING: What do I plan to accomplish today?",
    eveningPlaceholder: "🌙 EVENING: What did I actually get done today?",
    saveDayArchiveBtn: "Complete Day & Save to Archive (+25 XP)",
    historyDays: "📜 Past Days Archive", wantedToDo: "Planned:", didInFact: "Completed:",
    habitsTitle: "Habit & Abstinence Timers",
    habitsSub: "XP is granted automatically for milestones: 1 day, 2 days, 1 week, 1 month.",
    tagBad: "Quit", tagGood: "Build", attempt: "Attempt", record: "Record:", daysShort: "d.",
    resetHabitBtn: "Reset progress (relapse)", deleteBtn: "Delete",
    badHabitBtn: "🛑 Bad Habit (Quit)", goodHabitBtn: "🌱 Good Habit (Build)",
    habitNamePh: "Habit name", habitMotivPh: "Motivation (why?)", startTimerBtn: "+ Start Timer",
    questionNum: "Question #", answerPh: "Your answer...",
    schedTab: "📅 Schedule & Events", notesTab: "📝 Notes & Lists",
    schedTitle: "Event Planner",
    catWork: "💼 Work / Task", catHealth: "💪 Workout", catFocus: "🧠 Deep Focus", catMeet: "🤝 Meeting",
    eventPh: "Event for", addBtn: "+ Add", noEvents: "No events yet. Pick a date and add a task!",
    notesTitle: "Notes & Shopping Lists", searchNotesPh: "🔍 Search notes...",
    noteTitlePh: "Note title", noteTextPh: "Note text or shopping list...", saveNoteBtn: "+ Save Note",
    aiTitle: "LIFE OS AI Mentor", aiSub: "Analyzes your calendar, macros, notes, and goals",
    aiQuick1: "📋 What should I do today?", aiQuick2: "🍽️ Analyze my macros", aiQuick3: "📝 My notes & focus",
    aiInputPh: "Ask AI (advice, daily plan, analysis)...",
    guildTitle: "Guild @life_is_rpg_game", guildSub: "Your level and XP are synced",
    channelBtn: "Channel", nickPh: "Your Guild Nickname", saveNickBtn: "Save Nick",
    timerTitle: "Time until weekly reward & new quest:", sunday10: "Every Sunday at 10:00 MSK",
    weeklyQuestBadge: "WEEKLY GUILD QUEST",
    questDoneBtn: "✅ Weekly Quest Completed!", questDoBtn: "⚡ Complete Quest",
    leaderboardTitle: "Guild Leaderboard", questsShort: "q.",
    adminPanelTitle: "Creator Panel", noRights: "You do not have sufficient permissions",
    questEditor: "Guild Quest Editor:", saveQuestBtn: "Save Weekly Quest", playersList: "Players List"
  }
};

export default function App() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  const userId = tg?.initDataUnsafe?.user?.id || ADMIN_ID;
  const todayIso = new Date().toISOString().split('T')[0];
  const todayStr = new Date().toLocaleDateString('ru-RU');

  const [activeTab, setActiveTab] = useState('me');
  const [healthSub, setHealthSub] = useState('nutrition');
  const [focusSub, setFocusSub] = useState('goals');
  const [calSub, setCalSub] = useState('schedule');
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);

  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('ru');
  const t = DICT[lang] || DICT.ru;
  const questionsList = QUESTIONS_16_DATA[lang] || QUESTIONS_16_DATA.ru;

  const [nickname, setNickname] = useState("Новобранец");
  const [xp, setXp] = useState(0);
  const level = Math.floor(xp / 500);
  const [syncing, setSyncing] = useState(false);
  const [xpClaims, setXpClaims] = useState({});
  const [streak, setStreak] = useState({ count: 1, lastDate: "" });

  const [spheres, setSpheres] = useState({
    body: 10.0, energy: 10.0, mind: 10.0, discipline: 10.0, environment: 10.0, career: 10.0
  });
  const [improvements, setImprovements] = useState([]);
  const [newImpText, setNewImpText] = useState("");

  const [bodyProfile, setBodyProfile] = useState({
    weight: 70, height: 182, age: 22,
    activity: "hard3", metabolism: "fast", goal: "gain",
    targetWeight: 78, targetWeeks: 16
  });
  const [weightLogs, setWeightLogs] = useState([
    { id: 1, date: todayStr.slice(0, 5), weight: 70 }
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

  const [sleepLogs, setSleepLogs] = useState([]);
  const [sleepHours, setSleepHours] = useState("8");
  const [sleepQuality, setSleepQuality] = useState("Отлично");

  const [workouts, setWorkouts] = useState([]);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutDur, setWorkoutDur] = useState("");
  const [workoutComment, setWorkoutComment] = useState("");

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

  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [events, setEvents] = useState([]);
  const [eventTime, setEventTime] = useState("12:00");
  const [eventTitle, setEventTitle] = useState("");
  const [eventCat, setEventCat] = useState("Дело");

  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      text: lang === 'en'
        ? "Hi! I am your AI Mentor. I can analyze your schedule, macros, notes, and habits. Ask me what to focus on today!"
        : "Привет! Я твой ИИ-ассистент. Я вижу твой режим, задачи в календаре, заметки и прогресс по БЖУ. Спроси меня, что нужно сделать сегодня!"
    }
  ]);
  const [aiInput, setAiInput] = useState("");

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

  // Расчет нормы КБЖУ
  const calculateNutritionPlan = () => {
    const w = Number(bodyProfile.weight) || 70;
    const h = Number(bodyProfile.height) || 180;
    const a = Number(bodyProfile.age) || 22;
    const bmr = 10 * w + 6.25 * h - 5 * a + 5;
    const actMap = { light: 1.35, med3: 1.5, hard3: 1.65, athlete: 1.85 };
    const metaMap = { slow: 0.92, normal: 0.99, fast: 1.12 };

    let tdee = bmr * (actMap[bodyProfile.activity] || 1.55) * (metaMap[bodyProfile.metabolism] || 1.0);
    if (bodyProfile.goal === 'gain') tdee += 380;
    if (bodyProfile.goal === 'lose') tdee -= 400;

    const targetKcal = Math.round(tdee);
    const targetP = Math.round(w * (bodyProfile.goal === 'gain' ? 2.0 : 1.8));
    const targetF = Math.round(w * 1.0);
    const targetC = Math.max(100, Math.round((targetKcal - targetP * 4 - targetF * 9) / 4));

    const weightDiff = Math.abs((Number(bodyProfile.targetWeight) || w) - w);
    const safeWeeks = Math.max(1, Math.ceil(weightDiff / 0.55));
    return { targetKcal, targetP, targetF, targetC, safeWeeks };
  };

  const macroPlan = calculateNutritionPlan();
  const todayMeals = meals.filter(m => m.dateIso === todayIso);
  const totalCalories = todayMeals.reduce((acc, m) => acc + (Number(m.kcal) || 0), 0);
  const totalProtein = todayMeals.reduce((acc, m) => acc + (Number(m.p) || 0), 0);
  const totalFat = todayMeals.reduce((acc, m) => acc + (Number(m.f) || 0), 0);
  const totalCarbs = todayMeals.reduce((acc, m) => acc + (Number(m.c) || 0), 0);

  const isMacrosCompleted =
    totalCalories >= macroPlan.targetKcal * 0.95 &&
    totalProtein >= macroPlan.targetP * 0.95 &&
    totalCarbs >= macroPlan.targetC * 0.95;

  const getFullAppState = (overrides = {}) => ({
    theme, lang, streak, xpClaims, spheres, improvements,
    bodyProfile, weightLogs, waterByDate, meals, sleepLogs, workouts,
    dailyMorningPlan, dailyEveningReview, dailyHistory,
    habits, answers16, events, notes, ...overrides
  });

  const syncToCloud = (nextXp = xp, stateOverrides = {}) => {
    setSyncing(true);
    const fullState = getFullAppState(stateOverrides);
    localStorage.setItem(`lifeos_v4_${userId}`, JSON.stringify({
      nickname, xp: nextXp, weeklyDone, app_state: fullState
    }));

    const nextLvl = Math.floor(nextXp / 500);
    setLeaderboard(prev => prev.map(u =>
      u.telegram_id === userId ? { ...u, xp: nextXp, level: nextLvl } : u
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

  const grantRewardOnce = (claimKey, xpAmount, sphereDeltas = {}, extraState = {}) => {
    if (xpClaims[claimKey]) {
      syncToCloud(xp, extraState);
      return false;
    }
    const nextClaims = { ...xpClaims, [claimKey]: true };
    const nextSpheres = { ...spheres };
    Object.keys(sphereDeltas).forEach(k => {
      nextSpheres[k] = Math.min(100, +((nextSpheres[k] || 10) + sphereDeltas[k]).toFixed(2));
    });
    const nextXp = xp + xpAmount;

    setXpClaims(nextClaims);
    setSpheres(nextSpheres);
    setXp(nextXp);
    syncToCloud(nextXp, { ...extraState, xpClaims: nextClaims, spheres: nextSpheres });
    tg?.HapticFeedback?.notificationOccurred('success');
    return true;
  };

  useEffect(() => {
    if (isMacrosCompleted && !xpClaims[`macros_${todayIso}`]) {
      grantRewardOnce(`macros_${todayIso}`, 40, { energy: 0.4, body: 0.3 });
    }
  }, [totalCalories, totalProtein, totalCarbs]);

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

    const saved = localStorage.getItem(`lifeos_v4_${userId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nickname) setNickname(parsed.nickname);
        if (parsed.xp !== undefined) setXp(Number(parsed.xp) || 0);
        if (parsed.weeklyDone !== undefined) setWeeklyDone(parsed.weeklyDone);
        if (parsed.app_state) applyState(parsed.app_state);
      } catch (e) {}
    }

    fetch(`${API_BASE}/api/sync/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setNickname(data.user.nickname || "Новобранец");
          setNewNickInput(data.user.nickname || "");
          // Берем актуальный серверный XP (так как админ мог понизить уровень на сервере!)
          const serverXp = Number(data.user.xp) || 0;
          setXp(serverXp);
          const serverState = data.user.app_state || {};
          if (Object.keys(serverState).length > 0) {
            applyState(serverState);
          }
        }
        if (data.quest_stat) setWeeklyDone(Boolean(data.quest_stat.weekly_done));
        if (data.active_quest && data.active_quest.title) setActiveQuest(data.active_quest);
        if (data.leaderboard) setLeaderboard(data.leaderboard);
        if (data.guild_status) setGuildStatus(data.guild_status);
      })
      .catch(() => {});
  }, [userId]);

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

  const handleSendAiMessage = (customPrompt) => {
    const text = (customPrompt || aiInput).trim();
    if (!text) return;
    const userMsg = { role: 'user', text };
    const todayEvents = events.filter(e => e.date === todayIso && !e.done);

    let reply = "";
    const low = text.toLowerCase();

    if (lang === 'en') {
      const tasksStr = todayEvents.length > 0
        ? todayEvents.map(e => `• ${e.time} (${e.date}) — ${e.title}`).join("\n")
        : "All calendar tasks for today are done (or none scheduled yet).";
      reply =
        `📋 Today's Summary (${todayStr}):\n${tasksStr}\n\n` +
        `💧 Water: ${waterGlasses}/8 glasses.\n` +
        `🍽️ Macros: ${totalCalories}/${macroPlan.targetKcal} kcal (P: ${totalProtein}/${macroPlan.targetP}g, C: ${totalCarbs}/${macroPlan.targetC}g).\n` +
        `💡 Keep pushing your 1% improvements!`;
    } else if (low.includes("сегодня") || low.includes("сделать") || low.includes("план")) {
      const tasksStr = todayEvents.length > 0
        ? todayEvents.map(e => `• ${e.time} (${e.date}) — ${e.title}`).join("\n")
        : "В календаре на сегодня все задачи закрыты (или еще не добавлены).";
      reply =
        `📋 Сводка твоих задач на сегодня (${todayStr}):\n\n` +
        `${tasksStr}\n\n` +
        `💧 Вода: ${waterGlasses}/8 стаканов.\n` +
        `🍽️ БЖУ: ${totalCalories}/${macroPlan.targetKcal} ккал (Белки: ${totalProtein}/${macroPlan.targetP}г, Углеводы: ${totalCarbs}/${macroPlan.targetC}г).`;
    } else if (low.includes("бжу") || low.includes("питани") || low.includes("вес")) {
      reply =
        `⚖️ Текущий вес: ${bodyProfile.weight} кг (цель: ${bodyProfile.targetWeight} кг).\n` +
        `Твоя дневная норма: ${macroPlan.targetKcal} ккал | Белки: ${macroPlan.targetP}г | Углеводы: ${macroPlan.targetC}г | Жиры: ${macroPlan.targetF}г.\n` +
        `Осталось добрать сегодня: ${Math.max(0, macroPlan.targetKcal - totalCalories)} ккал и ${Math.max(0, macroPlan.targetP - totalProtein)}г белка.`;
    } else {
      const notesList = notes.slice(0, 3).map(n => `📌 ${n.title}: ${n.text}`).join("\n");
      reply = notes.length > 0
        ? `Твои актуальные заметки и фокус:\n\n${notesList}`
        : `Профиль ${nickname} (LVL ${level}): выпей 8 стаканов воды, закрой норму белка (${macroPlan.targetP}г) и запиши 1% улучшение!`;
    }

    setAiMessages(prev => [...prev, userMsg, { role: 'assistant', text: reply }]);
    if (!customPrompt) setAiInput("");
  };

  const formatTimer = (startTime) => {
    const sec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return lang === 'en' ? `${d}d ${h}h ${m}m` : `${d}д ${h}ч ${m}м`;
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
            <div className="text-[10px] text-slate-400 mt-0.5">{xp} XP ({t.nextLvl} {500 - (xp % 500)} XP)</div>
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

      {/* МОДАЛКА ОГОНЬКА */}
      {showStreakModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-5 border ${bgCard} space-y-4 text-center`}>
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mx-auto">
              <Flame className="w-10 h-10 fill-orange-500 text-orange-500" />
            </div>
            <h3 className="text-xl font-black">{streak.count || 1} {t.streakTitle}!</h3>
            <p className="text-xs text-slate-400">{t.streakDesc}</p>
            <button
              onClick={() => setShowStreakModal(false)}
              className="w-full py-2.5 rounded-xl bg-orange-500 text-black font-bold text-xs"
            >
              {t.streakBtn}
            </button>
          </div>
        </div>
      )}

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
                  if (window.confirm(t.resetConfirm)) {
                    localStorage.removeItem(`lifeos_v4_${userId}`);
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

      {/* МОДАЛКА АДМИНА (ПОЗВОЛЯЕТ И ПОВЫШАТЬ, И ПОНИЖАТЬ УРОВЕНЬ ВПЛОТЬ ДО 0!) */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl p-5 border ${bgCard} space-y-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4" /> {t.adminPanelTitle}
              </h3>
              <button onClick={() => setShowAdminModal(false)} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{t.close}</button>
            </div>

            {userId !== ADMIN_ID ? (
              <div className="p-6 text-center space-y-2">
                <Lock className="w-10 h-10 text-rose-500 mx-auto" />
                <div className="font-bold text-sm">{t.noRights}</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400">{t.questEditor}</div>
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
                      }).then(() => alert("OK!"));
                    }}
                    className="w-full py-2.5 bg-amber-500 text-black font-bold rounded-xl text-xs"
                  >
                    {t.saveQuestBtn}
                  </button>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-300">{t.playersList} ({leaderboard.length}):</div>
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
                            const newLvlStr = prompt(`Укажите уровень (0 или выше) для ${u.nickname}:`, u.level);
                            if (newLvlStr !== null) {
                              const lvlNum = Math.max(0, parseInt(newLvlStr, 10) || 0);
                              const newXpVal = lvlNum * 500;
                              // Если админ меняет уровень самому себе — сразу обновляем шапку и локальный кэш!
                              if (u.telegram_id === userId) {
                                setXp(newXpVal);
                                localStorage.setItem(`lifeos_v4_${userId}`, JSON.stringify({
                                  nickname, xp: newXpVal, weeklyDone, app_state: getFullAppState()
                                }));
                              }
                              setLeaderboard(prev => prev.map(x =>
                                x.telegram_id === u.telegram_id ? { ...x, level: lvlNum, xp: newXpVal } : x
                              ));
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
            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <div>
                <h3 className="text-sm font-bold">{t.spheresTitle}</h3>
                <p className="text-[11px] text-slate-400">{t.spheresSubtitle}</p>
              </div>
              {[
                { key: 'body', label: t.spBody, color: 'bg-rose-500' },
                { key: 'energy', label: t.spEnergy, color: 'bg-amber-500' },
                { key: 'mind', label: t.spMind, color: 'bg-purple-500' },
                { key: 'discipline', label: t.spDiscipline, color: 'bg-emerald-500' },
                { key: 'environment', label: t.spEnv, color: 'bg-cyan-500' },
                { key: 'career', label: t.spCareer, color: 'bg-blue-500' }
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

            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                  <Sparkles className="w-4 h-4" /> {t.onePercentTitle}
                </h2>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  {xpClaims[`imp_${todayIso}`] ? t.bonusDone : t.oncePerDay15}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.onePercentPlaceholder}
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
                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                    <Scale className="w-4 h-4" /> {t.bodyParamsTitle}
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400">{t.weightKg}</label>
                      <input type="number" value={bodyProfile.weight} onChange={e => setBodyProfile({ ...bodyProfile, weight: e.target.value })} onBlur={() => syncToCloud(xp, { bodyProfile })} className={`w-full p-2 rounded-lg border ${bgInput}`} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">{t.heightCm}</label>
                      <input type="number" value={bodyProfile.height} onChange={e => setBodyProfile({ ...bodyProfile, height: e.target.value })} onBlur={() => syncToCloud(xp, { bodyProfile })} className={`w-full p-2 rounded-lg border ${bgInput}`} />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">{t.targetWeight}</label>
                      <input type="number" value={bodyProfile.targetWeight} onChange={e => setBodyProfile({ ...bodyProfile, targetWeight: e.target.value })} onBlur={() => syncToCloud(xp, { bodyProfile })} className={`w-full p-2 rounded-lg border ${bgInput}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400">{t.activity}</label>
                      <select value={bodyProfile.activity} onChange={e => { const next = { ...bodyProfile, activity: e.target.value }; setBodyProfile(next); syncToCloud(xp, { bodyProfile: next }); }} className={`w-full p-2 rounded-lg border ${bgInput}`}>
                        <option value="light">{t.actLight}</option>
                        <option value="med3">{t.actMed}</option>
                        <option value="hard3">{t.actHard}</option>
                        <option value="athlete">{t.actAth}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">{t.metabolism}</label>
                      <select value={bodyProfile.metabolism} onChange={e => { const next = { ...bodyProfile, metabolism: e.target.value }; setBodyProfile(next); syncToCloud(xp, { bodyProfile: next }); }} className={`w-full p-2 rounded-lg border ${bgInput}`}>
                        <option value="slow">{t.metaSlow}</option>
                        <option value="normal">{t.metaNorm}</option>
                        <option value="fast">{t.metaFast}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">{t.myGoal}</label>
                      <select value={bodyProfile.goal} onChange={e => { const next = { ...bodyProfile, goal: e.target.value }; setBodyProfile(next); syncToCloud(xp, { bodyProfile: next }); }} className={`w-full p-2 rounded-lg border ${bgInput}`}>
                        <option value="gain">{t.goalGain}</option>
                        <option value="maintain">{t.goalMaint}</option>
                        <option value="lose">{t.goalLose}</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
                    <div className="font-bold text-emerald-400">
                      {t.calcNorm} {macroPlan.targetKcal} {t.kcal} | {t.pShort}: {macroPlan.targetP}g | {t.cShort}: {macroPlan.targetC}g | {t.fShort}: {macroPlan.targetF}g
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {t.safeTerm1} {bodyProfile.targetWeight} {t.safeTerm2} <b>~{macroPlan.safeWeeks} {t.weeks}</b>
                    </div>
                  </div>

                  {/* Взвешивание и прокручиваемый влево-вправо график веса с самого начала! */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        placeholder={t.logWeightPlaceholder}
                        value={newWeightInput}
                        onChange={e => setNewWeightInput(e.target.value)}
                        className={`flex-1 p-2 rounded-lg border text-xs ${bgInput}`}
                      />
                      <button
                        onClick={() => {
                          const wVal = Number(newWeightInput);
                          if (!wVal || wVal <= 20) return;
                          // Сохраняем ВСЮ историю взвешиваний с самого начала (без обрезки!)
                          const nextLogs = [...weightLogs, { id: Date.now(), date: todayStr.slice(0, 5), weight: wVal }];
                          const nextProf = { ...bodyProfile, weight: wVal };
                          setWeightLogs(nextLogs);
                          setBodyProfile(nextProf);
                          setNewWeightInput("");
                          syncToCloud(xp, { weightLogs: nextLogs, bodyProfile: nextProf });
                        }}
                        className="px-3 rounded-lg bg-emerald-500 text-black font-bold text-xs"
                      >
                        {t.addWeightBtn}
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400">{t.weightChartHint}</div>
                    <div className="overflow-x-auto pb-2 pt-3 px-2 bg-slate-900/50 rounded-xl border border-slate-800">
                      <div className="flex items-end gap-3 min-w-max h-24">
                        {weightLogs.map((wl, i) => {
                          const validWeights = weightLogs.map(x => Number(x.weight) || 70);
                          const minW = Math.min(...validWeights) - 2;
                          const maxW = Math.max(...validWeights) + 2;
                          const pct = Math.max(18, Math.min(100, (((Number(wl.weight) || 70) - minW) / (maxW - minW || 1)) * 100));
                          return (
                            <div
                              key={wl.id || i}
                              onClick={() => {
                                if (weightLogs.length > 1 && window.confirm(`Удалить запись веса ${wl.weight} кг от ${wl.date}?`)) {
                                  const nextLogs = weightLogs.filter((_, idx) => idx !== i);
                                  setWeightLogs(nextLogs);
                                  syncToCloud(xp, { weightLogs: nextLogs });
                                }
                              }}
                              className="w-9 shrink-0 flex flex-col items-center cursor-pointer"
                            >
                              <span className="text-[10px] text-emerald-400 font-bold mb-1">{wl.weight}</span>
                              <div className="w-6 bg-emerald-500/80 rounded-t transition-all hover:bg-rose-400" style={{ height: `${pct * 0.55}px` }} />
                              <span className="text-[9px] text-slate-400 mt-1">{wl.date}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Вода */}
                <div className={`p-4 rounded-2xl border ${bgCard} flex items-center justify-between`}>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1.5 text-cyan-400">
                      <Droplets className="w-4 h-4" /> {t.waterTitle} {waterGlasses} / 8 {t.glasses}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {xpClaims[`water_${todayIso}`] ? t.waterDone : t.waterHint}
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
                    >{t.addGlass}</button>
                  </div>
                </div>

                {/* Дневник питания */}
                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <div>
                    <h3 className="text-sm font-bold">{t.foodDiaryTitle}</h3>
                    <div className="text-[10px] text-slate-400">
                      {xpClaims[`macros_${todayIso}`] ? t.macrosDone : t.macrosHint}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">{t.kcal}</div>
                      <div className="text-xs font-black text-emerald-400">{totalCalories} / {macroPlan.targetKcal}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">{t.proteinsMain}</div>
                      <div className="text-xs font-bold text-blue-400">{totalProtein} / {macroPlan.targetP}g</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">{t.carbs}</div>
                      <div className="text-xs font-bold text-rose-400">{totalCarbs} / {macroPlan.targetC}g</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="text-[10px] text-slate-400">{t.fats}</div>
                      <div className="text-xs font-bold text-amber-400">{totalFat} / {macroPlan.targetF}g</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <input type="text" placeholder={t.mealPlaceholder} value={mealName} onChange={e => setMealName(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
                    <div className="grid grid-cols-4 gap-2">
                      <input type="number" placeholder={t.kcal} value={mealKcal} onChange={e => setMealKcal(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                      <input type="number" placeholder={t.proteinsMain} value={mealP} onChange={e => setMealP(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                      <input type="number" placeholder={t.carbs} value={mealC} onChange={e => setMealC(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                      <input type="number" placeholder={t.fats} value={mealF} onChange={e => setMealF(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
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
                      {t.addMealBtn}
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {todayMeals.map(m => (
                      <div key={m.id} className="p-2 rounded-lg bg-slate-900/50 border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.kcal} {t.kcal} • P:{m.p}g C:{m.c}g F:{m.f}g</div>
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
                  <Moon className="w-4 h-4" /> {t.sleepTitle}
                </h3>
                {todaySleepAlreadyLogged ? (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300">
                    {t.sleepAlready}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" step="0.5" placeholder={t.sleepHoursPlaceholder} value={sleepHours} onChange={e => setSleepHours(e.target.value)} className={`p-2.5 rounded-xl border text-xs ${bgInput}`} />
                      <select value={sleepQuality} onChange={e => setSleepQuality(e.target.value)} className={`p-2.5 rounded-xl border text-xs ${bgInput}`}>
                        <option value="Отлично">{t.sleepExc}</option>
                        <option value="Нормально">{t.sleepOk}</option>
                        <option value="Тяжело">{t.sleepBad}</option>
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
                      {t.saveSleepBtn}
                    </button>
                  </>
                )}
                <div className="space-y-2 pt-2">
                  {sleepLogs.map(s => (
                    <div key={s.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between text-xs">
                      <span>📅 {s.date}</span>
                      <span className="font-bold text-indigo-400">{s.hours}h ({s.quality})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {healthSub === 'workouts' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <h3 className="text-sm font-bold flex items-center gap-2 text-rose-400">
                  <Dumbbell className="w-4 h-4" /> {t.workoutsTitle}
                </h3>
                <input type="text" placeholder={t.workoutTypePlaceholder} value={workoutTitle} onChange={e => setWorkoutTitle(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
                <input type="text" placeholder={t.workoutDurPlaceholder} value={workoutDur} onChange={e => setWorkoutDur(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
                <textarea rows={2} placeholder={t.workoutCommPlaceholder} value={workoutComment} onChange={e => setWorkoutComment(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
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
                  {t.saveWorkoutBtn}
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

            {focusSub === 'goals' && (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-emerald-400">{t.planVsReview} ({todayStr})</h3>
                    <span className="text-[10px] text-slate-400">{t.oncePerDay}</span>
                  </div>

                  {todayPlanAlreadyArchived ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                      {t.planArchivedMsg}
                    </div>
                  ) : (
                    <>
                      <textarea rows={3} placeholder={t.morningPlaceholder} value={dailyMorningPlan} onChange={e => setDailyMorningPlan(e.target.value)} onBlur={() => syncToCloud(xp, { dailyMorningPlan })} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
                      <textarea rows={3} placeholder={t.eveningPlaceholder} value={dailyEveningReview} onChange={e => setDailyEveningReview(e.target.value)} onBlur={() => syncToCloud(xp, { dailyEveningReview })} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
                      <button
                        onClick={() => {
                          if (!dailyMorningPlan.trim() || !dailyEveningReview.trim()) return;
                          const entry = { id: Date.now(), dateIso: todayIso, date: todayStr, plan: dailyMorningPlan, review: dailyEveningReview };
                          const nextHist = [entry, ...dailyHistory];
                          setDailyHistory(nextHist);
                          grantRewardOnce(`plan_${todayIso}`, 25, { discipline: 0.3, mind: 0.2 }, {
                            dailyHistory: nextHist, dailyMorningPlan: "", dailyEveningReview: ""
                          });
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs"
                      >
                        {t.saveDayArchiveBtn}
                      </button>
                    </>
                  )}
                </div>

                <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">{t.historyDays} ({dailyHistory.length})</h4>
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {dailyHistory.map(item => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                        <div className="font-bold text-emerald-400">📅 {item.date}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-slate-950/60">
                            <div className="text-[10px] text-amber-400 font-bold">{t.wantedToDo}</div>
                            <div className="whitespace-pre-wrap">{item.plan}</div>
                          </div>
                          <div className="p-2 rounded bg-slate-950/60">
                            <div className="text-[10px] text-emerald-400 font-bold">{t.didInFact}</div>
                            <div className="whitespace-pre-wrap">{item.review}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {focusSub === 'habits' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <div>
                  <h3 className="text-sm font-bold">{t.habitsTitle}</h3>
                  <p className="text-[11px] text-slate-400">{t.habitsSub}</p>
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
                              {h.type === 'bad' ? t.tagBad : t.tagGood}
                            </span>
                            <span className="font-bold text-xs">{h.name}</span>
                            {h.motiv && <div className="text-[11px] text-slate-400 mt-0.5">«{h.motiv}»</div>}
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-amber-400 font-bold">
                              {t.attempt} #{h.attempts || 1} • {t.record} {bestRec} {t.daysShort}
                            </div>
                            <div className="font-mono text-xs font-bold text-emerald-400 mt-0.5">
                              {formatTimer(h.start)}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                          <button
                            onClick={() => {
                              if (window.confirm(`${t.resetHabitBtn}: «${h.name}»?`)) {
                                const next = habits.map(x => x.id === h.id ? {
                                  ...x, start: Date.now(), attempts: (x.attempts || 1) + 1, maxRecordDays: bestRec
                                } : x);
                                setHabits(next);
                                syncToCloud(xp, { habits: next });
                              }
                            }}
                            className="text-[11px] text-rose-400 flex items-center gap-1 font-semibold"
                          >
                            <RotateCcw className="w-3 h-3" /> {t.resetHabitBtn}
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`${t.deleteBtn}?`)) {
                                const next = habits.filter(x => x.id !== h.id);
                                setHabits(next);
                                syncToCloud(xp, { habits: next });
                              }
                            }}
                            className="text-[11px] text-slate-500 hover:text-rose-400"
                          >
                            {t.deleteBtn}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setHabitType('bad')} className={`py-1.5 rounded-lg text-xs font-bold border ${habitType === 'bad' ? 'border-rose-500 bg-rose-500/20 text-rose-400' : 'border-slate-700 text-slate-400'}`}>{t.badHabitBtn}</button>
                    <button onClick={() => setHabitType('good')} className={`py-1.5 rounded-lg text-xs font-bold border ${habitType === 'good' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 text-slate-400'}`}>{t.goodHabitBtn}</button>
                  </div>
                  <input type="text" placeholder={t.habitNamePh} value={habitName} onChange={e => setHabitName(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
                  <input type="text" placeholder={t.habitMotivPh} value={habitMotiv} onChange={e => setHabitMotiv(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
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
                    {t.startTimerBtn}
                  </button>
                </div>
              </div>
            )}

            {focusSub === 'q16' && (
              <div className="space-y-3">
                {questionsList.map((q, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${bgCard} space-y-2`}>
                    <div className="text-xs font-bold text-emerald-400">{t.questionNum}{i + 1}</div>
                    <div className="text-xs font-semibold">{q}</div>
                    <textarea
                      rows={2}
                      placeholder={t.answerPh}
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

        {/* ==================== 4. ВКЛАДКА "КАЛЕНДАРЬ И ЗАМЕТКИ" ==================== */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCalSub('schedule')}
                className={`py-2.5 rounded-xl text-xs font-bold border ${calSub === 'schedule' ? 'bg-emerald-500 text-black border-emerald-500' : `${bgCard} text-slate-400`}`}
              >
                {t.schedTab}
              </button>
              <button
                onClick={() => setCalSub('notes')}
                className={`py-2.5 rounded-xl text-xs font-bold border ${calSub === 'notes' ? 'bg-emerald-500 text-black border-emerald-500' : `${bgCard} text-slate-400`}`}
              >
                {t.notesTab}
              </button>
            </div>

            {calSub === 'schedule' && (
              <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-emerald-400">{t.schedTitle}</h3>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className={`p-1.5 rounded-lg border text-xs ${bgInput}`} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className={`p-2 rounded-xl border text-xs ${bgInput}`} />
                  <select value={eventCat} onChange={e => setEventCat(e.target.value)} className={`col-span-2 p-2 rounded-xl border text-xs ${bgInput}`}>
                    <option value="Дело">{t.catWork}</option>
                    <option value="Здоровье">{t.catHealth}</option>
                    <option value="Фокус">{t.catFocus}</option>
                    <option value="Встреча">{t.catMeet}</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`${t.eventPh} ${selectedDate}...`}
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
                    {t.addBtn}
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {events.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-6">{t.noEvents}</div>
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
                            <div className={`font-bold ${ev.done ? 'line-through text-slate-500' : ''}`}>{ev.title}</div>
                            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                              📅 {ev.date} • {ev.time} • <span className="text-slate-400">{ev.category}</span>
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
                <h3 className="text-sm font-bold text-amber-400">{t.notesTitle}</h3>
                <input type="text" placeholder={t.searchNotesPh} value={noteSearch} onChange={e => setNoteSearch(e.target.value)} className={`w-full p-2 rounded-xl border text-xs ${bgInput}`} />
                <input type="text" placeholder={t.noteTitlePh} value={noteTitle} onChange={e => setNoteTitle(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs font-bold ${bgInput}`} />
                <textarea rows={3} placeholder={t.noteTextPh} value={noteText} onChange={e => setNoteText(e.target.value)} className={`w-full p-2.5 rounded-xl border text-xs ${bgInput}`} />
                <button
                  onClick={() => {
                    if (!noteTitle.trim() && !noteText.trim()) return;
                    const next = [{ id: Date.now(), title: noteTitle || "Note", text: noteText, date: todayStr }, ...notes];
                    setNotes(next);
                    setNoteTitle(""); setNoteText("");
                    syncToCloud(xp, { notes: next });
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
                >
                  {t.saveNoteBtn}
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

        {/* ==================== 5. ВКЛАДКА "ИИ" ==================== */}
        {activeTab === 'ai' && (
          <div className={`p-4 rounded-2xl border ${bgCard} flex flex-col h-[72vh]`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">{t.aiTitle}</div>
                  <div className="text-[10px] text-emerald-400">{t.aiSub}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 shrink-0">
              <button onClick={() => handleSendAiMessage(t.aiQuick1)} className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[11px] text-emerald-400 whitespace-nowrap border border-slate-700">
                {t.aiQuick1}
              </button>
              <button onClick={() => handleSendAiMessage(t.aiQuick2)} className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[11px] text-amber-400 whitespace-nowrap border border-slate-700">
                {t.aiQuick2}
              </button>
              <button onClick={() => handleSendAiMessage(t.aiQuick3)} className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-[11px] text-cyan-400 whitespace-nowrap border border-slate-700">
                {t.aiQuick3}
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
                placeholder={t.aiInputPh}
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
                    <Shield className="w-4 h-4" /> {t.guildTitle}
                  </h3>
                  <p className="text-[11px] text-slate-400">{t.guildSub} ({level} LVL • {xp} XP)</p>
                </div>
                <a
                  href="https://t.me/life_is_rpg_game"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1"
                >
                  {t.channelBtn} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder={t.nickPh}
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
                  {t.saveNickBtn}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161f30] to-[#0f172a] border border-emerald-500/30 text-center">
              <div className="text-xs text-emerald-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" /> {t.timerTitle}
              </div>
              <div className="text-2xl font-mono font-black text-white py-1">
                {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
              </div>
              <div className="text-[11px] text-slate-400">{t.sunday10}</div>
            </div>

            <div className={`p-4 rounded-2xl border ${bgCard} space-y-3`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                    {t.weeklyQuestBadge}
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
                  localStorage.setItem(`lifeos_v4_${userId}`, JSON.stringify({
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
                {weeklyDone ? t.questDoneBtn : `${t.questDoBtn} (+${activeQuest.xp_reward || 100} XP)`}
              </button>
            </div>

            <div className={`p-4 rounded-2xl border ${bgCard} space-y-2.5`}>
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> {t.leaderboardTitle} ({leaderboard.length})
              </h4>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {leaderboard.map((u, i) => {
                  const displayLvl = u.telegram_id === userId ? level : (u.level || 0);
                  const displayXp = u.telegram_id === userId ? xp : (u.xp || 0);
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
                      <span className="text-[11px] text-slate-400">{displayXp} XP • {u.quests} {t.questsShort}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* НИЖНЯЯ НАВИГАЦИЯ */}
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
