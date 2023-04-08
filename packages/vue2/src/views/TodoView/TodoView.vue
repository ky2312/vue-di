<script lang="ts">
import {defineComponent} from 'vue'
import createTodoController from './TodoController'
import {useCounterStore} from '@/stores/counter'

export default defineComponent({
  setup() {
    const counterStore = useCounterStore()
    return {
      counterStore,
    }
  },
  data() {
    return {
      newTodoContent: '',
      todoController: createTodoController(),
    }
  },
  computed: {
    todos() {
      return this.todoController?.todos ?? []
    },
    counter() {
      return `${this.counterStore.counter}-${this.counterStore.doubleCount}`
    },
  },
  created() {
  },
  beforeDestroy() {
    this.todoController?.dispose()
  },
  methods: {
    addNewTodo() {
      if (!this.todoController?.validUser()) return alert('你不是有效用户!')
      try {
        this.todoController?.push(this.newTodoContent)
        this.newTodoContent = ''
      } catch (error: any) {
        alert(error.message)
      }
    },
    checkTodo(i: number) {
      this.todoController?.check(i)
    },
    count() {
      this.counterStore.increment()
    },
  },
})
</script>

<template>
  <div>
    <h1 @click="count">TodosList Demo {{counter}}</h1>

    <div>
      <input type="text" class="input-todo" v-model="newTodoContent">
      <button class="new-todo-btn" @click="addNewTodo">新增</button>
    </div>

    <ul>
      <li 
        v-for="({content, done}, index) in todos" 
        v-show="!done"
        @click="checkTodo(index)"
      >
        {{content}}
      </li>
    </ul>

    <br/>
    <li v-for="(item, index) in todos">
      {{item}}
    </li>
  </div>
</template>