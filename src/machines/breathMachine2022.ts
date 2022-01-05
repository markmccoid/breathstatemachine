import {
  createMachine,
  assign,
} from "xstate";

export type BreathEvent =
  | { type: "TICK" }
  | { type: "START" }
  | { type: "STOP" }
  | { type: "PAUSE" }
  | { type: "UNPAUSE" }
  | { type: "EXTEND_TOGGLE" }
  | { type: "NEXT" }
  | {
    type: "UPDATE_DEFAULTS";
    sessionSettings: Partial<Omit<BreathContext, "extend" | "sessionStats" | "sessionComplete" | "interval" | "elapsed">>
  };

export type sessionStats =
  | {
    breaths: number;
    holdTimeSeconds: number;
    inhaleHoldTimeSeconds: number;
  }
  | {};
export type BreathContext = {
  // -- Breathing pattern config
  inhaleTime: number; // seconds and tenths of a second
  pauseTime: number;
  exhaleTime: number;
  //-- Breathing round config
  breathReps: number; // How many breaths before hold time.
  breathCurrRep: number; // Current breath in current round
  //-- Long hold config
  holdTime: number; // hold time in seconds
  inhaleHoldTime: number; // inhaled holding time in seconds
  actionPauseTimeIn: number; // seconds to "wait" before inhale holds
  actionPauseTimeOut: number; // seconds to "wait" after inhale holds
  extend: boolean; // When true, extend the hold time, don't stop the timer
  //-- Breathing session config
  breathRounds: number; // Number of rounds (breathReps + Long Hold + )
  breathCurrRound: number; // Current round
  // -- session statistics
  sessionStats: { [round: number]: sessionStats };
  sessionComplete: boolean;
  //-- Timer config
  interval: number; // interval will cause TICK to be called every tenth of a sec. If you want more precision use .01
  elapsed: number;
};

const ticker = (ctx) => (cb) => {
  const intervalId = setInterval(() => {
    cb("TICK");
  }, ctx.interval * 1000);

  return () => {
    clearInterval(intervalId);
  };
};

const updateElapsedTime = assign<BreathContext, BreathEvent>({
  elapsed: (context) => context.elapsed + context.interval,
});

const resetElapsed = assign<BreathContext, BreathEvent>({ elapsed: 0 });

const resetContext = assign<BreathContext, BreathEvent>({
  elapsed: 0,
  breathCurrRep: 0,
  breathCurrRound: 0,
});

const resetSessionStats = assign<BreathContext, BreathEvent>({
  sessionStats: undefined,
  sessionComplete: false,
});
const incrementBreathRound = assign<BreathContext, BreathEvent>({
  breathCurrRound: (ctx, event) => ctx.breathCurrRound + 1,
});

const resetBreathCurrRep = assign<BreathContext, BreathEvent>({
  breathCurrRep: 0,
});

const incrementBreathRep = assign<BreathContext, BreathEvent>({
  breathCurrRep: (ctx) => ctx.breathCurrRep + 1,
});

const isElapsedGreaterThan = (checkAgainstTime) => (ctx) => {
  return ctx.elapsed > ctx[checkAgainstTime];
};

const extendToggle = assign<BreathContext, BreathEvent>({
  extend: (ctx) => !ctx.extend,
});

const updateDefaults = assign<BreathContext, BreathEvent>((ctx, event) => {
  // checking for type.  Only way to appease typescript
  if (event.type === "UPDATE_DEFAULTS") {
    // - decided to just merge the passed sessionSettings object with the context
    // - this way users can send one or more settings 
    const mergedSettings = { ...ctx, ...event.sessionSettings };
    return mergedSettings;
    // return {
    //   breathReps: event.breathReps || ctx.breathReps,
    //   breathRounds: event.breathRounds || ctx.breathRounds,
    //   holdTime: event.holdTime || ctx.holdTime,
    // };
  }
});

const sessionComplete = assign<BreathContext, BreathEvent>({
  sessionComplete: true,
});

const updateSessionStats = assign<BreathContext, BreathEvent>({
  sessionStats: (ctx) => {
    if (ctx.breathCurrRound > ctx.breathRounds) {
      return ctx.sessionStats;
    }
    let newSessionStats = { ...ctx.sessionStats };
    if (ctx?.sessionStats?.[ctx.breathCurrRound]) {
      newSessionStats = {
        [ctx.breathCurrRound]: {
          breaths: 0,
          holdTimeSeconds: 0,
          inhaleHoldTimeSeconds: 0,
        },
      };
    }
    return {
      ...newSessionStats,
      [ctx.breathCurrRound]: {
        ...newSessionStats[ctx.breathCurrRound],
        breaths: ctx.breathCurrRep - 1,
      },
    };
  },
});

const updateLongHoldStats = assign<BreathContext, BreathEvent>({
  sessionStats: (ctx) => {
    if (!ctx.sessionStats) {
      return ctx?.sessionStats;
    }
    return {
      ...ctx.sessionStats,
      [ctx.breathCurrRound]: {
        ...ctx.sessionStats[ctx.breathCurrRound],
        holdTimeSeconds: Math.floor(ctx.elapsed),
      },
    };
  },
});

const updateInhaleHoldStats = assign<BreathContext, BreathEvent>({
  sessionStats: (ctx) => {
    if (!ctx.sessionStats) {
      return ctx?.sessionStats;
    }
    return {
      ...ctx.sessionStats,
      [ctx.breathCurrRound]: {
        ...ctx.sessionStats[ctx.breathCurrRound],
        inhaleHoldTimeSeconds: Math.floor(ctx.elapsed),
      },
    };
  },
});
// type sessionStats = {
//   [roundNum: number]: {
//     breaths: number;
//     longHoldSeconds: Number;
//     inhaleHoldSeconds: Number;
//   };
// }
export const breathMachine = createMachine<BreathContext, BreathEvent>(
  {
    id: "breathmachine",
    initial: "idle",
    context: {
      // -- Breathing pattern config
      inhaleTime: 2, // seconds and tenths of a second
      pauseTime: 0,
      exhaleTime: 1.5,
      //-- Breathing round config
      breathReps: 3, // How many breaths before hold time.
      breathCurrRep: 0, // Current breath in current round
      //-- Long hold config
      holdTime: 5, // hold time in seconds
      extend: false, // When true, extend the hold time, don't stop the timer
      inhaleHoldTime: 5, // inhaled holding time in seconds
      actionPauseTimeIn: 3, // seconds to "wait" before inhale holds
      actionPauseTimeOut: 7, // seconds to "wait" after inhale holds
      //-- Breathing session config
      breathRounds: 15, // Number of rounds (breathReps + Long Hold + )
      breathCurrRound: 0, // Current round
      // -- session statistics
      sessionStats: {},
      sessionComplete: false,
      //-- Timer config
      interval: 0.1, // interval will cause TICK to be called every tenth of a sec. If you want more precision use .01
      elapsed: 0,
    },
    states: {
      idle: {
        entry: "resetContext",
        exit: "resetSessionStats",
        on: {
          START: "breathing",
          UPDATE_DEFAULTS: {
            actions: ["updateDefaults"],
          },
        },
      },
      breathing: {
        id: "breathing",
        entry: ["incrementBreathRound"],
        exit: [updateSessionStats],
        initial: "inhale",
        always: {
          target: "idle",
          actions: "sessionComplete",
          cond: (ctx) => ctx.breathCurrRound > ctx.breathRounds,
        },
        on: {
          STOP: "idle",
          PAUSE: ".paused",
          TICK: {
            actions: "updateElapsedTime",
          },
        },
        states: {
          inhale: {
            entry: ["resetElapsed", incrementBreathRep],
            invoke: {
              id: "ticker", // only used for viz
              src: ticker,
            },
            always: [
              {
                target: "#breathmachine.holding",
                cond: (ctx) => ctx.breathCurrRep > ctx.breathReps,
              },
              {
                // this condition is here so that we can SKIP the hold
                // state by setting the pauseTime to 0.
                target: "exhale",
                cond: (ctx) =>
                  isElapsedGreaterThan("inhaleTime")(ctx) &&
                  ctx.pauseTime === 0,
              },
              {
                target: "hold",
                cond: isElapsedGreaterThan("inhaleTime"),
              },
            ],
          },
          hold: {
            entry: "resetElapsed",
            invoke: {
              id: "ticker", // only used for viz
              src: ticker,
            },
            always: {
              target: "exhale",
              cond: isElapsedGreaterThan("pauseTime"),
            },
          },
          exhale: {
            entry: "resetElapsed",
            invoke: {
              id: "ticker", // only used for viz
              src: ticker,
            },
            always: {
              target: "inhale",
              cond: isElapsedGreaterThan("exhaleTime"),
            },
          },
          paused: {
            on: {
              UNPAUSE: "inhale",
            },
          },
        },
      },
      holding: {
        initial: "breathhold",
        entry: ["resetElapsed", "resetBreathCurrRep"],
        exit: ["updateLongHoldStats"],
        on: {
          STOP: "idle",
          PAUSE: ".paused",
          NEXT: {
            target: "inhalehold",
            // actions: 'resetBreathCurrRep',
          },
          EXTEND_TOGGLE: {
            actions: "extendToggle",
          },
          TICK: {
            actions: "updateElapsedTime",
          },
        },
        states: {
          breathhold: {
            invoke: {
              id: "ticker-hold", // only used for viz
              src: ticker,
            },
            always: {
              target: "#breathmachine.intropause",
              actions: (ctx) => console.log("go to inhalehold"),
              cond: (ctx) =>
                isElapsedGreaterThan("holdTime")(ctx) && !ctx.extend,
            },
          },
          paused: {
            // entry: (ctx) => clearInterval(ctx.intervalId),
            on: {
              UNPAUSE: "#breathmachine.holding",
            },
          },
        },
      },
      intropause: {
        entry: ["resetElapsed", () => console.log("intropause")],
        invoke: {
          id: "ticker-pause", // only used for viz
          src: ticker,
        },
        always: {
          target: "inhalehold",
          cond: isElapsedGreaterThan("actionPauseTimeIn"),
        },
        on: {
          STOP: "idle",
          TICK: {
            actions: "updateElapsedTime",
          },
        },
      },
      inhalehold: {
        entry: ["resetElapsed"],
        initial: "breathhold",
        exit: ["updateInhaleHoldStats", "resetBreathCurrRep"],
        on: {
          STOP: "idle",
          PAUSE: ".paused",
          NEXT: {
            target: "breathing",
            actions: "resetBreathCurrRep",
          },
          EXTEND_TOGGLE: {
            actions: "extendToggle",
          },
          TICK: {
            actions: "updateElapsedTime",
          },
        },
        states: {
          breathhold: {
            invoke: {
              id: "ticker-inhalehold", // only used for viz
              src: ticker,
            },
            always: {
              target: "#breathmachine.outropause",
              cond: (ctx) =>
                isElapsedGreaterThan("inhaleHoldTime")(ctx) && !ctx.extend,
            },
          },
          paused: {
            // entry: (ctx) => clearInterval(ctx.intervalId),
            on: {
              UNPAUSE: "#breathmachine.inhalehold",
            },
          },
        },
      },
      outropause: {
        entry: ["resetElapsed", () => console.log("outropause")],
        invoke: {
          id: "ticker-outropause", // only used for viz
          src: ticker,
        },
        always: {
          target: "breathing",
          cond: isElapsedGreaterThan("actionPauseTimeOut"),
        },
        on: {
          STOP: "idle",
          TICK: {
            actions: "updateElapsedTime",
          },
        },
      },
      finished: {},
    },
  },
  {
    actions: {
      incrementBreathRound,
      resetElapsed,
      resetBreathCurrRep,
      resetSessionStats,
      resetContext,
      updateDefaults,
      updateElapsedTime,
      updateLongHoldStats,
      updateInhaleHoldStats,
      extendToggle,
      sessionComplete,
    },
  }
);
