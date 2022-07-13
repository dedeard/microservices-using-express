import mongoose from 'mongoose'
import { Schema, model, Document, Model } from 'mongoose'

export interface IComment {
  author: string
  post: string
  parent: string
  body: string
  liked: string[]
}

export interface ICommentDocument extends IComment, Document {
  createdAt: Date
  like: (userId: string) => Promise<void>
  unlike: (userId: string) => Promise<void>
}

export interface ICommentModel extends Model<ICommentDocument> {}

// Schema
export const CommentSchema: Schema<ICommentDocument> = new Schema(
  {
    author: { type: String, required: true, immutable: true },
    post: { type: String, required: true, immutable: true },
    parent: { type: String, immutable: true },
    body: { type: String, required: true },
    liked: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now, immutable: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

// Methods
//
CommentSchema.methods.like = async function (userId: string): Promise<void> {
  const userIds = [...new Set(this.liked.concat(userId))]
  this.liked = userIds
  await this.save()
}

CommentSchema.methods.unlike = async function (userId: string): Promise<void> {
  const userIds = this.liked.filter((id: string) => id !== userId)
  this.liked = userIds
  await this.save()
}

// Model
const Comment = model<ICommentDocument, ICommentModel>('Comment', CommentSchema)

export default Comment
