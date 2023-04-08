import type UserModel from "@/models/UserModel";
import type UserService from "@/services/UserService";
import type {GlobalEventService} from 'di'
export interface GlobalDeps {
  userModel: UserModel
  userService: UserService
  globalEventService: GlobalEventService
} 