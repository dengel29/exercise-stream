import { createMachine, assign, fromCallback } from 'xstate'

const tick = assign({
  elapsed: ({ context }) => +(context.elapsed + context.interval),
})

const timerMachine = createMachine({
  id: 'timer',
  initial: 'idle',
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
          target: 'running',
        },
      },
      always: {
        target: 'running',
        guard: ({ context }) => context.startImmediately,
      },
    },
    running: {
      invoke: {
        src: fromCallback(({ sendBack }) => {
          const interval = setInterval(() => {
            sendBack({ type: 'TICK' })
          }, 1000 * 0.1)

          return () => {
            clearInterval(interval)
          }
        }),
      },
      on: {
        TICK: {
          actions: tick,
        },
        PAUSE: {
          target: 'paused',
        },
      },
      always: {
        target: 'paused',
        guard: ({ context }) => context.elapsed >= context.duration,
      },
    },
    paused: {
      on: {
        RESUME: {
          target: 'running',
        },
      },
    },
  },
  on: {
    'DURATION.UPDATE': {
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
})

export default timerMachine
