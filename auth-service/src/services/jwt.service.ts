import jwt from 'jsonwebtoken'
import moment from 'moment'
import { IUserDocument } from '@/models/user.model'
import config from '@/config/config'
import Blacklist from '@/models/blacklist.model'

export interface IRefreshToken {
  uid: string
  jti: string
  exp: number
  iat: number
}

export interface IAccessToken extends IRefreshToken {
  user: {
    id: string
    name: string
    username: string
  }
}

export const generateAccessToken = (user: IUserDocument): { bearer: string; expiredAt: Date } => {
  const iat = moment().unix()
  const exp = moment().add(config.jwt.access.expMinutes, 'minutes')

  const payload: IAccessToken = {
    uid: user.id,
    exp: exp.unix(),
    iat,
    jti: user.id + '-access-' + iat,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
    },
  }
  return {
    bearer: jwt.sign(payload, config.jwt.access.secret),
    expiredAt: exp.toDate(),
  }
}

export const generateRefreshToken = (user: IUserDocument): { bearer: string; expiredAt: Date } => {
  const iat = moment().unix()
  const exp = moment().add(config.jwt.refresh.expDays, 'days')
  const payload: IRefreshToken = {
    uid: user.id,
    exp: exp.unix(),
    iat,
    jti: user.id + '-refresh-' + iat,
  }
  return {
    bearer: jwt.sign(payload, config.jwt.refresh.secret),
    expiredAt: exp.toDate(),
  }
}

export const verifyAccessToken = (token: string): IAccessToken => {
  return jwt.verify(token, config.jwt.access.secret) as IAccessToken
}

export const verifyRefreshToken = async (token: string, blacklistCheck: boolean | undefined = true): Promise<IRefreshToken> => {
  const payload = jwt.verify(token, config.jwt.refresh.secret) as IRefreshToken
  if (blacklistCheck) {
    const count = await Blacklist.countDocuments({ jti: payload.jti })
    if (count > 0) {
      throw new Error('Refresh token has been blacklisted.')
    }
  }
  return payload
}

export const blacklistRefreshToken = async (token: string): Promise<void> => {
  const { jti, uid, exp } = await verifyRefreshToken(token)
  await Blacklist.create({ user: uid, jti, exp })
}
