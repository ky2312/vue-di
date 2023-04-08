
export interface Posts {
  userId: number
  id: number
  title: string
}
export interface PostsDetial extends Posts {
  body: string
}
export default class PostsModel {
  private _list: Posts[] = []
  get list() {return this._list}
  private _detail: PostsDetial | undefined
  get detail() {return this._detail}
  set detail(v) {this._detail = v}
  constructor() {
    console.log('PostsModel init')
  }
  public setList(list: Posts[]) {
    this._list = list
  }
  public setDetail(d: PostsDetial) {
    this._detail = d
  }
  dispose() {
    console.log('PostsModel dispose')
  }
}