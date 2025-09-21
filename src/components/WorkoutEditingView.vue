<template>
  <div class="editing-view styles">
    <div class="grid">
      <EditableExerciseList
        :exercises="exercises"
        :set-amount="setAmount"
        :set-indicator-styles="setIndicatorStyles"
        @remove-exercise="removeExercise"
        @move-up="moveup"
        @move-down="movedown"
      />
      <WorkoutForm
        :set-amount="setAmount"
        :rest-duration="restDuration"
        :big-break-duration="bigBreakDuration"
        @update:setAmount="handleSetAmount"
        @update:restDuration="handleRestDuration"
        @update:bigBreakDuration="handleBigBreakDuration"
        @add-exercise="addExercise"
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

<script>
import gsap from 'gsap'
import WorkoutForm from './WorkoutForm.vue'
import WorkoutSummary from './WorkoutSummary.vue'
import EditableExerciseList from './EditableExerciseList.vue'

export default {
  name: 'WorkoutEditingView',
  components: {
    WorkoutForm,
    WorkoutSummary,
    EditableExerciseList,
  },
  props: {
    exercises: Array,
    setAmount: {
      type: Number,
      required: true,
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
      return Math.round(this.tweenedSetAmount)
    },
    animatedTotalTime: function () {
      return Math.round(this.tweenedTotalTime)
    },
    animatedActiveTime: function () {
      return Math.round(this.tweenedActiveTime)
    },
    animatedRestingTime: function () {
      return Math.round(this.tweenedRestingTime)
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
    handleSetAmount: function (value) {
      this.$emit('update:setAmount', value)
    },
    handleRestDuration: function (value) {
      this.$emit('update:restDuration', value)
    },
    handleBigBreakDuration: function (value) {
      this.$emit('update:bigBreakDuration', value)
    },
    addExercise: function (exercise) {
      this.$emit('add-exercise', exercise)
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
  grid-template-columns: 20em 20em 1fr;
  gap: 1em;
}
</style>