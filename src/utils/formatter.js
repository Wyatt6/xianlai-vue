export const dateHyphenFormatter = input => {
  const obj = new Date(input)
  const year = obj.getFullYear()
  const month = obj.getMonth() + 1
  const date = obj.getDate()
  return '' + year + '-' + (month < 10 ? '0' : '') + month + '-' + (date < 10 ? '0' : '') + date
}
