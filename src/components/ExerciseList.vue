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
    <!-- Working Out View -->
    <div v-if="!editing">
      <div ref="workoutarea" class="workout-grid" @dragover="dragOver" @drop="drop">
        <div class="progress-area">
          <h1>Current Progress</h1>
          <div v-if="setsComplete === -1" class="set-indicator" :style="setIndicatorStyles">
            <div v-for="index in setAmount" :key="index" class="set"></div>
          </div>
          <div v-else class="set-indicator" :style="setIndicatorStyles">
            <div v-for="index in setsComplete" :key="index" class="set complete"></div>
            <div v-for="index in setsLeft" :key="index" class="set"></div>
          </div>
          <div class="workouts">
            <div
              v-for="exercise in exercises"
              :key="exercise.name"
              class="exercise-pill"
              :class="[
                exercise === currentExercise ? 'current-exercise' : '',
                exercise.complete ? 'complete' : '',
              ]"
            >
              {{ exercise.name }}
            </div>
          </div>
        </div>
        <div class="timer-ui-control">
          <h1>Swap timer UI</h1>
          <button @click="timerBottom">
            <img
              title="Position the timer to the bottom of the exercise name"
              :src="timerBottomSVG"
            />
          </button>
          <button @click="timerTop">
            <img title="Position the timer to the top of the exercise name" :src="timerTopSVG" />
          </button>
          <button @click="timerLeft">
            <img title="Position the timer to the left of the exercise name" :src="timerLeftSVG" />
          </button>
          <button @click="timerRight">
            <img
              title="Position the timer to the right of the exercise name"
              :src="timerRightSVG"
            />
          </button>
          <button @click="noText">
            <img title="Display the timer without the exercise name" :src="timerNoTextSVG" />
          </button>
        </div>
        <div v-if="!currentExercise">WORKOUT COMPLETE</div>
        <div
          v-if="currentExercise"
          ref="currentExercise"
          :style="timerPosition"
          class="current-workout"
          :class="dragging ? grabbing : 'grab'"
          draggable="true"
          @dragstart="dragStart"
          @mouseover="addGrabClass"
          @mouseleave="removeGrabClass"
        >
          <Timer
            :key="updater"
            :duration="currentExercise.duration"
            :start-immediately="shouldStartImmediately"
            @exerciseComplete="exerciseComplete"
          >
          </Timer>
          <p :style="textDisplay">
            {{ currentExercise.name }}
          </p>
        </div>
      </div>
    </div>
    <!-- Set and Exercise Input View -->
    <div v-if="editing" class="editing-view styles">
      <div class="grid">
        <div class="exercise-list">
          <transition-group
            appear="false"
            name="set-list"
            tag="div"
            class="set-indicator"
            :style="setIndicatorStyles"
          >
            <div
              v-for="index in setAmount"
              :key="index"
              class="set neutral"
              :style="{ '--i': index }"
            ></div>
          </transition-group>
          <ol>
            <li v-for="(exercise, index) in exercises" :key="exercise.name" :data-id="index">
              <div class="move-position-buttons">
                <button @click="moveup(index)">&#9650;</button>
                <button @click="movedown(index)">&#9660;</button>
              </div>
              <p>{{ exercise.name }}</p>
              <p>{{ exercise.duration }}s</p>
              <button @click="removeExercise(index)">&#9447;</button>
            </li>
          </ol>
        </div>
        <div class="higher-level-controls">
          <!-- how many sets -->
          <div class="exercise-inputs bg-slate" style="padding: 0.2em">
            <h1 style="font-size: 1.4em; margin: 0">Add Exercises</h1>
            <div class="spacer"></div>
            <div class="flex-row align-end">
              <label for="">
                <p>Exercise</p>
              </label>
              <input ref="exercisename" type="text" />
            </div>
            <div class="spacer"></div>
            <div class="flex-row align-end">
              <label for="">
                <p>Duration</p>
              </label>
              <div style="height: 100%; display: flex; justify-content: space-around">
                <button @click="decrementExerciseDuration">-</button>
                <input ref="exerciseduration" type="number" value="10" step="10" />
                <button @click="incrementExerciseDuration">+</button>
              </div>
            </div>
            <div class="spacer"></div>
            <button
              style="border-radius: 3px; height: 1.8em; border-bottom: none; font-size: 0.8em"
              @click="addExercise"
            >
              Add Exercise
            </button>
          </div>
          <div class="spacer"></div>
          <div class="exercise-inputs bg-slate" style="padding: 0.2em">
            <h1 style="font-size: 1.4em; margin: 0">Workout Settings</h1>
            <div class="spacer"></div>
            <div class="flex-row align-end">
              <label for="">
                <p>Set #</p>
              </label>
              <div style="height: 100%; display: flex; justify-content: space-around">
                <button @click="decrementSetAmount">-</button>
                <input
                  ref="setAmountInput"
                  v-model.number="setAmount"
                  type="number"
                  min="1"
                  max="40"
                />
                <button @click="incrementSetAmount">+</button>
              </div>
            </div>
            <div class="spacer"></div>
            <div class="flex-row align-end">
              <label for="">
                <p style="font-size: 0.8em; width: min-content">
                  Duration of break between exercises
                </p>
              </label>
              <div style="height: 100%; display: flex; justify-content: space-around">
                <button @click="decrementRestDuration">-</button>
                <input v-model.number="restDuration" type="number" />
                <button @click="incrementRestDuration">+</button>
              </div>
            </div>
            <div class="spacer"></div>
            <div class="flex-row align-end">
              <label for="">
                <p style="font-size: 0.8em; width: min-content">Duration of break between sets</p>
              </label>
              <div style="height: 100%; display: flex; justify-content: space-around">
                <button @click="decrementBigBreakDuration">-</button>
                <input v-model.number="bigBreakDuration" type="number" />
                <button @click="incrementBigBreakDuration">+</button>
              </div>
            </div>
          </div>
        </div>
        <div class="workout-summary">
          <h1>Workout Summary</h1>
          <div style="width: 100%; margin: 0 auto; padding: 0.2em">
            <div class="flex-row workout-stat-box">
              <div class="stat-description">Set amount</div>
              <div class="stat-amount">
                <mark>{{ animatedSetAmount }}</mark>
              </div>
            </div>

            <div class="flex-row workout-stat-box">
              <div class="stat-description">Exercises per set</div>
              <div class="stat-amount">
                <mark>{{ exercises.length }}</mark>
              </div>
            </div>

            <div class="flex-row workout-stat-box">
              <div class="stat-description">Break between exercises</div>
              <div class="stat-amount">
                <mark>{{ restDuration }}</mark>
              </div>
            </div>

            <div class="flex-row workout-stat-box">
              <div class="stat-description">Break between sets</div>
              <div class="stat-amount">
                <mark>{{ bigBreakDuration }}</mark>
              </div>
            </div>

            <div class="flex-row workout-stat-box">
              <div class="stat-description">Total time</div>
              <div class="stat-amount">
                <mark>{{ convertSecondsToMinutesAndSeconds(animatedTotalTime.toFixed(0)) }}</mark>
              </div>
            </div>

            <div class="flex-row workout-stat-box">
              <div class="stat-description">Total active time</div>
              <div class="stat-amount">
                <mark>{{ convertSecondsToMinutesAndSeconds(animatedActiveTime.toFixed(0)) }}</mark>
              </div>
            </div>

            <div class="flex-row workout-stat-box">
              <div class="stat-description">Total resting time</div>
              <div class="stat-amount">
                <mark>{{ convertSecondsToMinutesAndSeconds(animatedRestingTime.toFixed(0)) }}</mark>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Timer from './Timer.vue'
import timerLeftSVG from '@/assets/timerLeft.svg'
import timerRightSVG from '@/assets/timerRight.svg'
import timerBottomSVG from '@/assets/timerBottom.svg'
import timerTopSVG from '@/assets/timerTop.svg'
import timerNoTextSVG from '@/assets/timerNoText.svg'
import gsap from 'gsap'

export default {
  components: {
    Timer,
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
      currentWorkoutDisplayDirection: 'column',
      currentWorkoutDisplayReverse: '',
      currentWorkoutDisplayText: 'block',
      editing: true,
      maxSetAmount: 40,
      setAmount: 0,
      tweenedSetAmount: 0,
      tweenedTotalTime: 0,
      tweenedActiveTime: 0,
      tweenedRestingTime: 0,
      setsComplete: -1,
      updater: 0,
      restDuration: 3,
      bigBreakDuration: 10,
      status: 'idle',
      grabbing: 'grabbing',
      channel: null,
    }
  },
  computed: {
    animatedSetAmount: function () {
      return this.tweenedSetAmount.toFixed(0)
    },
    animatedTotalTime: function () {
      return this.tweenedTotalTime
    },
    animatedActiveTime: function () {
      return this.tweenedActiveTime
    },
    animatedRestingTime: function () {
      return this.tweenedRestingTime
    },
    setIndicatorStyles() {
      return {
        '--grid-width': `repeat(${this.setAmount}, minmax(0, ${(this.setAmount * 0.8).toFixed(
          1
        )}fr))`,
        '--gap': `${100 / this.setAmount}px`,
        '--total': `${this.setAmount}`,
      }
    },
    buttonText() {
      return this.editing ? 'Start Workout' : 'Edit Workout'
    },
    timerPosition() {
      return {
        '--timer-x': `${this.currentExerciseX}`,
        '--timer-y': `${this.currentExerciseY}`,
        '--direction': `${this.currentWorkoutDisplayDirection}${this.currentWorkoutDisplayReverse}`,
      }
    },
    textDisplay() {
      return {
        '--display': `${this.currentWorkoutDisplayText}`,
      }
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
    activeTime() {
      if (this.exercises.length <= 0 || this.setAmount === 0) {
        return 0
      }
      return (
        this.exercises.reduce((accumulator, currentValue) => {
          return accumulator + currentValue.duration
        }, 0) * this.setAmount
      )
    },
    restingTime() {
      if (this.exercises.length <= 0 || this.setAmount === 0) {
        return 0
      }
      return (
        this.exercises.length * this.restDuration * this.setAmount +
        this.setAmount * this.bigBreakDuration
      )
    },
    restingTimeReadable() {
      return this.convertSecondsToMinutesAndSeconds(this.restingTime)
    },
    activeTimeReadable() {
      return this.convertSecondsToMinutesAndSeconds(this.activeTime)
    },
    aggregatedTime() {
      if (this.exercises.length <= 0 || this.setAmount === 0) {
        return 0
      }
      let exerciseTime = this.activeTime
      let restingTime = this.restingTime
      return (restingTime + exerciseTime).toFixed(0)
    },
    readableAggregatedTime() {
      return this.convertSecondsToMinutesAndSeconds(aggregatedTime)
    },
    resting() {
      return this.status === 'resting'
    },
  },
  watch: {
    toggleWorkoutDisplayReverse: {
      handler(value) {
        console.log(value)
        // this.setURLParams("setAmount", value)
        if (value) {
          this.currentWorkoutDisplayReverse = '-reverse'
        } else {
          this.currentWorkoutDisplayReverse = ''
        }
      },
    },
    aggregatedTime: {
      handler(value) {
        gsap.to(this.$data, { duration: 0.6, tweenedTotalTime: value, ease: 'elastic' })
      },
    },
    activeTime: {
      handler(value) {
        gsap.to(this.$data, { duration: 0.6, tweenedActiveTime: value, ease: 'power3.inOut' })
      },
    },
    restingTime: {
      handler(value) {
        gsap.to(this.$data, { duration: 0.6, tweenedRestingTime: value })
      },
    },
    toggleWorkoutDisplayDirection: {
      handler(value) {
        if (value) {
          this.currentWorkoutDisplayDirection = 'row'
        } else {
          this.currentWorkoutDisplayDirection = 'column'
        }
        // this.setURLParams("setAmount", value)
      },
    },
    setAmount: {
      handler(value) {
        if (value > this.maxSetAmount) {
          alert('cant do that, sorry')
          this.setAmount = this.maxSetAmount - 1
        } else {
          gsap.to(this.$data, { duration: 0.5, tweenedSetAmount: value })
          this.setURLParams('setAmount', value)
        }
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
      handler(value) {
        // when current workout changes, increment this updater to re-render the timer
        console.log(value)
        this.updater++
      },
    },
    setsLeft: {
      handler(value) {
        console.log(value)
      },
    },
  },
  mounted: function () {
    // browser channel experiment

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
    convertSecondsToMinutesAndSeconds(t) {
      var minutes = Math.floor(t / 60).toFixed(0)
      var seconds = (t - minutes * 60).toFixed(0)

      return `${minutes} minutes \n\n ${seconds} seconds`
    },
    decrementSetAmount: function () {
      if (this.setAmount - 1 === 0) {
        alert('Must have at least 1 set')
        return (this.setAmount = 1)
      }
      return this.setAmount--
    },
    incrementSetAmount: function () {
      if (this.setAmount + 1 < this.maxSetAmount) {
        this.setAmount++
      } else {
        return alert('cant do that')
      }
    },
    decrementRestDuration: function () {
      return this.restDuration--
    },
    incrementRestDuration: function () {
      return this.restDuration++
    },
    decrementBigBreakDuration: function () {
      return this.bigBreakDuration--
    },
    incrementBigBreakDuration: function () {
      return this.bigBreakDuration++
    },
    decrementExerciseDuration: function () {
      this.$refs.exerciseduration.value--
    },
    incrementExerciseDuration: function () {
      this.$refs.exerciseduration.value++
    },
    noText: function () {
      console.log('hihi')
      this.currentWorkoutDisplayText = 'none'
      console.log(this.currentWorkoutDisplayText)
    },
    timerTop: function () {
      this.currentWorkoutDisplayDirection = 'column'
      this.currentWorkoutDisplayReverse = ''
      this.currentWorkoutDisplayText = 'block'
    },
    timerBottom: function () {
      console.log('hey')
      this.currentWorkoutDisplayDirection = 'column'
      this.currentWorkoutDisplayReverse = '-reverse'
      this.currentWorkoutDisplayText = 'block'
    },
    timerRight: function () {
      console.log('hey')
      this.currentWorkoutDisplayDirection = 'row'
      this.currentWorkoutDisplayReverse = '-reverse'
      this.currentWorkoutDisplayText = 'block'
    },
    timerLeft: function () {
      console.log('hey')
      this.currentWorkoutDisplayDirection = 'row'
      this.currentWorkoutDisplayReverse = ''
      this.currentWorkoutDisplayText = 'block'
    },
    addGrabClass: function () {
      this.$refs.currentExercise.classList.add('grab')
    },
    removeGrabClass: function () {
      this.$refs.currentExercise.classList.remove('grab')
    },
    dragStart: function (event) {
      this.dragging = true
      var style = window.getComputedStyle(event.target, null)
      event.dataTransfer.setData(
        'text/plain',
        parseInt(style.getPropertyValue('left'), 10) -
          event.clientX +
          ',' +
          (parseInt(style.getPropertyValue('top'), 10) - event.clientY)
      )
    },
    dragOver: function (event) {
      event.preventDefault()
      return false
    },
    drop: function (event) {
      this.dragging = false
      var offset = event.dataTransfer.getData('text/plain').split(',')
      // var dm = this.$refs.currentExercise
      this.currentExerciseX = event.clientX + parseInt(offset[0], 10) + 'px'
      this.currentExerciseY = event.clientY + parseInt(offset[1], 10) + 'px'

      this.setURLParams('x', this.currentExerciseX)
      this.setURLParams('y', this.currentExerciseY)
      event.preventDefault()
      return false
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
      console.log('ending set')
      // this errors when there's ONLY ONE SET but is fine if there is more than one SET
      if (this.setsComplete === -1) {
        console.log('setscomplete is -1')
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
    addExercise: function () {
      let name = this.$refs.exercisename.value
      let duration = Number(this.$refs.exerciseduration.value)
      this.exercises.push({ name: name, duration: duration, timeLeft: duration, complete: false })
      this.$refs.exercisename.value = ''
      this.$refs.exercisename.focus()
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
.spacer {
  height: 0.8em;
}

.workout-summary {
  width: 70%;
  /* margin: 0 auto; */
  text-align: center;
  padding: 8px;
  border: 2px dotted hsla(var(--dark-slate), 1);
}

.workout-summary h1 {
  margin: 0px 0px 0.4em 0px;
  font-size: 1.4em;
}

.stat-description {
  margin-right: auto;
  text-align: left;
}

.stat-amount {
  text-align: right;
}

.flex-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 80%;
}

.flex-row label {
  position: relative;
}

.workout-stat-box {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 1em;
}

.bg-slate {
  background: hsla(var(--slate), var(--background-shade));
  color: white;
  border: 3px solid hsla(var(--slate), var(--border-shade));
  border-radius: 3px;
}

.align-end {
  align-items: flex-end;
}

.set-list {
  height: 0.6em;
  order: -1;
}
.set {
  height: 0.6em;
  /* width: 100%; */
  transform: translateX(0px) translateY(0px) scale(1);
  opacity: 1;
  transition: all 0.8s ease;
}

.set-list-enter-from {
  height: 0.6em;
  opacity: 0;
  transition-delay: 0;
  transform: translateX(30px) translateY(30px) scale(0);
}

.set-list-leave-to {
  height: 0.6em;
  opacity: 0;
  transition-delay: 0;
  transform: translateX(400px) translateY(40px) scale(0);
}

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
label {
  display: flex;
  flex-direction: column;
}
label p {
  margin: 0.2em;
}
.exercise-inputs {
  display: flex;
  width: 70%;
  margin: 0 auto;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  height: max-content;
}

.exercise-inputs label {
  display: inherit;
  align-items: inherit;
}
.exercise-inputs input {
  border: none;
  padding-left: 4px;
  text-align: center;
  height: 100%;
  border-bottom: 3px solid white;
  width: 60%;
}
.exercise-inputs input:focus {
  border: none;
  outline: none;
  border-bottom: var(--input-border);
}

.exercise-inputs input[type='number'] {
  width: 2.2em;
  -moz-appearance: textfield;
}

.exercise-inputs input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.exercise-inputs input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.complete {
  background: var(--workout-green);
}

.exercise-inputs button {
  border-bottom: var(--input-border);
  background-color: hsla(var(--dark-slate), 1);
  color: white;
  font-weight: bold;
  cursor: pointer;
  border-left: hsla(var(--green), var(--border-shade));
  border-right: hsla(var(--green), var(--border-shade));
  border-top: hsla(var(--green), var(--border-shade));
}

.exercise-inputs button:nth-of-type(1n) {
  border-radius: 3px 0px 0px 3px;
}
.exercise-inputs button:nth-of-type(2n) {
  border-radius: 0px 3px 3px 0px;
}

.editing-view {
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial,
    sans-serif;
  height: 80vh;
  position: relative;
}

.workout-grid {
  display: grid;
  position: relative;
  grid-template-columns: 1fr 1fr;
  height: 80vh;
  width: 99vw;
}
.workout-grid .timer-ui-control {
  display: flex;
  background-color: var(--slate-bg);
  flex-wrap: wrap;
  justify-content: space-around;
  flex-direction: row;
  width: 4em;
  position: absolute;
  right: 0;

  align-items: center;
  border: 3px solid hsla(var(--dark-slate), 1);
  border-radius: 3px;
}
.workout-grid .timer-ui-control h1 {
  margin: 0px 0px 0.4em 0px;
  font-size: 1em;
  color: white;
}
.workout-grid .timer-ui-control button {
  display: flex;
  justify-content: center;
  border: none;
  background-color: hsla(var(--dark-slate), 1);
  margin: 0.2em;
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  width: 28px;
  height: 28px;
}
.workout-grid .timer-ui-control button:hover {
  cursor: pointer;
}
li {
  display: grid;
  gap: 0.4em;
  grid-template-columns: 1em 5em 1em 1.2em;
  /* padding: 0em 0em 0.4em 0.4em; */
  border-radius: 3px;
  width: 95%;
  /* margin: 0 auto; */
  flex-direction: row;
  justify-content: space-evenly;
  height: fit-content;
  margin-bottom: 0.6em;
  align-items: center;
  border: 1px dotted var(--workout-green);
}
li p:last-of-type {
  font-size: 0.8em;
  margin-bottom: 0;
  padding-left: 1em;
  place-self: last baseline;
  justify-self: last baseline;
  margin-block-end: none;
}
li button:nth-of-type(1n) {
  border: none;
  width: 1.2em;
  height: 1.2em;
  display: grid;
  place-self: flex-start;
  place-content: center;
  background: #222c;
  color: white;
  font-size: 1em;
  font-weight: 700;
  border-radius: 0 0 0px 3px;
  cursor: pointer;
}

.grab {
  cursor: grab;
}
.grabbing {
  cursor: grabbing;
  border: 1px dotted black;
  background: rgba(0, 0, 0, 0.1);
}
.grid {
  display: grid;
  grid-template-columns: 20em 20em 1fr;
  gap: 1em;
}

.progress-area {
  width: 30%;
  border: 3px solid hsla(var(--dark-slate), 1);
  position: sticky;
  top: 20px;
  background-color: var(--slate-bg);
  color: white;
  height: max-content;
  padding: 0.4em;
  border-radius: 3px;
  height: 100%;
}
.progress-area .set {
  border: 1px solid white;
  box-shadow: 1px 1px;
}
.progress-area h1 {
  margin: 0px 0px 0.4em 0px;
  font-size: 1em;
}

.exercise-pill {
  margin: 0px 0px 0.2em;
  border-radius: 3px;
  font-size: 1.6em;
}
.current-workout {
  align-items: center;
  position: absolute;
  top: var(--timer-y);
  left: var(--timer-x);
  text-shadow: -4px -4px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  color: white;
  display: flex;
  flex-direction: var(--direction);
  font-size: 6em;
}

.current-workout p {
  margin: 0;
  width: 4em;
  display: var(--display);
}

.exercise-list {
  margin: 0 auto;
  width: 50%;
}

ol {
  padding: 0;
  list-style-type: none;
}
ol:empty::before {
  content: 'Added exercises will appear here';
  width: 30px;
  height: 30px;
  font-style: oblique;
}
ol:empty::after {
  content: 'Added exercises will appear here';
  width: 30px;
  height: 30px;
  font-style: oblique;
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
.set-indicator {
  display: grid;
  grid-template-columns: var(--grid-width);
  height: 10px;
  gap: var(--gap);
  margin-bottom: 1em;
  transition: all 0.8s ease;
}

.set {
  border: 1px solid black;
  border-radius: 10px;
  box-shadow: 1px 1px;
}
.move-position-buttons {
  font-size: 0.8em;
}
.move-position-buttons button {
  border: none;
  background-color: hsla(var(--dark-slate), 1);
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.move-position-buttons button:first-of-type {
  border-bottom: 2px solid var(--input-border);
  /* margin-bottom: -3px; */
  border-radius: 0px 2px 0px 0px;
  border-left: 1px solid hsla(var(--green), var(--border-shade));
}
.move-position-buttons button:last-of-type {
  margin-top: 0;
  border-radius: 0px 0px 2px 0px;
  border-top: 2px solid var(--input-border);
  border-left: 1px solid hsla(var(--green), var(--border-shade));
}

.neutral {
  border: 1px solid black;
}
.current-exercise {
  border: 2px solid var(--workout-green);
}

mark {
  background: hsla(var(--slate), var(--background-shade));
  padding: 0px 3px 0px 3px;
  border-radius: 3px;
  color: white;
}
</style>
