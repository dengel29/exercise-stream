<template>
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
</template>

<script>
export default {
  name: 'WorkoutSummary',
  props: {
    exercises: Array,
    setAmount: Number,
    restDuration: Number,
    bigBreakDuration: Number,
    animatedSetAmount: Number,
    animatedTotalTime: Number,
    animatedActiveTime: Number,
    animatedRestingTime: Number,
  },
  methods: {
    convertSecondsToMinutesAndSeconds(t) {
      var minutes = Math.floor(t / 60).toFixed(0)
      var seconds = (t - minutes * 60).toFixed(0)

      return `${minutes} m \n\n ${seconds} s`
    },
  },
}
</script>

<style scoped>
.workout-summary {
  width: 70%;
  margin: 0 auto;
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
.workout-stat-box {
  width: 90%;
  margin: 0 auto;
  margin-bottom: 1em;
}
mark {
  background: hsla(var(--slate), var(--background-shade));
  padding: 0px 3px 0px 3px;
  border-radius: 3px;
  color: white;
}
</style>