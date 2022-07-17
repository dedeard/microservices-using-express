import { Schema, model, Document, Model } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser {
  name: string
  username: string
  password: string
  bio?: string
  lastLogin?: Date
}

export interface IUserDocument extends IUser, Document {
  comparePassword: (password: string) => Promise<boolean>
}

export interface IUserModel extends Model<IUserDocument> {
  isUsernameTaken: (username: string, excludeId?: string) => Promise<boolean>
}

export const UserSchema: Schema<IUserDocument> = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 30 },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    bio: { type: String, maxlength: 300, default: '' },
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

// Statics
//
UserSchema.statics.isUsernameTaken = async function (username: string, excludeId: string): Promise<boolean> {
  const count = await this.countDocuments({ username, _id: { $ne: excludeId } })
  return count > 0
}

// Model
//
const User = model<IUserDocument, IUserModel>('User', UserSchema)

export default User
