import storageService from '@/services/storage.service'
import { randomBytes } from 'crypto'
import moment from 'moment'
import { Schema, model, Document, PaginateModel } from 'mongoose'
import paginate from 'mongoose-paginate-v2'
import sharp from 'sharp'
import slugify from 'slugify'

export interface IPost {
  user: Schema.Types.ObjectId
  title: string
  slug: string
  heroImage?: string
  description: string
  body: string
  tags: string[]
  published: boolean
  likes: Schema.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

export interface IPostDocument extends IPost, Document {
  generateHero: (imgBuff: Buffer) => Promise<string>
  deleteHero: () => Promise<void>
}

export interface IPostModel extends PaginateModel<IPostDocument> {}

// Schema
export const PostSchema: Schema<IPostDocument> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, immutable: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    heroImage: { type: String },
    description: { type: String, required: true },
    body: { type: String, default: '' },
    tags: [{ type: String, default: [] }],
    published: { type: Boolean, default: false },
    likes: [{ type: Schema.Types.ObjectId, default: [] }],
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

PostSchema.plugin(paginate)

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

// Methods
// Generate hero image
PostSchema.methods.generateHero = async function (imgBuff: Buffer): Promise<string> {
  const name = 'hero/' + this._id + '-' + moment().unix() + '.jpg'
  await sharp(imgBuff)
    .resize({ width: 180, height: 180 })
    .toFormat('jpeg')
    .toBuffer()
    .then((buffer) => {
      return storageService.save(name, buffer)
    })
  const oldHero = this.heroImage
  this.heroImage = storageService.createUrl(name)
  await this.save()
  if (oldHero) {
    await storageService.remove(storageService.normalizeUrl(oldHero))
  }
  return this.heroImage
}

// Delete hero image
PostSchema.methods.deleteHero = async function (): Promise<void> {
  await storageService.remove(storageService.normalizeUrl(this.heroImage))
  this.heroImage = undefined
  await this.save()
}

// Model
const Post = model<IPostDocument, IPostModel>('Post', PostSchema)

export default Post
