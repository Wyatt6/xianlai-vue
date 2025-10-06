<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <el-card class="main-card">
        <div class="half-card cover-img">
          <div class="cover-text">
            <div class="cover-title">{{ coverTitle }}</div>
            <div class="cover-subtitle">{{ coverSubTitle }}</div>
          </div>
        </div>
        <div class="half-card input-box">
          <RouterView />
        </div>
      </el-card>
    </div>
    <div class="footer">
      <span v-if="hasText(Option.data.portal.footerCopyright)">{{ Option.data.portal.footerCopyright }}</span>
      <span v-if="hasText(Option.data.portal.footerBeianIcp)">&nbsp;&nbsp;</span>
      <a v-if="hasText(Option.data.portal.footerBeianIcp)" target="_blank" href="https://beian.miit.gov.cn/">
        {{ Option.data.portal.footerBeianIcp }}
      </a>
      <span v-if="hasText(Option.data.portal.footerBeianGongan)">&nbsp;&nbsp;</span>
      <a v-if="hasText(Option.data.portal.footerBeianGongan)" target="_blank" href="https://beian.mps.gov.cn/">
        {{ Option.data.portal.footerBeianGongan }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { useOptionStore } from '@/stores/option'
import { hasText } from '@/utils/common'
import { ref } from 'vue'

const Option = useOptionStore()

const coverImage = ref()
function initCoverImage() {
  const type = Option.data.portal.coverImageType
  let coverUrl
  if (type === 'web') {
    coverImage.value = `url(${Option.data.portal.coverImagePath})`
  } else if (type === 'upload') {
    // TODO 用上传的图片做门户封面
  } else if (type === 'local') {
    coverUrl = new URL('/', import.meta.url)
    coverUrl.pathname = Option.data.portal.coverImagePath
    coverImage.value = `url(${coverUrl})`
  } else {
    coverImage.value = `url(/src/assets/images/portal/default-cover.jpg)`
  }
}
initCoverImage()

const coverTitle = ref(Option.data.portal.coverTitle)
const coverTitleSize = ref(`${Option.data.portal.coverTitleSize}rem`)
const coverTitleColor = ref(Option.data.portal.coverTitleColor)
const coverSubTitle = ref(Option.data.portal.coverSubTitle)
const coverSubTitleSize = ref(`${Option.data.portal.coverSubTitleSize}rem`)
const coverSubTitleColor = ref(Option.data.portal.coverSubTitleColor)
</script>

<style lang="scss" scoped>
.page-wrap {
  width: 100%;
  height: 100%;
  background-color: var(--el-bg-color-page);
  $--footer-height: 4rem;

  .card-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .main-card {
      $--main-card-width: 100rem;
      $--main-card-height: 60rem;
      width: $--main-card-width;
      height: $--main-card-height;
      border-radius: 0;

      :deep(.el-card__body) {
        width: 100%;
        height: 100%;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: space-around;
      }

      .half-card {
        width: 50%;
        height: 100%;
      }

      .cover-img {
        background-image: v-bind(coverImage);
        background-size: 100% 100%;
        display: flex;
        justify-content: center;

        .cover-text {
          width: 80%;
          height: 10rem;
          margin-top: 9rem;
          cursor: default;

          .cover-title {
            font-size: v-bind(coverTitleSize);
            font-weight: 900;
            color: v-bind(coverTitleColor);
          }

          .cover-subtitle {
            font-size: v-bind(coverSubTitleSize);
            color: v-bind(coverSubTitleColor);
          }
        }
      }

      .input-box {
        $--input-box-padding: 7rem;
        padding: $--input-box-padding;
        width: calc($--main-card-width / 2 - 2 * $--input-box-padding);
        height: calc($--main-card-height - 2 * $--input-box-padding);
      }
    }
  }

  .footer {
    width: 100%;
    height: $--footer-height;
    margin-top: -$--footer-height;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }
}
</style>
