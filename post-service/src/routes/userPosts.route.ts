import { Router, Application } from 'express'
import * as controller from '@/controllers/userPosts.controller'
import { auth } from '@/middlewares/AuthMiddleware'

export const route = Router()

route.get('/', auth(), controller.getPosts)
route.get('/:id', auth(), controller.getPost)
route.post('/', auth(), controller.createPost)
route.put('/:id', auth(), controller.updatePost)
route.delete('/:id', auth(), controller.deletePost)

export const setupUserPostsRoute = (app: Application) => {
  app.use('/posts/user', route)
}
