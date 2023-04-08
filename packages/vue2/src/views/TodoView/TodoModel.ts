
import type {Todo} from '@/types/todo'

export default class TodoModel {
  private _todos: Todo[] = [{content: 'Make PPT!', done: false}]
  get todos() {return this._todos}
  constructor() {
    console.log('TodoModel init')
  }
  push(item: Todo) {
    this._todos.push(item)
  }
  check(i: number) {
    this._todos[i].done = !this._todos[i].done
  }
  dispose() {
    this._todos = []
    console.log('TodoModel dispose')
  }
}