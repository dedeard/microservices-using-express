import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { errorMessage, errorResponse } from '../common/errorConverter'
import swal from '../common/swal'
import { useAuth } from '../contexts/auth/context'
import api from '../services/api.service'
import { ICommen, IReply, IUser } from '../types'
import Avatar from './Avatar'
import UIInput from './UIInput'
import { CreateReply, ReplyList } from './Reply'

const CreateComment = (props: {
  postId: string
  onComment: (comment: ICommen) => void
}) => {
  const auth = useAuth()

  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{ content: string }>({
    content: '',
  })
  const [input, setInput] = React.useState<{ content: string }>({ content: '' })

  const handleChange = (e: React.FormEvent<any>) => {
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({ content: '' })
    try {
      const comment = await api(auth.state.token).createComment(
        props.postId,
        input,
      )
      comment.author = auth.state.user as IUser
      comment.replies = []
      props.onComment(comment)
      setInput({ ...input, content: '' })
      swal.success('Comment created!')
    } catch (e: any) {
      const err = errorResponse(e)
      setErrors({ ...{ content: '' }, ...err.errors })
      if (err.message) swal.error(err.message)
    }
    setLoading(false)
  }

  return (
    <>
      {auth.state.user ? (
        <form onSubmit={handleSubmit} className="mb-3">
          <UIInput
            name="content"
            label=" "
            placeholder="Write a comment..."
            textarea={true}
            value={input.content}
            error={errors.content}
            onChange={handleChange}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Create comment
          </button>
        </form>
      ) : (
        <div className="py-5 text-center">
          <h3 className="mb-3">You must be logged in to comment</h3>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      )}
    </>
  )
}

const CommetList = (props: {
  comment: ICommen
  onUpdated: (comment: ICommen) => void
  onDeleted: (commentId: string) => void
}) => {
  const auth = useAuth()
  const { comment } = props
  const [openReply, setOpenReply] = React.useState(false)

  const onReply = (reply: IReply) => {
    const data = { ...comment, replies: [reply, ...comment.replies] }
    props.onUpdated(data)
  }

  const onReplyDeleted = (replyId: string) => {
    const data = {
      ...comment,
      replies: comment.replies.filter((r) => r.id !== replyId),
    }
    props.onUpdated(data)
  }

  const handleDelete = async () => {
    const { isConfirmed } = await swal.dangerConfirm()
    if (!isConfirmed) return
    try {
      await api(auth.state.token).deleteComment(comment.id)
      props.onDeleted(comment.id)
    } catch (e: any) {
      swal.error(errorMessage(e))
    }
  }
  return (
    <div className="py-3 border-bottom">
      <div className="mb-3 d-flex">
        <div className="pe-3 my-auto">
          <Link to={`/@${comment.author.username}`}>
            <Avatar name={comment.author.name} />
          </Link>
        </div>
        <p className="my-auto">
          <span className="d-block">
            <strong>
              <Link to={`/@${comment.author.username}`}>
                {comment.author.name}
              </Link>
            </strong>
          </span>
          <span className="d-block text-muted small">
            {moment(comment.createdAt).fromNow()}
          </span>
        </p>
      </div>
      <div style={{ paddingLeft: 61 }}>
        <p>{comment.content}</p>
        {auth.state.user && (
          <button
            className="btn btn-sm text-primary p-0 font-weight-bold me-3 mb-3"
            onClick={() => setOpenReply(!openReply)}
          >
            {openReply ? 'Close' : 'Reply'}
          </button>
        )}
        {auth.state.user && auth.state.user.id === comment.author.id && (
          <button
            className="btn btn-sm p-0 text-danger font-weight-bold mb-3"
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
        {openReply && auth.state.user && (
          <CreateReply commentId={comment.id} onReply={onReply} />
        )}
        {comment.replies.map((reply) => (
          <ReplyList key={reply.id} reply={reply} onDeleted={onReplyDeleted} />
        ))}
      </div>
    </div>
  )
}

export default function Comments(props: { postId: string }) {
  const { postId } = props
  const [comments, setComments] = React.useState<ICommen[]>([])

  React.useEffect(() => {
    if (postId) {
      api()
        .getComments(postId)
        .then((data) => {
          setComments(data)
        })
        .catch((e) => {
          swal.error(errorMessage(e))
        })
    }
  }, [props.postId])

  const addComment = async (comment: ICommen) => {
    setComments([comment, ...comments])
  }

  const onCommentUpdate = (comment: ICommen) => {
    const data = comments.map((c) => {
      if (c.id === comment.id) {
        return comment
      }
      return c
    })
    setComments([...data])
  }

  const onCommentDeleted = (commentId: string) => {
    const data = comments.filter((c) => c.id !== commentId)
    console.log('onCommentDeleted', data)
    setComments([...data])
  }

  return (
    <>
      <h3>Comments</h3>
      {<CreateComment postId={postId} onComment={addComment} />}
      <hr />
      {comments.map((comment) => (
        <CommetList
          key={comment.id}
          comment={comment}
          onUpdated={onCommentUpdate}
          onDeleted={onCommentDeleted}
        />
      ))}
    </>
  )
}
