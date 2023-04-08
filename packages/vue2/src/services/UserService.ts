import {Disposable, globalContainer, makeGlobalFlag} from 'di'
import type { GlobalDeps } from '@/types/container'

export default class UserService {
  public get isHighLevel() {return this._deps.userModel.user.level >= 5}
  public get isAdult() {return this._deps.userModel.user.age >= 18}
  public get username() {return this._deps.userModel.user.name}
  constructor(private _deps: GlobalDeps) {
    console.log('UserService init')
    
    this._deps.globalEventService.on('useUserInfo', (name: string) => {
      console.log('useUserInfo name', name)
    })
  }
  public upUserLevel() {
    this._deps.userModel.setUser({
      ...this._deps.userModel.user,
      level: 5,
    })
  }
  public downUserLevel() {
    this._deps.userModel.setUser({
      ...this._deps.userModel.user,
      level: 1,
    })
  }
  public dispose() {
    console.log('UserService dispose')
  }
}
makeGlobalFlag(UserService)