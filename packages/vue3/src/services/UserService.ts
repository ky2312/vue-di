import {makeGlobalFlag} from 'di'
import type {UserModel} from '@/models/UserModel'

interface Deps {
  userModel: UserModel
}
export class UserService {
  get username() {return this._deps.userModel.name}
  constructor(private _deps: Deps) {}
  setUsername(name: string) {
    return this._deps.userModel.setName(name)
  }
}
makeGlobalFlag(UserService)