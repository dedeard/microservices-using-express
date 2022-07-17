import Joi from 'joi'
import User, { IUserDocument } from '@/models/user.model'

export const uniqueUsernameLookup =
  (exludeId?: string): Joi.ExternalValidationFunction =>
  async (val) => {
    const exists = await User.isUsernameTaken(val, exludeId)
    if (exists) {
      throw new Joi.ValidationError(
        '"Username" already exists.',
        [{ message: '"Username" already exists.', context: { key: 'username' }, path: ['username'] }],
        val,
      )
    }
  }

export const registeredUsernameLookup =
  (exludeId?: string): Joi.ExternalValidationFunction =>
  async (val) => {
    const exists = await User.isUsernameTaken(val, exludeId)
    if (!exists) {
      throw new Joi.ValidationError(
        '"Username" is not registered.',
        [{ message: '"Username" is not registered.', context: { key: 'username' }, path: ['username'] }],
        val,
      )
    }
  }

export const passwordMatchLookup =
  (user: IUserDocument): Joi.ExternalValidationFunction =>
  async (val) => {
    const match = await user.comparePassword(val)
    if (!match) {
      throw new Joi.ValidationError(
        '"Password" is not valid.',
        [{ message: '"Password" is not valid', context: { key: 'password' }, path: ['password'] }],
        val,
      )
    }
  }
