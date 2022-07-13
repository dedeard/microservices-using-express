import { Router, Application } from 'express'
import * as controller from '@/controllers/posts.controller'

export const route = Router()

route.get('/', controller.getPosts)
route.get('/:id', controller.getPost)

export const setupPostsRoute = (app: Application) => {
  app.use('/posts', route)
}
