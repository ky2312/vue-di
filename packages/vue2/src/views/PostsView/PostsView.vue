<script lang="ts">
import {defineComponent} from 'vue'
import {createController} from './PostsController'
import type {Posts} from './PostsModel'

export default defineComponent({
  data() {
    return {
      controller: createController(),
    }
  },
  computed: {
    postsList() {
      return this.controller.list
    },
  },
  created() {
    this.controller.getList()
  },
  beforeDestroy() {
    // @ts-ignore
    // this.controller.dispose()
  },
  methods: {
    handleJumpDetail(item: Posts) {
      if (!this.controller.isVip) return alert('你不是vip!')
      // @ts-ignore
      this.$router.push({name: 'postsDetail', params: {id: item.id}})
    }
  },
})
</script>

<template>
  <div>
    <div
      v-for="(item, i) in postsList"
      :key="i"
      @click="handleJumpDetail(item)"
    >
      {{item.title}}
    </div>
  </div>
</template>