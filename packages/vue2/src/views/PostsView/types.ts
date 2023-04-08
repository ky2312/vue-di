import type PostsModel from "./PostsModel";
import type PostsRemote from "./PostsRemote";
import type { GlobalDeps } from "@/types/container";

export interface Deps extends GlobalDeps {
  postsModel: PostsModel
  postsRemote: PostsRemote
}