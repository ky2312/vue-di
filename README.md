/packages/di 为核心

/packages/vue2 为vue2示例

/packages/vue3 为vue3示例

## 如何使用

### 全局

具体请参照 /packages/vue2 或 /packages/vue3 内的示例代码。

```ts
// UserModel.ts
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
```

```ts
// UserService.ts
import {makeGlobalFlag} from 'di'
import {UserModel} from './UserModel'

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
```

```ts
// main.ts
import {globalContainer} from 'di'
import {UserModel} from './UserModel'
import {UserService} from './UserService'

globalContainer.register({
  UserModel, 
  UserService,
})

// vue...
```

```vue
// App.vue
<script lang='ts'>
import {globalContainer} from 'di'
import {defineComponent} from 'vue'
import {UserService} from './UserService'

export default defineComponent({
  data() {
    return {
      usernameBuf: '',
      userService: globalContainer.resolve<UserService>('userService'),
    }
  },
  computed: {
    username() {
      return this.userService.username
    },
  },
  methods: {
    setUsername() {
      this.userService.setUsername(this.usernameBuf)
      this.usernameBuf = ''
    }
  },
})
</script>

<template>
  <div>
    <div>name: {{username}}</div>
    <div>
      <input v-model="usernameBuf" />
      <button @click="setUsername">修改</button>
    </div>
  </div>
</template>
```

### 局部

具体请参照 /packages/vue2/src/views/PostsView/PostsView.vue 内的示例代码。
