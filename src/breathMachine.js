import { createMachine, assign } from 'xstate';

const ticker = (ctx) => (cb) => {
  const interval = setInterval(() => {
    cb('TICK');
  }, ctx.interval * 1000);
  return () => clearInterval(interval);
};

// const timerExpired = (ctx) => ctx.elapsed >= ctx.duration;
const inhaleDone = (ctx) => {
  console.log('Inhale Check');
  return ctx.elapsed >= ctx.inhale;
};
const pauseDone = (ctx) => {
  console.log('pause Check');
  return ctx.elapsed >= ctx.pause;
};
const exhaleDone = (ctx) => {
  console.log('Exhale Check');
  return ctx.elapsed >= ctx.exhale;
};

const roundComplete = (ctx) => {
  return ctx.repeatRounds <= ctx.currentRound;
};

// https://xstate.js.org/viz/?gist=78fef4bd3ae520709ceaee62c0dd59cd
export const breathMachine = createMachine({
  id: 'timer',
  initial: 'idle',
  context: {
    inhale: 3,
    pause: 2,
    exhale: 3,
    repeatRounds: 3, //number of times to repeat pattern
    currentRound: 0,
    elapsed: 0,
    interval: 1,
  },
  states: {
    idle: {
      id: 'idle',
      entry: assign({
        // duration: 60,
        elapsed: 0,
      }),
      on: {
        TOGGLE: 'running',
        RESET: undefined,
      },
    },
    running: {
      invoke: {
        id: 'ticker', // only used for viz
        src: ticker,
      },
      initial: 'inhale',
      states: {
        inhale: {
          entry: [
            assign({
              currentRound: (ctx) => ctx.currentRound + 1,
            }),
          ],
          exit: [
            assign({
              elapsed: 0,
            }),
          ],
          always: [
            { target: 'pause', cond: inhaleDone },
            { target: '#idle', cond: roundComplete },
          ],
          on: {
            RESET: undefined,
          },
        },
        pause: {
          exit: [
            assign({
              elapsed: 0,
            }),
          ],
          always: {
            target: 'exhale',
            cond: pauseDone,
          },
          on: {
            // TOGGLE: undefined,
            // TICK: undefined,
          },
        },
        exhale: {
          exit: [
            assign({
              elapsed: 0,
            }),
          ],
          always: {
            target: 'inhale',
            cond: exhaleDone,
          },
          on: {
            // TOGGLE: undefined,
          },
        },
      },
      on: {
        TICK: {
          actions: assign({
            elapsed: (ctx) => ctx.elapsed + ctx.interval,
          }),
        },
        TOGGLE: 'paused',
        STOP: 'idle',
        ADD_MINUTE: {
          actions: assign({
            duration: (ctx) => ctx.duration + 60,
          }),
        },
      },
    },
    paused: {
      on: { TOGGLE: 'running' },
    },
  },
  on: {
    RESET: {
      target: '.idle',
    },
  },
});
