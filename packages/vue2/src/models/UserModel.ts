import {Disposable, globalContainer, makeGlobalFlag} from 'di'
import type {User} from '@/types/user'

export default class UserModel {
  private _user: User = {
    name: '用户1',
    age: 20,
    level: 1,
  }
  public get user() {return this._user}
  constructor() {
    console.log('UserModel init')
  }
  public setUser(item: User) {
    this._user = item
  }
  public dispose() {
    this._user = {
      name: 'xxx',
      age: 1,
      level: 1,
    }
    console.log('UserModel dispose')
  }
}
makeGlobalFlag(UserModel)