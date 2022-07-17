import Joi from 'joi'
import ca from '@/shared/catchAsync'
import { passwordMatchLookup, uniqueUsernameLookup } from '@/shared/validationLookup'
import ApiError from '@/shared/ApiError'
import User, { IUserDocument } from '@/models/user.model'
import redisCache from '@/config/cache'

async function getUser(id?: string): Promise<IUserDocument> {
  const user = await User.findById(id)
  if (!user) throw new ApiError(400, 'Your account has been deleted.')
  return user
}

export const getProfile = ca(async (req, res) => {
  const key = `user:${req.auth?.uid}`
  const user = await redisCache.wrap(key, async () => {
    return await getUser(req.auth?.uid)
  })
  res.json(user)
})

export const updateProfile = ca(async (req, res) => {
  const user = await getUser(req.auth.uid)
  try {
    const { name, bio, username, password, newPassword } = req.body
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(30).required(),
      bio: Joi.string().trim().max(300).allow('').required(),
      username: Joi.string()
        .trim()
        .lowercase()
        .min(6)
        .max(30)
        .regex(/^(?![_.])(?!.*[_]{2})[a-z0-9_]+(?<![_])$/)
        .message('Username must be start with a letter, and contain only letters, numbers, and underscores.')
        .required()
        .external(uniqueUsernameLookup(req.auth.uid)),
      newPassword: Joi.string().trim().min(3).max(30).allow(''),
      password: Joi.when('newPassword', {
        then: Joi.string().trim().required().external(passwordMatchLookup(user)),
      }),
    }).validateAsync({ name, bio, password, username, newPassword }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to update profile.', e)
  }

  user.name = req.body.name
  user.username = req.body.username
  user.bio = req.body.bio || ''
  if (req.body.newPassword) user.password = req.body.newPassword
  await user.save()

  const key = `user:${req.auth?.uid}`
  await redisCache.del(key)

  res.json(user)
})
