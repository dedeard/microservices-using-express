import Joi from 'joi'
import { UploadedFile } from 'express-fileupload'
import { fromBuffer } from 'file-type'
import ca from '@/shared/catchAsync'
import { passwordMatchLookup } from '@/shared/validationLookup'
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
  const user = await getUser(req.auth?.uid)
  try {
    const { name, website, bio, password, newPassword } = req.body
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(30),
      website: Joi.string().trim().uri().allow(''),
      bio: Joi.string().trim().max(300),
      newPassword: Joi.string().trim().min(3).max(30),
      password: Joi.when('newPassword', {
        then: Joi.string().trim().required().external(passwordMatchLookup(user)),
        otherwise: Joi.when('email', {
          then: Joi.string().trim().required().external(passwordMatchLookup(user)),
        }),
      }),
    }).validateAsync({ name, website, bio, password, newPassword }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed to update profile.', e)
  }

  if (req.body.name) user.name = req.body.name
  if (typeof req.body.website !== 'undefined') user.website = req.body.website || null
  if (typeof req.body.bio !== 'undefined') user.bio = req.body.bio || null
  if (req.body.newPassword) user.password = req.body.newPassword
  await user.save()

  const key = `user:${req.auth?.uid}`
  await redisCache.del(key)

  res.json(user)
})

export const updateAvatar = ca(async (req, res) => {
  const user = await getUser(req.auth?.uid)
  const image = req.files?.image
  const data: UploadedFile | undefined = Array.isArray(image) ? image[0] : image
  if (!data) throw new ApiError(422, 'Image is required')

  const mime = await fromBuffer(data.data)
  if (!['jpg', 'png', 'gif'].includes(mime?.ext || '')) {
    throw new ApiError(422, 'Image format must be [jpg, png, gif]')
  }
  await user.generateAvatar(data.data)

  const key = `user:${req.auth?.uid}`
  await redisCache.del(key)

  res.json(user)
})
