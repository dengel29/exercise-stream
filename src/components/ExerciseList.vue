<template>
<button @click="generateURLParams">Gen</button>
<nav>
  <button @click="toggleWorkout">start workout</button><button @click="resetSetAndWorkouts">reset</button>
</nav>
<!-- Working Out View -->
<div v-if="!editing">
  <div class="workout-grid">
    <div class="progress-area">
           <div class="set-indicator" :style="setIndicatorStyles" v-if="setsComplete === -1">
            <div class="set" v-for="index in setAmount" :key="index"></div>
          </div>
        <div class="set-indicator" :style="setIndicatorStyles" v-else>
          <div class="set" style="background: green" v-for="index in setsComplete" :key="index"></div>
          <div class="set" v-for="index in setsLeft" :key="index"></div>
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
    <div v-if="currentWorkout" class="current-workout" @keyup.esc="pause">
      <p> 
        {{currentWorkout.name}}
      </p>
      <Timer :key="updater"
        @exerciseComplete="exerciseComplete"
        :duration=currentWorkout.duration
        :start-immediately=shouldStartImmediately
        >
      </Timer>
      <div v-if="currentWorkout.complete">Onto the next one</div>
    </div>
  </div>
</div>
<!-- Set and Exercise Input View -->
<div v-if="editing" class="editing-view">
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
            <input :disabled="!auto" type="number" v-model.number="restDuration">
          </label>
        </div>
        
    </div>
    </div>
    <div class="exercise-list">
      <!-- if it is auto or manual -->
        <!-- if it is auto how much break between workouts -->
      <!--  -->
      <div class="set-indicator" :style="setIndicatorStyles">
        <div class="set neutral" v-for="index in setAmount" :key="index">
        </div>
      </div>
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
      setsComplete: -1,
      auto: false,
      updater: 0,
      restDuration: 3,
      status: 'idle'
    }
  },
  methods: {
    generateURLParams: function() {
      // let exercises = toRaw(this.exercises)
      // console.log(this.exercises)
      // setAmount
      // restDuration
      // let exerciseString = "exercises="
      // this.exercises.forEach(e => {
      //   exerciseString = exerciseString.concat(new URLSearchParams(e).toString()).concat('&')
      // })
      // let setAmountString = this.setAmount
      // console.log(exerciseString)
      // let params = new URLSearchParams(texerc)
      // params.append('exercises', ["nea", "tdick"])
      // console.log(params.getAll('exercises'))
    },
    exerciseComplete: function() {
      // rests are exercises also, so checks if just completed 'resting' workout or normal workout
      if (!this.resting) {
        this.currentWorkout.complete = true
        this.status = 'resting'
        this.setCheck()
      } else {
        this.status = 'workingOut'
      }
    },
    setCheck: function() {
      // end the set if all workouts are complete
     if (this.exercises.every(exercise => exercise.complete)) {
        this.endSet()
      }
    },
    endSet() {
      // first set
      console.log("ending set")
      // this errors when there's ONLY ONE SET but is fine if there is more than one SET
      if (this.setsComplete === -1) {
        console.log('setscomplete is -1')
        this.setsComplete = 1
      // every set after first
      } 
      else {
        this.setsComplete++
        // last set
        if (this.setsLeft === 0 ) {
          return
        // any set besides last
        } 
      }
      this.resetWorkouts()
    },
    resetWorkouts() {
      this.exercises.forEach(ex => {
        ex.complete = false
        ex.timeLeft = ex.duration
      })
    },
    resetSetAndWorkouts() {
      this.setsComplete = -1
      this.resetWorkouts()
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
    shouldStartImmediately() {
      return this.anyExercisesComplete || this.setsComplete >= 0
    },
    currentWorkout() {
      // returns a 'resting' view with rest duration if resting, or the next incomplete workout in the set
      if (this.resting && this.exercises.every(e => !e.complete)) {
        return {name: "Big Break", duration: 5, complete: false}
      } else if (this.resting) {
        return {name: "Resting", duration: this.restDuration, complete: false}
      }
      else {
        return this.exercises.filter(e => !e.complete)[0]
      }
    },
    anyExercisesComplete() {
      return this.exercises.some(ex => ex.complete)
    },
    setsLeft() {
      return this.setAmount - this.setsComplete
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

  .editing-view {
    font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif
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
    font-size:10em;
    text-align: right
  }

  .current-workout p {
    margin: 0
  }

.exercise-list {
  margin: 0 auto
}

ol {
    padding: 0;
    list-style-type: none;
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

.neutral {
  border: 1px solid black;
}
</style>