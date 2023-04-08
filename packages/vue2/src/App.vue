<script lang="ts">
import {defineComponent} from 'vue'
import {globalContainer} from 'di'
import type { GlobalDeps } from './types/container'

export default defineComponent({
  setup() {

  },
  data() {
    return {
      controller: globalContainer.resolve<GlobalDeps['userService']>('userService'),
      routes: [
        {name: 'Home', to: '/'},
        {name: 'Todo', to: '/todo'},
        {name: 'Posts', to: '/posts'},
      ],
    }
  },
  computed: {
    isVip() {
      return this.controller.isHighLevel
    },
  },
  created() {

  },
  methods: {
    upVip() {
      this.controller.upUserLevel()
    },
    downVip() {
      this.controller.downUserLevel()
    }
  },
})
</script>

<template>
  <div id="app">
    <header>
      <div>
        <div>
          <strong v-if="!isVip" @click="upVip">成为vip</strong>
          <strong v-else @click="downVip">解除vip</strong>
        </div>
      </div>
      <nav>
        <router-link
          class="nav__item"
          v-for="({name, to}, i) in routes"
          :to="to"
          :key="i"
        >{{name}}</router-link>
      </nav>
    </header>

    <router-view />
  </div>
</template>

<style scoped>
.nav__item {
  margin: 5px;
}
header {
  border-bottom: 1px solid #000;
}
</style>
