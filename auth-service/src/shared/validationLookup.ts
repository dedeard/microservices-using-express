import Joi from 'joi'
import User, { IUserDocument } from '@/models/user.model'

export const uniqueEmailLookup =
  (exludeId?: string): Joi.ExternalValidationFunction =>
  async (val) => {
    const exists = await User.isEmailTaken(val, exludeId)
    if (exists) {
      throw new Joi.ValidationError('"Email" already exists.', [{ message: '"Email" already exists.', context: { key: 'email' } }], val)
    }
  }

export const registeredEmailLookup =
  (exludeId?: string): Joi.ExternalValidationFunction =>
  async (val) => {
    const exists = await User.isEmailTaken(val, exludeId)
    if (!exists) {
      throw new Joi.ValidationError(
        '"Email" is not registered.',
        [{ message: '"Email" is not registered.', context: { key: 'email' } }],
        val,
      )
    }
  }

export const passwordMatchLookup =
  (user: IUserDocument): Joi.ExternalValidationFunction =>
  async (val) => {
    const match = await user.comparePassword(val)
    if (!match) {
      throw new Joi.ValidationError('"Password" is not valid.', [{ message: '"Password" is not valid', context: { key: 'password' } }], val)
    }
  }
