import { Schema, model, Document, Model } from 'mongoose'

export interface IComment {
  author: string
  post: string
  parent: string
  content: string
}

export interface ICommentDocument extends IComment, Document {
  createdAt: Date
}

export interface ICommentModel extends Model<ICommentDocument> {}

// Schema
export const CommentSchema: Schema<ICommentDocument> = new Schema(
  {
    author: { type: String, required: true, immutable: true },
    post: { type: String, required: true, immutable: true },
    parent: { type: String, immutable: true },
    content: { type: String, required: true },
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

// Model
const Comment = model<ICommentDocument, ICommentModel>('Comment', CommentSchema)

export default Comment
