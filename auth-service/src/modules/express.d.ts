import { IAccessToken } from '@/services/jwt.service'

declare global {
  namespace Express {
    interface Request {
      auth?: IAccessToken
    }
  }
}
