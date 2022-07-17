import moment from 'moment'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { errorMessage } from '../../common/errorConverter'
import swal from '../../common/swal'
import api from '../../services/api.service'
import { IPost } from '../../types'
import Avatar from '../Avatar'
import Comments from '../Comments'

export default function ReadPostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [post, setPost] = React.useState<IPost | null>(null)

  React.useEffect(() => {
    const loadPost = async (slug: string) => {
      setLoading(true)
      try {
        const post = await api().getPost(slug)
        setPost(post)
      } catch (e: any) {
        if (e.response?.status === 404) {
          return navigate('/404')
        }
        swal.error(errorMessage(e))
      }
      setLoading(false)
    }
    if (slug) loadPost(slug)
  }, [slug])

  if (!post) return null

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-4">
          <div className="card card-body">
            <div className="text-center pt-5">
              <div className="mb-3">
                <Avatar
                  name={post.author.name || 'N'}
                  size={80}
                  fontSize={24}
                />
              </div>
              <h5 className="text-uppercase ">{post.author.name}</h5>
              <p className="text-muted">@{post.author.username}</p>
              <p className="text-muted small">{post.author.bio}</p>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <h1 className="h2 mb-3">{post.title}</h1>
              <div className="mb-3 d-flex">
                <div className="pe-3 my-auto">
                  <Link to={`/@${post.author.username}`}>
                    <Avatar name={post.author.name} />
                  </Link>
                </div>
                <p className="my-auto">
                  <span className="d-block">
                    <strong>
                      <Link to={`/@${post.author.username}`}>
                        {post.author.name}
                      </Link>
                    </strong>
                  </span>
                  <span className="d-block text-muted small">
                    {moment(post.createdAt).fromNow()}
                  </span>
                </p>
              </div>
            </div>
            <hr />
            <div className="card-body">
              <ReactMarkdown
                children={post.content || ''}
                components={{ h1: 'h3', h2: 'h3' }}
              />
            </div>
            <hr />
            <div className="card-body">
              <Comments postId={post.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
