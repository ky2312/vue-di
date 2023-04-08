import type {Deps} from './types'

export default class TodoInputService {
  constructor(private _deps: Deps) {
    console.log('TodoInputService init')
  }
  push(content: string) {
    if (!content) throw new Error('content内容不能为空')
    this._deps.todoModel.push({content, done: false})
  }
  dispose() {
    console.log('TodoInputService dispose')
  }
}