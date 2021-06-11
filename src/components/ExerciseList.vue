<template>
<nav>
  <button @click="toggleWorkout">
    start workout</button>
  <button @click="resetSetAndWorkouts">
    reset
  </button>
  <button @click="generateURLParams">
    Gen
  </button>
</nav>
<!-- Working Out View -->
<div v-if="!editing" class="styles">
  <div class="workout-grid" ref="workoutarea" @dragover="dragOver" @drop="drop">
    <div class="progress-area">
           <div class="set-indicator" :style="setIndicatorStyles" v-if="setsComplete === -1">
            <div class="set" v-for="index in setAmount" :key="index"></div>
          </div>
        <div class="set-indicator" :style="setIndicatorStyles" v-else>
          <div class="set complete" v-for="index in setsComplete" :key="index"></div>
          <div class="set" v-for="index in setsLeft" :key="index"></div>
        </div>
      <div class="workouts">
        <h2>Current Progress</h2>
        <div 
          class="exercise-pill"
          v-for="exercise in exercises" 
          :key="exercise.name"
          :class="[
            (exercise === currentExercise ? 'current-exercise': ''), 
            (exercise.complete ? 'complete' : '')]">
          {{exercise.name}}
        </div>
      </div>
    </div>
    <div v-if="!currentExercise">
      WORKOUT COMPLETE
    </div>
    <div v-if="currentExercise" :style="timerPosition" class="current-workout" :class="dragging ? grabbing : 'grab'" draggable="true" ref="currentExercise" @dragstart="dragStart" @mouseover="addGrabClass" @mouseleave="removeGrabClass">
      <Timer :key="updater"
        @exerciseComplete="exerciseComplete"
        :duration=currentExercise.duration
        :start-immediately=shouldStartImmediately
        >
      </Timer>
      <p> 
        {{currentExercise.name}}
      </p>
    </div>
  </div>
</div>
<!-- Set and Exercise Input View -->
<div v-if="editing" class="editing-view styles">
  <div class="grid">
    <div class="higher-level-controls">
      <!-- how many sets -->
      <div class="exercise-inputs">
        <label for="">
          Set #
          <input type="number" min='1' v-model.number="setAmount">
        </label>  
        <label for="">
          Duration of break between exercises
          <input type="number" v-model.number="restDuration">
        </label>
          <label for="">
          Duration of break between sets
          <input type="number" v-model.number="bigBreakDuration">
        </label>
      </div>
    </div>
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
              <button @click="moveup(index)">&#9650;</button>
              <button @click="movedown(index)">&#9660;</button>
            </div>
            <p>{{exercise.name}}</p><p>{{exercise.duration}}s</p>
            <button style="color: black; border: none; margin-left: 1em; cursor: pointer" @click="removeExercise(index)">&#9447;</button>
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
      exercises: [],
      dragging: false,
      currentExerciseX: 10,
      currentExerciseY: 10,
      editing: true,
      setAmount: 2,
      setsComplete: -1,
      updater: 0,
      restDuration: 3,
      bigBreakDuration: 10,
      status: 'idle',
      grabbing: 'grabbing',
      channel: null
    }
  },
  mounted: function() {
    // browser channel experiment

    // url param detection and updating data from URL params
    let url = new URL(document.location)
    if (url.searchParams.has("x") && url.searchParams.has("y")) {
      this.currentExerciseX = url.searchParams.get("x")
      this.currentExerciseY = url.searchParams.get("y")
    }
    if (url.searchParams.has("exercises")) {
      this.exercises = JSON.parse(decodeURIComponent(url.searchParams.get("exercises")))
    }
    if (url.searchParams.has("setAmount")) {
      this.setAmount = Number(url.searchParams.get("setAmount"))
    }
    if (url.searchParams.has("restDuration")) {
      this.restDuration = Number(url.searchParams.get("restDuration"))
    }
    if (url.searchParams.has("bigBreakDuration")) {
      this.bigBreakDuration = Number(url.searchParams.get("bigBreakDuration"))
    }
  },
  methods: {
    addGrabClass: function() {
      this.$refs.currentExercise.classList.add('grab')
    },
    removeGrabClass: function() {
      this.$refs.currentExercise.classList.remove('grab')
    },
    dragStart: function (event) {
      this.dragging = true
      var style = window.getComputedStyle(event.target, null);
      event.dataTransfer.setData("text/plain",
      (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
    }, 
    dragOver: function (event) {
      event.preventDefault(); 
      return false; 
    },
    drop: function (event) {
      this.dragging = false;
      var offset = event.dataTransfer.getData("text/plain").split(',');
      // var dm = this.$refs.currentExercise
      this.currentExerciseX = (event.clientX + parseInt(offset[0],10)) + 'px';
      this.currentExerciseY = (event.clientY + parseInt(offset[1],10)) + 'px';
    
      this.setURLParams("x", this.currentExerciseX)
      this.setURLParams("y", this.currentExerciseY)
      event.preventDefault();
      return false;
    },
    setURLParams: function(param, value) {
      const url = new URL(document.location)
      if (typeof value === "string" || typeof value === 'number') {
        url.searchParams.set(param, value)
      }
      if (typeof value === "object") {
        url.searchParams.set(param, encodeURIComponent(JSON.stringify(value)))
      }
      window.history.pushState({}, '', url);
    },
    generateURLParams: function() {
      this.channel.postMessage(JSON.parse(JSON.stringify(this.exercises)));
      this.setURLParams("exercises", this.exercises)
    },
    exerciseComplete: function() {
      // rests are exercises also, so checks if just completed 'resting' workout or normal workout
      if (!this.resting) {
        this.currentExercise.complete = true
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
      this.$refs.exercisename.focus();
      this.setURLParams("exercises", this.exercises)
    },
    removeExercise: function(index) {
      this.exercises.splice(index, 1)
      this.setURLParams("exercises", this.exercises)
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
      this.setURLParams("exercises", this.exercises)
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
      this.setURLParams("exercises", this.exercises)
    }
  },
  computed: {
    setIndicatorStyles() {
      return {
        '--grid-width': `repeat(${this.setAmount}, minmax(0, 1fr))`,
      }
    },
    timerPosition() {
      return {
        '--timer-x': `${this.currentExerciseX}`,
        '--timer-y': `${this.currentExerciseY}`
      }
    },
    shouldStartImmediately() {
      return this.anyExercisesComplete || this.setsComplete >= 0
    },
    currentExercise() {
      // returns a 'resting' view with rest duration if resting, or the next incomplete workout in the set
      if (this.resting && this.exercises.every(e => !e.complete)) {
        return {name: "Big Break", duration: this.bigBreakDuration, complete: false}
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
    setAmount: {
      handler(value) {
        this.setURLParams("setAmount", value)
      }
    },
    restDuration: {
      handler(value) {
        this.setURLParams("restDuration", value)
      }
    },
    bigBreakDuration: {
      handler(value) {
        this.setURLParams("bigBreakDuration", value)
      }
    },
    currentExercise: {
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

<style scoped lang="scss">

.styles {
    --workout-green: #41b983;
    --input-border: 3px solid var(--workout-green);
  }
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
    align-items:center;
    
    label {
      display: inherit;
      align-items: inherit  
    }
    input {
      border: none;
      padding-left: 4px;
      border-left: 3px solid black;
      border-bottom:3px solid black;
      border-radius: 3px;
    }
    input:focus {
      border: none;
      outline: none;
      border-left: var(--input-border);
      border-bottom:var(--input-border);
      border-radius: 3px;
    }
    input[type=number] {
      width: 2.2em;
      
    }
  }

  .complete {
    background: var(--workout-green)
  }

  .exercise-inputs button {
    height: 50%;
    margin-top: 1em;
  }

  .editing-view {
    font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif
  }

  .workout-grid {
    display: grid;
    position:relative;
    grid-template-columns: 1fr 1fr;
    height: 80vh
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
    margin-bottom: 0;
    padding: 0;
    text-align: center

  }
  .grab {
    cursor: grab
  }
  .grabbing {
    cursor: grabbing;
    border: 1px dotted black
  }
  .grid {
    display: grid;
    grid-template-columns: 20em 20em 1fr;
    padding-top: 3em;
  }

  .progress-area {
    width: 20%;
    position: sticky;
    top: 20px;
    background-color: hsla(245,25%,20%, 0.9);
    color: white;
    height:max-content;
    padding:0.4em;
    border-radius:3px;
    .set {
      border: 1px solid white
    }
  }

  .exercise-pill {
    margin: 0px 0px .2em;
    border-radius: 3px;
  }
  .current-workout {
    align-items: center;
    position:absolute;
    top: var(--timer-y);
    left: var(--timer-x);
    text-shadow: -4px -4px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
    color: white;
    display: flex;
    flex-direction:column;
    font-size:6em;
  }

  .current-workout p {
    margin: 0;
    width: 4em
  }

.exercise-list {
  margin: 0 auto;
  width:50%;
}

ol {
    padding: 0;
    list-style-type: none;
}
nav {
  position:absolute;
  top:0;
  right:0
}
.set-indicator {
  display:grid;
  grid-template-columns: var(--grid-width);
  height:10px;
  gap: 3px;
}

.set {
  border:1px solid black;
  border-radius:10px
}
.move-position-buttons {
  margin-right:0.2em;
  font-size:1em;
  button{
    width:2em;
  }
}

.neutral {
  border: 1px solid black;
}

.current-exercise {
  border: 2px solid var(--workout-green)
}
</style>