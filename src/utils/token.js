import Storage from './storage'

/**
 * 保存token令牌到本地缓存
 * @param {*} token token令牌值
 */
function setToken(token) {
  Storage.set(Storage.keys.TOKEN, token)
}

/**
 * 从本地缓存中获取token令牌
 * @returns token令牌值
 */
function getToken() {
  return Storage.get(Storage.keys.TOKEN)
}

/**
 * 判断本地缓存是否有token令牌
 * @returns 有 - true / 无 - false
 */
function hasToken() {
  return getToken() != null
}

/**
 * 保存token过期时间到本地缓存
 * @param {*} expiredTime token过期时间
 */
function setExpiredTime(expiredTime) {
  Storage.set(Storage.keys.TOKEN_EXPIRE_TIME, expiredTime)
}

/**
 * 从本地缓存获取token过期时间
 * @returns token过期时间
 */
function getExpiredTime() {
  return Storage.get(Storage.keys.TOKEN_EXPIRE_TIME)
}

/**
 * 判断token是否过期
 * @returns
 */
function isExpired() {
  const current = Date.now()
  const expiredTime = getExpiredTime()
  return current > expiredTime
}

export default {
  setToken,
  getToken,
  hasToken,
  setExpiredTime,
  getExpiredTime,
  isExpired
}
