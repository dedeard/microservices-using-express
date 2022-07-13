import { Router, Application } from 'express'
import * as controller from '@/controllers/posts.controller'
import { auth } from '@/middlewares/AuthMiddleware'

export const route = Router()

route.get('/', controller.getPosts)
route.get('/:id', controller.getPost)

route.get('/:userId/liked', controller.getLikedPosts)
route.post('/:id/like', auth(), controller.likePost)
route.delete('/:id/like', auth(), controller.unlikePost)

export const setupPostsRoute = (app: Application) => {
  app.use('/posts', route)
}
