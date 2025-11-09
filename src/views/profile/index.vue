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
                    <el-avatar shape="circle" :size="150" :src="notEmpty(profile) && notEmpty(profile.avatar) ? profile.avatar : FailPicture" />
                  </div>
                  <div class="btn-wrap">
                    <el-button class="btn" @click="changeAvatar()">更换头像</el-button>
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
                        <el-input v-model="form.phone" clearable>
                          <template #append>
                            <el-button @click="ElMessage.error('功能未开发')">更换号码</el-button>
                          </template>
                        </el-input>
                      </el-form-item>
                      <el-form-item label="电子邮箱">
                        <el-input v-model="form.email" clearable>
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
    <!-- <ChangeAvatar :show="showChangeAvatar" @close="showChangeAvatar = false" /> -->
    <ChangePwd :show="showChangePwd" @close="showChangePwd = false" />
  </div>
</template>

<script setup>
import FailPicture from '@/assets/images/fail_picture.png'
// import ChangeAvatar from './ChangeAvatar'
import ChangePwd from './ChangePwd.vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Storage from '@/utils/storage'
import { notEmpty } from '@/utils/common'

const loading = ref(false)
const user = ref(Storage.get(Storage.keys.USER))
const profile = ref(Storage.get(Storage.keys.PROFILE))
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

// // ---------- 头像 ----------
// // 更换头像对话框
// const showChangeAvatar = ref(false)
// const changeAvatar = () => {
//   showChangeAvatar.value = true
// }

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

// const saveProfile = () => {
//   if (store.state.app.hasProfile) {
//     if (profileForm.value.nickname === store.state.app.profile.nickname && profileForm.value.motto === store.state.app.profile.motto) {
//       ElMessage.error('用户个人信息未变更')
//       return
//     }
//   }

//   profileForm.value.userId = store.state.app.user.id
//   API.content.profile
//     .editProfile(profileForm.value)
//     .then(async res => {
//       if (res && res.success) {
//         // 更新store和缓存
//         const newProfile = store.state.app.profile
//         const { profile } = res.data
//         if (profile) {
//           newProfile.nickname = profile.nickname
//           newProfile.motto = profile.motto
//         }
//         await store.commit('app/setProfile', newProfile)
//         await Storage.set(AppConst.PROFILE, profile)
//         initProfileForm()

//         console.log('保存成功')
//         ElMessage.success('保存成功')
//       } else {
//         if (res && res.message != null) {
//           console.log('修改用户个人信息失败：', res.message)
//           ElMessage.error(res.message)
//         } else {
//           console.log('修改用户个人信息失败')
//           ElMessage.error('保存失败')
//         }
//       }
//     })
//     .catch(error => {
//       console.log(error)
//       ElMessage.error(error.message)
//     })
// }
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
