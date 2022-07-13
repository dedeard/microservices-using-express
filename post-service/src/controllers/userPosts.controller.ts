import { Types } from 'mongoose'
import redisCache from '@/config/cache'
import Post from '@/models/post.model'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import Joi from 'joi'
import pusher from '@/config/pusher'
import { fromBuffer } from 'file-type'
import { UploadedFile } from 'express-fileupload'
import updatePostsOnAlgolia from '@/queue/UpdatePostsOnAlgolia'

export const getPosts = ca(async (req, res) => {
  const key = `users:${req.auth.uid}:posts`
  const posts = await redisCache.wrap(key, async () => {
    return await Post.find({ user: req.auth.uid })
  })
  res.json(posts)
})

export const getPost = ca(async (req, res) => {
  const key = `users:${req.auth.uid}:post:${req.params.id}`
  const post = await redisCache.wrap(key, async () => {
    return await Post.find({ user: req.auth.uid, _id: req.params.id })
  })
  if (!post) throw new ApiError(404, 'Post not found')
  res.json(post)
})

export const createPost = ca(async (req, res) => {
  let { title, description } = req.body
  try {
    const data = await Joi.object({
      title: Joi.string().trim().min(3).max(200).required(),
      description: Joi.string().trim().min(3).max(500).required(),
    }).validateAsync({ title, description }, { abortEarly: false })
    title = data.title
    description = data.description
  } catch (e) {
    throw new ApiError(422, 'Failed to create post', e)
  }
  const post = await Post.create({ title, description, user: req.auth.uid })
  await redisCache.del(`users:${req.auth.uid}:posts`)
  res.json(post)
})

export const updatePost = ca(async (req, res) => {
  const id = req.params.id
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, 'Post not found')
  const post = await Post.findOne({ _id: id, user: req.auth.uid })
  if (!post) throw new ApiError(404, 'Post not found')

  let { title, description, body, tags, published } = req.body
  try {
    const data = await Joi.object({
      title: Joi.string().trim().min(3).max(200).required(),
      description: Joi.string().trim().min(3).max(500).required(),
      body: Joi.string().trim().max(1500).required(),
      tags: Joi.array().items(Joi.string().trim().min(3).max(20)).required(),
      published: Joi.boolean().default(false).required(),
    }).validateAsync({ title, description, body, tags, published }, { abortEarly: false })
    title = data.title
    description = data.description
    body = data.body
    tags = data.tags
    published = data.published
  } catch (e) {
    throw new ApiError(422, 'Failed to update post', e)
  }
  if (req.files?.heroImage) {
    const image = req.files.heroImage
    const data: UploadedFile = Array.isArray(image) ? image[0] : image
    const mime = await fromBuffer(data.data)
    try {
      await Joi.object({
        heroImage: Joi.string().valid('jpg', 'png', 'gif').message('Image format must be [jpg, png, gif]').required(),
      }).validateAsync({ heroImage: mime?.ext || '' }, { abortEarly: false })
    } catch (e) {
      throw new ApiError(422, 'Failed to update post', e)
    }
    await post.generateHero(data.data)
  }

  post.title = title
  post.description = description
  post.body = body
  post.tags = tags
  post.published = published
  await post.save()

  await redisCache.del(`users:${req.auth.uid}:post:${id}`)
  await redisCache.del(`users:${req.auth.uid}:posts`)

  if (published) {
    await pusher.trigger('posts', 'publish', { id: post._id, title, description, tags })
    const job = updatePostsOnAlgolia.createJob({ action: 'publish', postId: post._id })
    await job.save()
  } else {
    await pusher.trigger('posts', 'remove', { id: post._id })
    const job = updatePostsOnAlgolia.createJob({ action: 'remove', postId: post._id })
    await job.save()
  }

  res.json(post)
})

export const deletePost = ca(async (req, res) => {
  const id = req.params.id
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, 'Post not found')
  const post = await Post.findOne({ _id: id, user: req.auth.uid })
  if (!post) throw new ApiError(404, 'Post not found')

  await post.deleteHero()
  await post.delete()
  await redisCache.del(`users:${req.auth.uid}:post:${id}`)
  await redisCache.del(`users:${req.auth.uid}:posts`)
  if (post.published) {
    await pusher.trigger('posts', 'remove', { id: post._id })
    const job = updatePostsOnAlgolia.createJob({ action: 'remove', postId: post._id })
    await job.save()
  }

  res.sendStatus(204)
})
