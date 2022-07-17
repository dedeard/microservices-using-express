import Joi from 'joi'
import moment from 'moment'
import User from '@/models/user.model'
import * as jwtService from '@/services/jwt.service'
import ApiError from '@/shared/ApiError'
import ca from '@/shared/catchAsync'
import { uniqueUsernameLookup } from '@/shared/validationLookup'

export const register = ca(async (req, res) => {
  try {
    const { name, username, password } = req.body
    req.body = await Joi.object({
      name: Joi.string().trim().min(3).max(30).required(),
      password: Joi.string().trim().min(3).max(30).required(),
      username: Joi.string()
        .trim()
        .lowercase()
        .min(6)
        .max(30)
        .regex(/^(?![_.])(?!.*[_]{2})[a-z0-9_]+(?<![_])$/)
        .message('Username must be start with a letter, and contain only letters, numbers, and underscores.')
        .required()
        .external(uniqueUsernameLookup()),
    }).validateAsync({ name, username, password }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed register.', e)
  }
  await User.create(req.body)
  res.sendStatus(204)
})

export const login = ca(async (req, res) => {
  try {
    const { username, password } = req.body
    req.body = await Joi.object({
      password: Joi.string().trim().required(),
      username: Joi.string().trim().lowercase().required(),
    }).validateAsync({ username, password }, { abortEarly: false })
  } catch (e) {
    throw new ApiError(422, 'Failed login.', e)
  }

  const user = await User.findOne({ username: req.body.username })
  if (user && (await user.comparePassword(req.body.password))) {
    user.lastLogin = moment().toDate()
    await user.save()

    return res.json({
      user,
      token: {
        access: jwtService.generateAccessToken(user),
        refresh: jwtService.generateRefreshToken(user),
      },
    })
  }
  throw new ApiError(400, 'Password and Username combination is invalid.')
})

export const refreshAccessToken = ca(async (req, res) => {
  let payload
  try {
    payload = await jwtService.verifyRefreshToken(req.body.refreshToken)
  } catch (e: any) {
    throw new ApiError(400, e.message)
  }
  const user = await User.findById(payload.uid)
  if (user) {
    return res.json(jwtService.generateAccessToken(user))
  }
  throw new ApiError(400, 'Your account has been deleted.')
})

export const revokeRefreshToken = ca(async (req, res) => {
  try {
    await jwtService.blacklistRefreshToken(req.body.refreshToken)
  } catch (e: any) {
    throw new ApiError(400, e.message)
  }
  res.sendStatus(204)
})
