<template>
  <div class="base-timer">
    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="base-timer__circle">
        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="46.5" />
        <path
          :stroke-dasharray="timeCircleDashArray"
          class="base-timer__path-remaining"
          d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
        ></path>
      </g>
    </svg>
    <span class="base-timer__label">
      {{ timeLeft }}
      <button @click="toggleTimer">
        {{ paused || idle ? 'Resume' : 'Pause' }}
      </button>
    </span>
  </div>
</template>

<script>
import { useMachine } from '@xstate/vue'
import timerMachine from '../machines/timer'
import audioFile from '../assets/321.wav'
let audio = new Audio(audioFile)
export default {
  props: ['duration', 'startImmediately'],
  emits: ['exerciseComplete'],
  setup(props) {
    const { state, send } = useMachine(timerMachine, {
      context: {
        duration: props.duration,
        startImmediately: props.startImmediately,
      },
    })
    return {
      state,
      send,
    }
  },
  computed: {
    timeLeft() {
      return (this.state.context.duration - this.state.context.elapsed).toFixed(1)
    },
    complete() {
      return this.state.context.elapsed >= this.state.context.duration
    },
    paused() {
      return this.state.matches('paused')
    },
    idle() {
      return this.state.matches('idle')
    },
    running() {
      return this.state.matches('running')
    },
    timeFraction() {
      const rawTimeFraction = this.timeLeft / this.state.context.duration
      const adjustment = (0.5 / this.state.context.duration) * (0.5 - rawTimeFraction)
      return rawTimeFraction - adjustment
    },
    timeCircleDashArray() {
      return `${(this.timeFraction * 282).toFixed(0)} 282`
    },
  },
  watch: {
    complete: {
      handler() {
        this.$emit('exerciseComplete')
      },
    },
    timeLeft: {
      handler(value) {
        if (value == 4) {
          audio.play()
        }
      },
    },
  },
  methods: {
    toggleTimer: function () {
      if (this.paused || this.idle) {
        this.send('RESUME')
        return
      }
      if (this.running) {
        this.send('PAUSE')
        return
      }
    },
  },
}
</script>

<style scoped lang="scss">
.base-timer {
  position: relative;
  width: 300px;
  height: 300px; /* Removes SVG styling that would hide the time label */
  &__circle {
    fill: none;
    stroke: none;
  } /* The SVG path that displays the timer's progress */
  &__path-elapsed {
    stroke-width: 7px;
  }
  &__label {
    position: absolute;
    width: inherit;
    height: inherit;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* Sort of an arbitrary number; adjust to your liking */
    font-size: 48px;
  }
  &__path-remaining {
    /* Just as thick as the original ring */
    stroke-width: 9px; /* Rounds the line endings to create a seamless circle */
    stroke-linecap: round; /* Makes sure the animation starts at the top of the circle */
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
    transform-origin: center; /* One second aligns with the speed of the countdown timer */
    -moz-transition: 0.1s linear all;
    -webkit-transition: 0.1s linear all; /* Allows the ring to change color when the color value updates */
    transition: 0.1s linear all; /* Allows the ring to change color when the color value updates */
    stroke: hsla(153, 48%, 49%, 0.7); // green
  }
  &__svg {
    // Flips the svg and makes the animation to move left-to-right
    -webkit-transform: scaleX(-1);
    transform: scaleX(-1);
  }
}

p {
  margin: 0;
}
</style>