<template>
  <div class="editing-view styles">
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
                :value="setAmount"
                @input="handleSetAmount"
                type="number"
                min="1"
                ref="setAmountInput"
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
              <input  
                :value="restDuration"
                @input="handleRestDuration" 
                type="number" />
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
              <input 
                @input="handleBigBreakDuration" 
                :value="bigBreakDuration" 
                type="number" />
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
</template>

<script>
import gsap from 'gsap'

export default {
  name: 'WorkoutEditingView',
  props: {
    exercises: Array,
    setAmount: {
      type: Number,
      required: true
    },
    restDuration: Number,
    bigBreakDuration: Number,
  },
  emits: [
    'update:setAmount',
    'update:restDuration',
    'update:bigBreakDuration',
    'add-exercise',
    'remove-exercise',
    'move-up',
    'move-down',
  ],
  data: function () {
    return {
      tweenedSetAmount: 0,
      tweenedTotalTime: 0,
      tweenedActiveTime: 0,
      tweenedRestingTime: 0,
      maxSetAmount: 40,
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
    aggregatedTime() {
      if (this.exercises.length <= 0 || this.setAmount === 0) {
        return 0
      }
      let exerciseTime = this.activeTime
      let restingTime = this.restingTime
      return (restingTime + exerciseTime).toFixed(0)
    },
  },
  watch: {
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
    setAmount: {
      handler(value) {
        if (value > this.maxSetAmount) {
          alert('cant do that, sorry')
          this.$emit('update:setAmount', this.maxSetAmount - 1)
        } else {
          gsap.to(this.$data, { duration: 0.5, tweenedSetAmount: value })
        }
      },
    },
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
        this.$emit('update:setAmount', 1)
        return
      }
      this.$emit('update:setAmount', this.setAmount - 1)
    },
    incrementSetAmount: function () {
      if (this.setAmount + 1 < this.maxSetAmount) {
        this.$emit('update:setAmount', this.setAmount + 1)
      } else {
        return alert('cant do that')
      }
    },
    handleSetAmount: function (event) {
       emit('update:setAmount', parseFloat(event.target.value));
    },
    handleRestDuration: function (event) {
       emit('update:restDuration', parseFloat(event.target.value));
    },
    decrementRestDuration: function () {
      this.$emit('update:restDuration', this.restDuration - 1)
    },
    incrementRestDuration: function () {
      this.$emit('update:restDuration', this.restDuration + 1)
    },
    decrementBigBreakDuration: function () {
      this.$emit('update:bigBreakDuration', this.bigBreakDuration - 1)
    },
    incrementBigBreakDuration: function () {
      this.$emit('update:bigBreakDuration', this.bigBreakDuration + 1)
    },
    handleBigBreakDuration: function (event) {
      this.$emit('update:bigBreakDuration', parseFloat(event.target.value))
    },
    decrementExerciseDuration: function () {
      this.$refs.exerciseduration.value--
    },
    incrementExerciseDuration: function () {
      this.$refs.exerciseduration.value++
    },
    addExercise: function () {
      let name = this.$refs.exercisename.value
      let duration = Number(this.$refs.exerciseduration.value)
      this.$emit('add-exercise', { name, duration })
      this.$refs.exercisename.value = ''
      this.$refs.exercisename.focus()
    },
    removeExercise: function (index) {
      this.$emit('remove-exercise', index)
    },
    moveup: function (index) {
      this.$emit('move-up', index)
    },
    movedown: function (index) {
      this.$emit('move-down', index)
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

.grid {
  display: grid;
  grid-template-columns: 20em 20em 1fr;
  gap: 1em;
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

mark {
  background: hsla(var(--slate), var(--background-shade));
  padding: 0px 3px 0px 3px;
  border-radius: 3px;
  color: white;
}
</style>