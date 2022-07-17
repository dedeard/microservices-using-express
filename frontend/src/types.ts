export interface IUser {
  id: string
  name: string
  username: string
  bio: string | null
  lastLogin: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface IToken {
  bearer: string
  expiredAt: string
}

export interface IPost {
  id: string
  title: string
  slug: string
  description: string
  content?: string
  createdAt: string
  author: IUser
}

export interface IReply {
  id: string
  author: IUser
  postId: string
  content: string
  createdAt: string
}

export interface ICommen extends IReply {
  replies: IReply[]
}
