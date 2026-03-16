import type { Command, LevelDefinition, RunResult, RunStatus, RoutineName } from "@lumaloop/engine";

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
  actionView: string;
  addCommandToSlot: (routineLabel: string, index: number) => string;
  allActions: string;
  camera: string;
  cameraLeft: string;
  cameraRight: string;
  campaign: string;
  clear: string;
  commandLabels: Record<Command, string>;
  concept: string;
  debugger: string;
  defaultHint: string;
  darkMode: string;
  execution: string;
  executionFailed: string;
  failureReasons: Record<RunStatus, string>;
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
  menuIdleStatus: string;
  menuSuccessStatus: string;
  next: string;
  noSlots: string;
  panelIdleStatus: string;
  panelSuccessStatus: string;
  pause: string;
  play: string;
  proc1Routine: string;
  proc2Routine: string;
  proceduralHierarchy: string;
  programmingPuzzle: string;
  programSize: (value: number) => string;
  puzzleMenu: string;
  puzzleSolved: string;
  removeCommandFromSlot: (routineLabel: string, index: number) => string;
  replay: string;
  reset: string;
  robotColor: string;
  right: string;
  routineSlots: (filled: number, total: number) => string;
  score: string;
  selectLevel: string;
  showingFullCommandSet: string;
  showingLevelCommands: string;
  sizeSummary: (value: number) => string;
  solvePuzzle: string;
  speed: string;
  status: string;
  statusLabels: Record<RunStatus | "READY", string>;
  step: string;
  steps: string;
  successBody: string;
  targets: string;
  theme: string;
  tools: string;
  workspaceCanvas: string;
};

const messages: Record<Locale, Messages> = {
  en: {
    actions: "Actions",
    actionView: "Action View",
    addCommandToSlot: (routineLabel, index) => `Add command to ${routineLabel} slot ${index}`,
    allActions: "All Actions",
    camera: "Camera",
    cameraLeft: "Camera Left",
    cameraRight: "Camera Right",
    campaign: "Campaign",
    clear: "Clear",
    commandLabels: {
      FORWARD: "Move Forward",
      TURN_LEFT: "Turn Left",
      TURN_RIGHT: "Turn Right",
      JUMP: "Jump",
      LIGHT: "Light",
      CALL_P1: "Function 1",
      CALL_P2: "Function 2",
    },
    concept: "Concept",
    debugger: "Debugger",
    defaultHint: "Light every goal tile.",
    darkMode: "Dark",
    execution: "Execution",
    executionFailed: "Execution failed.",
    failureReasons: {
      FAILED_EMPTY_PROCEDURE: "A procedure was called before it had commands.",
      FAILED_INCOMPLETE: "Not every target was lit.",
      FAILED_INVALID_JUMP: "That jump was not legal.",
      FAILED_INVALID_MOVE: "The robot tried to walk into empty space.",
      FAILED_INVALID_PROGRAM: "The current setup is invalid.",
      FAILED_MAX_STEPS: "The safety step limit stopped the run.",
      FAILED_RECURSION: "The call stack limit stopped recursion.",
      FAILED_WRONG_LIGHT: "Light only works on a goal tile.",
      SUCCESS: "Puzzle solved.",
    },
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
    menuIdleStatus: "Build a small program and press play.",
    menuSuccessStatus: "Puzzle solved.",
    next: "Next",
    noSlots: "No slots",
    panelIdleStatus: "Build a program, then run it or step through it like a debugger.",
    panelSuccessStatus: "All goal tiles are lit.",
    pause: "Pause",
    play: "Play",
    proc1Routine: "Proc 1",
    proc2Routine: "Proc 2",
    proceduralHierarchy: "Procedural Hierarchy",
    programmingPuzzle: "Programming puzzle",
    programSize: (value) => `Program Size ${value}`,
    puzzleMenu: "Puzzle Menu",
    puzzleSolved: "Puzzle Solved!",
    removeCommandFromSlot: (routineLabel, index) => `Remove command from ${routineLabel} slot ${index}`,
    replay: "Replay",
    reset: "Reset",
    robotColor: "Robot Color",
    right: "Right",
    routineSlots: (filled, total) => `${filled} / ${total}`,
    score: "Score",
    selectLevel: "Select Level",
    showingFullCommandSet: "Showing the full command set.",
    showingLevelCommands: "Showing level-allowed commands only.",
    sizeSummary: (value) => `Size ${value}`,
    solvePuzzle: "Solve the Puzzle!",
    speed: "Speed",
    status: "Status",
    statusLabels: {
      READY: "Ready",
      SUCCESS: "Solved",
      FAILED_EMPTY_PROCEDURE: "Empty procedure",
      FAILED_INCOMPLETE: "Incomplete",
      FAILED_INVALID_JUMP: "Invalid jump",
      FAILED_INVALID_MOVE: "Invalid move",
      FAILED_INVALID_PROGRAM: "Invalid program",
      FAILED_MAX_STEPS: "Step limit",
      FAILED_RECURSION: "Recursion limit",
      FAILED_WRONG_LIGHT: "Wrong light",
    },
    step: "Step",
    steps: "Steps",
    successBody: "All targets are lit. You can replay this level or move on to the next puzzle.",
    targets: "Targets",
    theme: "Theme",
    tools: "Tools",
    workspaceCanvas: "Workspace Canvas",
  },
  ru: {
    actions: "Команды",
    actionView: "Показ команд",
    addCommandToSlot: (routineLabel, index) => `Добавить команду в ${routineLabel}, ячейка ${index}`,
    allActions: "Все команды",
    camera: "Камера",
    cameraLeft: "Камера влево",
    cameraRight: "Камера вправо",
    campaign: "Кампания",
    clear: "Очистить",
    commandLabels: {
      FORWARD: "Вперед",
      TURN_LEFT: "Поворот влево",
      TURN_RIGHT: "Поворот вправо",
      JUMP: "Прыжок",
      LIGHT: "Зажечь",
      CALL_P1: "Функция 1",
      CALL_P2: "Функция 2",
    },
    concept: "Идея",
    debugger: "Отладка",
    defaultHint: "Зажгите каждую целевую плитку.",
    darkMode: "Темная",
    execution: "Выполнение",
    executionFailed: "Выполнение завершилось ошибкой.",
    failureReasons: {
      FAILED_EMPTY_PROCEDURE: "Процедура была вызвана до того, как в ней появились команды.",
      FAILED_INCOMPLETE: "Зажжены не все цели.",
      FAILED_INVALID_JUMP: "Этот прыжок недопустим.",
      FAILED_INVALID_MOVE: "Робот попытался шагнуть в пустоту.",
      FAILED_INVALID_PROGRAM: "Текущая программа некорректна.",
      FAILED_MAX_STEPS: "Сработал защитный лимит шагов.",
      FAILED_RECURSION: "Лимит стека остановил рекурсию.",
      FAILED_WRONG_LIGHT: "Команда света работает только на целевой плитке.",
      SUCCESS: "Уровень пройден.",
    },
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
    menuIdleStatus: "Соберите программу и нажмите запуск.",
    menuSuccessStatus: "Уровень пройден.",
    next: "Дальше",
    noSlots: "Нет ячеек",
    panelIdleStatus: "Соберите программу и запустите ее или проходите по шагам как в отладчике.",
    panelSuccessStatus: "Все целевые плитки зажжены.",
    pause: "Пауза",
    play: "Старт",
    proc1Routine: "Проц. 1",
    proc2Routine: "Проц. 2",
    proceduralHierarchy: "Иерархия процедур",
    programmingPuzzle: "Головоломка по программированию",
    programSize: (value) => `Размер программы ${value}`,
    puzzleMenu: "Меню уровня",
    puzzleSolved: "Головоломка решена!",
    removeCommandFromSlot: (routineLabel, index) => `Убрать команду из ${routineLabel}, ячейка ${index}`,
    replay: "Повтор",
    reset: "Сброс",
    robotColor: "Цвет робота",
    right: "Вправо",
    routineSlots: (filled, total) => `${filled} / ${total}`,
    score: "Счет",
    selectLevel: "Выбрать уровень",
    showingFullCommandSet: "Показан полный набор команд.",
    showingLevelCommands: "Показаны только команды, разрешенные уровнем.",
    sizeSummary: (value) => `Размер ${value}`,
    solvePuzzle: "Решите головоломку!",
    speed: "Скорость",
    status: "Статус",
    statusLabels: {
      READY: "Готово",
      SUCCESS: "Решено",
      FAILED_EMPTY_PROCEDURE: "Пустая процедура",
      FAILED_INCOMPLETE: "Не все цели",
      FAILED_INVALID_JUMP: "Неверный прыжок",
      FAILED_INVALID_MOVE: "Неверный ход",
      FAILED_INVALID_PROGRAM: "Неверная программа",
      FAILED_MAX_STEPS: "Лимит шагов",
      FAILED_RECURSION: "Лимит рекурсии",
      FAILED_WRONG_LIGHT: "Неверный свет",
    },
    step: "Шаг",
    steps: "Шаги",
    successBody: "Все цели зажжены. Можно переиграть уровень или перейти к следующей головоломке.",
    targets: "Цели",
    theme: "Тема",
    tools: "Инструменты",
    workspaceCanvas: "Рабочее полотно",
  },
  he: {
    actions: "פקודות",
    actionView: "תצוגת פקודות",
    addCommandToSlot: (routineLabel, index) => `הוסף פקודה ל${routineLabel}, משבצת ${index}`,
    allActions: "כל הפקודות",
    camera: "מצלמה",
    cameraLeft: "מצלמה שמאלה",
    cameraRight: "מצלמה ימינה",
    campaign: "קמפיין",
    clear: "נקה",
    commandLabels: {
      FORWARD: "קדימה",
      TURN_LEFT: "פנה שמאלה",
      TURN_RIGHT: "פנה ימינה",
      JUMP: "קפיצה",
      LIGHT: "הדלק",
      CALL_P1: "פונקציה 1",
      CALL_P2: "פונקציה 2",
    },
    concept: "רעיון",
    debugger: "דיבאגר",
    defaultHint: "האירו כל אריח יעד.",
    darkMode: "כהה",
    execution: "הרצה",
    executionFailed: "ההרצה נכשלה.",
    failureReasons: {
      FAILED_EMPTY_PROCEDURE: "נקראה פרוצדורה לפני שהיו בה פקודות.",
      FAILED_INCOMPLETE: "לא כל היעדים הודלקו.",
      FAILED_INVALID_JUMP: "הקפיצה הזו אינה חוקית.",
      FAILED_INVALID_MOVE: "הרובוט ניסה לצעוד אל חלל ריק.",
      FAILED_INVALID_PROGRAM: "התוכנית הנוכחית אינה תקינה.",
      FAILED_MAX_STEPS: "מגבלת הצעדים עצרה את ההרצה.",
      FAILED_RECURSION: "מגבלת מחסנית הקריאות עצרה את הרקורסיה.",
      FAILED_WRONG_LIGHT: "אפשר להדליק רק על אריח יעד.",
      SUCCESS: "השלב נפתר.",
    },
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
    menuIdleStatus: "בנו תוכנית קצרה ולחצו הפעלה.",
    menuSuccessStatus: "השלב נפתר.",
    next: "הבא",
    noSlots: "אין משבצות",
    panelIdleStatus: "בנו תוכנית ואז הפעילו אותה או עברו צעד צעד כמו בדיבאגר.",
    panelSuccessStatus: "כל אריחי היעד מוארים.",
    pause: "השהה",
    play: "הפעל",
    proc1Routine: "פרוצדורה 1",
    proc2Routine: "פרוצדורה 2",
    proceduralHierarchy: "היררכיית פרוצדורות",
    programmingPuzzle: "חידת תכנות",
    programSize: (value) => `גודל תוכנית ${value}`,
    puzzleMenu: "תפריט שלב",
    puzzleSolved: "החידה נפתרה!",
    removeCommandFromSlot: (routineLabel, index) => `הסר פקודה מ${routineLabel}, משבצת ${index}`,
    replay: "הפעל שוב",
    reset: "איפוס",
    robotColor: "צבע הרובוט",
    right: "ימינה",
    routineSlots: (filled, total) => `${filled} / ${total}`,
    score: "ציון",
    selectLevel: "בחרו שלב",
    showingFullCommandSet: "מוצג סט הפקודות המלא.",
    showingLevelCommands: "מוצגות רק הפקודות המותרות לשלב.",
    sizeSummary: (value) => `גודל ${value}`,
    solvePuzzle: "פתרו את החידה!",
    speed: "מהירות",
    status: "מצב",
    statusLabels: {
      READY: "מוכן",
      SUCCESS: "נפתר",
      FAILED_EMPTY_PROCEDURE: "פרוצדורה ריקה",
      FAILED_INCOMPLETE: "לא כל היעדים",
      FAILED_INVALID_JUMP: "קפיצה שגויה",
      FAILED_INVALID_MOVE: "תנועה שגויה",
      FAILED_INVALID_PROGRAM: "תוכנית שגויה",
      FAILED_MAX_STEPS: "מגבלת צעדים",
      FAILED_RECURSION: "מגבלת רקורסיה",
      FAILED_WRONG_LIGHT: "הדלקה שגויה",
    },
    step: "צעד",
    steps: "צעדים",
    successBody: "כל היעדים מוארים. אפשר להפעיל שוב את השלב או לעבור לחידה הבאה.",
    targets: "יעדים",
    theme: "ערכת נושא",
    tools: "כלים",
    workspaceCanvas: "משטח עבודה",
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
      designerNotes: "Кратчайший путь - пройти по прямой к единственной лампе.",
    },
    "world-01-level-02": {
      name: "Повернись к лампе",
      concept: "Поворот меняет дальнейшее движение",
      designerNotes: "Очевидная ошибка - идти вперед до поворота.",
    },
    "world-01-level-03": {
      name: "Прямой угол",
      concept: "Порядок выполнения важен на повороте",
      designerNotes: "Этот изгиб показывает, что слишком ранний или слишком поздний поворот одинаково приводит к провалу.",
    },
    "world-01-level-04": {
      name: "Поворот в обе стороны",
      concept: "Левый и правый поворот не взаимозаменяемы",
      designerNotes: "Маршрут сработает только если после двух шагов повернуть направо и зажечь последнюю плитку.",
    },
    "world-01-level-05": {
      name: "Обратный зигзаг",
      concept: "Длинный маршрут требует заранее продумать и направление, и момент поворота",
      designerNotes: "Путь выглядит простым, но один слишком ранний или слишком поздний поворот сразу сбрасывает робота с поля.",
    },
    "world-02-level-01": {
      name: "Зигзагообразный коридор",
      concept: "Планирование пути с чередованием поворотов",
      designerNotes: "Поле маленькое, но наказывает за поверхностную симуляцию.",
    },
    "world-02-level-02": {
      name: "Ложная развилка",
      concept: "Замечайте и избегайте заманчивую неверную ветку",
      designerNotes: "Одна ветка существует только затем, чтобы ошибки планирования были заметнее.",
    },
    "world-02-level-03": {
      name: "Двойной угол",
      concept: "Мысленная симуляция на более длинном маршруте",
      designerNotes: "Путь все еще линейный, но уже достаточно длинный, чтобы требовать аккуратной последовательности.",
    },
    "world-02-level-04": {
      name: "Две лампы",
      concept: "Прохождение не закончено, пока не зажжены все цели",
      designerNotes: "Игрок может зажечь одну лампу и все равно проиграть, что учит условию полноты.",
    },
    "world-02-level-05": {
      name: "Лампы с обходом",
      concept: "Нужно планировать не только первое достижение цели",
      designerNotes: "До первой лампы добраться легко. Настоящая задача - покинуть ее с правильной ориентацией для второй.",
    },
    "world-02-level-06": {
      name: "Кольцо ламп",
      concept: "Один маршрут может требовать повороты в разные стороны",
      designerNotes: "Внутренняя плитка выглядит как удобный срез, если потерять ориентацию.",
    },
    "world-03-level-01": {
      name: "Первый подъем",
      concept: "Чтобы подняться на один уровень, нужен прыжок",
      designerNotes: "FORWARD кажется правильным, но ломается из-за разницы высот.",
    },
    "world-03-level-02": {
      name: "Шаг вниз",
      concept: "Прыжок нужен и для спуска",
      designerNotes: "Уровень изолирует асимметрию между FORWARD и JUMP.",
    },
    "world-03-level-03": {
      name: "Поворот на плато",
      concept: "Совмещайте правила прыжка и ориентацию",
      designerNotes: "Только первый ход использует JUMP, остальные идут по той же высоте.",
    },
    "world-03-level-04": {
      name: "Вверх, затем вниз",
      concept: "Переходы по высоте могут происходить несколько раз за маршрут",
      designerNotes: "Нужно заметить, что и подъем, и спуск требуют JUMP.",
    },
    "world-03-level-05": {
      name: "Поворот на лестнице",
      concept: "Момент прыжка меняется, когда маршрут поворачивает к новому подъему",
      designerNotes: "Путь чередует участки, где легален JUMP и где легален FORWARD, поэтому относиться ко всем перепадам высоты одинаково нельзя.",
    },
    "world-03-level-06": {
      name: "Разделенное плато",
      concept: "Один и тот же тип хода решает и подъем, и спуск в одном маршруте",
      designerNotes: "После первой лампы правильный ход все еще JUMP, хотя теперь робот идет вниз.",
    },
    "world-03-level-07": {
      name: "Горный переключатель",
      concept: "Нужно читать весь профиль высоты, а не считать высоту единичным препятствием",
      designerNotes: "Маршрут поднимается, спускается, поворачивает и снова поднимается. Если перестать симулировать после первого прыжка, будет провал.",
    },
    "world-04-level-01": {
      name: "Двойной марш",
      concept: "Используйте процедуру вместо повторения одного и того же блока ходов",
      designerNotes: "Оптимальный путь: MAIN: P1, P1, LIGHT и P1: FORWARD, FORWARD.",
    },
    "world-04-level-02": {
      name: "Вложенный угол",
      concept: "Функции могут вызывать другие функции, чтобы сжать маршрут",
      designerNotes: "Один компактный вариант: MAIN: P1, P2, LIGHT; P1: FORWARD, FORWARD; P2: TURN_RIGHT, FORWARD.",
    },
    "world-04-level-03": {
      name: "Линия сигналов",
      concept: "Процедура может упаковать повторяющуюся пару действий, а не только движение",
      designerNotes: "Полезная абстракция здесь - FORWARD плюс LIGHT, повторенные три раза после первой лампы.",
    },
    "world-04-level-04": {
      name: "Ступенчатая пара",
      concept: "Вложенные процедуры могут переиспользовать блок движения после смены ориентации",
      designerNotes: "Компактный маршрут использует одну процедуру для прямого прохода, а вторую - чтобы повернуть и снова вызвать первую.",
    },
    "world-04-level-05": {
      name: "Спиральные сигналы",
      concept: "Соберите один повторяемый макрос из другого, чтобы сжать узор из повторяющихся углов",
      designerNotes: "Хорошее решение воспринимает пройти две клетки, зажечь и повернуть налево как одну повторяемую форму.",
    },
    "world-04-level-06": {
      name: "Ритм подъемника",
      concept: "Процедуры важны и тогда, когда повторяющийся мотив связан с высотой, а не с расстоянием",
      designerNotes: "Вся головоломка - это повторяющийся ритм подняться, зажечь, спуститься. Давление слотов заставляет абстрагировать этот узор.",
    },
    "world-05-level-01": {
      name: "Рекурсивные лампы",
      concept: "Рекурсия может выразить повторяющийся шаблон до последней лампы",
      designerNotes: "Используйте MAIN: P1 и P1: LIGHT, FORWARD, P1. Идеал 4 означает четыре заполненных слота программы, а не четыре выполненных шага.",
    },
    "world-05-level-02": {
      name: "Рекурсивная лестница",
      concept: "Рекурсия умеет выражать повторяющийся перепад высоты так же хорошо, как прямой коридор",
      designerNotes: "Используйте MAIN: P1 и P1: LIGHT, JUMP, P1. Последний LIGHT завершает уровень раньше, чем следующая рекурсивная ветка успевает что-то сломать.",
    },
    "world-05-level-03": {
      name: "Эстафета по углам",
      concept: "Взаимная рекурсия может чередовать зажигание и перестановку позиции",
      designerNotes: "Компактное решение использует P1 для зажигания и передачи хода, а P2 - для двух шагов, поворота налево и рекурсивного возврата в P1.",
    },
    "world-05-level-04": {
      name: "Ромбовидный вихрь",
      concept: "Рекурсивные помощники могут удерживать один и тот же ритм поворота, пока поле как будто вращается вокруг робота",
      designerNotes: "Рабочая пара здесь такая: P1: LIGHT, P2 и P2: FORWARD, TURN_RIGHT, FORWARD, P1.",
    },
    "world-05-level-05": {
      name: "Эстафета по гребню",
      concept: "Рекурсивная процедура может кодировать длинный повторяющийся ритм рельефа",
      designerNotes: "Шаблон таков: LIGHT, JUMP, FORWARD, P1. Повторяющаяся пара команд движения проводит робота по чередующемуся гребню.",
    },
    "world-05-level-06": {
      name: "Спиральный подъем",
      concept: "Взаимная рекурсия может объединить ориентацию и высоту в один повторяющийся шаблон подъема",
      designerNotes: "P1 отвечает за LIGHT и передачу управления. P2 отвечает за TURN_LEFT, JUMP, FORWARD и рекурсивный возврат в P1.",
    },
  },
  he: {
    "world-01-level-01": {
      name: "קו ישר",
      concept: "רצף וסדר ביצוע",
      designerNotes: "המסלול הקצר ביותר הוא קו ישר אל המנורה היחידה.",
    },
    "world-01-level-02": {
      name: "פנו אל המנורה",
      concept: "סיבוב משנה את התנועה הבאה",
      designerNotes: "הטעות הברורה היא ללכת קדימה לפני שמסתובבים.",
    },
    "world-01-level-03": {
      name: "זווית ישרה",
      concept: "סדר הביצוע חשוב בפינה",
      designerNotes: "הפנייה הזו מלמדת שסיבוב מוקדם מדי או מאוחר מדי ייכשל באופן עקבי.",
    },
    "world-01-level-04": {
      name: "פנו לשני הכיוונים",
      concept: "פנייה שמאלה ופנייה ימינה אינן שקולות",
      designerNotes: "המסלול עובד רק אם אחרי שני צעדים פונים ימינה ומדליקים את האריח האחרון.",
    },
    "world-01-level-05": {
      name: "זיגזג חוזר",
      concept: "מסלול ארוך דורש לתכנן מראש גם את כיוון הפנייה וגם את התזמון שלה",
      designerNotes: "הדרך נראית פשוטה, אבל פנייה אחת מוקדמת מדי או מאוחרת מדי תפיל את הרובוט מהלוח.",
    },
    "world-02-level-01": {
      name: "מסדרון מזגזג",
      concept: "תכנון מסלול עם פניות מתחלפות",
      designerNotes: "הלוח קטן, אבל מעניש על סימולציה שטחית.",
    },
    "world-02-level-02": {
      name: "הסתעפות מטעה",
      concept: "לזהות ולהימנע מהענף השגוי והמפתה",
      designerNotes: "ענף אחד קיים רק כדי להפוך תכנון שגוי לברור יותר.",
    },
    "world-02-level-03": {
      name: "פינה כפולה",
      concept: "סימולציה מנטלית לאורך מסלול ארוך יותר",
      designerNotes: "המסלול עדיין ליניארי, אבל כבר מספיק ארוך כדי לדרוש סדר פעולות מדויק.",
    },
    "world-02-level-04": {
      name: "שתי מנורות",
      concept: "ההרצה לא הושלמה עד שכל היעדים מוארים",
      designerNotes: "אפשר להגיע למנורה אחת ועדיין להיכשל, וכך לומדים את תנאי ההשלמה.",
    },
    "world-02-level-05": {
      name: "מנורות עם מעקף",
      concept: "צריך לתכנן מעבר להגעה הראשונה אל היעד",
      designerNotes: "קל להגיע למנורה הראשונה. האתגר האמיתי הוא לעזוב אותה עם הכיוון הנכון בדרך לשנייה.",
    },
    "world-02-level-06": {
      name: "לולאת מנורות",
      concept: "מסלול אחד יכול לדרוש פניות לשני הכיוונים",
      designerNotes: "האריח הפנימי נראה כמו קיצור דרך מפתה אם מאבדים את תחושת הכיוון.",
    },
    "world-03-level-01": {
      name: "העלייה הראשונה",
      concept: "כדי לעלות קומה אחת חייבים לקפוץ",
      designerNotes: "FORWARD נראה נכון, אבל נכשל בגלל הבדל הגבהים.",
    },
    "world-03-level-02": {
      name: "צעד למטה",
      concept: "קפיצה משמשת גם לירידה",
      designerNotes: "השלב הזה מבודד את הא-סימטריה בין FORWARD ל-JUMP.",
    },
    "world-03-level-03": {
      name: "פנייה על הרמה",
      concept: "לשלב את חוקיות הקפיצה עם כיוון התנועה",
      designerNotes: "רק המהלך הראשון משתמש ב-JUMP; השאר מתבצעים באותו גובה.",
    },
    "world-03-level-04": {
      name: "למעלה ואז למטה",
      concept: "מעברי גובה יכולים לקרות יותר מפעם אחת במסלול",
      designerNotes: "צריך לשים לב שגם העלייה וגם הירידה דורשות JUMP.",
    },
    "world-03-level-05": {
      name: "פנייה במדרגות",
      concept: "תזמון הקפיצה משתנה כשהמסלול פונה לעבר עלייה נוספת",
      designerNotes: "המסלול מחליף בין קטעים שבהם מותר JUMP לקטעים שבהם מותר FORWARD, ולכן אי אפשר להתייחס לכל שינוי גובה אותו דבר.",
    },
    "world-03-level-06": {
      name: "רמה מפוצלת",
      concept: "אותו סוג מהלך פותר גם עלייה וגם ירידה בתוך אותו מסלול",
      designerNotes: "אחרי המנורה הראשונה, המהלך הנכון הוא עדיין JUMP גם כשהרובוט כבר יורד.",
    },
    "world-03-level-07": {
      name: "מתג הרים",
      concept: "צריך לקרוא את כל פרופיל הגובה ולא להתייחס לגובה כמכשול יחיד",
      designerNotes: "המסלול עולה, יורד, פונה ושוב עולה. מי שמפסיק לסמלץ אחרי הקפיצה הראשונה ייכשל.",
    },
    "world-04-level-01": {
      name: "צעדה כפולה",
      concept: "השתמשו בפרוצדורה במקום לחזור על אותו רצף הליכה",
      designerNotes: "הפתרון היעיל: MAIN: P1, P1, LIGHT ו-P1: FORWARD, FORWARD.",
    },
    "world-04-level-02": {
      name: "פינה מקוננת",
      concept: "פונקציות יכולות לקרוא לפונקציות אחרות כדי לקצר מסלול",
      designerNotes: "פתרון קצר אחד הוא MAIN: P1, P2, LIGHT עם P1: FORWARD, FORWARD ו-P2: TURN_RIGHT, FORWARD.",
    },
    "world-04-level-03": {
      name: "קו אותות",
      concept: "פרוצדורה יכולה לארוז זוג פעולות חוזר, לא רק תנועה",
      designerNotes: "ההפשטה הנכונה כאן היא FORWARD ואז LIGHT, שלוש פעמים אחרי המנורה הראשונה.",
    },
    "world-04-level-04": {
      name: "זוג מדרגות",
      concept: "פרוצדורות מקוננות יכולות למחזר קטע תנועה אחרי שינוי כיוון",
      designerNotes: "המסלול הקומפקטי משתמש בפרוצדורה אחת להליכה הישרה ובשנייה כדי לפנות ואז לקרוא שוב לראשונה.",
    },
    "world-04-level-05": {
      name: "אותות ספירליים",
      concept: "בנו מאקרו חוזר אחד מתוך אחר כדי לדחוס תבנית של פינות חוזרות",
      designerNotes: "פתרון טוב מתייחס ללעבור שתי משבצות, להדליק ולפנות שמאלה כאל צורה אחת שחוזרת על עצמה.",
    },
    "world-04-level-06": {
      name: "קצב המעלית",
      concept: "פרוצדורות עדיין חשובות גם כשהמוטיב החוזר קשור לגובה ולא למרחק",
      designerNotes: "כל החידה היא קצב חוזר של לעלות, להדליק, לרדת. מגבלת הסלוטים מאלצת להפוך את התבנית הזו להפשטה.",
    },
    "world-05-level-01": {
      name: "מנורות רקורסיביות",
      concept: "רקורסיה יכולה לתאר דפוס חוזר עד שהמנורה האחרונה מסיימת את ההרצה",
      designerNotes: "השתמשו ב-MAIN: P1 וב-P1: LIGHT, FORWARD, P1. האידיאל 4 מתייחס לארבעה סלוטים ממולאים בתוכנית, לא לארבע פעולות שמתבצעות בפועל.",
    },
    "world-05-level-02": {
      name: "מדרגה רקורסיבית",
      concept: "רקורסיה יכולה לתאר הפרש גבהים חוזר לא פחות טוב ממסדרון ישר",
      designerNotes: "השתמשו ב-MAIN: P1 וב-P1: LIGHT, JUMP, P1. ה-LIGHT האחרון מסיים את השלב לפני שהקריאה הרקורסיבית הבאה מספיקה להזיק.",
    },
    "world-05-level-03": {
      name: "מרוץ פינות",
      concept: "רקורסיה הדדית יכולה להחליף בין הדלקה לבין מיקום מחדש",
      designerNotes: "פתרון קומפקטי משתמש ב-P1 כדי להדליק ולהעביר שליטה, וב-P2 כדי ללכת שתי משבצות, לפנות שמאלה ולחזור רקורסיבית אל P1.",
    },
    "world-05-level-04": {
      name: "סחרור יהלום",
      concept: "עוזרים רקורסיביים יכולים לשמור על דפוס פנייה קבוע בזמן שהלוח כאילו מסתובב סביב הרובוט",
      designerNotes: "הזוג שעובד כאן הוא P1: LIGHT, P2 ו-P2: FORWARD, TURN_RIGHT, FORWARD, P1.",
    },
    "world-05-level-05": {
      name: "מרוץ רכס",
      concept: "פרוצדורה רקורסיבית יכולה לקודד קצב טופוגרפי ארוך שחוזר על עצמו",
      designerNotes: "התבנית היא LIGHT, JUMP, FORWARD, P1. זוג פקודות התנועה החוזר מעביר את הרובוט לאורך הרכס המתחלף.",
    },
    "world-05-level-06": {
      name: "עלייה ספירלית",
      concept: "רקורסיה הדדית יכולה לשלב כיוון וגובה בתבנית טיפוס אחת שחוזרת על עצמה",
      designerNotes: "P1 אחראית על LIGHT ועל העברת השליטה. P2 אחראית על TURN_LEFT, JUMP, FORWARD ועל החזרה הרקורסיבית אל P1.",
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

export function getRunStatusMessage(locale: Locale, result: RunResult | null, variant: "menu" | "panel") {
  const copy = getMessages(locale);

  if (result === null) {
    return variant === "menu" ? copy.menuIdleStatus : copy.panelIdleStatus;
  }

  if (result.status === "SUCCESS") {
    return variant === "menu" ? copy.menuSuccessStatus : copy.panelSuccessStatus;
  }

  return copy.failureReasons[result.status] ?? result.failureReason ?? copy.executionFailed;
}

export function getRunStatusLabel(locale: Locale, result: RunResult | null) {
  const copy = getMessages(locale);

  if (result === null) {
    return copy.statusLabels.READY;
  }

  return copy.statusLabels[result.status];
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
