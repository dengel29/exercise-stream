<template>
  <div>
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
</template>

<script>
import Timer from './Timer.vue'
import timerLeftSVG from '@/assets/timerLeft.svg'
import timerRightSVG from '@/assets/timerRight.svg'
import timerBottomSVG from '@/assets/timerBottom.svg'
import timerTopSVG from '@/assets/timerTop.svg'
import timerNoTextSVG from '@/assets/timerNoText.svg'

export default {
  name: 'WorkoutInProgressView',
  components: {
    Timer,
  },
  props: {
    exercises: Array,
    setAmount: Number,
    setsComplete: Number,
    currentExercise: Object,
    updater: Number,
    shouldStartImmediately: Boolean,
    dragging: Boolean,
  },
  emits: ['exercise-complete', 'update-timer-position'],
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
      currentExerciseX: '439px',
      currentExerciseY: '68px',
      currentWorkoutDisplayDirection: 'column',
      currentWorkoutDisplayReverse: '',
      currentWorkoutDisplayText: 'block',
      grabbing: 'grabbing',
    }
  },
  computed: {
    setsLeft() {
      return this.setAmount - this.setsComplete
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
  },
  methods: {
    exerciseComplete: function () {
      this.$emit('exercise-complete')
    },
    noText: function () {
      this.currentWorkoutDisplayText = 'none'
    },
    timerTop: function () {
      this.currentWorkoutDisplayDirection = 'column'
      this.currentWorkoutDisplayReverse = ''
      this.currentWorkoutDisplayText = 'block'
    },
    timerBottom: function () {
      this.currentWorkoutDisplayDirection = 'column'
      this.currentWorkoutDisplayReverse = '-reverse'
      this.currentWorkoutDisplayText = 'block'
    },
    timerRight: function () {
      this.currentWorkoutDisplayDirection = 'row'
      this.currentWorkoutDisplayReverse = '-reverse'
      this.currentWorkoutDisplayText = 'block'
    },
    timerLeft: function () {
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
      this.$emit('update:dragging', true)
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
      this.$emit('update:dragging', false)
      var offset = event.dataTransfer.getData('text/plain').split(',')
      this.currentExerciseX = event.clientX + parseInt(offset[0], 10) + 'px'
      this.currentExerciseY = event.clientY + parseInt(offset[1], 10) + 'px'
      this.$emit('update-timer-position', { x: this.currentExerciseX, y: this.currentExerciseY })
      event.preventDefault()
      return false
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
.complete {
  background: var(--workout-green);
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
.grab {
  cursor: grab;
}
.grabbing {
  cursor: grabbing;
  border: 1px dotted black;
  background: rgba(0, 0, 0, 0.1);
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
.current-exercise {
  border: 2px solid var(--workout-green);
}
</style>