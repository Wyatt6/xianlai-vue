export default {
  keys: {
    TOKEN: 'token',
    TOKEN_EXPIRE_TIME: 'token_expire_time',
    USER: 'user',
    PROFILE: 'profile',
    DEPARTMENT: 'department',
    POSITION: 'position',
    REMEMBER_USERNAME: 'remember_username',
    MENUBAR_EXPAND: 'sidebar_expand',
    TAG_LIST: 'tag_list',

    AUTHORITY: 'system.authority',
    USER: 'system.user'
  },

  /**
   * 写入缓存
   * @param {*} key   设置的缓存的键
   * @param {*} value 设置的缓存的值
   */
  set: (key, value) => {
    // value有两种情况：
    // 1、基本数据类型
    // 2、复杂数据类型（要做转换）
    if (typeof value === 'object') {
      value = JSON.stringify(value) // 将复杂数据类型（数组、对象）转化为JSON字符串进行存储
    }
    window.localStorage.setItem(key, value)
  },
  /**
   * 读取缓存
   * @param {*} key 目标缓存值的键
   * @returns 目标缓存值
   */
  get: key => {
    const data = window.localStorage.getItem(key)
    try {
      return JSON.parse(data) // 将JSON字符串默认按复杂数据类型解析（默认当成复杂数据类型）
    } catch (error) {
      return data
    }
  },
  /**
   * 删除某个缓存值
   * @param {*} key 要删除的缓存值的键
   */
  delete: key => {
    window.localStorage.removeItem(key)
  },
  /**
   * 清空所有缓存
   */
  clear: () => {
    window.localStorage.clear()
  }
}
