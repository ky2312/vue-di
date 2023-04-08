import type {Deps} from './types'

export default class TodoListService {
  get list() {return this._deps.todoModel.todos}
  constructor(private _deps: Deps) {
    console.log('TodoListService init')
  }
  checkTodo(i: number) {
    this._deps.todoModel.check(i)
  }
  dispose() {
    console.log('TodoListService dispose')
  }
}