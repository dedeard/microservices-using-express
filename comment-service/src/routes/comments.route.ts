import { Router, Application } from 'express'
import * as controller from '@/controllers/comments.controller'
import { auth } from '@/middlewares/AuthMiddleware'

export const route = Router()

route.get('/:postId', controller.getComments)
route.post('/:postId', auth(), controller.createComment)
route.delete('/:commentId', auth(), controller.deleteComment)
route.post('/:commentId/reply', auth(), controller.createReply)
route.delete('/:replyId/reply', auth(), controller.deleteReply)
route.post('/:id/like', auth(), controller.likeComment)
route.delete('/:id/like', auth(), controller.unlikeComment)

export const setupCommentsRoute = (app: Application) => {
  app.use('/comments', route)
}
