import { Router, Application } from 'express'
import * as controller from '@/controllers/users.controller'

export const route = Router()

route.post('/', controller.fetchUsers)
route.get('/', controller.getUsers)
route.get('/:id', controller.getUser)

export const setupUsersRoute = (app: Application) => {
  app.use('/users', route)
}
