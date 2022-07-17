import { Router, Application } from 'express'
import { auth } from '@/middlewares/AuthMiddleware'
import * as controller from '@/controllers/posts.controller'

export const route = Router()

route.get('/', controller.getPosts)
route.get('/:id', controller.getPost)
route.post('/', auth(), controller.createPost)
route.put('/:id', auth(), controller.updatePost)
route.delete('/:id', auth(), controller.deletePost)

export const setupPostsRoute = (app: Application) => {
  app.use('/posts', route)
}
