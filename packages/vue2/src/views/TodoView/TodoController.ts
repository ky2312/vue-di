import TodoModel from './TodoModel.js'
import TodoInputService from './TodoInputService.js'
import TodoListService from './TodoListService.js'
import {createScopeContainer} from 'di'
import type {Deps} from './types'

export class TodoController {
  get todos() {
    return this._deps.todoListService?.list ?? []
  }
  get isVip() {
    return this._deps.userService.isHighLevel
  }
  constructor(private _deps: Deps) {
    console.log('TodoController init')
    
    this._deps.globalEventService.emit('useUserInfo', TodoController.name)
  }
  push(content: string) {
    this._deps.todoInputService.push(content)
  }
  check(i: number) {
    this._deps.todoListService.checkTodo(i)
  }
  validUser() {
    return this._deps.userService.isAdult && this._deps.userService.isHighLevel
  }
  switchLevel(isUp = true) {
    if (isUp) {
      this._deps.userService.upUserLevel()
    } else {
      this._deps.userService.downUserLevel()
    }
  }
  dispose() {
    console.log('TodoController dispose')
  }
}

const scopeContainer = createScopeContainer()
scopeContainer.register({
  todoModel: TodoModel,
  todoListService: TodoListService,
  todoInputService: TodoInputService,
})
export default () => {
  scopeContainer.reload()
  return scopeContainer.instance(TodoController)
}
