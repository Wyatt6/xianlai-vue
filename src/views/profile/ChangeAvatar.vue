<template>
  <el-dialog :model-value="show" title="更换头像" @close="onClose()">
    <div class="avatar-wrap">
      <el-avatar shape="circle" :size="150" :src="selectedAvatar" />
    </div>
    <div class="btn-wrap">
      <el-upload
        class="upload-btn"
        ref="uploadRef"
        v-model:file-list="fileList"
        :show-file-list="false"
        :limit="1"
        :on-change="onChange"
        :on-exceed="onExceed"
        :on-success="onSuccess"
        :on-error="onError"
        :auto-upload="false"
        action="/api/iam/user/uploadAvatar"
        :headers="{ token: Storage.get(Storage.keys.TOKEN) }"
      >
        <template #trigger>
          <el-button type="primary" plain :loading="loading">选择图片</el-button>
        </template>
        <el-button style="margin-left: 1rem" type="primary" @click="submitUpload" :loading="loading">确定上传</el-button>
      </el-upload>
    </div>
    <div class="tips-wrap">格式为jpeg/jpg/png/bmp，大小不超过500KB</div>
  </el-dialog>
</template>

<script setup>
import FailPicture from '@/assets/images/fail_picture.png'
import { ref, watch } from 'vue'
import { ElMessage, genFileId } from 'element-plus'
import Storage from '@/utils/storage'
import { getExtension } from '@/utils/file'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
    required: true
  },
  nowAvatarImg: {
    type: String,
    default: null,
    required: false
  }
})
const emits = defineEmits(['close', 'success'])

const uploadRef = ref(null)
const fileList = ref([])
const selectedAvatar = ref(null)
const loading = ref(false)

watch(
  () => props.show,
  (value, oldValue) => {
    if (value === true) {
      // 初始化
      fileList.value = []
      selectedAvatar.value = props.nowAvatarImg != null ? props.nowAvatarImg : FailPicture
      loading.value = false
    }
  },
  { immediate: true }
)

function onChange(file) {
  if (file.size > 500 * 1024) {
    ElMessage.error('头像图片大小为' + Math.ceil(file.size) / 1024 + 'KB，无法上传')
  } else if (!['jpeg', 'jpg', 'png', 'bmp'].includes(getExtension(file))) {
    ElMessage.error('不支持该头像文件格式')
  } else {
    selectedAvatar.value = URL.createObjectURL(file.raw)
  }
}

function onExceed(files) {
  uploadRef.value.clearFiles()
  const file = files[0]
  file.uid = genFileId()
  uploadRef.value.handleStart(file)
}

function submitUpload() {
  loading.value = true
  uploadRef.value.submit()
}

function onSuccess(result) {
  loading.value = false
  if (result.success) {
    ElMessage.success('头像上传成功')
    emits('success', result)
    emits('close')
  } else {
    console.log('头像上传失败')
    ElMessage.error(result && result.data && result.data.failMessage ? result.data.failMessage : '头像上传失败')
  }
}

function onError(error) {
  loading.value = false
  ElMessage.error(error)
}

function onClose() {
  emits('close')
}
</script>

<style lang="scss" scoped>
.avatar-wrap {
  width: 100%;
  height: 15rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  // 禁止头像图片拖动
  :deep(.el-avatar img) {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
  }
}

.btn-wrap {
  margin-top: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;

  .upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.tips-wrap {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
