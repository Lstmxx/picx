<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { UploadVideoModel, ElementPlusSizeEnum, VideoHandleResult } from '@/common/model'
import { store } from '@/stores'
import { getOSName } from '@/utils'
import GettingVideo from './components/getting-video/getting-video.vue'
import UploadVideoCard from './components/upload-video-card/upload-video-card.vue'
import { generateUploadVideoObject } from './utils/generate'

const userConfigInfo = computed(() => store.getters.getUserConfigInfo).value
const globalSettings = computed(() => store.getters.getGlobalSettings).value
const logoutStatus = computed(() => store.getters.getUserLoginStatus)
const uploading = ref(false)
const isCanDeploy = ref(false)

const shortcutKey = computed(() => (getOSName() === 'mac' ? '⌘' : 'Ctrl'))

const uploadVideoList = ref<UploadVideoModel[]>([])

const handleGettingVideoList = (result: VideoHandleResult[]) => {
  result.forEach((v) => {
    store.dispatch('UPLOAD_VIDEO_LIST_ADD', generateUploadVideoObject(v))
  })
}

const remove = (uuid: string) => {
  // todo
  console.log(uuid)
  store.dispatch('UPLOAD_VIDEO_LIST_REMOVE', uuid)
}

const uploadImage = () => {
  // todo
}

const resetUploadInfo = () => {
  uploadVideoList.value = []
  isCanDeploy.value = false
}

watch(
  () => logoutStatus,
  (_n) => {
    // 如果退出登录，清空信息
    // eslint-disable-next-line no-unused-expressions
    !_n && resetUploadInfo()
  }
)

watch(
  () => (store.state as any).uploadVideoListModule.uploadVideoList,
  (nv) => {
    uploadVideoList.value = nv
    isCanDeploy.value = uploadVideoList.value.some((x) => x.uploadStatus.progress === 100)
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<template>
  <div class="upload-page-container">
    <!-- 左侧 / 上传图片列表 -->
    <div
      class="upload-page-left page-container"
      v-if="uploadVideoList.length && globalSettings!.elementPlusSize !== ElementPlusSizeEnum.small"
    >
      <div class="uploaded-item" v-for="(item, index) in uploadVideoList" :key="index + item.uuid">
        <UploadVideoCard :video-item="item" @remove="remove($event)" />
      </div>
    </div>

    <!-- 右侧 / 上传操作 -->
    <div class="upload-page-right page-container" :class="{ 'has-left': uploadVideoList.length }">
      <!-- 选择图片区域 -->
      <div class="row-item">
        <div class="content-box">
          <GettingVideo :disabled="uploading" @get-video-list="handleGettingVideoList" />
        </div>
      </div>

      <!-- 状态信息区域 -->
      <div class="row-item">
        <div class="content-box upload-area-status">
          <selected-info-bar />
          <span class="upload-count" v-if="uploadVideoList.length">
            {{ $t('uploaded') }}：{{
              uploadVideoList.filter((x) => x.uploadStatus.progress === 100).length
            }}
            /
            {{ uploadVideoList.length }}
          </span>
        </div>
      </div>

      <!-- 部署 -->
      <div class="row-item" v-if="userConfigInfo.logined">
        <div class="content-box">
          <deploy-status-bar :disabled="!isCanDeploy" />
        </div>
      </div>

      <!-- 重置 & 上传   -->
      <div class="row-item" v-if="uploadVideoList.length">
        <div class="content-box operation-btn">
          <el-button :disabled="uploading" plain type="warning" @click="resetUploadInfo">
            {{ $t('reset') }} <span class="shortcut-key">{{ shortcutKey }} A</span>
          </el-button>
          <el-button :disabled="uploading" plain type="primary" @click="uploadImage">
            {{ $t('upload') }} <span class="shortcut-key">{{ shortcutKey }} S</span>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
@import "./upload-video.styl"
</style>
