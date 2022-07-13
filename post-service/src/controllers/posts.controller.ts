import { Types } from 'mongoose'
import redisCache from '@/config/cache'
import Post from '@/models/post.model'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'

export const getPosts = ca(async (req, res) => {
  let limit = Number(req.query.limit) || 20
  let offset = Number(req.query.offset) || 0

  if (limit <= 0) limit = 20
  if (offset < 0) offset = 0

  const key = `posts:${offset}:${limit}`

  const posts = await redisCache.wrap(key, async () => {
    return await Post.paginate(
      { published: true },
      {
        limit,
        offset,
        sort: '-createdAt',
        select: 'user title slug description heroImage createdAt updatedAt',
      },
    )
  })
  res.json(posts)
})

export const getPost = ca(async (req, res) => {
  const id = req.params.id
  const key = `post:${id}`
  if (!Types.ObjectId.isValid(id)) throw new ApiError(404, 'Post not found')
  const post = await redisCache.wrap(key, async () => {
    return await Post.find({ published: true, _id: id })
  })
  if (!post) throw new ApiError(404, 'Post not found')
  res.json(post)
})
