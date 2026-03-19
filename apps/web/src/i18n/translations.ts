import type { Command, LevelDefinition, RoutineName } from "@lumaloop/engine";

export const SUPPORTED_LOCALES = ["en", "ru", "he"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_OPTIONS: { label: string; value: Locale }[] = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "he", label: "עברית" },
];

const RTL_LOCALES: Locale[] = ["he"];

type Messages = {
  actions: string;
  addCommandToSlot: (routineLabel: string, index: number) => string;
  allActions: string;
  clear: string;
  commandLabels: Record<Command, string>;
  defaultHint: string;
  darkMode: string;
  hint: string;
  idealSize: (value: number) => string;
  language: string;
  left: string;
  level: string;
  levelOnly: string;
  levelOptionLabel: (index: number, name: string) => string;
  lockedForLevel: string;
  lightMode: string;
  mainRoutine: string;
  menu: string;
  next: string;
  noSlots: string;
  pause: string;
  play: string;
  proc1Routine: string;
  proc2Routine: string;
  proceduralHierarchy: string;
  programSize: (value: number) => string;
  puzzleMenu: string;
  puzzleSolved: string;
  removeCommandFromSlot: (routineLabel: string, index: number) => string;
  replay: string;
  robotColor: string;
  right: string;
  routineSlots: (filled: number, total: number) => string;
  showingFullCommandSet: string;
  showingLevelCommands: string;
  successBody: string;
  theme: string;
  walkthroughClose: string;
  walkthroughDone: string;
  walkthroughNext: string;
  walkthroughOpen: string;
  walkthroughPrevious: string;
  walkthroughSubtitle: string;
  walkthroughTitle: string;
  walkthroughSlides: {
    body: string;
    bullets: string[];
    eyebrow: string;
    title: string;
  }[];
};

const messages: Record<Locale, Messages> = {
  en: {
    actions: "Actions",
    addCommandToSlot: (routineLabel, index) => `Add command to ${routineLabel} slot ${index}`,
    allActions: "All Actions",
    clear: "Clear",
    commandLabels: {
      FORWARD: "Move Forward",
      TURN_LEFT: "Turn Left",
      TURN_RIGHT: "Turn Right",
      JUMP: "Jump",
      ACTIVATE: "Activate",
      CALL_P1: "Function 1",
      CALL_P2: "Function 2",
    },
    defaultHint: "Activate every goal tile.",
    darkMode: "Dark",
    hint: "Hint",
    idealSize: (value) => `Ideal Size ${value}`,
    language: "Language",
    left: "Left",
    level: "Level",
    levelOnly: "Level Only",
    levelOptionLabel: (index, name) => `Level ${index} - ${name}`,
    lockedForLevel: "Locked for this level",
    lightMode: "Light",
    mainRoutine: "Main",
    menu: "Menu",
    next: "Next",
    noSlots: "No slots",
    pause: "Pause",
    play: "Play",
    proc1Routine: "Proc 1",
    proc2Routine: "Proc 2",
    proceduralHierarchy: "Procedural Hierarchy",
    programSize: (value) => `Program Size ${value}`,
    puzzleMenu: "Puzzle Menu",
    puzzleSolved: "Puzzle Solved!",
    removeCommandFromSlot: (routineLabel, index) => `Remove command from ${routineLabel} slot ${index}`,
    replay: "Replay",
    robotColor: "Robot Color",
    right: "Right",
    routineSlots: (filled, total) => `${filled} / ${total}`,
    showingFullCommandSet: "Showing the full command set.",
    showingLevelCommands: "Showing level-allowed commands only.",
    successBody: "All targets are lit. You can replay this level or move on to the next puzzle.",
    theme: "Theme",
    walkthroughClose: "Close guide",
    walkthroughDone: "Start Playing",
    walkthroughNext: "Continue",
    walkthroughOpen: "How to play",
    walkthroughPrevious: "Back",
    walkthroughSubtitle:
      "A quick mission briefing on the controls, the puzzle loop, and the thinking skills Lumaloop strengthens as you play.",
    walkthroughTitle: "How to Play Lumaloop",
    walkthroughSlides: [
      {
        eyebrow: "Mission",
        title: "Wake every light on the board",
        body:
          "Every puzzle is a small navigation mission. Your robot follows the program exactly as written, and the level is solved only when every target tile is glowing, so you are planning a complete route rather than racing to a single finish point.",
        bullets: [
          "Turn the robot before moving or jumping so each step starts from the right direction.",
          "Lighting one beacon is not enough if another target is still dark somewhere else on the map.",
          "A shorter solution usually means you discovered the real pattern hidden inside the puzzle.",
        ],
      },
      {
        eyebrow: "Controls",
        title: "Build the route one command at a time",
        body:
          "Use the action tray to place commands into Main and sketch the robot's path. As the campaign opens up, Proc 1 and Proc 2 let you package repeating ideas into reusable mini-programs instead of rewriting the same sequence again and again.",
        bullets: [
          "Tap a command to add it to the currently selected routine.",
          "Remove individual steps or clear a routine whenever you want to test a cleaner idea.",
          "Some levels limit the available commands on purpose so you can focus on one new concept at a time.",
        ],
      },
      {
        eyebrow: "Debug",
        title: "Run the plan and learn from every mistake",
        body:
          "Press Play and watch the robot execute your code literally. When something goes wrong, that failure is useful information: compare what you expected with what actually happened, then revise the program and test again.",
        bullets: [
          "Pause, replay, and iterate as often as you need without losing your progress.",
          "Hints point toward the key idea of the current puzzle without giving away the full answer.",
          "The moment the robot fails usually reveals whether the issue is order, direction, terrain, or a missing action.",
        ],
      },
      {
        eyebrow: "Themes",
        title: "Each world teaches a new way of thinking",
        body:
          "The campaign is structured like a guided curriculum. Early levels build confidence with sequencing and turning, later ones introduce height changes and navigation in space, and advanced worlds teach procedures and recursive patterns.",
        bullets: [
          "Sequencing teaches you to choose the right action in the right order.",
          "Orientation and height train spatial reasoning: where the robot is facing, standing, and heading next.",
          "Procedures and recursion teach you to compress repeating patterns into powerful reusable logic.",
        ],
      },
      {
        eyebrow: "Benefits",
        title: "You are practicing real computational thinking",
        body:
          "Lumaloop is more than a puzzle toy. It builds planning, decomposition, pattern recognition, debugging, and the confidence to improve an idea step by step until it works.",
        bullets: [
          "Break a long route into smaller chunks that are easier to understand and fix.",
          "Notice repeating structures, compress them, and reuse them with intention.",
          "Build persistence by testing, observing, refining, and trying again with a smarter plan.",
        ],
      },
    ],
  },
  ru: {
    actions: "Команды",
    addCommandToSlot: (routineLabel, index) => `Добавить команду в ${routineLabel}, ячейка ${index}`,
    allActions: "Все команды",
    clear: "Очистить",
    commandLabels: {
      FORWARD: "Вперед",
      TURN_LEFT: "Поворот влево",
      TURN_RIGHT: "Поворот вправо",
      JUMP: "Прыжок",
      ACTIVATE: "Активировать",
      CALL_P1: "Функция 1",
      CALL_P2: "Функция 2",
    },
    defaultHint: "Активируйте каждую целевую плитку.",
    darkMode: "Темная",
    hint: "Подсказка",
    idealSize: (value) => `Идеальный размер ${value}`,
    language: "Язык",
    left: "Влево",
    level: "Уровень",
    levelOnly: "Только уровень",
    levelOptionLabel: (index, name) => `Уровень ${index} - ${name}`,
    lockedForLevel: "Недоступно на этом уровне",
    lightMode: "Светлая",
    mainRoutine: "Основная",
    menu: "Меню",
    next: "Дальше",
    noSlots: "Нет ячеек",
    pause: "Пауза",
    play: "Старт",
    proc1Routine: "Проц. 1",
    proc2Routine: "Проц. 2",
    proceduralHierarchy: "Иерархия процедур",
    programSize: (value) => `Размер программы ${value}`,
    puzzleMenu: "Меню уровня",
    puzzleSolved: "Головоломка решена!",
    removeCommandFromSlot: (routineLabel, index) => `Убрать команду из ${routineLabel}, ячейка ${index}`,
    replay: "Повтор",
    robotColor: "Цвет робота",
    right: "Вправо",
    routineSlots: (filled, total) => `${filled} / ${total}`,
    showingFullCommandSet: "Показан полный набор команд.",
    showingLevelCommands: "Показаны только команды, разрешенные уровнем.",
    successBody: "Все цели зажжены. Можно переиграть уровень или перейти к следующей головоломке.",
    theme: "Тема",
    walkthroughClose: "Закрыть гид",
    walkthroughDone: "Начать играть",
    walkthroughNext: "Продолжить",
    walkthroughOpen: "Как играть",
    walkthroughPrevious: "Назад",
    walkthroughSubtitle:
      "Короткий брифинг об управлении, игровом цикле и мыслительных навыках, которые Lumaloop постепенно развивает.",
    walkthroughTitle: "Как играть в Lumaloop",
    walkthroughSlides: [
      {
        eyebrow: "Миссия",
        title: "Зажгите все огни на поле",
        body:
          "Каждый уровень - это небольшая навигационная миссия. Робот выполняет программу буквально, а уровень считается пройденным только тогда, когда светятся все целевые плитки, поэтому важно продумать весь маршрут, а не только прийти в одну точку.",
        bullets: [
          "Сначала разверните робота в нужную сторону, а уже потом двигайтесь или прыгайте.",
          "Одной зажженной лампы недостаточно, если на карте осталась еще хотя бы одна темная цель.",
          "Короткое решение часто означает, что вы заметили настоящий скрытый шаблон уровня.",
        ],
      },
      {
        eyebrow: "Управление",
        title: "Собирайте маршрут по одной команде",
        body:
          "Используйте панель действий, чтобы добавлять команды в основную программу и намечать путь робота. По мере прохождения откроются Проц. 1 и Проц. 2, чтобы повторяющиеся идеи можно было упаковывать в переиспользуемые мини-программы.",
        bullets: [
          "Нажмите на команду, чтобы добавить ее в выбранную сейчас процедуру.",
          "Удаляйте отдельные шаги или очищайте процедуру, когда хотите проверить более чистую идею.",
          "Некоторые уровни специально ограничивают набор команд, чтобы вы сосредоточились на одной новой концепции.",
        ],
      },
      {
        eyebrow: "Отладка",
        title: "Запускайте план и учитесь на каждой ошибке",
        body:
          "Нажмите старт и наблюдайте, как робот буквально исполняет ваш код. Если что-то ломается, это полезный сигнал: сравните ожидаемый маршрут с тем, что произошло на самом деле, и затем исправьте программу.",
        bullets: [
          "Ставьте на паузу, переигрывайте и пробуйте заново столько раз, сколько нужно.",
          "Подсказки направляют к ключевой идее уровня, но не выдают весь ответ целиком.",
          "Момент сбоя обычно показывает, в чем проблема: в порядке, направлении, рельефе или пропущенном действии.",
        ],
      },
      {
        eyebrow: "Темы",
        title: "Каждый мир учит новому способу мышления",
        body:
          "Кампания устроена как постепенная учебная программа. Сначала вы укрепляете понимание последовательностей и поворотов, затем осваиваете высоту и движение в пространстве, а дальше переходите к процедурам и рекурсивным шаблонам.",
        bullets: [
          "Последовательности учат выбирать нужное действие в нужный момент.",
          "Ориентация и высота развивают пространственное мышление: куда робот смотрит, где стоит и что ждет впереди.",
          "Процедуры и рекурсия учат сжимать повторяющиеся фрагменты в мощную переиспользуемую логику.",
        ],
      },
      {
        eyebrow: "Польза",
        title: "Вы тренируете настоящее вычислительное мышление",
        body:
          "Lumaloop - это не просто набор головоломок. Игра развивает планирование, декомпозицию, распознавание шаблонов, отладку и уверенность в том, что хорошую идею можно постепенно улучшать, пока она не заработает.",
        bullets: [
          "Разбивайте длинный маршрут на более понятные и управляемые части.",
          "Замечайте повторяющиеся структуры, сжимайте их и переиспользуйте осознанно.",
          "Развивайте настойчивость через цикл «проверил, увидел, исправил и попробовал снова».",
        ],
      },
    ],
  },
  he: {
    actions: "פקודות",
    addCommandToSlot: (routineLabel, index) => `הוסף פקודה ל${routineLabel}, משבצת ${index}`,
    allActions: "כל הפקודות",
    clear: "נקה",
    commandLabels: {
      FORWARD: "קדימה",
      TURN_LEFT: "פנה שמאלה",
      TURN_RIGHT: "פנה ימינה",
      JUMP: "קפיצה",
      ACTIVATE: "הפעל",
      CALL_P1: "פונקציה 1",
      CALL_P2: "פונקציה 2",
    },
    defaultHint: "הפעילו כל אריח יעד.",
    darkMode: "כהה",
    hint: "רמז",
    idealSize: (value) => `גודל אידיאלי ${value}`,
    language: "שפה",
    left: "שמאלה",
    level: "שלב",
    levelOnly: "רק לשלב",
    levelOptionLabel: (index, name) => `שלב ${index} - ${name}`,
    lockedForLevel: "נעול בשלב הזה",
    lightMode: "בהיר",
    mainRoutine: "ראשית",
    menu: "תפריט",
    next: "הבא",
    noSlots: "אין משבצות",
    pause: "השהה",
    play: "הפעל",
    proc1Routine: "פרוצדורה 1",
    proc2Routine: "פרוצדורה 2",
    proceduralHierarchy: "היררכיית פרוצדורות",
    programSize: (value) => `גודל תוכנית ${value}`,
    puzzleMenu: "תפריט שלב",
    puzzleSolved: "החידה נפתרה!",
    removeCommandFromSlot: (routineLabel, index) => `הסר פקודה מ${routineLabel}, משבצת ${index}`,
    replay: "הפעל שוב",
    robotColor: "צבע הרובוט",
    right: "ימינה",
    routineSlots: (filled, total) => `${filled} / ${total}`,
    showingFullCommandSet: "מוצג סט הפקודות המלא.",
    showingLevelCommands: "מוצגות רק הפקודות המותרות לשלב.",
    successBody: "כל היעדים מוארים. אפשר להפעיל שוב את השלב או לעבור לחידה הבאה.",
    theme: "ערכת נושא",
    walkthroughClose: "סגירת המדריך",
    walkthroughDone: "להתחיל לשחק",
    walkthroughNext: "להמשיך",
    walkthroughOpen: "איך משחקים",
    walkthroughPrevious: "חזרה",
    walkthroughSubtitle:
      "תדריך קצר על השליטה, על לולאת הפתרון של המשחק, ועל מיומנויות החשיבה ש-Lumaloop מחזק בהדרגה.",
    walkthroughTitle: "איך משחקים ב-Lumaloop",
    walkthroughSlides: [
      {
        eyebrow: "משימה",
        title: "להדליק את כל האורות שעל הלוח",
        body:
          "כל שלב הוא משימת ניווט קטנה. הרובוט מבצע את התוכנית בדיוק כפי שנכתבה, והשלב נפתר רק כשכל אריחי היעד מוארים, לכן צריך לתכנן מסלול שלם ולא רק להגיע לנקודה אחת.",
        bullets: [
          "קודם מסובבים את הרובוט לכיוון הנכון ורק אחר כך זזים או קופצים.",
          "לא מספיק להדליק מנורה אחת אם נשאר יעד אחר כבוי במקום אחר על המפה.",
          "פתרון קצר יותר בדרך כלל אומר שזיהיתם את הדפוס האמיתי שמסתתר בתוך החידה.",
        ],
      },
      {
        eyebrow: "שליטה",
        title: "לבנות את המסלול פקודה אחרי פקודה",
        body:
          "משתמשים במגש הפעולות כדי להוסיף פקודות לראשית ולשרטט את הנתיב של הרובוט. בהמשך הקמפיין נפתחות גם פרוצדורה 1 ופרוצדורה 2, כדי שתוכלו לארוז רעיונות חוזרים למיני-תוכניות שניתנות לשימוש חוזר.",
        bullets: [
          "לוחצים על פקודה כדי להוסיף אותה לרוטינה הפעילה כרגע.",
          "אפשר להסיר צעדים בודדים או לנקות רוטינה כשרוצים לבדוק רעיון מסודר יותר.",
          "בחלק מהשלבים כמות הפקודות מוגבלת בכוונה, כדי למקד אתכם ברעיון חדש אחד בכל פעם.",
        ],
      },
      {
        eyebrow: "דיבוג",
        title: "להריץ את התוכנית וללמוד מכל טעות",
        body:
          "לוחצים על הפעלה וצופים ברובוט מבצע את הקוד כפשוטו. כשמשהו משתבש, זו לא סתם טעות אלא מידע שימושי: משווים בין מה שציפיתם שיקרה לבין מה שקרה בפועל, ואז משפרים את התוכנית ומנסים שוב.",
        bullets: [
          "אפשר לעצור, להריץ מחדש, ולחזור על הניסיון כמה פעמים שצריך בלי לאבד התקדמות.",
          "הרמזים מכוונים לרעיון המרכזי של השלב בלי לחשוף מיד את כל הפתרון.",
          "רגע הכישלון עצמו בדרך כלל מגלה אם הבעיה היא סדר, כיוון, גובה, או פעולה שחסרה.",
        ],
      },
      {
        eyebrow: "נושאים",
        title: "כל עולם מלמד דרך חדשה לחשוב",
        body:
          "הקמפיין בנוי כמו מסלול לימוד מודרך. בשלבים הראשונים מתחזקים ברצפים ובפניות, אחר כך לומדים לחשוב על גובה ותנועה במרחב, ובהמשך מתקדמים לפרוצדורות ולדפוסים רקורסיביים.",
        bullets: [
          "רצפים מלמדים לבחור את הפעולה הנכונה בזמן הנכון.",
          "כיוון וגובה מחזקים חשיבה מרחבית: לאן הרובוט פונה, איפה הוא עומד, ומה מחכה בהמשך.",
          "פרוצדורות ורקורסיה מלמדות לדחוס דפוסים חוזרים ללוגיקה חזקה שאפשר למחזר שוב ושוב.",
        ],
      },
      {
        eyebrow: "תועלת",
        title: "אתם מתרגלים חשיבה חישובית אמיתית",
        body:
          "Lumaloop הוא הרבה יותר ממשחק חידות. הוא מפתח תכנון, פירוק בעיות, זיהוי דפוסים, דיבוג, ואת הביטחון לשפר רעיון בהדרגה עד שהוא באמת עובד.",
        bullets: [
          "מפרקים מסלול ארוך לחלקים קטנים שקל יותר להבין, לבדוק ולתקן.",
          "מזהים מבנים חוזרים, דוחסים אותם, ומשתמשים בהם שוב בצורה מודעת.",
          "בונים התמדה דרך מחזור של ניסיון, תצפית, שיפור, וניסיון חוזר עם תוכנית חכמה יותר.",
        ],
      },
    ],
  },
};

type LocalizedLevelCopy = {
  concept?: string;
  designerNotes?: string;
  name: string;
};

const levelCopy: Partial<Record<Exclude<Locale, "en">, Record<string, LocalizedLevelCopy>>> = {
  ru: {
    "world-01-level-01": {
      name: "Прямая линия",
      concept: "Последовательность и порядок выполнения",
      designerNotes: "Посчитайте клетки до цели. На этом уровне поворачивать не нужно.",
    },
    "world-01-level-02": {
      name: "Повернись к лампе",
      concept: "Поворот меняет дальнейшее движение",
      designerNotes: "Первое полезное действие здесь меняет направление, а не позицию.",
    },
    "world-01-level-03": {
      name: "Прямой угол",
      concept: "Порядок выполнения важен на повороте",
      designerNotes: "Поворот нужен после прямого участка, а не до него.",
    },
    "world-01-level-04": {
      name: "Поворот в обе стороны",
      concept: "Левый и правый поворот не взаимозаменяемы",
      designerNotes: "Один выбор поворота ведет к цели, другой уводит от нее.",
    },
    "world-01-level-05": {
      name: "Обратный зигзаг",
      concept: "Длинный маршрут требует заранее продумать и направление, и момент поворота",
      designerNotes: "Считайте каждый изгиб контрольной точкой. Последнюю смену направления легко пропустить.",
    },
    "world-02-level-01": {
      name: "Зигзагообразный коридор",
      concept: "Планирование пути с чередованием поворотов",
      designerNotes: "Продумайте весь зигзаг до того, как поставите первый поворот.",
    },
    "world-02-level-02": {
      name: "Ложная развилка",
      concept: "Замечайте и избегайте заманчивую неверную ветку",
      designerNotes: "Одна ветка нужна только затем, чтобы потратить лишний поворот. Смотрите, куда каждая опция оставляет направление робота.",
    },
    "world-02-level-03": {
      name: "Двойной угол",
      concept: "Мысленная симуляция на более длинном маршруте",
      designerNotes: "Не решайте его по одной пещре за раз. Один раз целиком просимулируйте весь маршрут.",
    },
    "world-02-level-04": {
      name: "Две лампы",
      concept: "Прохождение не закончено, пока не зажжены все цели",
      designerNotes: "Достичь цели - не то же самое, что завершить забег.",
    },
    "world-02-level-05": {
      name: "Лампы с обходом",
      concept: "Нужно планировать не только первое достижение цели",
      designerNotes: "Настоящая сложность начинается после первой цели.",
    },
    "world-02-level-06": {
      name: "Кольцо ламп",
      concept: "Один маршрут может требовать повороты в разные стороны",
      designerNotes: "Срез кажется правильным из-за формы поля, а не из-за текущего направления.",
    },
    "world-03-level-01": {
      name: "Первый подъем",
      concept: "Чтобы подняться на один уровень, нужен прыжок",
      designerNotes: "Если ход идет вверх, сначала проверяйте высоту, а уже потом расстояние.",
    },
    "world-03-level-02": {
      name: "Шаг вниз",
      concept: "Прыжок нужен и для спуска",
      designerNotes: "Движение вниз все равно подчиняется правилу смены высоты.",
    },
    "world-03-level-03": {
      name: "Поворот на плато",
      concept: "Совмещайте правила прыжка и ориентацию",
      designerNotes: "Здесь только один ход меняет высоту. Дальше задача уже про направление.",
    },
    "world-03-level-04": {
      name: "Вверх, затем вниз",
      concept: "Переходы по высоте могут происходить несколько раз за маршрут",
      designerNotes: "И вверх, и вниз здесь нужен один и тот же особый ход.",
    },
    "world-03-level-05": {
      name: "Поворот на лестнице",
      concept: "Момент прыжка меняется, когда маршрут поворачивает к новому подъему",
      designerNotes: "Группируйте маршрут по тому, меняется ли высота, а не по виду дорожки сверху.",
    },
    "world-03-level-06": {
      name: "Разделенное плато",
      concept: "Один и тот же тип хода решает и подъем, и спуск в одном маршруте",
      designerNotes: "После первой цели сначала думайте о высоте, а уже потом о расстоянии.",
    },
    "world-03-level-07": {
      name: "Горный переключатель",
      concept: "Нужно читать весь профиль высоты, а не считать высоту единичным препятствием",
      designerNotes: "Читайте маршрут как подъем, спуск, поворот, подъем.",
    },
    "world-04-level-01": {
      name: "Двойной марш",
      concept: "Используйте процедуру вместо повторения одного и того же блока ходов",
      designerNotes: "Здесь есть повторяющийся отрезок ходьбы. Вопрос в том, где его хранить.",
    },
    "world-04-level-02": {
      name: "Вложенный угол",
      concept: "Функции могут вызывать другие функции, чтобы сжать маршрут",
      designerNotes: "Одна процедура может отвечать за расстояние, а другая - за поворот.",
    },
    "world-04-level-03": {
      name: "Линия сигналов",
      concept: "Процедура может упаковать повторяющуюся пару действий, а не только движение",
      designerNotes: "Упакуйте повторяющуюся пару действий, а не только повторяющееся движение.",
    },
    "world-04-level-04": {
      name: "Ступенчатая пара",
      concept: "Вложенные процедуры могут переиспользовать блок движения после смены ориентации",
      designerNotes: "Попробуйте переиспользовать один и тот же прямой отрезок из разных ориентаций.",
    },
    "world-04-level-05": {
      name: "Спиральные сигналы",
      concept: "Соберите один повторяемый макрос из другого, чтобы сжать узор из повторяющихся углов",
      designerNotes: "Ищите повторяющийся фрагмент в форме угла, а не отдельную повторяющуюся команду.",
    },
    "world-04-level-06": {
      name: "Ритм подъемника",
      concept: "Процедуры важны и тогда, когда повторяющийся мотив связан с высотой, а не с расстоянием",
      designerNotes: "Здесь повторяется ритм высоты, а не просто форма пути.",
    },
    "world-05-level-01": {
      name: "Рекурсивные лампы",
      concept: "Рекурсия может выразить повторяющийся шаблон до последней лампы",
      designerNotes: "Пусть именно рекурсивный вызов решает, есть ли впереди еще цель. Идеальный размер считает занятые слоты, а не выполненные шаги.",
    },
    "world-05-level-02": {
      name: "Рекурсивная лестница",
      concept: "Рекурсия умеет выражать повторяющийся перепад высоты так же хорошо, как прямой коридор",
      designerNotes: "Условие остановки здесь задает конец поля. Идеальный размер считает занятые слоты, а не выполненные шаги.",
    },
    "world-05-level-03": {
      name: "Эстафета по углам",
      concept: "Взаимная рекурсия может чередовать зажигание и перестановку позиции",
      designerNotes: "Пусть одна процедура отвечает за активацию, а другая - за перестановку перед следующей целью.",
    },
    "world-05-level-04": {
      name: "Ромбовидный вихрь",
      concept: "Рекурсивные помощники могут удерживать один и тот же ритм поворота, пока поле как будто вращается вокруг робота",
      designerNotes: "Сохраняйте один и тот же ритм поворота каждый раз, когда фигура как будто вращается вокруг вас.",
    },
    "world-05-level-05": {
      name: "Эстафета по гребню",
      concept: "Рекурсивная процедура может кодировать длинный повторяющийся ритм рельефа",
      designerNotes: "Повторяющаяся единица здесь длиннее одного хода. Ловите ритм рельефа, а не отдельный шаг.",
    },
    "world-05-level-06": {
      name: "Спиральный подъем",
      concept: "Взаимная рекурсия может объединить ориентацию и высоту в один повторяющийся шаблон подъема",
      designerNotes: "Разделите повторяющуюся работу на «активировать здесь» и «добраться до следующего уступа».",
    },
    "world-06-level-01": {
      name: "Контур мельницы",
      concept: "Более длинный узор из поворотов все равно можно свернуть в одну рекурсивную фразу",
      designerNotes: "Повторяющаяся единица здесь не сводится к одному углу. Это прямой участок, затем поворот, затем следующая цель.",
    },
    "world-06-level-02": {
      name: "Спиральные ступени",
      concept: "Рекурсия может кодировать спиральный подъем, когда каждое повторение заканчивается на новом уступе",
      designerNotes: "Смотрите на каждую цель как на начало одного и того же предложения подъема, а не как на особый случай.",
    },
    "world-06-level-03": {
      name: "Массив крюков",
      concept: "Взаимная рекурсия может разделить длинный повторяющийся крюк на активацию и перестановку",
      designerNotes: "Одна процедура должна отвечать за лампу. Другая должна брать на себя длинный изгиб, который переносит вас к следующей.",
    },
    "world-06-level-04": {
      name: "Угловой подъемник",
      concept: "Вложенные процедуры могут отделить повторяемый подъем от угла, который перенаправляет его",
      designerNotes: "Повторяемый фрагмент здесь - сам подъем. Оборачивающая процедура должна решать, когда зажигать цель, а когда поворачиваться.",
    },
    "world-06-level-05": {
      name: "Фонарная лестница",
      concept: "Взаимная рекурсия может сохранить чередующийся ритм высоты на поворотах",
      designerNotes: "Хитрость в том, что рельеф чередуется, но фраза, которую вы повторяете для каждой лампы, остается одной и той же.",
    },
    "world-07-level-01": {
      name: "Углы спирали",
      concept: "Длинная рекурсивная фраза может объединить плоское движение, поворот и высоту в одну спираль",
      designerNotes: "Каждое повторение начинается на цели и заканчивается на цели, но середина фразы смешивает три разные идеи движения.",
    },
    "world-07-level-02": {
      name: "Поворотный гребень",
      concept: "Взаимная рекурсия может пронести ритм рельефа через маршрут с поворотом",
      designerNotes: "Подъем и спуск находятся внутри транспортирующей процедуры. Процедура активации должна остаться крошечной.",
    },
    "world-07-level-03": {
      name: "Спираль помощников",
      concept: "Вспомогательная процедура может держать изгиб и прыжок, пока рекурсивная процедура владеет всей фразой",
      designerNotes: "Это сложнее обычной плоской спирали, потому что помощник должен сохранять и новое направление, и новую высоту.",
    },
    "world-07-level-04": {
      name: "Пульсирующий мост",
      concept: "Очень сложные макро-задачи все еще можно собрать чистой композицией без рекурсии",
      designerNotes: "Один помощник - это просто дистанция. Другой - это пульс: дойти до лампы, зажечь ее, повернуться и перебраться на следующую полосу.",
    },
    "world-07-level-05": {
      name: "Переход по короне",
      concept: "Чередование макросов может закодировать маршрут, который поднимается через разные типы углов",
      designerNotes: "Здесь важно выбрать правильный повторяемый угол для каждого отрезка. Помощники достаточно похожи, чтобы запутать вас, если разбиение будет небрежным.",
    },
    "world-08-level-01": {
      name: "Сложенная галерея",
      concept: "Сложный маршрут все равно можно свернуть, если одна процедура владеет расстоянием, а другая поворотом",
      designerNotes: "Уровень выглядит как путь с тремя лампами, но настоящий повторяющийся объект - это прямой отрезок, а затем четверть поворота.",
    },
    "world-08-level-02": {
      name: "Сложенная терраса",
      concept: "Та же двухслойная абстракция работает и тогда, когда каждый прямой отрезок на самом деле является подъемом",
      designerNotes: "Не решайте это как три отдельные площадки. Постройте одну процедуру для подъема и одну для смены ориентации.",
    },
    "world-08-level-03": {
      name: "Петля-печать",
      concept: "Взаимная рекурсия может нести ритм поворота по петле, не объясняя заново каждый угол",
      designerNotes: "Держите процедуру активации крошечной. Именно транспортная процедура должна помнить форму петли.",
    },
    "world-08-level-04": {
      name: "Пепельный серпантин",
      concept: "Рекурсия становится сложнее, когда повторяющаяся единица чередует подъем и спуск",
      designerNotes: "Поле каждый раз меняет высоту, но фраза о каждой лампе остается стабильной, если разделить ее в правильном месте.",
    },
    "world-08-level-05": {
      name: "Двойные крюки",
      concept: "Более длинную эстафету в форме крюка все еще можно чисто разделить между светом и перемещением",
      designerNotes: "Форма специально провоцирует записать весь маршрут напрямую. Не поддавайтесь и выделите повторяющийся крюк.",
    },
    "world-08-level-06": {
      name: "Гребневые крюки",
      concept: "Та же схема с крюком становится намного сложнее, когда в транспортную процедуру добавляются перепады высоты",
      designerNotes: "Рекурсивное разделение все еще правильно, но теперь транспортная процедура должна кодировать рельеф так же, как и направление.",
    },
    "world-08-level-07": {
      name: "Двойная линза",
      concept: "Одна процедура может упаковать целую фразу «зажги и поверни», пока другая удешевляет длинные отрезки",
      designerNotes: "Здесь важно решить, какой процедуре принадлежит активация, а не только движение.",
    },
    "world-08-level-08": {
      name: "Ступенчатая мозаика",
      concept: "Одна и та же абстрактная структура может пережить маршрут, который поднимается, поворачивает, спускается и снова поднимается",
      designerNotes: "Если уровень ощущается как список частных случаев, значит ваше разбиение слишком конкретное.",
    },
    "world-08-level-09": {
      name: "Игольчатый подъем",
      concept: "Одна рекурсивная фраза может работать даже тогда, когда каждое повторение прыгает дважды и поворачивает посередине",
      designerNotes: "Читайте целое предложение от одной лампы до другой. Средний поворот - часть повтора, а не особое исключение.",
    },
    "world-08-level-10": {
      name: "Гребень турникета",
      concept: "Вспомогательная процедура может владеть только осью поворота, пока рекурсивная процедура продолжает весь подъем",
      designerNotes: "Самая маленькая процедура здесь не является полным ответом. Это лишь шарнир, который позволяет рекурсивной фразе оставаться компактной.",
    },
  },
  he: {
    "world-01-level-01": {
      name: "קו ישר",
      concept: "רצף וסדר ביצוע",
      designerNotes: "ספרו את המשבצות עד היעד. בשלב הזה בכלל לא צריך לפנות.",
    },
    "world-01-level-02": {
      name: "פנו אל המנורה",
      concept: "סיבוב משנה את התנועה הבאה",
      designerNotes: "הפעולה השימושית הראשונה כאן משנה כיוון, לא מיקום.",
    },
    "world-01-level-03": {
      name: "זווית ישרה",
      concept: "סדר הביצוע חשוב בפינה",
      designerNotes: "הפנייה צריכה לקרות אחרי הקטע הישר, לא לפניו.",
    },
    "world-01-level-04": {
      name: "פנו לשני הכיוונים",
      concept: "פנייה שמאלה ופנייה ימינה אינן שקולות",
      designerNotes: "בחירת פנייה אחת מכוונת אל היעד, והאחרת מרחיקה ממנו.",
    },
    "world-01-level-05": {
      name: "זיגזג חוזר",
      concept: "מסלול ארוך דורש לתכנן מראש גם את כיוון הפנייה וגם את התזמון שלה",
      designerNotes: "התייחסו לכל פנייה כאל נקודת ביקורת. קל לפספס דווקא את שינוי הכיוון האחרון.",
    },
    "world-02-level-01": {
      name: "מסדרון מזגזג",
      concept: "תכנון מסלול עם פניות מתחלפות",
      designerNotes: "תכננו את כל הזיגזג לפני שאתם מציבים את הפנייה הראשונה.",
    },
    "world-02-level-02": {
      name: "הסתעפות מטעה",
      concept: "לזהות ולהימנע מהענף השגוי והמפתה",
      designerNotes: "ענף אחד קיים רק כדי לבזבז פנייה. בדקו לאיזה כיוון כל אפשרות משאירה את הרובוט.",
    },
    "world-02-level-03": {
      name: "פינה כפולה",
      concept: "סימולציה מנטלית לאורך מסלול ארוך יותר",
      designerNotes: "אל תפתרו את זה פינה אחרי פינה. דמיינו פעם אחת את כל המסלול עד הסוף.",
    },
    "world-02-level-04": {
      name: "שתי מנורות",
      concept: "ההרצה לא הושלמה עד שכל היעדים מוארים",
      designerNotes: "להגיע ליעד זה לא אותו דבר כמו לסיים את הריצה.",
    },
    "world-02-level-05": {
      name: "מנורות עם מעקף",
      concept: "צריך לתכנן מעבר להגעה הראשונה אל היעד",
      designerNotes: "החלק הקשה באמת מתחיל אחרי היעד הראשון.",
    },
    "world-02-level-06": {
      name: "לולאת מנורות",
      concept: "מסלול אחד יכול לדרוש פניות לשני הכיוונים",
      designerNotes: "הקיצור נראה נכון בגלל צורת הלוח, לא בגלל הכיוון שבו הרובוט פונה.",
    },
    "world-03-level-01": {
      name: "העלייה הראשונה",
      concept: "כדי לעלות קומה אחת חייבים לקפוץ",
      designerNotes: "אם המהלך עולה בגובה, קודם בודקים גובה ורק אחר כך מרחק.",
    },
    "world-03-level-02": {
      name: "צעד למטה",
      concept: "קפיצה משמשת גם לירידה",
      designerNotes: "גם ירידה עדיין נשלטת על ידי חוק שינוי הגובה.",
    },
    "world-03-level-03": {
      name: "פנייה על הרמה",
      concept: "לשלב את חוקיות הקפיצה עם כיוון התנועה",
      designerNotes: "כאן רק מהלך אחד משנה גובה. אחריו הבעיה כבר הופכת לבעיה של כיוון.",
    },
    "world-03-level-04": {
      name: "למעלה ואז למטה",
      concept: "מעברי גובה יכולים לקרות יותר מפעם אחת במסלול",
      designerNotes: "אותו מהלך מיוחד נדרש גם בעלייה וגם בירידה.",
    },
    "world-03-level-05": {
      name: "פנייה במדרגות",
      concept: "תזמון הקפיצה משתנה כשהמסלול פונה לעבר עלייה נוספת",
      designerNotes: "חלקו את המסלול לפי השאלה אם הגובה משתנה, לא לפי איך שהשביל נראה מלמעלה.",
    },
    "world-03-level-06": {
      name: "רמה מפוצלת",
      concept: "אותו סוג מהלך פותר גם עלייה וגם ירידה בתוך אותו מסלול",
      designerNotes: "אחרי היעד הראשון, חשבו קודם על הגובה ורק אחר כך על המרחק.",
    },
    "world-03-level-07": {
      name: "מתג הרים",
      concept: "צריך לקרוא את כל פרופיל הגובה ולא להתייחס לגובה כמכשול יחיד",
      designerNotes: "קראו את המסלול כך: עלייה, ירידה, פנייה, עלייה.",
    },
    "world-04-level-01": {
      name: "צעדה כפולה",
      concept: "השתמשו בפרוצדורה במקום לחזור על אותו רצף הליכה",
      designerNotes: "יש כאן קטע הליכה שחוזר על עצמו. השאלה היא איפה לשמור אותו.",
    },
    "world-04-level-02": {
      name: "פינה מקוננת",
      concept: "פונקציות יכולות לקרוא לפונקציות אחרות כדי לקצר מסלול",
      designerNotes: "פרוצדורה אחת יכולה לקחת בעלות על המרחק, והשנייה על הפינה.",
    },
    "world-04-level-03": {
      name: "קו אותות",
      concept: "פרוצדורה יכולה לארוז זוג פעולות חוזר, לא רק תנועה",
      designerNotes: "ארזו את זוג הפעולות שחוזר על עצמו, לא רק את התנועה שחוזרת על עצמה.",
    },
    "world-04-level-04": {
      name: "זוג מדרגות",
      concept: "פרוצדורות מקוננות יכולות למחזר קטע תנועה אחרי שינוי כיוון",
      designerNotes: "נסו למחזר את אותו קטע ישר מכמה אוריינטציות שונות.",
    },
    "world-04-level-05": {
      name: "אותות ספירליים",
      concept: "בנו מאקרו חוזר אחד מתוך אחר כדי לדחוס תבנית של פינות חוזרות",
      designerNotes: "חפשו קטע חוזר בצורת פינה, לא פקודה בודדת שחוזרת.",
    },
    "world-04-level-06": {
      name: "קצב המעלית",
      concept: "פרוצדורות עדיין חשובות גם כשהמוטיב החוזר קשור לגובה ולא למרחק",
      designerNotes: "מה שחוזר כאן הוא קצב של גבהים, לא רק צורת מסלול.",
    },
    "world-05-level-01": {
      name: "מנורות רקורסיביות",
      concept: "רקורסיה יכולה לתאר דפוס חוזר עד שהמנורה האחרונה מסיימת את ההרצה",
      designerNotes: "תנו לקריאה הרקורסיבית לקבוע אם נשאר עוד יעד. הגודל האידיאלי סופר סלוטים מלאים, לא צעדים שבוצעו.",
    },
    "world-05-level-02": {
      name: "מדרגה רקורסיבית",
      concept: "רקורסיה יכולה לתאר הפרש גבהים חוזר לא פחות טוב ממסדרון ישר",
      designerNotes: "תנאי העצירה מגיע מקצה הלוח. הגודל האידיאלי סופר סלוטים מלאים, לא צעדים שבוצעו.",
    },
    "world-05-level-03": {
      name: "מרוץ פינות",
      concept: "רקורסיה הדדית יכולה להחליף בין הדלקה לבין מיקום מחדש",
      designerNotes: "תנו לפרוצדורה אחת לטפל בהפעלה, ולשנייה לטפל במיקום לקראת היעד הבא.",
    },
    "world-05-level-04": {
      name: "סחרור יהלום",
      concept: "עוזרים רקורסיביים יכולים לשמור על דפוס פנייה קבוע בזמן שהלוח כאילו מסתובב סביב הרובוט",
      designerNotes: "שמרו על אותו קצב פנייה בכל פעם שהצורה כאילו מסתובבת סביבכם.",
    },
    "world-05-level-05": {
      name: "מרוץ רכס",
      concept: "פרוצדורה רקורסיבית יכולה לקודד קצב טופוגרפי ארוך שחוזר על עצמו",
      designerNotes: "היחידה החוזרת כאן ארוכה ממהלך אחד. חפשו את קצב הרכס, לא צעד בודד.",
    },
    "world-05-level-06": {
      name: "עלייה ספירלית",
      concept: "רקורסיה הדדית יכולה לשלב כיוון וגובה בתבנית טיפוס אחת שחוזרת על עצמה",
      designerNotes: "פצלו את העבודה החוזרת ל'הפעל כאן' ול'התקדם אל המדף הבא'.",
    },
    "world-06-level-01": {
      name: "מעגל טחנת רוח",
      concept: "גם תבנית ארוכה יותר של פניות אפשר לדחוס למשפט רקורסיבי אחד",
      designerNotes: "היחידה החוזרת כאן היא לא רק פינה אחת. זה קטע ישר, אחר כך פנייה, ואז היעד הבא.",
    },
    "world-06-level-02": {
      name: "מדרגות ספירלה",
      concept: "רקורסיה יכולה לקודד טיפוס ספירלי כשכל חזרה מסתיימת על מדף חדש",
      designerNotes: "התייחסו לכל יעד כאל תחילתו של אותו משפט טיפוס, ולא כאל מקרה מיוחד.",
    },
    "world-06-level-03": {
      name: "מערך ווים",
      concept: "רקורסיה הדדית יכולה לפצל וו ארוך שחוזר על עצמו בין הפעלה לבין מיקום מחדש",
      designerNotes: "פרוצדורה אחת צריכה להיות אחראית על המנורה. השנייה צריכה לקחת את הסיבוב הארוך שמעביר אתכם אל הבאה בתור.",
    },
    "world-06-level-04": {
      name: "מעלית פינתית",
      concept: "פרוצדורות מקוננות יכולות להפריד בין העלייה החוזרת לבין הפינה שמכוונת אותה מחדש",
      designerNotes: "הקטע החוזר כאן הוא העלייה עצמה. פרוצדורת העטיפה צריכה להחליט מתי להדליק ומתי להסתובב.",
    },
    "world-06-level-05": {
      name: "סולם פנסים",
      concept: "רקורסיה הדדית יכולה לשמר קצב גבהים מתחלף לאורך פניות",
      designerNotes: "התחכום כאן הוא שהשטח מתחלף, אבל המשפט שאתם אומרים על כל פנס נשאר אותו דבר.",
    },
    "world-07-level-01": {
      name: "פינות הליקס",
      concept: "משפט רקורסיבי ארוך יכול לשלב תנועה שטוחה, פנייה וגובה לכדי הליקס אחד",
      designerNotes: "כל חזרה מתחילה על יעד ומסתיימת על יעד, אבל אמצע המשפט משלב שלושה רעיונות שונים של תנועה.",
    },
    "world-07-level-02": {
      name: "סיבוב רכס",
      concept: "רקורסיה הדדית יכולה לשאת קצב טופוגרפי דרך מסלול שמסתובב",
      designerNotes: "העלייה והירידה יושבות בתוך פרוצדורת ההובלה. פרוצדורת ההפעלה צריכה להישאר זעירה.",
    },
    "world-07-level-03": {
      name: "ספירלת עוזרים",
      concept: "פרוצדורת עזר יכולה להחזיק את הפנייה והקפיצה בזמן שהפרוצדורה הרקורסיבית מחזיקה את כל המשפט",
      designerNotes: "זה קשה יותר מספירלה שטוחה, כי העוזר חייב לשמר גם את הכיוון החדש וגם את הגובה החדש.",
    },
    "world-07-level-04": {
      name: "גשר פעימות",
      concept: "גם פאזלי מאקרו קשים מאוד אפשר לבנות מהרכבה טהורה בלי רקורסיה",
      designerNotes: "עוזר אחד הוא רק מרחק. העוזר השני הוא הפעימה: להגיע לפנס, להדליק אותו, להסתובב ולעבור לנתיב הבא.",
    },
    "world-07-level-05": {
      name: "חציית כתר",
      concept: "החלפה בין מאקרואים יכולה לקודד מסלול שמטפס דרך סוגים שונים של פינות",
      designerNotes: "כאן צריך לבחור את הפינה החוזרת הנכונה לכל מקטע. העוזרים דומים מספיק כדי לבלבל אם הפירוק לא מדויק.",
    },
    "world-08-level-01": {
      name: "גלריה מקופלת",
      concept: "גם מסלול קשה אפשר לדחוס כשפרוצדורה אחת מחזיקה את המרחק ואחרת את הפנייה",
      designerNotes: "הפאזל נראה כמו מסלול עם שלושה פנסים, אבל הדבר שבאמת חוזר הוא קטע ישר ואחריו רבע סיבוב.",
    },
    "world-08-level-02": {
      name: "טרסה מקופלת",
      concept: "אותה הפשטה דו-שכבתית עובדת גם כשכל קטע ישר הוא בעצם טיפוס",
      designerNotes: "אל תפתרו את זה כשלוש טרסות נפרדות. בנו פרוצדורה אחת לעלייה ואחת לכיוון מחדש.",
    },
    "world-08-level-03": {
      name: "לולאת חותם",
      concept: "רקורסיה הדדית יכולה לשאת קצב פניות סביב לולאה בלי להסביר כל פינה מחדש",
      designerNotes: "השאירו את פרוצדורת ההפעלה זעירה. פרוצדורת ההובלה היא זו שצריכה לזכור את צורת הלולאה.",
    },
    "world-08-level-04": {
      name: "סרפנטינה אפרורית",
      concept: "רקורסיה נעשית קשה יותר כשהיחידה החוזרת מחליפה בין עלייה לירידה",
      designerNotes: "הלוח משנה גובה בכל פעם, אבל המשפט על כל פנס נשאר יציב אם מפצלים אותו במקום הנכון.",
    },
    "world-08-level-05": {
      name: "ווים כפולים",
      concept: "גם מרוץ ארוך בצורת וו אפשר לפצל בצורה נקייה בין אור לבין תנועה",
      designerNotes: "הצורה נועדה לפתות אתכם לכתוב את כל המסלול ישירות. אל תיפלו בזה, ובודדו את הוו החוזר.",
    },
    "world-08-level-06": {
      name: "ווי רכס",
      concept: "אותו דפוס וו נעשה קשה בהרבה כששינויי הגובה מתקפלים לתוך פרוצדורת ההובלה",
      designerNotes: "הפיצול הרקורסיבי עדיין נכון, אבל עכשיו פרוצדורת ההובלה חייבת לקודד גם את השטח וגם את הכיוון.",
    },
    "world-08-level-07": {
      name: "עדשה כפולה",
      concept: "פרוצדורה אחת יכולה לארוז משפט שלם של 'הדלק והסתובב', בזמן שאחרת מוזילה קטעים ארוכים",
      designerNotes: "כאן חשוב להחליט איזו פרוצדורה מחזיקה את ההפעלה, לא רק איזו מחזיקה את התנועה.",
    },
    "world-08-level-08": {
      name: "פסיפס מדרגות",
      concept: "אותו מבנה מופשט יכול לשרוד מסלול שעולה, פונה, יורד ושוב עולה",
      designerNotes: "אם השלב מרגיש כמו רשימת מקרים פרטיים, אז הפירוק שלכם קונקרטי מדי.",
    },
    "world-08-level-09": {
      name: "טיפוס מחט",
      concept: "משפט רקורסיבי אחד יכול לעבוד גם כשכל חזרה קופצת פעמיים ומסתובבת באמצע",
      designerNotes: "קראו את כל המשפט מפנס אחד אל הבא. הפנייה שבאמצע היא חלק מהחזרה, לא חריג מיוחד.",
    },
    "world-08-level-10": {
      name: "רכס קרוסלה",
      concept: "פרוצדורת עזר יכולה להחזיק רק את ציר הסיבוב בזמן שהפרוצדורה הרקורסיבית ממשיכה את כל הטיפוס",
      designerNotes: "הפרוצדורה הקטנה ביותר כאן אינה כל הפתרון. היא רק הציר שמאפשר למשפט הרקורסיבי להישאר קומפקטי.",
    },
  },
};

export function getMessages(locale: Locale) {
  return messages[locale];
}

export function isRtlLocale(locale: Locale) {
  return RTL_LOCALES.includes(locale);
}

export function getRoutineLabel(locale: Locale, routine: RoutineName) {
  const copy = getMessages(locale);

  switch (routine) {
    case "main":
      return copy.mainRoutine;
    case "p1":
      return copy.proc1Routine;
    case "p2":
      return copy.proc2Routine;
  }
}

export function localizeLevel(level: LevelDefinition, locale: Locale): LevelDefinition {
  if (locale === "en") {
    return level;
  }

  const copy = levelCopy[locale]?.[level.id];

  if (!copy) {
    return level;
  }

  return {
    ...level,
    name: copy.name,
    metadata: level.metadata
      ? {
        ...level.metadata,
        concept: copy.concept ?? level.metadata.concept,
        designerNotes: copy.designerNotes ?? level.metadata.designerNotes,
      }
      : undefined,
  };
}
