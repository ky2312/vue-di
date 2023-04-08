import Vue from 'vue'
import VueRouter from 'vue-router'
import TodoView from '../views/TodoView/TodoView.vue'
import PostsView from '../views/PostsView/PostsView.vue'
import PostsDetailView from '../views/PostsView/PostsDetailView.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes: [
    {
      path: '/todo',
      name: 'todo',
      component: TodoView,
    },
    {
      path: '/posts',
      name: 'posts',
      component: PostsView,
    },
    {
      path: '/posts/:id',
      name: 'postsDetail',
      component: PostsDetailView,
    },
  ]
})

export default router
