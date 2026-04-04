import type { LocaleData } from "../translations";

export const localeData: LocaleData = {
  messages: {
    actions: "Actions",
    addCommandToSlot: (routineLabel, index) => `Add command to ${routineLabel} slot ${index}`,
    allActions: "All Actions",
    backToPuzzle: "Back To Puzzle",
    clear: "Clear",
    commandLabels: {
      FORWARD: "Move Forward",
      TURN_LEFT: "Turn Left",
      TURN_RIGHT: "Turn Right",
      JUMP: "Jump",
      ACTIVATE: "Activate",
      TOGGLE: "Toggle",
      CALL_P1: "Process 1",
      CALL_P2: "Process 2",
    },
    fastPlay: "Fast Play",
    idealSize: (value) => `Ideal Size ${value}`,
    idealSizeLevelOnlyNote: "Ideal size is based on Level Only actions.",
    language: "Language",
    left: "Left",
    level: "Level",
    levelOnly: "Level Only",
    levelOptionLabel: (index, name) => `Level ${index} - ${name}`,
    locked: "Locked",
    lockedForLevel: "Locked for this level",
    loaderTitle: "LUMALOOP",
    loaderSubtitle: "Loading the puzzle grid...",
    mainRoutine: "Main Process",
    menu: "Menu",
    next: "Next",
    newMechanic: (label) => label,
    noSlots: "No slots",
    pause: "Pause",
    play: "Play",
    povMode: "POV Mode",
    povPlay: "POV Play",
    proc1Routine: "Process 1",
    proc2Routine: "Process 2",
    proceduralHierarchy: "Processes",
    programSize: (value) => `Program Size ${value}`,
    puzzleMenu: "Puzzle Menu",
    puzzleSolved: "Puzzle Solved!",
    dismiss: "Dismiss",
    removeCommandFromSlot: (routineLabel, index) => `Remove command from ${routineLabel} slot ${index}`,
    replay: "Replay",
    continuePlaying: "Continue",
    robotColor: "Robot Color",
    right: "Right",
    routineSlots: (filled, total) => `${filled} / ${total}`,
    runOptions: "Run options",
    showingFullCommandSet: "Showing the full command set.",
    showingLevelCommands: "Showing level-allowed commands only.",
    skipToEnd: "Skip to End",
    splashLoading: "Loading...",
    splashStart: "Start",
    splashTagline: "Master the Logic. Close the Loop.",
    starsProgress: (earned, total) => `${earned} / ${total} Stars`,
    bestSize: (value) => `Best ${value}`,
    idealShort: (value) => `Ideal ${value}`,
    currentLabel: "Current",
    perfectLabel: "Perfect",
    worldDisplayName: (worldId, fallbackName) => {
      if (worldId === "world-01-basics") {
        return "Basics";
      }

      if (worldId === "world-03-height") {
        return "Height";
      }

      if (worldId === "world-04-procedures") {
        return "Procedures";
      }

      if (worldId === "world-05-recursion") {
        return "Recursion";
      }

      if (worldId === "world-06-hard") {
        return "Recursive Patterns";
      }

      if (worldId === "world-07-very-hard") {
        return "Advanced Composition";
      }

      if (worldId === "world-08-mastery") {
        return "Mastery";
      }

      if (worldId === "world-09-trickery") {
        return "Misdirection";
      }

      if (worldId === "world-10-phantoms") {
        return "False Paths";
      }

      if (worldId === "world-11-switches") {
        return "Switches";
      }

      return fallbackName;
    },
    worldCurrent: "Current World",
    worldCompleted: "World Complete",
    worldPerfected: "World Perfected",
    successBody: "All targets are lit. You can replay this level or move on to the next puzzle.",
    replayTutorial: "Replay Tutorial",
    worldLabel: (index, name) => `WORLD ${String(index).padStart(2, "0")}: ${name}`,
    worldProgressSummary: (completed, total, perfected, stars, totalStars) =>
      `${completed} / ${total} Completed • ${perfected} Perfected • ${stars} / ${totalStars} Stars`,
    worldTheme: (label) => `Theme: ${label}`,
    failureBodies: {
      SUCCESS: "The run already succeeded.",
      FAILED_INVALID_MOVE: "The robot tried to walk onto a tile that was not reachable from its current position.",
      FAILED_INVALID_JUMP: "The robot tried to jump where the height change or landing tile was invalid.",
      FAILED_INVALID_TOGGLE: "The robot used Toggle while not standing on a valid switch tile.",
      FAILED_WRONG_LIGHT: "The robot tried to activate a tile that was not a target.",
      FAILED_INCOMPLETE: "You have part of the solution working. Keep building until every target is lit.",
      FAILED_MAX_STEPS: "The run exceeded the safety step limit. That usually means the program is looping too long.",
      FAILED_RECURSION: "A process called itself too deeply and hit the recursion limit.",
      FAILED_EMPTY_PROCEDURE: "The program called a process that has no commands in it.",
      FAILED_INVALID_PROGRAM: "The program could not run because its structure was invalid.",
    },
    failureTitles: {
      SUCCESS: "Puzzle Solved",
      FAILED_INVALID_MOVE: "That Move Was Not Legal",
      FAILED_INVALID_JUMP: "That Jump Did Not Work",
      FAILED_INVALID_TOGGLE: "Toggle Needs A Switch",
      FAILED_WRONG_LIGHT: "Activate Only Works On Targets",
      FAILED_INCOMPLETE: "Some Targets Are Still Dark",
      FAILED_MAX_STEPS: "The Program Ran Too Long",
      FAILED_RECURSION: "The Processes Recurred Too Deeply",
      FAILED_EMPTY_PROCEDURE: "One Process Is Empty",
      FAILED_INVALID_PROGRAM: "The Program Could Not Run",
    },
    walkthroughClose: "Close guide",
    walkthroughDone: "Start Playing",
    walkthroughNext: "Continue",
    walkthroughOpen: "How to play",
    walkthroughPrevious: "Back",
    walkthroughSubtitle:
      "A quick mission briefing on the controls, the puzzle loop, and the thinking skills Lumaloop strengthens as you play.",
    walkthroughTitle: "How to Play Lumaloop",
    onboardingContinue: "Continue",
    onboardingSkip: "Skip tutorial",
    onboardingLevel1: {
      activate: {
        body: "Click Activate to light the target once the robot reaches it.",
        title: "Finish The Program",
      },
      firstForward: {
        body: "Click Forward to add the first step. Your program is built one command at a time.",
        title: "Start In The Actions Tray",
      },
      mainRoutine: {
        body: "This is your Main program. Each click fills the next empty slot here in execution order.",
        title: "Watch The Program Fill In",
      },
      play: {
        body: "Press Play to run the program you just built.",
        title: "Run The Robot",
      },
      secondForward: {
        body: "Click Forward one more time. This level is a straight line, so you need two moves before the lamp.",
        title: "Add The Next Move",
      },
    },
    onboardingLevel2: {
      activate: {
        body: "Now add Activate so the robot lights the lamp after reaching it.",
        title: "Finish The Sequence",
      },
      boardIntro: {
        body: "Level 2 introduces turning. The robot starts facing right, but the lamp is straight ahead on the vertical path, so direction matters before movement.",
        title: "This Level Teaches Turning",
      },
      forwardTwice: {
        body: "Click Forward twice. After turning, the robot can move up the path toward the lamp.",
        title: "Move After Turning",
      },
      play: {
        body: "Press Play to test the full sequence.",
        title: "Run It",
      },
      turnRight: {
        body: "Click Turn Right first. Turning changes what the next Forward command will do.",
        title: "Face The Lamp",
      },
    },
    onboardingToggleIntro: {
      boardIntro: {
        body: "This level introduces switches. The glowing switch tile can change the board layout and unlock a path that was blocked a moment ago.",
        title: "Switches Change The Board",
      },
      play: {
        body: "Press Play after adding Toggle so you can watch the board change and see why this action matters.",
        title: "Test The Switch",
      },
      toggle: {
        body: "Click Toggle to add the new switch action. Use it while standing on the switch tile to move the linked floor segment.",
        title: "Meet The Toggle Action",
      },
    },
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
          "Use the action tray to place commands into the Main Process and sketch the robot's path. As the campaign opens up, Process 1 and Process 2 let you package repeating ideas into reusable mini-processes instead of rewriting the same sequence again and again.",
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
          "A shorter or cleaner retry often reveals the core pattern faster than adding more commands.",
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
};
