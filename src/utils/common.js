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

/**
 * 获取某个月有多少天
 * @param {*} year 年份
 * @param {*} month 月份
 * @returns 该月的天数
 */
export function getDaysOfMonth(year, month) {
  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31
    case 4:
    case 6:
    case 9:
    case 11:
      return 30
  }
  if (year % 100 === 0) {
    return year % 400 === 0 ? 29 : 28
  } else {
    return year % 4 === 0 ? 29 : 28
  }
}
