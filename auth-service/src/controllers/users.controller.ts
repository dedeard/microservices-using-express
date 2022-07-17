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
    return await User.find({ _id: { $in: ids } }).select('name username website')
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
    return await User.find().skip(offset).limit(limit).select('name username website')
  })
  res.json(users)
})

export const getUser = ca(async (req, res) => {
  const id = req.params.id
  const key = `user:${id}`
  const user = await redisCache.wrap(key, async () => {
    let key = '_id'
    if (!Types.ObjectId.isValid(id)) key = 'username'
    const data = await User.findOne({ [key]: id })
    if (!data) throw new ApiError(404, 'User is undefined.')
    return data
  })
  res.json(user)
})
