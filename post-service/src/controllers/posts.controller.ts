import { Types, FilterQuery } from 'mongoose'
import axios from 'axios'
import redisCache from '@/config/cache'
import Post, { IPostDocument } from '@/models/post.model'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import config from '@/config/config'
import Joi from 'joi'

export const getPosts = ca(async (req, res) => {
  let userId = String(req.query.userId || '')
  let limit = Number(req.query.limit) || 8
  let skip = String(req.query.skip || '')

  if (limit <= 0) limit = 8
  if (!Types.ObjectId.isValid(skip)) skip = ''

  const key = `posts:${skip}:${limit}:${userId}`
  const posts = await redisCache.wrap(key, async () => {
    const query: FilterQuery<IPostDocument> = {}
    if (skip) {
      const skiped = await Post.findById(skip).select('createdAt')
      if (skiped) query.createdAt = { $lt: skiped.createdAt }
    }

    if (Types.ObjectId.isValid(userId)) query.author = userId
    const data = await Post.find(query).limit(limit).select('title author slug description createdAt').sort({ createdAt: -1 })

    const userIds = [...new Set(data.map((doc) => doc.author))]
    const users = (await axios.post(`${config.authServiceBaseUrl}/users`, { ids: userIds })).data

    const docs = data
      .map((doc) => ({ ...doc.toJSON(), author: users.find((user: any) => user.id === doc.author) }))
      .filter((doc) => doc.author)

    return docs
  })
  res.json(posts)
})

export const getPost = ca(async (req, res) => {
  const id = req.params.id
  const key = `post:${id}`
  const post = await redisCache.wrap(key, async () => {
    const query: FilterQuery<IPostDocument> = { published: true }
    if (Types.ObjectId.isValid(id)) {
      query._id = id
    } else {
      query.slug = id
    }
    const data = await Post.findOne(query)
    if (!data) throw new ApiError(404, 'Post not found')
    return { ...data.toJSON(), author: (await axios.get(`${config.authServiceBaseUrl}/users/${data.author}`)).data }
  })

  if (!post) throw new ApiError(404, 'Post not found')
  res.json(post)
})

export const createPost = ca(async (req, res) => {
  try {
    const { title, description, content } = req.body
    req.body = await Joi.object({
      title: Joi.string().trim().min(3).max(200).required(),
      description: Joi.string().trim().min(3).max(500).required(),
      content: Joi.string().trim().max(2500).required(),
    }).validateAsync({ title, description, content }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to create post', e)
  }
  const post = await Post.create({ ...req.body, author: req.auth.uid })
  await redisCache.del(`users:${req.auth.uid}:posts`)
  res.json(post)
})

export const updatePost = ca(async (req, res) => {
  const id = req.params.id
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, 'Post not found')
  const post = await Post.findOne({ _id: id, author: req.auth.uid })
  if (!post) throw new ApiError(404, 'Post not found')

  try {
    const { title, description, content } = req.body
    req.body = await Joi.object({
      title: Joi.string().trim().min(3).max(200).required(),
      description: Joi.string().trim().min(3).max(500).required(),
      content: Joi.string().trim().max(2500).required(),
    }).validateAsync({ title, description, content }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to update post', e)
  }

  post.title = req.body.title
  post.description = req.body.description
  post.content = req.body.content

  await Promise.all([post.save(), redisCache.del(`users:${req.auth.uid}:posts`), redisCache.del(`users:${req.auth.uid}:post:${id}`)])

  res.json(post)
})

export const deletePost = ca(async (req, res) => {
  const id = req.params.id
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, 'Post not found')
  const post = await Post.findOne({ _id: id, author: req.auth.uid })
  if (!post) throw new ApiError(404, 'Post not found')
  await Promise.all([post.delete(), redisCache.del(`users:${req.auth.uid}:posts`), redisCache.del(`users:${req.auth.uid}:post:${id}`)])
  res.sendStatus(204)
})
