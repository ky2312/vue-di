import type { Posts, PostsDetial } from "./PostsModel"

export default class PostsRemote {
  constructor() {
    console.log('PostsRemote init')
  }
  async getList(): Promise<Posts[]> {
    return await (await fetch('http://jsonplaceholder.typicode.com/posts')).json()
  }
  async getDetail(id: number): Promise<PostsDetial> {
    return await (await fetch('http://jsonplaceholder.typicode.com/posts/' + id)).json()
  }
  dispose() {
    console.log('PostsRemote dispose')
  }
}