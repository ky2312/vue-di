import { createScopeContainer } from "di";
import type { Deps } from "./types";
import PostsModel from './PostsModel'
import PostsRemote from './PostsRemote'

export class PostsController {
  get list() {return this._deps.postsModel.list}
  get detail() {return this._deps.postsModel.detail}
  get isVip() {return this._deps.userService.isHighLevel}
  private _t = undefined as (number | undefined)
  constructor(private _deps: Deps) {
    console.log('PostsController init')
  }
  public async getList() {
    const d = await this._deps.postsRemote.getList()
    this._deps.postsModel.setList(d)
  }
  public async getDetail(id: number) {
    const d = await this._deps.postsRemote.getDetail(id)
    this._deps.postsModel.setDetail(d)
  }
  public clearDetail() {
    this._deps.postsModel.detail = undefined
  }
  dispose() {
    console.log('PostsController dispose')
  }
}
let controller: PostsController | undefined
export function createController() {
  if (controller) return controller
  const container = createScopeContainer()
  container.register({PostsModel, PostsRemote})
  return controller = container.instance(PostsController)
}