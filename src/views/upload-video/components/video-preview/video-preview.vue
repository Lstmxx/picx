<script lang="ts" setup>
import { ref } from 'vue'
import { UploadVideoModel } from '@/common/model'

const dialogVisible = ref(false)

const videoData = ref<UploadVideoModel | null>(null)

const handleOpen = (videoItem: UploadVideoModel) => {
  dialogVisible.value = true
  videoData.value = videoItem
}

defineExpose({
  handleOpen
})
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="videoData?.filename.final" width="800">
    <video
      v-if="videoData?.objectURL"
      :src="videoData?.objectURL"
      controls
      autoplay
      class="video"
    ></video>
  </el-dialog>
</template>

<style scoped lang="stylus">
.video {
  width 100%
  height 100%
  max-height 60vh
  background #000
}
</style>
