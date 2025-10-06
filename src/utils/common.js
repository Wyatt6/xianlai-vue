/**
 * 判断数据是否为空值（null/undefined/{}/[]）
 * @param {*} data
 * @returns true-空；false-非空
 */
export function isEmpty(data) {
  if (!data) return true
  if (JSON.stringify(data) === '{}') return true
  if (JSON.stringify(data) === '[]') return true
  return false
}

/**
 * 判断数据是否非空（null/undefined/{}/[]）
 * @param {*} data
 * @returns true-非空；false-空
 */
export function notEmpty(data) {
  return !isEmpty(data)
}

/**
 * 检查字符串是否非null且至少含有一个非空白字符
 * @param {*} data
 * @returns
 */
export function hasText(str) {
  return str != null && str.length > 0 && str.trim().length > 0
}
