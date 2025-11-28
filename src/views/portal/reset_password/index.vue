<template>
  <div class="box-wrap">
    <div class="box-header">
      <div>
        <span class="title">重置密码</span>
      </div>
      <div>
        <span :class="loading ? 'sub-title-link__disabled' : 'sub-title-link'" @click="toLogin">返回登录</span>
      </div>
    </div>
    <el-steps class="steps" :active="nowStep" align-center finish-status="wait">
      <el-step title="发送校验码"></el-step>
      <el-step title="检查校验码"></el-step>
      <el-step title="重置密码"></el-step>
    </el-steps>
    <div>
      <step1_send_code v-if="nowStep == 0" @next="toNext" />
      <step2_check_code v-if="nowStep == 1" @pre="toPre" @next="toNext" />
      <step3_reset_password v-if="nowStep == 2" @first="nowStep = 0" />
    </div>
  </div>
</template>

<script setup>
import step1_send_code from './step1_send_code.vue'
import step2_check_code from './step2_check_code.vue'
import step3_reset_password from './step3_reset_password.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import pathTable from '~/router/path_table'

const loading = ref(false)
const router = useRouter()
const nowStep = ref(0)

/**
 * 下一步
 */
function toNext() {
  nowStep.value = (nowStep.value + 1) % 3
}

/**
 * 上一步
 */
function toPre() {
  nowStep.value = (nowStep.value + 3 - 1) % 3
}

/**
 * 点击登录按钮
 */
function toLogin() {
  if (!loading.value) {
    router.push(pathTable.LOGIN)
  }
}
</script>

<style lang="scss" scoped>
.box-wrap {
  width: 100%;
  height: 100%;

  .sub-title {
    font-size: 1.4rem;
  }

  .sub-title-link {
    color: #409eff;
    font-size: 1.4rem;
    cursor: pointer;

    &__disabled {
      color: #409eff;
      font-size: 1.4rem;
      cursor: not-allowed;
    }
  }

  .box-header {
    width: 100%;
    height: 3.5rem;
    margin-bottom: 2.5rem;
    display: flex;
    align-items: flex-end; // 下边对齐
    justify-content: space-between;

    .title {
      font-size: 3rem;
      font-weight: bold;
      font-family: Tahoma;
    }
  }

  .steps {
    margin-top: 3rem;
  }
}
</style>
