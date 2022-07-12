import { Schema, model, Document, Model } from 'mongoose'
import moment from 'moment'
import { randomBytes } from 'crypto'
import config from '@/config/config'

export interface IForgot {
  email: string
  code: string
  expiredAt: Date
  createdAt?: Date
}

export interface IForgotDocument extends IForgot, Document {}

export interface IForgotModel extends Model<IForgotDocument> {
  generateForgotPasswordCode(email: string): Promise<string>
  verifyForgotPasswordCode(code: string, email: string): Promise<IForgotDocument>
}

export const ForgotSchema: Schema<IForgotDocument> = new Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expiredAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
})

ForgotSchema.statics.generateForgotPasswordCode = async function (email: string): Promise<string> {
  const code = randomBytes(3).toString('hex').toUpperCase()
  await this.deleteMany({ email })
  await this.create({
    email,
    code,
    expiredAt: moment().add(config.resetPasswordExpMinutes, 'minutes'),
  })
  return code
}

ForgotSchema.statics.verifyForgotPasswordCode = async function (code: string, email: string): Promise<IForgotDocument> {
  const forgotCode = await this.findOne({ code, email })
  if (!forgotCode) throw new Error('The code is invalid.')
  if (moment().isAfter(forgotCode.expiredAt)) throw new Error('The code has expired.')
  return forgotCode
}

const Forgot = model<IForgotDocument, IForgotModel>('Forgot', ForgotSchema)

export default Forgot
