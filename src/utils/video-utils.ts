import { computed } from 'vue'
import { UploadedVideoModel, UploadVideoModel } from '@/common/model'
import { store } from '@/stores'
import { copyText } from './common-utils'
import i18n from '@/plugins/vue/i18n'

/**
 * 视频 File 格式转 Base64 格式
 * @param file
 */
export function videoFileToBase64(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result as string
      resolve(base64)
    }
    reader.onerror = () => resolve(null)
  })
}

/**
 * 生成一个上传的视频对象
 */
export const createUploadVideoObject = (): UploadVideoModel => {
  return {
    uuid: '',
    objectURL: '',
    base64: {
      originalBase64: '',
      watermarkBase64: null,
      compressBase64: null
    },
    fileInfo: {
      originalFile: null,
      compressFile: null,
      watermarkFile: null
    },
    filename: {
      hash: '',
      suffix: '',
      name: '',
      prefix: '',
      final: '',
      initName: '',
      newName: '',
      isAddHash: true,
      isRename: false,
      isAddPrefix: false
    },
    uploadStatus: {
      progress: 0,
      uploading: false
    },
    reUploadInfo: {
      dir: '',
      path: '',
      isReUpload: false
    }
  }
}

/**
 * 文件名称添加前缀的处理
 * @param filename
 * @param isAddPrefix
 */
export const addPrefixHandle = (
  filenameObj: UploadVideoModel['filename'],
  isAddPrefix: boolean
) => {
  filenameObj.isAddPrefix = isAddPrefix
  if (isAddPrefix) {
    filenameObj.name = `${filenameObj.prefix}${filenameObj.initName}`
  } else {
    filenameObj.name = `${filenameObj.initName}`
  }
  if (filenameObj.isAddHash) {
    filenameObj.final = `${filenameObj.name}.${filenameObj.hash}.${filenameObj.suffix}`
  } else {
    filenameObj.final = `${filenameObj.name}.${filenameObj.suffix}`
  }
}

/**
 * 文件名称添加哈希值的处理
 * @param filenameObj
 * @param isAddHash
 */
export const addHashHandle = (filenameObj: UploadVideoModel['filename'], isAddHash: boolean) => {
  filenameObj.isAddHash = isAddHash
  if (isAddHash) {
    filenameObj.final = `${filenameObj.name}.${filenameObj.hash}.${filenameObj.suffix}`
  } else {
    filenameObj.final = `${filenameObj.name}.${filenameObj.suffix}`
  }
}

/**
 * 重命名
 * @param filenameObj
 * @param isRename
 */
export const rename = (
  filenameObj: UploadVideoModel['filename'],
  isRename: boolean,
  isAddPrefix: boolean
) => {
  filenameObj.isRename = isRename

  if (isRename) {
    filenameObj.name = filenameObj.newName.trim().replace(/\s+/g, '-')
  } else {
    addPrefixHandle(filenameObj, isAddPrefix) // 恢复列表 prefix 选项
  }

  if (filenameObj.isAddHash) {
    filenameObj.final = `${filenameObj.name}.${filenameObj.hash}.${filenameObj.suffix}`
  } else {
    filenameObj.final = `${filenameObj.name}.${filenameObj.suffix}`
  }
}

/**
 * 生成一个视频链接
 * @param videoObj
 */
export const generateVideoLink = (videoObj: UploadedVideoModel): string | null => {
  const userConfigInfo = computed(() => store.getters.getUserConfigInfo).value
  const userSettings = computed(() => store.getters.getUserSettings).value

  const { selected } = userSettings.imageLinkType
  const { rule } = userSettings.imageLinkType.presetList[selected]
  if (rule) {
    const { owner, repo, branch } = userConfigInfo
    return rule
      .replaceAll('{{owner}}', owner)
      .replaceAll('{{repo}}', repo)
      .replaceAll('{{branch}}', branch)
      .replaceAll('{{path}}', videoObj.path)
  }
  return null
}

const copyMessage = (autoCopy = false) => {
  const message: string = autoCopy
    ? i18n.global.t('copy_success_1')
    : i18n.global.t('copy_success_2')

  ElMessage({
    type: autoCopy ? 'info' : 'success',
    message,
    duration: autoCopy ? 6000 : 4000
  })
}

/**
 * 复制单个视频链接
 * @param videoObj
 * @param autoCopy
 */
export const copyVideoLink = (videoObj: UploadedVideoModel, autoCopy: boolean = false) => {
  const link = generateVideoLink(videoObj)
  if (link) {
    copyText(link, () => {
      copyMessage(autoCopy)
    })
  } else {
    ElMessage.error({ message: i18n.global.t('copy_fail_1') })
  }
}
