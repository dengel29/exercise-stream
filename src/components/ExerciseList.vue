<template>
<nav style="margin-right:3em;">
  <button @click="toggleWorkout">
    {{buttonText}}</button>
  <button @click="resetSetAndWorkouts">
    reset
  </button>
  <!-- <button @click="generateURLParams">
    Gen
  </button> -->
  <br>
</nav>
<!-- Working Out View -->
<div v-if="!editing" class="styles">
  <div class="workout-grid" ref="workoutarea" @dragover="dragOver" @drop="drop">
    <div class="progress-area">
      <h1 >Current Progress</h1>
           <div class="set-indicator" :style="setIndicatorStyles" v-if="setsComplete === -1">
            <div class="set" v-for="index in setAmount" :key="index"></div>
          </div>
        <div class="set-indicator" :style="setIndicatorStyles" v-else>
          <div class="set complete" v-for="index in setsComplete" :key="index"></div>
          <div class="set" v-for="index in setsLeft" :key="index"></div>
        </div>
      <div class="workouts">
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
    <div class="timer-ui-control">
      <h1> Swap timer UI </h1>
      <button @click="timerBottom"> <img title="Position the timer to the bottom of the exercise name" :src="timerBottomSVG"/> </button>
      <button @click="timerTop"> <img title="Position the timer to the top of the exercise name" :src="timerTopSVG"/> </button>
      <button @click="timerLeft"> <img title="Position the timer to the left of the exercise name" :src="timerLeftSVG"/> </button>
      <button @click="timerRight"> <img title="Position the timer to the right of the exercise name" :src="timerRightSVG"/> </button>
      <button @click="noText"> <img title="Position the timer to the right of the exercise name" :src="timerNoTextSVG"/> </button>
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
      <p :style="textDisplay"> 
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
        <!-- <p v-if="exercises.length === 0"> no good</p> -->
        <ol>
          <li v-for="(exercise, index) in exercises" :key="exercise.name" :data-id="index">
            <div class="move-position-buttons">
              <button @click="moveup(index)">&#9650;</button>
              <button @click="movedown(index)">&#9660;</button>
            </div>
            <p>{{exercise.name}}</p>
            <p>{{exercise.duration}}s</p>
            <button style="color: black; border: none; margin-left: 1em; cursor: pointer" @click="removeExercise(index)">
              &#9447;
            </button>
          </li>
        </ol>
      </div>
    </div>
</div>
</template>

<script>
import Timer from './Timer.vue';
import timerLeftSVG from "@/assets/timerLeft.svg"
import timerRightSVG from "@/assets/timerRight.svg"
import timerBottomSVG from "@/assets/timerBottom.svg"
import timerTopSVG from "@/assets/timerTop.svg"
import timerNoTextSVG from "@/assets/timerNoText.svg"

export default {
  setup() {
    return {
      timerLeftSVG, timerRightSVG, timerBottomSVG, timerTopSVG, timerNoTextSVG
    }
  },
  components: {
    Timer
  },
  data: function() {
    return {
      exercises: [],
      dragging: false,
      currentExerciseX: 10,
      currentExerciseY: 10,
      currentWorkoutDisplayDirection: 'column',
      currentWorkoutDisplayReverse:'',
      currentWorkoutDisplayText: 'block',
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
    // toggleDisplayDirection() {
    //   currentWorkoutDisplayDirection
    // },
    noText:function() {
      console.log('hihi')
      this.currentWorkoutDisplayText = 'none'
      console.log(this.currentWorkoutDisplayText)
    },
    timerTop: function() {
        this.currentWorkoutDisplayDirection = 'column' 
        this.currentWorkoutDisplayReverse = ''
        this.currentWorkoutDisplayText = 'block'
    },
    timerBottom: function() {
      console.log('hey')
        this.currentWorkoutDisplayDirection = 'column' 
        this.currentWorkoutDisplayReverse = '-reverse'
        this.currentWorkoutDisplayText = 'block'
    },
    timerRight: function() {
      console.log('hey')
        this.currentWorkoutDisplayDirection = 'row' 
        this.currentWorkoutDisplayReverse = '-reverse'
        this.currentWorkoutDisplayText = 'block'
    },
    timerLeft: function() {
      console.log('hey')
        this.currentWorkoutDisplayDirection = 'row' 
        this.currentWorkoutDisplayReverse = ''
        this.currentWorkoutDisplayText = 'block'
    },
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
    buttonText() {
      return this.editing ? 'Start Workout' : 'Edit Workout'
    },
    timerPosition() {
      return {
        '--timer-x': `${this.currentExerciseX}`,
        '--timer-y': `${this.currentExerciseY}`,
        '--direction': `${this.currentWorkoutDisplayDirection}${this.currentWorkoutDisplayReverse}`,
      }
    },
    textDisplay() {
      return {
        '--display' : `${this.currentWorkoutDisplayText}`
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
    toggleWorkoutDisplayReverse: {
      handler(value) {
        console.log(value)
        // this.setURLParams("setAmount", value)
        if(value) {
          this.currentWorkoutDisplayReverse = '-reverse'
        }  else {
          this.currentWorkoutDisplayReverse = ''
        }
      }
    },
    toggleWorkoutDisplayDirection: {
      handler(value) {
        if (value) {
          this.currentWorkoutDisplayDirection = "row"
        } else {
          this.currentWorkoutDisplayDirection = "column"
        }
        // this.setURLParams("setAmount", value)
      }
    },
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
@mixin smallh1 {
   margin: 0px 0px 0.4em 0px;
  font-size:1em;
}
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
    height: 80vh;
    width: 99vw;
    .timer-ui-control {
      h1{ 
        @include smallh1;
        color: white;
      };
      display: flex; 
      background-color: hsla(245,25%,25%, 0.9);
      flex-wrap: wrap;
      justify-content: space-around;
      flex-direction: row; 
      width: 4em; 
      position: absolute; 
      right: 0;
      
      align-items: center;
      border:3px solid hsla(245,25%,20%, 1);
      border-radius:3px;
      button {
        display:flex;
        justify-content:center;
        border: none;
        background-color:hsla(245,25%,10%, 1);
        margin:0.2em;
        border: 1px solid rgba(0, 0, 0, 0.4);;
        border-radius:3px;
        width: 28px;
        height: 28px;
        &:hover {
          cursor: pointer
        }
      }
    }
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
    border: 1px dotted black;
    background: rgba(0, 0, 0, 0.1)
  }
  .grid {
    display: grid;
    grid-template-columns: 20em 20em 1fr;
    padding-top: 3em;
  }

  .progress-area {
    width: 30%;
    border: 3px solid hsla(245,25%,20%, 1);
    position: sticky;
    top: 20px;
    background-color: hsla(245,25%,25%, 0.9);
    color: white;
    height:max-content;
    padding:0.4em;
    border-radius:3px;
    height: 100%;
    .set {
      border: 1px solid white;
      box-shadow: 1px 1px;
    }
    h1 {
      @include smallh1
    }
  }

  .exercise-pill {
    margin: 0px 0px .2em;
    border-radius: 3px;
    font-size:1.6em;
  }
  .current-workout {
    align-items: center;
    position:absolute;
    top: var(--timer-y);
    left: var(--timer-x);
    text-shadow: -4px -4px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
    color: white;
    display: flex;
    flex-direction:var(--direction);
    font-size:6em;
  }

  .current-workout p {
    margin: 0;
    width: 4em;
    display: var(--display)
  }

.exercise-list {
  margin: 0 auto;
  width:50%;
}

ol {
    padding: 0;
    list-style-type: none;
}
ol:empty::before {
  content: 'Added exercises will appear here';
  font-style: oblique
}
nav {
  display:flex;
  width:100%;
  height:max-content;
  background-color: hsla(245,25%,25%, 0.9);
  margin-top:0;
  padding:0.2em;
  margin-bottom:0.2em;
  align-items:center;
  justify-content:flex-end
}
.set-indicator {
  display:grid;
  grid-template-columns: var(--grid-width);
  height:10px;
  gap: 3px;
  margin-bottom:1em;
}

.set {
  border:1px solid black;
  border-radius:10px;
  box-shadow: 1px 1px;
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