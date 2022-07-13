import { Types, FilterQuery } from 'mongoose'
import redisCache from '@/config/cache'
import Post, { IPostDocument } from '@/models/post.model'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'

export const getPosts = ca(async (req, res) => {
  let userId = String(req.query.uid) || ''
  let limit = Number(req.query.limit) || 20
  let offset = Number(req.query.offset) || 0

  if (limit <= 0) limit = 20
  if (offset < 0) offset = 0

  const key = `posts:${offset}:${limit}:${userId}`
  const posts = await redisCache.wrap(key, async () => {
    const query: FilterQuery<IPostDocument> = { published: true }
    if (Types.ObjectId.isValid(userId)) query.user = userId

    return await Post.paginate(query, {
      limit,
      offset,
      sort: '-createdAt',
      select: 'user title slug description heroImage createdAt updatedAt',
    })
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
    return await Post.find(query)
  })
  if (!post) throw new ApiError(404, 'Post not found')
  res.json(post)
})
