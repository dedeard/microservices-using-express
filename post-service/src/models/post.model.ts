import { randomBytes } from 'crypto'
import { Schema, model, Document, Model } from 'mongoose'
import slugify from 'slugify'

export interface IPost {
  author: string
  title: string
  slug: string
  description: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface IPostDocument extends IPost, Document {}

export interface IPostModel extends Model<IPostDocument> {}

// Schema
export const PostSchema: Schema<IPostDocument> = new Schema(
  {
    author: { type: String, required: true, immutable: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    content: { type: String, default: '' },
  },
  {
    timestamps: true,
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

// Pre save
// Generate slug
PostSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const rn = Math.floor(Math.random() * 4 + 1)
    const hash = randomBytes(rn).toString('hex')
    this.slug = slugify(this.title, { lower: true, remove: /[*+~.()'"!:@]/g }) + '-' + hash
  }
  next()
})

// Model
const Post = model<IPostDocument, IPostModel>('Post', PostSchema)

export default Post
