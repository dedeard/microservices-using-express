import { Router, Application } from 'express'
import * as controller from '@/controllers/auth.controller'

export const route = Router()

route.post('/register', controller.register)
route.post('/login', controller.login)
route.post('/refresh-access-token', controller.refreshAccessToken)
route.delete('/revoke-refresh-token', controller.revokeRefreshToken)

export const setupAuthRoute = (app: Application) => {
  app.use('/auth', route)
}
