import { Router, Application } from 'express'
import { auth } from '@/middlewares/AuthMiddleware'
import * as controller from '@/controllers/account.controller'

export const route = Router()

route.get('/profile', auth(), controller.getProfile)
route.put('/profile', auth(), controller.updateProfile)
route.put('/avatar', auth(), controller.updateAvatar)
route.post('/pusher', auth(), controller.pusherLogin)

export const setupAccountRoute = (app: Application) => {
  app.use('/account', route)
}
