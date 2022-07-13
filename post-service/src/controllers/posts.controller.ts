import { Types, FilterQuery } from 'mongoose'
import axios from 'axios'
import redisCache from '@/config/cache'
import Post, { IPostDocument } from '@/models/post.model'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import config from '@/config/config'

export const getPosts = ca(async (req, res) => {
  let userId = String(req.query.uid) || ''
  let limit = Number(req.query.limit) || 20
  let offset = Number(req.query.offset) || 0
  let tag = String(req.query.tag) || ''

  if (limit <= 0) limit = 20
  if (offset < 0) offset = 0

  const key = `posts:${offset}:${limit}:${userId}:${tag}`
  const posts = await redisCache.wrap(key, async () => {
    const query: FilterQuery<IPostDocument> = { published: true }
    if (Types.ObjectId.isValid(userId)) query.user = userId
    if (tag) query.tags = { $in: [tag] }

    const data = await Post.paginate(query, {
      limit,
      offset,
      sort: '-createdAt',
      select: 'user title slug description heroImage createdAt updatedAt',
    })

    const userIds = [...new Set(data.docs.map((doc) => doc.author))]
    const users = (await axios.post(`${config.authServiceBaseUrl}/users`, { ids: userIds })).data

    // @ts-ignore
    data.docs = data.docs
      .map((doc) => ({ ...doc.toJSON(), author: users.find((user: any) => user.id === doc.author) }))
      .filter((doc) => doc.author)
    return data
  })
  res.json(posts)
})

export const getPost = ca(async (req, res) => {
  const id = req.params.id
  const key = `post:${id}`
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, 'Post not found')
  const post = await redisCache.wrap(key, async () => {
    const query: FilterQuery<IPostDocument> = { published: true }
    if (Types.ObjectId.isValid(id)) {
      query._id = id
    } else {
      query.slug = id
    }
    const data = await Post.findOne(query)
    if (!data) throw new ApiError(404, 'Post not found')
    const author = (await axios.get(`${config.authServiceBaseUrl}/users/${data.author}`)).data
    data.author = author
    return data
  })

  if (!post) throw new ApiError(404, 'Post not found')
  res.json(post)
})

export const likePost = ca(async (req, res) => {
  const userId = req.auth.uid
  const id = req.params.id
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, 'Post not found')
  const post = await Post.findOne({ _id: id })
  if (!post) throw new ApiError(404, 'Post not found')
  await Promise.all([post.like(userId), redisCache.del(`post:${id}`), redisCache.del(`likedPosts:${userId}`)])
  res.sendStatus(204)
})

export const unlikePost = ca(async (req, res) => {
  const userId = req.auth.uid
  const id = req.params.id
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, 'Post not found')
  const post = await Post.findOne({ _id: id })
  if (!post) throw new ApiError(404, 'Post not found')
  await Promise.all([post.unlike(userId), redisCache.del(`post:${id}`), redisCache.del(`likedPosts:${userId}`)])
  res.sendStatus(204)
})

export const getLikedPosts = ca(async (req, res) => {
  const posts = await redisCache.wrap(`likedPosts:${req.auth.uid}`, async () => {
    const data = await Post.find({ published: true, liked: { $in: [req.auth.uid] } })
    const userIds = [...new Set(data.map((doc) => doc.author))]
    const users = (await axios.post(`${config.authServiceBaseUrl}/users`, { ids: userIds })).data
    // @ts-ignore
    data = data.map((doc) => ({ ...doc.toJSON(), author: users.find((user: any) => user.id === doc.author) })).filter((doc) => doc.author)
    return data
  })
  res.json(posts)
})

export const getTags = ca(async (req, res) => {
  const tags = await redisCache.wrap(
    'tags',
    async () => {
      const data = await Post.distinct('tags')
      return data
    },
    { ttl: 60 * 60 },
  )
  res.json(tags)
})
