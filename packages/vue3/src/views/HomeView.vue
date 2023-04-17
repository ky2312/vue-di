<script setup lang="ts">
import {reactive, ref} from 'vue'
import {globalContainer} from 'di'
import type { UserService } from '@/services/UserService';

const usernameBuf = ref('')
const user = reactive(globalContainer.resolve<UserService>('userService'))
const setUsername = () => {
  user.setUsername(usernameBuf.value)
  usernameBuf.value = ''
}
</script>

<template>
  <div>
    <div>name: {{user.username}}</div>
    <div>
      <input v-model="usernameBuf" />
      <button @click="setUsername">修改</button>
    </div>
  </div>
</template>
