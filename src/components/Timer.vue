<template>

  <p>{{ timeLeft }}</p>
  <button @click="toggleTimer">
    {{paused || idle ? 'Resume' : 'Pause'}}
  </button>
</template>

<script>
import {useMachine} from '@xstate/vue'
import timerMachine from '../machines/timer'
export default {
  props: ['duration', 'startImmediately'],
  setup(props) {
    const {state, send} = useMachine(timerMachine, {
      context: {
        duration: props.duration,
        startImmediately: props.startImmediately
      }
    })
    return {
      state,
      send
    }
  },
  emits: ['exerciseComplete'],
  computed: {
    timeLeft() {
      return (this.state.context.duration - this.state.context.elapsed).toFixed(1)
    },
    complete() {
      return this.state.context.elapsed >= this.state.context.duration
    },
    paused() {
      return this.state.matches("paused")
    },
    idle() {
      return this.state.matches("idle")
    },
    running() {
      return this.state.matches("running")
    }
  },
  methods: {
    returnState: function() {
      console.log(this.state.matches("paused"))
    },
    toggleTimer: function() {
      if (this.paused || this.idle) {
        this.send('RESUME')
        return
      }
      if (this.state.matches("running")) {
        this.send('PAUSE')
        return
      }
    }
  },
  watch: {
    complete: {
      handler(value) {
        console.log(value)
        this.$emit('exerciseComplete')
      }
    }
  }
}
</script>

<style scoped>
  p {
    margin :0
  }
</style>