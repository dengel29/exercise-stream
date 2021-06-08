import { createMachine, assign } from "xstate";

const tick = assign({
  elapsed: (context) => +(context.elapsed + context.interval),
});

const timerMachine = createMachine({
  id: "timer",
  initial: "idle",
  context: {
    elapsed: 0,
    duration: 10,
    interval: 0.1,
    startImmediately: false,
  },
  states: {
    idle: {
      on: {
        RESUME: {
          target: "running",
        },
      },
      always: {
        target: "running",
        cond: (context) => {
          return context.startImmediately;
        },
      },
    },
    running: {
      invoke: {
        src: (context) => (callback) => {
          const interval = setInterval(() => {
            callback("TICK");
          }, 1000 * context.interval);

          return () => {
            clearInterval(interval);
          };
        },
      },
      on: {
        TICK: {
          actions: tick,
        },
        PAUSE: {
          target: "paused",
        },
      },
      always: {
        target: "paused",
        cond: (context) => {
          return context.elapsed > context.duration;
        },
      },
    },
    paused: {
      on: {
        RESUME: {
          target: "running",
        },
      },
    },
  },
  on: {
    "DURATION.UPDATE": {
      actions: assign({
        duration: (_, event) => event.value,
      }),
    },
    RESET: {
      actions: assign({
        elapsed: 0,
      }),
    },
  },
});

export default timerMachine;
