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

<script setup>
import { useMachine } from '@xstate/vue'
import { watch, computed } from 'vue'
import timerMachine from '../machines/timer'
import audioFile from '../assets/321.wav'

const props = defineProps(['duration', 'startImmediately'])
const emit = defineEmits(['exerciseComplete'])

let audio = new Audio(audioFile)

const { snapshot, send } = useMachine(timerMachine, {
  context: {
    duration: props.duration,
    startImmediately: props.startImmediately,
  },
})

watch(
  () => props.startImmediately,
  (shouldStart) => {
    if (shouldStart) {
      send({ type: 'RESUME' })
    } else {
      send({ type: 'PAUSE' })
    }
  }
)

const timeLeft = computed(() => {
  if (snapshot.value) {
    return (snapshot.value.context.duration - snapshot.value.context.elapsed).toFixed(1)
  }
  return 0
})

const complete = computed(() => {
  if (snapshot.value) {
    return snapshot.value.context.elapsed >= snapshot.value.context.duration
  }
  return false
})

const paused = computed(() => {
  if (snapshot.value) {
    return snapshot.value.matches('paused')
  }
  return false
})

const idle = computed(() => {
  if (snapshot.value) {
    return snapshot.value.matches('idle')
  }
  return false
})

const running = computed(() => {
  if (snapshot.value) {
    return snapshot.value.matches('running')
  }
  return false
})

const timeFraction = computed(() => {
  if (timeLeft.value && snapshot.value) {
    const rawTimeFraction = timeLeft.value / snapshot.value.context.duration
    const adjustment = (0.5 / snapshot.value.context.duration) * (0.5 - rawTimeFraction)
    return rawTimeFraction - adjustment
  }
  return 0
})

const timeCircleDashArray = computed(() => {
  return `${(timeFraction.value * 282).toFixed(0)} 282`
})

watch(complete, () => {
  emit('exerciseComplete')
})

watch(timeLeft, (value) => {
  if (value == 4) {
    audio.play()
  }
})

const toggleTimer = () => {
  if (paused.value || idle.value) {
    send({ type: 'RESUME' })
    return
  }
  if (running.value) {
    send({ type: 'PAUSE' })
    return
  }
}
</script>

<style scoped>
.base-timer {
  position: relative;
  width: 300px;
  height: 300px;
}
.base-timer__circle {
  fill: none;
  stroke: none;
}
.base-timer__path-elapsed {
  stroke-width: 7px;
}
.base-timer__label {
  position: absolute;
  width: inherit;
  height: inherit;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}
.base-timer__path-remaining {
  stroke-width: 9px;
  stroke-linecap: round;
  transform: rotate(90deg);
  transform-origin: center;
  transition: 0.1s linear all;
  stroke: hsla(153, 48%, 49%, 0.7);
}
.base-timer__svg {
  transform: scaleX(-1);
}

p {
  margin: 0;
}
</style>