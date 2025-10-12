import { defineStore } from 'pinia'
import Storage from '@/utils/storage'

export const useResetStore = defineStore('reset', () => {
  /**
   * 重置状态值和缓存值
   */
  async function resetStoreAndStorage() {
    const username = Storage.get(Storage.keys.REMEMBER_USERNAME)
    Storage.clear()
    if (username != null) Storage.set(Storage.keys.REMEMBER_USERNAME, username)
  }

  return {
    resetStoreAndStorage
  }
})
