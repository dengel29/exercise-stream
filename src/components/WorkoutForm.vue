<template>
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
          <input :value="restDuration" type="number" />
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
          <input :value="bigBreakDuration" type="number" />
          <button @click="incrementBigBreakDuration">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkoutForm',
  props: {
    setAmount: Number,
    restDuration: Number,
    bigBreakDuration: Number,
  },
  emits: ['update:setAmount', 'update:restDuration', 'update:bigBreakDuration', 'add-exercise'],
  methods: {
    decrementSetAmount: function () {
      if (this.setAmount - 1 === 0) {
        alert('Must have at least 1 set')
        this.$emit('update:setAmount', 1)
        return
      }
      this.$emit('update:setAmount', this.setAmount - 1)
    },
    incrementSetAmount: function () {
      if (this.setAmount + 1 < 40) {
        this.$emit('update:setAmount', this.setAmount + 1)
      } else {
        return alert('cant do that')
      }
    },
    handleSetAmount: function (event) {
      this.$emit('update:setAmount', parseFloat(event.target.value))
    },
    decrementRestDuration: function () {
      this.$emit('update:restDuration', this.restDuration - 1)
    },
    incrementRestDuration: function () {
      this.$emit('update:restDuration', this.restDuration + 1)
    },
    handleRestDuration: function (event) {
      this.$emit('update:restDuration', parseFloat(event.target.value))
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
  },
}
</script>

<style scoped>
.spacer {
  height: 0.8em;
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
.bg-slate {
  background: hsla(var(--slate), var(--background-shade));
  color: white;
  border: 3px solid hsla(var(--slate), var(--border-shade));
  border-radius: 3px;
}
.align-end {
  align-items: flex-end;
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
</style>