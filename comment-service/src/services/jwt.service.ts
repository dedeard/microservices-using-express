import jwt from 'jsonwebtoken'
import config from '@/config/config'

export interface IAccessToken {
  uid: string
  jti: string
  exp: number
  iat: number
  user: {
    id: string
    name: string
    email: string
  }
}

export const verifyAccessToken = (token: string): IAccessToken => {
  return jwt.verify(token, config.jwtSecret) as IAccessToken
}
