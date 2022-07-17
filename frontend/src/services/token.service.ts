import moment from 'moment'
import jsCookie from 'js-cookie'
import { IToken } from '../types'

const REFRESH_KEY = 'refresh-token'

export const saveRefreshToken = (refreshToken: IToken) => {
  const expires = moment(refreshToken.expiredAt).toDate()
  jsCookie.set(REFRESH_KEY, refreshToken.bearer, { expires })
}

export const getRefreshToken = () => {
  return jsCookie.get(REFRESH_KEY)
}

export const removeRefreshToken = () => {
  jsCookie.remove(REFRESH_KEY)
}
