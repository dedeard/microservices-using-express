import { Schema, model, Document, PaginateModel } from 'mongoose'
import bcrypt from 'bcrypt'
import sharp from 'sharp'
import moment from 'moment'
import paginate from 'mongoose-paginate-v2'
import storageService from '@/services/storage.service'

export interface IUser {
  name: string
  email: string
  password: string
  avatar?: string
  website?: string
  bio?: string
  lastLogin?: Date
}

export interface IUserDocument extends IUser, Document {
  comparePassword: (password: string) => Promise<boolean>
  generateAvatar: (imgBuff: Buffer) => Promise<string>
  deleteAvatar: () => Promise<void>
}

export interface IUserModel extends PaginateModel<IUserDocument> {
  isEmailTaken: (email: string, excludeId?: string) => Promise<boolean>
}

export const UserSchema: Schema<IUserDocument> = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, immutable: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String },
    website: { type: String, trim: true },
    bio: { type: String, maxlength: 300 },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret.password
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

UserSchema.plugin(paginate)

// Hash password before data is seved.
UserSchema.pre('save', function (next) {
  const password = this.password

  if (this.isModified('password')) {
    return bcrypt.hash(password, 10, (err, hash) => {
      if (err) return next(err)
      this.password = hash
      return next()
    })
  }
  return next()
})

// Methods
//
UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password)
}

UserSchema.methods.generateAvatar = async function (imgBuff: Buffer): Promise<string> {
  const name = 'avatar/' + this._id + '-' + moment().unix() + '.jpg'
  await sharp(imgBuff)
    .resize({ width: 180, height: 180 })
    .toFormat('jpeg')
    .toBuffer()
    .then((buffer) => {
      return storageService.save(name, buffer)
    })
  const oldAvatar = this.avatar
  this.avatar = storageService.createUrl(name)
  await this.save()
  if (oldAvatar) {
    await storageService.remove(storageService.normalizeUrl(oldAvatar))
  }
  return this.avatar
}

UserSchema.methods.deleteAvatar = async function (): Promise<void> {
  await storageService.remove(storageService.normalizeUrl(this.avatar))
  this.avatar = undefined
  await this.save()
}

// Statics
//
UserSchema.statics.isEmailTaken = async function (email: string, excludeId: string): Promise<boolean> {
  const count = await this.countDocuments({ email, _id: { $ne: excludeId } })
  return count > 0
}

// Model
//
const User = model<IUserDocument, IUserModel>('User', UserSchema)

export default User
