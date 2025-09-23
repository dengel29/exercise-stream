<template>
  <div class="exercise-list">
    <transition-group
      :appear="false"
      name="set-list"
      tag="div"
      class="set-indicator"
      :style="setIndicatorStyles"
    >
      <div
        v-for="index in setAmount"
        :key="index"
        class="set neutral"
        :style="{ '--i': index }"
      ></div>
    </transition-group>
    <ol>
      <li v-for="(exercise, index) in exercises" :key="exercise.name" :data-id="index">
        <div class="move-position-buttons">
          <button @click="moveup(index)">&#9650;</button>
          <button @click="movedown(index)">&#9660;</button>
        </div>
        <p>{{ exercise.name }}</p>
        <p>{{ exercise.duration }}s</p>
        <button @click="removeExercise(index)">&#9447;</button>
      </li>
    </ol>
  </div>
</template>

<script setup>
const props = defineProps({
  exercises: Array,
  setAmount: Number,
  setIndicatorStyles: Object,
})

const emit = defineEmits(['remove-exercise', 'move-up', 'move-down'])

const removeExercise = (index) => {
  emit('remove-exercise', index)
}

const moveup = (index) => {
  emit('move-up', index)
}

const movedown = (index) => {
  emit('move-down', index)
}
</script>

<style scoped>
.set-list {
  height: 0.6em;
  order: -1;
}
.set {
  height: 0.6em;
  /* width: 100%; */
  transform: translateX(0px) translateY(0px) scale(1);
  opacity: 1;
  transition: all 0.8s ease;
}
.set-list-enter-from {
  height: 0.6em;
  opacity: 0;
  transition-delay: 0;
  transform: translateX(30px) translateY(30px) scale(0);
}
.set-list-leave-to {
  height: 0.6em;
  opacity: 0;
  transition-delay: 0;
  transform: translateX(400px) translateY(40px) scale(0);
}
li {
  display: grid;
  gap: 0.4em;
  grid-template-columns: 1em 5em 1em 1.2em;
  /* padding: 0em 0em 0.4em 0.4em; */
  border-radius: 3px;
  width: 95%;
  /* margin: 0 auto; */
  flex-direction: row;
  justify-content: space-evenly;
  height: fit-content;
  margin-bottom: 0.6em;
  align-items: center;
  border: 1px dotted var(--workout-green);
}
li p:last-of-type {
  font-size: 0.8em;
  margin-bottom: 0;
  padding-left: 1em;
  place-self: last baseline;
  justify-self: last baseline;
  margin-block-end: none;
}
li button:nth-of-type(1n) {
  border: none;
  width: 1.2em;
  height: 1.2em;
  display: grid;
  place-self: flex-start;
  place-content: center;
  background: #222c;
  color: white;
  font-size: 1em;
  font-weight: 700;
  border-radius: 0 0 0px 3px;
  cursor: pointer;
}
.exercise-list {
  margin: 0 auto;
  width: 50%;
  padding: 1em;
  background: whitesmoke;
  border-radius: 5px;
  border: 1px solid gainsboro
}
ol {
  padding: 0;
  list-style-type: none;
  max-height:20em;
  overflow: scroll;
}
ol:empty::before {
  content: 'Added exercises will appear here';
  width: 30px;
  height: 30px;
  font-style: oblique;
}
ol:empty::after {
  content: 'Added exercises will appear here';
  width: 30px;
  height: 30px;
  font-style: oblique;
}
.set-indicator {
  display: grid;
  grid-template-columns: var(--grid-width);
  height: 10px;
  gap: var(--gap);
  margin-bottom: 1em;
  transition: all 0.8s ease;
}
.set {
  border: 1px solid black;
  border-radius: 10px;
  box-shadow: 1px 1px;
}
.move-position-buttons {
  font-size: 0.8em;
}
.move-position-buttons button {
  border: none;
  background-color: hsla(var(--dark-slate), 1);
  color: white;
  font-weight: bold;
  cursor: pointer;
}
.move-position-buttons button:first-of-type {
  border-bottom: 2px solid var(--input-border);
  /* margin-bottom: -3px; */
  border-radius: 0px 2px 0px 0px;
  border-left: 1px solid hsla(var(--green), var(--border-shade));
}
.move-position-buttons button:last-of-type {
  margin-top: 0;
  border-radius: 0px 0px 2px 0px;
  border-top: 2px solid var(--input-border);
  border-left: 1px solid hsla(var(--green), var(--border-shade));
}
.neutral {
  border: 1px solid black;
}
</style>