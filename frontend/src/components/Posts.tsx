import moment from 'moment'
import React from 'react'
import { Link } from 'react-router-dom'
import swal from '../common/swal'
import { useAuth } from '../contexts/auth/context'
import api from '../services/api.service'
import { IPost } from '../types'
import Avatar from './Avatar'

function PostList(props: { post: IPost; onDelete?: (id: string) => void }) {
  const { post } = props
  const auth = useAuth()
  const [loading, setLoading] = React.useState(false)

  const handleDelete = async () => {
    const { isConfirmed } = await swal.dangerConfirm()
    if (!isConfirmed) return
    setLoading(true)
    try {
      await api(auth.state.token).deletePost(post.id)
      if (props.onDelete) props.onDelete(post.id)
    } catch (e: any) {
      swal.error(e.message)
    }
    setLoading(false)
  }

  return (
    <div key={post.id} className="card card-body mb-3 p-3 pt-4">
      <h5 className="card-title text-uppercase mb-3">{post.title}</h5>
      <div className="mb-3 d-flex">
        <div className="pe-3 my-auto">
          <Link to={`/@${post.author.username}`}>
            <Avatar name={post.author.name} />
          </Link>
        </div>
        <p className="my-auto">
          <span className="d-block">
            <strong>
              <Link to={`/@${post.author.username}`}>{post.author.name}</Link>
            </strong>
          </span>
          <span className="d-block text-muted small">
            {moment(post.createdAt).fromNow()}
          </span>
        </p>
      </div>
      <p>{post.description}</p>
      <div>
        <Link to={'/' + post.slug} className="btn btn-primary">
          Read
        </Link>
        {post.author.id === auth.state.user?.id && (
          <>
            <Link
              to={'/' + post.id + '/edit-post'}
              className="btn btn-info ms-2"
            >
              Edit
            </Link>
            <button
              className="btn btn-danger ms-2"
              type="button"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function Posts(props: { userId?: string }) {
  const { userId } = props
  const [loading, setLoading] = React.useState(true)
  const [end, setEnd] = React.useState(false)
  const [posts, setPosts] = React.useState<IPost[]>([])

  const loadPosts = React.useCallback(async () => {
    setLoading(true)
    const data = await api().getPosts(posts.at(-1)?.id || '', 6, userId)
    setPosts([...posts, ...data])
    if (data.length < 2) setEnd(true)
    setLoading(false)
  }, [posts, loading, userId])

  React.useEffect(() => {
    loadPosts()
  }, [])

  const handleDelete = React.useCallback(
    (id: string) => {
      setPosts([...posts.filter((p) => p.id !== id)])
    },
    [posts],
  )

  return (
    <>
      {posts.map((post) => (
        <PostList key={post.id} post={post} onDelete={handleDelete} />
      ))}
      <div className="text-center mb-3">
        <button
          onClick={loadPosts}
          className="btn btn-primary btn-lg px-5"
          disabled={loading || end}
        >
          {(() => {
            if (loading) return 'Loading...'
            if (end) return 'No more posts'
            return 'Load more'
          })()}
        </button>
      </div>
    </>
  )
}
