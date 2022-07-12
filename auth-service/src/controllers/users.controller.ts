import { Types } from 'mongoose'
import User from '@/models/user.model'
import ca from '@/shared/catchAsync'
import ApiError from '@/shared/ApiError'
import redisCache from '@/config/cache'

export const fetchUsers = ca(async (req, res) => {
  let ids: string[] = []

  if (Array.isArray(req.body.ids) && req.body.ids.length > 0) {
    ids = req.body.ids.filter((id: any) => Types.ObjectId.isValid(id))
  }

  const key = 'users:' + ids.sort().join(',')
  const users = await redisCache.wrap(key, async () => {
    return await User.find({ _id: { $in: ids } }).select('name avatar website')
  })

  res.json(users)
})

export const getUsers = ca(async (req, res) => {
  let limit = Number(req.query.limit) || 20
  let offset = Number(req.query.offset) || 0

  if (limit <= 0) limit = 20
  if (offset < 0) offset = 0

  const key = `users:${offset}:${limit}`
  const users = await redisCache.wrap(key, async () => {
    return await User.paginate({}, { limit, offset, sort: '-createdAt', select: 'name avatar website' })
  })
  res.json(users)
})

export const getUser = ca(async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, 'User is undefined.')
  }
  const key = `user:${req.params.id}`
  const user = await redisCache.wrap(key, async () => {
    const data = await User.findById(req.params.id).select('-password -email -__v')
    if (!data) throw new ApiError(404, 'User is undefined.')
    return data
  })
  res.json(user)
})
