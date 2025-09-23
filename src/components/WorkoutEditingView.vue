<template>
  <div class="editing-view styles">
    <div class="grid">
      <WorkoutForm
        :set-amount="setAmount"
        :rest-duration="restDuration"
        :big-break-duration="bigBreakDuration"
        @update:setAmount="handleSetAmount"
        @update:restDuration="handleRestDuration"
        @update:bigBreakDuration="handleBigBreakDuration"
        @add-exercise="addExercise"
      />
      <EditableExerciseList
        :exercises="exercises"
        :set-amount="setAmount"
        :set-indicator-styles="setIndicatorStyles"
        @remove-exercise="removeExercise"
        @move-up="moveup"
        @move-down="movedown"
      />
      <WorkoutSummary
        :set-amount="setAmount"
        :exercises="exercises"
        :rest-duration="restDuration"
        :big-break-duration="bigBreakDuration"
        :animated-set-amount="animatedSetAmount"
        :animated-total-time="animatedTotalTime"
        :animated-active-time="animatedActiveTime"
        :animated-resting-time="animatedRestingTime"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import gsap from 'gsap'
import WorkoutForm from './WorkoutForm.vue'
import WorkoutSummary from './WorkoutSummary.vue'
import EditableExerciseList from './EditableExerciseList.vue'

const props = defineProps({
  exercises: Array,
  setAmount: {
    type: Number,
    required: true,
    default: 1,
  },
  restDuration: Number,
  bigBreakDuration: Number,
})

const emit = defineEmits([
  'update:setAmount',
  'update:restDuration',
  'update:bigBreakDuration',
  'add-exercise',
  'remove-exercise',
  'move-up',
  'move-down',
])

const tweenedSetAmount = ref(0)
const tweenedTotalTime = ref(0)
const tweenedActiveTime = ref(0)
const tweenedRestingTime = ref(0)
const maxSetAmount = 40

const animatedSetAmount = computed(() => Math.round(tweenedSetAmount.value))
const animatedTotalTime = computed(() => Math.round(tweenedTotalTime.value))
const animatedActiveTime = computed(() => Math.round(tweenedActiveTime.value))
const animatedRestingTime = computed(() => Math.round(tweenedRestingTime.value))

const setIndicatorStyles = computed(() => ({
  '--grid-width': `repeat(${props.setAmount}, minmax(0, ${(props.setAmount * 0.8).toFixed(1)}fr))`,
  '--gap': `${100 / props.setAmount}px`,
  '--total': `${props.setAmount}`,
}))

const activeTime = computed(() => {
  if (props.exercises.length <= 0 || props.setAmount === 0) {
    return 0
  }
  return (
    props.exercises.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.duration
    }, 0) * props.setAmount
  )
})

const restingTime = computed(() => {
  if (props.exercises.length <= 0 || props.setAmount === 0) {
    return 0
  }
  return (
    props.exercises.length * props.restDuration * props.setAmount +
    props.setAmount * props.bigBreakDuration
  )
})

const aggregatedTime = computed(() => {
  if (props.exercises.length <= 0 || props.setAmount === 0) {
    return 0
  }
  return (restingTime.value + activeTime.value).toFixed(0)
})

watch(aggregatedTime, (value) => {
  gsap.to(tweenedTotalTime, { duration: 0.6, value: value, ease: 'elastic' })
})

watch(activeTime, (value) => {
  gsap.to(tweenedActiveTime, { duration: 0.6, value: value, ease: 'power3.inOut' })
})

watch(restingTime, (value) => {
  gsap.to(tweenedRestingTime, { duration: 0.6, value: value })
})

watch(
  () => props.setAmount,
  (value) => {
    if (value > maxSetAmount) {
      alert('cant do that, sorry')
      emit('update:setAmount', maxSetAmount - 1)
    } else {
      gsap.to(tweenedSetAmount, { duration: 0.5, value: value })
    }
  }
)

const handleSetAmount = (value) => {
  emit('update:setAmount', value)
}

const handleRestDuration = (value) => {
  emit('update:restDuration', value)
}

const handleBigBreakDuration = (value) => {
  emit('update:bigBreakDuration', value)
}

const addExercise = (exercise) => {
  emit('add-exercise', exercise)
}

const removeExercise = (index) => {
  emit('remove-exercise', index)
}

const moveup = (index) => {
  emit('move-up', index)
}

const movedown = (index) => {
  emit('move-down', index)
}
</script>

<style scoped>
.styles {
  --background-shade: 0.8;
  --border-shade: 1;
  --green: 153, 48%, 49%;
  --workout-green: hsla(var(--green), var(--background-shade));
  --dark-green: hsla(var(--green), var(--border-shade));
  --slate: 245, 25%, 25%;
  --dark-slate: 245, 25%, 15%;
  --slate-bg: hsla(var(--slate), var(--background-shade));
  --input-border: 3px solid var(--workout-green);
}
.editing-view {
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial,
    sans-serif;
  height: 80vh;
  position: relative;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20em, 1fr));
  gap: 1em;
}
</style>