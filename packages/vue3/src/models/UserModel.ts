import {makeGlobalFlag} from 'di'

export interface User {
  name: string
  age: number
}
export class UserModel {
  private _user: User = {
    name: 'user1',
    age: 10,
  }
  get name() {return this._user.name}
  get age() {return this._user.age}
  setName(name: string) {
    this._user.name = name
  }
}
makeGlobalFlag(UserModel)