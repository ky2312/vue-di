<script lang="ts">
import {defineComponent} from 'vue'
import {createController} from './PostsController'

export default defineComponent({
  data() {
    return {
      controller: createController(),
    }
  },
  computed: {
    detail() {
      return this.controller.detail
    },
  },
  created() {
    if (this.controller.isVip) {
      const id = Number.parseInt(this.$route.params.id)
      this.controller.getDetail(id)
      this.controller.clearDetail()
    } else {
      alert('你不是vip!')
    }
  },
  beforeDestroy() {
    // @ts-ignore
    // this.controller.dispose()
  },
  methods: {
    handleBack() {
      this.$router.back()
    }
  },
})
</script>

<template>
  <div>
    <div @click="handleBack">back</div>
    <div>
      {{detail?.body}}
    </div>
  </div>
</template>