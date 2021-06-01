<template>
<nav>
  <button @click="toggleWorkout">start workout</button>
</nav>
<!-- Working Out View -->
<div v-if="!editing">
  <div class="workout-grid">
    <div class="progress-area">
      <div class="set-indicator" :style="setIndicatorStyles">
         <div class="set" style="background: green" v-for="index in setsComplete" :key="index">
        </div>
        <div class="set" v-for="index in setsLeft" :key="index">
        </div>
      </div>
      <div class="workouts">
        <h2>Workout Progress!</h2>
        <div 
          v-for="exercise in exercises" 
          :key="exercise.name" 
          :style="exercise.complete ? 'background: green' : ''">
          {{exercise.name}}
        </div>
      </div>
    </div>
    <div v-if="!currentWorkout">
      WORKOUT COMPLETE
    </div>
    <div v-if="currentWorkout" class="current-workout">
      <p> 
        {{currentWorkout.name}}
      </p>
      <Timer :key="updater"
        @exerciseComplete="exerciseComplete"
        :duration=currentWorkout.duration
        >
      </Timer>
      <div v-if="currentWorkout.complete">Onto the next one</div>
    </div>
  </div>
</div>
<!-- Set and Exercise Input View -->
<div v-if="editing">
  <div class="grid">
    <div class="exercise-inputs">
      <label for="">
        Exercise
        <input type="text" ref="exercisename">
      </label>
      <label for="">
        Duration
        <input type="number" step="20" ref="exerciseduration">
      </label>
      <button @click="addExercise">+</button>
    </div>
    <div class="higher-level-controls">
      <!-- how many sets -->
      <div class="exercise-inputs">
        <label for="">
          Set #
          <input type="number" min='1' v-model.number="setAmount">
        </label>
        <div style="border: 0.5px solid; margin-top:0.2em; padding: 0.2em">
          <label for="" >
            Auto?
            <input type="checkbox" v-model="auto">
          </label>
          <label for="">
            Duration of break between sets
            <input :disabled="!auto" type="number">
          </label>
        </div>
        
    </div>
    </div>
    <div class="exercise-list">
      <!-- if it is auto or manual -->
        <!-- if it is auto how much break between workouts -->
      <!--  -->
      <ol>
          <li 
            v-for="(exercise, index) in exercises" 
            :key="exercise.name" 
            :data-id="index">
            <div class="move-position-buttons">
              <button @click="moveup(index)">^</button>
              <button @click="movedown(index)">v</button>
            </div>
            <p>{{exercise.name}} | {{exercise.duration}} seconds</p>
            <button @click="removeExercise(index)">x</button>
          </li>
      </ol>
    </div>
  </div>
</div>
</template>

<script>
import Timer from './Timer.vue'
export default {
  setup() {},
  components: {
    Timer
  },
  data: function() {
    return {
      exercises: [
        {name: 'Pushups', duration: 2, timeLeft: 2 , complete: false}, 
        {name: 'Lunges', duration: 2, timeLeft: 2 , complete: false}
      ],
      editing: true,
      setAmount: 1,
      setsComplete: 0,
      auto: false,
      updater: 0,
      restDuration: 3,
      status: 'idle'
    }
  },
  methods: {
    exerciseComplete: function() {
      // rests are exercises also, so checks if just completed 'resting' workout or normal workout
      if (!this.resting) {
        this.currentWorkout.complete = true
        this.setCheck()
        this.status = 'resting'
      } else {
        this.status = 'workingOut'
      }
    },
    setCheck: function() {
      // end the set if all workouts are complete
      if (this.exercises.filter(exercise => !exercise.complete).length === 0) {
        this.endSet()
      }
    },
    endSet() {
      this.setsComplete++
      // if 
      if (this.setsLeft === 0 ) {
        return
      } else {
        this.resetWorkouts()
      }
    },
    resetWorkouts() {
      this.exercises.forEach(ex => {
        ex.complete = false
        ex.timeLeft = ex.duration
      })
    },
    toggleWorkout: function() {
      this.editing = !this.editing
    },
    addExercise: function() {
      let name = this.$refs.exercisename.value
      let duration = Number(this.$refs.exerciseduration.value)
      this.exercises.push({name: name, duration: duration, timeLeft: duration, complete: false})
      this.$refs.exercisename.value = ''
      this.$refs.exerciseduration.value = ''
      this.$refs.exercisename.focus()
    },
    removeExercise: function(index) {
      this.exercises.splice(index, 1)
    },
    moveup: function(index) {
      if (index > 0){
        let selectedElement = this.exercises[index]
        let elementAbove = this.exercises[index -1]
        // move element above down
        this.exercises.splice(index, 1, elementAbove)
        // move element one position higher
        this.exercises.splice(index -1 , 1, selectedElement)

      }
    },
    movedown: function(index) {
      if (index < this.exercises.length -1){
        let selectedElement = this.exercises[index]
        let elementAbove = this.exercises[index + 1]
        // move element above down
        this.exercises.splice(index, 1, elementAbove)
        // move element one position higher
        this.exercises.splice(index + 1 , 1, selectedElement)
      }
    }
  },
  computed: {
    setIndicatorStyles() {
      return {
        '--grid-width': `repeat(${this.setAmount}, minmax(0, 1fr))`,
      }
    },
    currentWorkout() {
      // returns a 'resting' view with rest duration if resting, or the next incomplete workout in the set
      if (this.resting) {
        return {name: "Restin", duration: this.restDuration, complete: false}
      } else {
        return this.exercises.filter(e => !e.complete)[0]
      }
    },
    setsLeft() {
      return this.setAmount - this.setsComplete
    },
    toggleView() {
      return this.viewFocused === "editingWorkout"
    },
    workingOut() {
      return this.status === "workingOut"
    },
    resting() {
      return this.status === "resting"
    }
  },
  watch: {
    currentWorkout: {
      handler(value) {
        // when current workout changes, increment this updater to re-render the timer
        console.log(value)
        this.updater++
      }
    },
    setsLeft: {
      handler(value) {
        console.log(value)
      }
    }
  }
}
</script>

<style scoped>
  label {
    display:flex;
    flex-direction: column
  }
  .exercise-inputs {
    display: flex;
    width: 100%;
    margin: 0 auto;
    flex-direction: column;
    justify-content: space-evenly;
    height: 3em;
    align-items: self-end;
    align-items:center
  }

  .exercise-inputs button {
    height: 50%;
    margin-top: 1em;
  }

  li {
    display: flex;
    width: 50%;
    margin: 0 auto;
    flex-direction: row;
    justify-content: space-evenly;
    height: fit-content;
    margin-bottom:.6em;
    align-items: center
  }
  li p {
    max-width:4em;
    min-width:3em
  }

  li button {
    margin: auto 0 auto 0
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .progress-area {
    width: 20%;
    position: sticky;
    top: 20px;
  }

  .current-workout {
    text-shadow: -4px -4px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
    color: white;
    display: flex;
    flex-direction:column;
    font-size:12em
  }

  .current-workout p {
    margin: 0
  }

nav {
  margin: 3em
}
.set-indicator {
  display:grid;
  grid-template-columns:var(--grid-width);
  
  height:10px;
}

.set {
  border:1px solid red;
}
</style>