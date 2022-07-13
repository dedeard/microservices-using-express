import { Types } from 'mongoose'
import Joi from 'joi'
import axios from 'axios'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import Comment from '@/models/comment.model'
import redisCache from '@/config/cache'
import config from '@/config/config'

export const getComments = ca(async (req, res) => {
  const postId = req.params.postId
  if (!Types.ObjectId.isValid(postId)) throw new ApiError(404, 'Post not found')
  const response = await redisCache.wrap(`posts:${postId}:comments`, async () => {
    let comments = await Comment.find({ post: postId }).sort({ createdAt: -1 })

    const userIds = [...new Set(comments.map((comment) => comment.author))]
    const users = (await axios.post(`${config.authServiceBaseUrl}/users`, { ids: userIds })).data

    // @ts-ignore
    comments = comments
      .map((comment) => ({ ...comment.toJSON(), author: users.find((user: any) => user.id === comment.author) }))
      .filter((comment) => comment.author)

    return comments
      .filter((comment) => !comment.parent)
      .map((comment) => {
        const obj: any = { ...comment, replies: [] }
        obj.replies = comments.filter(({ parent }) => parent === comment.id.toString())
        return obj
      })
  })

  res.json(response)
})

export const createComment = ca(async (req, res) => {
  const postId = req.params.postId
  const userId = req.auth.uid

  if (!Types.ObjectId.isValid(postId)) throw new ApiError(404, 'Post not found')

  let { body } = req.body
  try {
    const data = await Joi.object({
      body: Joi.string().trim().min(3).max(500).required(),
    }).validateAsync({ body }, { abortEarly: false })
    body = data.body
  } catch (e) {
    throw new ApiError(422, 'Failed to create comment', e)
  }

  const comment = await Comment.create({ body, author: userId, post: postId })
  await redisCache.del(`posts:${postId}:comments`)
  res.json(comment)
})

export const deleteComment = ca(async (req, res) => {
  const userId = req.auth.uid
  const commentId = req.params.commentId
  if (!Types.ObjectId.isValid(commentId)) throw new ApiError(404, 'Comment not found')
  const comment = await Comment.findOne({ _id: commentId, author: userId })
  if (!comment) throw new ApiError(404, 'Comment not found')
  await Promise.all([Comment.deleteMany({ parent: commentId }), comment.remove(), redisCache.del(`posts:${comment.post}:comments`)])
})

export const createReply = ca(async (req, res) => {
  const userId = req.auth.uid
  const commentId = req.params.commentId
  if (!Types.ObjectId.isValid(commentId)) throw new ApiError(404, 'Comment not found')
  const comment = await Comment.findOne({ _id: commentId, parent: null })
  if (!comment) throw new ApiError(404, 'Comment not found')

  let { body } = req.body
  try {
    const data = await Joi.object({
      body: Joi.string().trim().min(3).max(500).required(),
    }).validateAsync({ body }, { abortEarly: false })
    body = data.body
  } catch (e) {
    throw new ApiError(422, 'Failed to create reply', e)
  }

  const reply = await Comment.create({ body, author: userId, parent: commentId, post: comment.post })
  await redisCache.del(`posts:${comment.post}:comments`)
  res.json(reply)
})

export const deleteReply = ca(async (req, res) => {
  const userId = req.auth.uid
  const replyId = req.params.replyId
  if (!Types.ObjectId.isValid(replyId)) throw new ApiError(404, 'Reply not found')
  const reply = await Comment.findOne({ _id: replyId, author: userId, parent: { $ne: null } })
  if (!reply) throw new ApiError(404, 'Reply not found')
  await Promise.all([reply.remove(), redisCache.del(`posts:${reply.post}:comments`)])
  res.sendStatus(204)
})

export const likeComment = ca(async (req, res) => {
  const userId = req.auth.uid
  const id = req.params.id
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, 'Comment not found')
  const comment = await Comment.findOne({ _id: id })
  if (!comment) throw new ApiError(404, 'Comment not found')
  await comment.like(userId)
  res.sendStatus(204)
})

export const unlikeComment = ca(async (req, res) => {
  const userId = req.auth.uid
  const id = req.params.id
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, 'Comment not found')
  const comment = await Comment.findOne({ _id: id })
  if (!comment) throw new ApiError(404, 'Comment not found')
  await comment.unlike(userId)
  res.sendStatus(204)
})
