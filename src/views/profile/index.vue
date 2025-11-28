<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <el-card class="card" shadow="never">
        <div class="tab-wrap" v-loading="loading">
          <el-tabs class="tabs" tab-position="left">
            <el-tab-pane class="tab-page" label="基础信息">
              <el-scrollbar height="100%">
                <div class="info-wrap">
                  <div class="avatar-wrap">
                    <el-avatar shape="circle" :size="150" :src="avatarImg" />
                  </div>
                  <div class="btn-wrap">
                    <el-button class="btn" @click="showChangeAvatar = true">更换头像</el-button>
                    <el-button class="btn" plain type="danger" @click="showChangePwd = true">修改密码</el-button>
                  </div>
                  <el-divider />
                  <div class="info-detail">
                    <el-form :model="form" label-position="right" label-width="auto" label-suffix=":">
                      <el-form-item label="用户ID">
                        <el-text>{{ user.id }}</el-text>
                      </el-form-item>
                      <el-form-item label="用户名">
                        <el-text>{{ user.username }}</el-text>
                      </el-form-item>
                      <el-form-item label="昵称">
                        <el-input v-model="form.nickname" clearable />
                      </el-form-item>
                    </el-form>
                  </div>
                  <div class="btn-wrap">
                    <el-button class="btn" type="primary" @click="saveProfile()">保存</el-button>
                    <el-button class="btn" @click="init()">重置</el-button>
                  </div>
                  <el-divider />
                  <div class="info-detail">
                    <el-form :model="form" label-position="right" label-width="auto" label-suffix=":">
                      <el-form-item label="电话号码">
                        <el-input clearable>
                          <template #append>
                            <el-button @click="ElMessage.error('功能未开发')">更换号码</el-button>
                          </template>
                        </el-input>
                      </el-form-item>
                      <el-form-item label="电子邮箱">
                        <el-input clearable>
                          <template #append>
                            <el-button @click="ElMessage.error('功能未开发')">更换邮箱</el-button>
                          </template>
                        </el-input>
                      </el-form-item>
                    </el-form>
                  </div>
                </div>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </div>
    <ChangeAvatar :show="showChangeAvatar" :nowAvatarImg="avatarImg" @close="showChangeAvatar = false" @success="uploadSuccess" />
    <ChangePwd :show="showChangePwd" @close="showChangePwd = false" />
  </div>
</template>

<script setup>
import FailPicture from '@/assets/images/fail_picture.png'
import ChangePwd from './ChangePwd.vue'
import ChangeAvatar from './ChangeAvatar.vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useApiStore } from '@/apis'
import Storage from '@/utils/storage'
import { isEmpty, notEmpty } from '@/utils/common'
import { getAvatarImage } from '@/utils/file'

const Apis = useApiStore()
const loading = ref(false)
const user = ref(Storage.get(Storage.keys.USER))
const profile = ref(Storage.get(Storage.keys.PROFILE))
const avatarImg = ref(FailPicture)
const form = ref({
  userId: null,
  avatar: null,
  gendernickname: null,
  photo: null,
  name: null,
  gender: null,
  employeeNo: null,
  phone: null,
  email: null
})
const showChangePwd = ref(false)
const showChangeAvatar = ref(false)

function init() {
  if (notEmpty(profile.value)) {
    form.value.userId = profile.value.userId
    form.value.avatar = profile.value.avatar
    form.value.nickname = profile.value.nickname
    form.value.photo = profile.value.photo
    form.value.name = profile.value.name
    form.value.gender = profile.value.gender
    form.value.employeeNo = profile.value.employeeNo
    form.value.phone = profile.value.phone
    form.value.email = profile.value.email
  }
}
init()

async function getAvatarImg() {
  if (isEmpty(profile.value) || isEmpty(profile.value.avatar)) {
    return null
  } else {
    avatarImg.value = await getAvatarImage(profile.value.avatar)
  }
}
getAvatarImg()

function uploadSuccess(result) {
  Storage.set(Storage.keys.PROFILE, result.data.profile)
  profile.value = result.data.profile
  getAvatarImg()
}

const saveProfile = () => {
  if (notEmpty(profile.value)) {
    if (form.value.nickname === profile.value.nickname) {
      ElMessage.error('基础信息未变更')
      return
    }
  }
  Apis.request.iam.user
    .editUserInfo(null, {
      id: user.value.id,
      nickname: form.value.nickname
    })
    .then(result => {
      if (result && result.success) {
        console.log('基础信息修改成功')
        Storage.set(Storage.keys.USER, result.data.user)
        Storage.set(Storage.keys.PROFILE, result.data.profile)
        user.value = result.data.user
        profile.value = result.data.profile
        init()
        ElMessage.success('基础信息修改成功')
      } else {
        console.log('基础信息修改失败')
        ElMessage.error(result && result.data.failMessage ? result.data.failMessage : '基础信息修改失败')
      }
    })
}
</script>

<style lang="scss" scoped>
@use '@/views/layout/index.module.scss' as vars;

.page-wrap {
  width: 100%;
  height: 100%;

  .card-wrap {
    width: 100%;
    min-height: 100%;
    display: flex;
    justify-content: center;

    .card {
      width: 100%;
      min-height: calc(100% - 0.2rem);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      .el-card__body {
        min-height: calc(100% - 2 * var(--el-card-padding)) !important;
      }

      .tab-wrap {
        width: 100%;
        // 全屏高度: 100vh
        // 减去Navbar高度: $navbar-height
        // 减去Tagbar高度: $tagbar-height
        // 减去调整值: 4.7rem
        height: calc(100vh - vars.$navbar-height - vars.$tagbar-height - 4.7rem);

        .tabs {
          width: 100%;
          height: 100%;

          .tab-page {
            padding-top: 1rem;
            padding-bottom: 1rem;
            width: 100%;
            height: calc(100% - 2rem);

            .info-wrap {
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;

              .avatar-wrap {
                width: 100%;
                margin-bottom: 1rem;
                display: flex;
                justify-content: center;

                // 禁止头像图片拖动
                :deep(.el-avatar img) {
                  -webkit-user-drag: none;
                  -khtml-user-drag: none;
                  -moz-user-drag: none;
                  -o-user-drag: none;
                }
              }

              .info-detail {
                width: 40%;
              }

              .btn-wrap {
                width: 100%;
                margin-top: 2rem;
                display: flex;
                justify-content: center;

                .btn {
                  width: 15rem;
                }
              }
            }
          }
        }
      }

      .setting-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    }
  }
}
</style>
