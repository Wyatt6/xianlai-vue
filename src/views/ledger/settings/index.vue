<template>
  <div class="page-wrapper">
    <div class="card-wrapper">
      <el-card class="card" shadow="never">
        <el-tabs class="tabs" tab-position="left">
          <el-tab-pane :lazy="true">
            <template #label>
              <LocalIcon class="tab-pane-icon" name="ri-shopping-cart-2-line" />
              <span class="tab-pane-label">记账类别</span>
            </template>
            <Category />
          </el-tab-pane>
          <el-tab-pane :lazy="true">
            <template #label>
              <LocalIcon class="tab-pane-icon" name="ri-bank-card-2-line" />
              <span class="tab-pane-label">动账账户</span>
            </template>
            <Account />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import LocalIcon from '@/components/LocalIcon/index.vue'
import Category from './category/index.vue'
import Account from './account/index.vue'
</script>

<style lang="scss" scpoed>
.page-wrapper {
  width: 100%;
  height: 100%;

  .card-wrapper {
    width: 100%;
    min-height: 100%;
    display: flex;
    justify-content: center;

    .card {
      width: calc(100% - 0.2rem);
      min-height: calc(100% - 0.2rem);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      .el-card__body {
        height: calc(100% - 2 * var(--el-card-padding)) !important;

        .tabs {
          height: 100%;

          .el-tabs__content {
            height: 100%;

            .el-tab-pane {
              height: 100%;
            }
          }

          .tab-pane-icon {
            $--tab-pane-icon-size: 2rem;
            width: $--tab-pane-icon-size;
            height: $--tab-pane-icon-size;
          }

          .tab-pane-label {
            font-size: 1.4rem;
            font-weight: bold;
            margin-left: 0.8rem;
          }
        }
      }
    }
  }
}
</style>
