<template>
  <div class="styles">
    <nav style="margin-right: 3em">
      <button @click="toggleWorkout">
        {{ buttonText }}
      </button>
      <button @click="resetSetAndWorkouts">reset</button>
      <!-- <button @click="generateURLParams">
    Gen
  </button> -->
      <br />
    </nav>
    <WorkoutInProgressView
      v-if="!editing"
      :exercises="exercises"
      :set-amount="setAmount"
      :sets-complete="setsComplete"
      :current-exercise="currentExercise"
      :updater="updater"
      :should-start-immediately="shouldStartImmediately"
      :dragging="dragging"
      @exercise-complete="exerciseComplete"
      @update-timer-position="updateTimerPosition"
    />
    <WorkoutEditingView
      v-if="editing"
      :exercises="exercises"
      :set-amount="setAmount"
      :rest-duration="restDuration"
      :big-break-duration="bigBreakDuration"
      @update:setAmount="setAmount = $event"
      @update:restDuration="restDuration = $event"
      @update:bigBreakDuration="bigBreakDuration = $event"
      @add-exercise="addExercise"
      @remove-exercise="removeExercise"
      @move-up="moveup"
      @move-down="movedown"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import WorkoutEditingView from './WorkoutEditingView.vue'
import WorkoutInProgressView from './WorkoutInProgressView.vue'

const exercises = ref([])
const dragging = ref(false)
const currentExerciseX = ref('439px')
const currentExerciseY = ref('68px')
const editing = ref(true)
const setAmount = ref(1)
const setsComplete = ref(-1)
const updater = ref(0)
const restDuration = ref(3)
const bigBreakDuration = ref(10)
const status = ref('idle')

const buttonText = computed(() => (editing.value ? 'Start Workout' : 'Edit Workout'))

const anyExercisesComplete = computed(() => exercises.value.some((ex) => ex.complete))

const shouldStartImmediately = computed(
  () => anyExercisesComplete.value || setsComplete.value >= 0
)

const resting = computed(() => status.value === 'resting')

const currentExercise = computed(() => {
  if (resting.value && exercises.value.every((e) => !e.complete)) {
    return { name: 'Big Break', duration: bigBreakDuration.value, complete: false }
  } else if (resting.value) {
    return { name: 'Resting', duration: restDuration.value, complete: false }
  } else {
    return exercises.value.filter((e) => !e.complete)[0]
  }
})

const setsLeft = computed(() => setAmount.value - setsComplete.value)

watch(setAmount, (value) => {
  setURLParams('setAmount', value)
})

watch(restDuration, (value) => {
  setURLParams('restDuration', value)
})

watch(bigBreakDuration, (value) => {
  setURLParams('bigBreakDuration', value)
})

watch(currentExercise, () => {
  updater.value++
})

onMounted(() => {
  let url = new URL(document.location)
  if (url.searchParams.has('x') && url.searchParams.has('y')) {
    currentExerciseX.value = url.searchParams.get('x')
    currentExerciseY.value = url.searchParams.get('y')
  }
  if (url.searchParams.has('exercises')) {
    exercises.value = JSON.parse(decodeURIComponent(url.searchParams.get('exercises')))
  }
  if (url.searchParams.has('setAmount')) {
    setAmount.value = Number(url.searchParams.get('setAmount'))
  }
  if (url.searchParams.has('restDuration')) {
    restDuration.value = Number(url.searchParams.get('restDuration'))
  }
  if (url.searchParams.has('bigBreakDuration')) {
    bigBreakDuration.value = Number(url.searchParams.get('bigBreakDuration'))
  }
})

const setURLParams = (param, value) => {
  const url = new URL(document.location)
  if (typeof value === 'string' || typeof value === 'number') {
    url.searchParams.set(param, value)
  }
  if (typeof value === 'object') {
    url.searchParams.set(param, encodeURIComponent(JSON.stringify(value)))
  }
  window.history.pushState({}, '', url)
}

const updateTimerPosition = (position) => {
  currentExerciseX.value = position.x
  currentExerciseY.value = position.y
  setURLParams('x', currentExerciseX.value)
  setURLParams('y', currentExerciseY.value)
}

const resetWorkouts = () => {
  exercises.value.forEach((ex) => {
    ex.complete = false
    ex.timeLeft = ex.duration
  })
}

const endSet = () => {
  if (setsComplete.value === -1) {
    setsComplete.value = 1
  } else {
    setsComplete.value++
    if (setsLeft.value === 0) {
      return
    }
  }
  resetWorkouts()
}

const setCheck = () => {
  if (exercises.value.every((exercise) => exercise.complete)) {
    endSet()
  }
}

const exerciseComplete = () => {
  if (!resting.value) {
    const current = currentExercise.value
    const exerciseInArray = exercises.value.find((e) => e.name === current.name)
    if (exerciseInArray) {
      exerciseInArray.complete = true
    }
    status.value = 'resting'
    setCheck()
  } else {
    status.value = 'workingOut'
  }
}

const resetSetAndWorkouts = () => {
  setsComplete.value = -1
  resetWorkouts()
}

const toggleWorkout = () => {
  editing.value = !editing.value
}

const addExercise = (exercise) => {
  exercises.value.push({
    name: exercise.name,
    duration: exercise.duration,
    timeLeft: exercise.duration,
    complete: false,
  })
  setURLParams('exercises', exercises.value)
}

const removeExercise = (index) => {
  exercises.value.splice(index, 1)
  setURLParams('exercises', exercises.value)
}

const moveup = (index) => {
  if (index > 0) {
    let selectedElement = exercises.value[index]
    let elementAbove = exercises.value[index - 1]
    exercises.value.splice(index, 1, elementAbove)
    exercises.value.splice(index - 1, 1, selectedElement)
  }
  setURLParams('exercises', exercises.value)
}

const movedown = (index) => {
  if (index < exercises.value.length - 1) {
    let selectedElement = exercises.value[index]
    let elementAbove = exercises.value[index + 1]
    exercises.value.splice(index, 1, elementAbove)
    exercises.value.splice(index + 1, 1, selectedElement)
  }
  setURLParams('exercises', exercises.value)
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
nav {
  display: flex;
  width: 100%;
  height: max-content;
  background-color: var(--slate-bg);
  margin-top: 0;
  padding: 0.2em;
  margin-bottom: 0.2em;
  align-items: center;
  justify-content: flex-end;
}
</style>
