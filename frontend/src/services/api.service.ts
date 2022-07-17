import axios from 'axios'
import { ICommen, IPost, IReply, IToken, IUser } from '../types'

axios.defaults.baseURL =
  import.meta.env.VITE_BASE_API_URL || 'http://localhost:4000'

export default function api(token?: string | null) {
  const headers = {
    Authorization: token ? `Bearer ${token}` : '',
  }
  return {
    register(data: any) {
      return axios.post('/auth/register', data)
    },
    login(data: any) {
      return axios.post('/auth/login', data).then(({ data }) => {
        return data as {
          user: IUser
          token: { refresh: IToken; access: IToken }
        }
      })
    },
    refreshAccessToken(data: { refreshToken: string }) {
      return axios
        .post('/auth/refresh-access-token', data)
        .then(({ data }) => data as IToken)
    },
    revokeRefreshToken(data: { refreshToken: string }) {
      return axios.delete('/auth/revoke-refresh-token', { data })
    },

    getProfile() {
      return axios
        .get('/account/profile', { headers })
        .then(({ data }) => data as IUser)
    },
    updateProfile(data: any) {
      return axios
        .put('/account/profile', data, { headers })
        .then(({ data }) => data as IUser)
    },

    getUser(id: string) {
      return axios.get('/users/' + id).then(({ data }) => data as IUser)
    },

    createPost(data: any) {
      return axios
        .post('/posts', data, { headers })
        .then(({ data }) => data as IPost)
    },
    getPost(id: string) {
      return axios.get('/posts/' + id).then(({ data }) => data as IPost)
    },
    getPosts(skip: number | string, limit: number, userId?: string) {
      return axios
        .get(`/posts?limit=${limit}&skip=${skip}&userId=${userId}`)
        .then(({ data }) => data as IPost[])
    },
    updatePost(id: string, data: any) {
      return axios
        .put('/posts/' + id, data, { headers })
        .then(({ data }) => data as IPost)
    },
    deletePost(id: string) {
      return axios.delete('/posts/' + id, { headers })
    },

    getComments(postId: string) {
      return axios
        .get('/comments/' + postId)
        .then(({ data }) => data as ICommen[])
    },
    createComment(postId: string, data: any) {
      return axios
        .post('/comments/' + postId, data, { headers })
        .then(({ data }) => data as ICommen)
    },
    deleteComment(commentId: string) {
      return axios.delete('/comments/' + commentId, { headers })
    },
    replyComment(commentId: string, data: any) {
      return axios
        .post('/comments/' + commentId + '/reply', data, { headers })
        .then(({ data }) => data as IReply)
    },
    deleteReply(replyId: string) {
      return axios.delete('/comments/' + replyId + '/reply', { headers })
    },
  }
}
