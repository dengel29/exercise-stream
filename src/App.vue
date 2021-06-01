<template>
  <ExerciseList/>
</template>

<script>
import ExerciseList from './components/ExerciseList.vue'

export default {
  name: 'App',
  components: {
    ExerciseList
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
#app {
  font-family: 'Share Tech Mono', monospace, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  font-size: 1.2em;
}

input {
    font-size: 1em;
  }
button {
  font-family: 'Share Tech Mono', monospace, Avenir, Helvetica, Arial, sans-serif;
}
</style>
