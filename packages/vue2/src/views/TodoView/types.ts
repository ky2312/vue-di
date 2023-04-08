import type TodoModel from "./TodoModel";
import type TodoListService from "./TodoListService";
import type TodoInputService from "./TodoInputService";
import type { GlobalDeps } from "@/types/container";

export interface Deps extends GlobalDeps {
  todoModel: TodoModel
  todoListService: TodoListService
  todoInputService: TodoInputService
}