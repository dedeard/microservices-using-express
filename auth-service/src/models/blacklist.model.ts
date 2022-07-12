import { Schema, model, Document, Model } from 'mongoose'

export interface IBlacklist {
  user: Schema.Types.ObjectId
  jti: string
  exp: string
}

export interface IBlacklistDocument extends IBlacklist, Document {}

export interface IBlacklistModel extends Model<IBlacklistDocument> {}

export const BlacklistSchema: Schema<IBlacklistDocument> = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  jti: { type: String, required: true, unique: true },
  exp: { type: String, required: true },
})

const Blacklist = model<IBlacklistDocument, IBlacklistModel>('Blacklist', BlacklistSchema)

export default Blacklist
