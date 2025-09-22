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

<script>
import Timer from './Timer.vue'
import WorkoutEditingView from './WorkoutEditingView.vue'
import WorkoutInProgressView from './WorkoutInProgressView.vue'
import timerLeftSVG from '@/assets/timerLeft.svg'
import timerRightSVG from '@/assets/timerRight.svg'
import timerBottomSVG from '@/assets/timerBottom.svg'
import timerTopSVG from '@/assets/timerTop.svg'
import timerNoTextSVG from '@/assets/timerNoText.svg'

export default {
  components: {
    Timer,
    WorkoutEditingView,
    WorkoutInProgressView,
  },
  setup() {
    return {
      timerLeftSVG,
      timerRightSVG,
      timerBottomSVG,
      timerTopSVG,
      timerNoTextSVG,
    }
  },
  data: function () {
    return {
      exercises: [],
      dragging: false,
      currentExerciseX: '439px',
      currentExerciseY: '68px',
      editing: true,
      setAmount: 1,
      setsComplete: -1,
      updater: 0,
      restDuration: 3,
      bigBreakDuration: 10,
      status: 'idle',
      channel: null,
    }
  },
  computed: {
    buttonText() {
      return this.editing ? 'Start Workout' : 'Edit Workout'
    },
    shouldStartImmediately() {
      return this.anyExercisesComplete || this.setsComplete >= 0
    },
    currentExercise() {
      // returns a 'resting' view with rest duration if resting, or the next incomplete workout in the set
      if (this.resting && this.exercises.every((e) => !e.complete)) {
        return { name: 'Big Break', duration: this.bigBreakDuration, complete: false }
      } else if (this.resting) {
        return { name: 'Resting', duration: this.restDuration, complete: false }
      } else {
        return this.exercises.filter((e) => !e.complete)[0]
      }
    },
    anyExercisesComplete() {
      return this.exercises.some((ex) => ex.complete)
    },
    setsLeft() {
      return this.setAmount - this.setsComplete
    },
    workingOut() {
      return this.status === 'workingOut'
    },
    resting() {
      return this.status === 'resting'
    },
  },
  watch: {
    setAmount: {
      handler(value) {
        this.setURLParams('setAmount', value)
      },
    },
    restDuration: {
      handler(value) {
        this.setURLParams('restDuration', value)
      },
    },
    bigBreakDuration: {
      handler(value) {
        this.setURLParams('bigBreakDuration', value)
      },
    },
    currentExercise: {
      handler() {
        // when current workout changes, increment this updater to re-render the timer
        this.updater++
      },
    },
  },
  mounted: function () {
    // url param detection and updating data from URL params
    let url = new URL(document.location)
    if (url.searchParams.has('x') && url.searchParams.has('y')) {
      this.currentExerciseX = url.searchParams.get('x')
      this.currentExerciseY = url.searchParams.get('y')
    }
    if (url.searchParams.has('exercises')) {
      this.exercises = JSON.parse(decodeURIComponent(url.searchParams.get('exercises')))
    }
    if (url.searchParams.has('setAmount')) {
      this.setAmount = Number(url.searchParams.get('setAmount'))
    }
    if (url.searchParams.has('restDuration')) {
      this.restDuration = Number(url.searchParams.get('restDuration'))
    }
    if (url.searchParams.has('bigBreakDuration')) {
      this.bigBreakDuration = Number(url.searchParams.get('bigBreakDuration'))
    }
  },
  methods: {
    updateTimerPosition: function (position) {
      this.currentExerciseX = position.x
      this.currentExerciseY = position.y
      this.setURLParams('x', this.currentExerciseX)
      this.setURLParams('y', this.currentExerciseY)
    },
    setURLParams: function (param, value) {
      const url = new URL(document.location)
      if (typeof value === 'string' || typeof value === 'number') {
        url.searchParams.set(param, value)
      }
      if (typeof value === 'object') {
        url.searchParams.set(param, encodeURIComponent(JSON.stringify(value)))
      }
      window.history.pushState({}, '', url)
    },
    generateURLParams: function () {
      this.channel.postMessage(JSON.parse(JSON.stringify(this.exercises)))
      this.setURLParams('exercises', this.exercises)
    },
    exerciseComplete: function () {
      // rests are exercises also, so checks if just completed 'resting' workout or normal workout
      if (!this.resting) {
        this.currentExercise.complete = true
        this.status = 'resting'
        this.setCheck()
      } else {
        this.status = 'workingOut'
      }
    },
    setCheck: function () {
      // end the set if all workouts are complete
      if (this.exercises.every((exercise) => exercise.complete)) {
        this.endSet()
      }
    },
    endSet() {
      // first set
      if (this.setsComplete === -1) {
        this.setsComplete = 1
        // every set after first
      } else {
        this.setsComplete++
        // last set
        if (this.setsLeft === 0) {
          return
          // any set besides last
        }
      }
      this.resetWorkouts()
    },
    resetWorkouts() {
      this.exercises.forEach((ex) => {
        ex.complete = false
        ex.timeLeft = ex.duration
      })
    },
    resetSetAndWorkouts() {
      this.setsComplete = -1
      this.resetWorkouts()
    },
    toggleWorkout: function () {
      this.editing = !this.editing
    },
    addExercise: function (exercise) {
      this.exercises.push({
        name: exercise.name,
        duration: exercise.duration,
        timeLeft: exercise.duration,
        complete: false,
      })
      this.setURLParams('exercises', this.exercises)
    },
    removeExercise: function (index) {
      this.exercises.splice(index, 1)
      this.setURLParams('exercises', this.exercises)
    },
    moveup: function (index) {
      if (index > 0) {
        let selectedElement = this.exercises[index]
        let elementAbove = this.exercises[index - 1]
        // move element above down
        this.exercises.splice(index, 1, elementAbove)
        // move element one position higher
        this.exercises.splice(index - 1, 1, selectedElement)
      }
      this.setURLParams('exercises', this.exercises)
    },
    movedown: function (index) {
      if (index < this.exercises.length - 1) {
        let selectedElement = this.exercises[index]
        let elementAbove = this.exercises[index + 1]
        // move element above down
        this.exercises.splice(index, 1, elementAbove)
        // move element one position higher
        this.exercises.splice(index + 1, 1, selectedElement)
      }
      this.setURLParams('exercises', this.exercises)
    },
  },
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
