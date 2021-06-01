<template>

  <button @click="send('PAUSE')">
    {{ timeLeft }}
  </button>
  <button @click="send('RESUME')">Resume</button>
  <button @click="returnState">print state</button>
</template>

<script>
import {useMachine} from '@xstate/vue'
import timerMachine from '../machines/timer'
export default {
  props: ['duration'],
  setup(props) {
    const {state, send} = useMachine(timerMachine, {context: {duration: props.duration, breakDuration: props.breakDuration}})
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
  },
  methods: {
    returnState: function() {
      console.log(this.state.matches("paused"))
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

</style>