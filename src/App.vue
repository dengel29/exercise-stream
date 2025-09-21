<template>
  <div>
    <ExerciseList />
    <p class="version">v{{ version }}</p>
  </div>
</template>

<script>
import ExerciseList from './components/ExerciseList.vue'

export default {
  name: 'App',
  components: {
    ExerciseList,
  },
  data() {
    return {
      version: import.meta.env.VITE_APP_VERSION,
    }
  },
}
</script>

<style>
@import 'open-props/style';
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

body {
  margin: 0;
}
#app {
  font-family: 'Share Tech Mono', monospace, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 1.2em;
}

.version {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.8em;
  color: #aaa;
}

input {
  font-size: 1em;
}
button {
  font-family: 'Share Tech Mono', monospace, Avenir, Helvetica, Arial, sans-serif;
}
</style>
