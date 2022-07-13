import { NextFunction, Request, Response } from 'express'
import ca from '@/shared/catchAsync'
import ApiError from '@/shared/ApiError'
import * as jwt from '@/services/jwt.service'

class AuthMiddleware {
  req: Request
  next: NextFunction

  constructor(req: Request, next: NextFunction) {
    this.req = req
    this.next = next
  }

  async checkAuth(): Promise<void> {
    const bearer = this.parseBearerToken(this.req)
    if (!bearer) return this.next(new ApiError(401, 'Access token is required.'))

    try {
      this.req.auth = jwt.verifyAccessToken(bearer)
    } catch (e: any) {
      if (e.name === 'TokenExpiredError') {
        return this.next(new ApiError(401, 'Access token has expired.'))
      }
      return this.next(new ApiError(401, 'Invalid access token'))
    }

    this.next()
  }

  parseBearerToken(req: Request): string | null {
    const auth = req.headers ? req.headers.authorization || null : null
    if (!auth) return null

    const parts = auth.split(' ')
    if (parts.length < 2) return null

    const schema = (parts.shift() as string).toLowerCase()
    const token = parts.join(' ')
    if (schema !== 'bearer') return null

    return token
  }
}

export function auth(): (req: Request, res: Response, next: NextFunction) => void {
  return ca(async (req, res, next) => {
    const authentication = new AuthMiddleware(req, next)
    await authentication.checkAuth()
  })
}
