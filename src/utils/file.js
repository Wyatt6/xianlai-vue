import Axios from 'axios'
import { notEmpty, isEmpty } from './common'

export function getExtension(file) {
  const name = file.raw.name
  if (notEmpty(name)) {
    const temp = name.split('.')
    return temp[temp.length - 1]
  } else {
    return file.raw.type.split('/')[1]
  }
}

export async function getAvatarImage(filename) {
  if (isEmpty(filename)) {
    return null
  } else {
    const result = await Axios.get('/api/iam/user/downloadAvatar', {
      params: { filename },
      headers: { Accept: 'image/*' },
      responseType: 'blob'
    })
    return URL.createObjectURL(result.data)
  }
}
