import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { errorMessage, errorResponse } from '../common/errorConverter'
import swal from '../common/swal'
import { useAuth } from '../contexts/auth/context'
import api from '../services/api.service'
import { IReply, IUser } from '../types'
import Avatar from './Avatar'
import UIInput from './UIInput'

export const CreateReply = (props: {
  commentId: string
  onReply: (reply: IReply) => void
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
      const reply = await api(auth.state.token).replyComment(
        props.commentId,
        input,
      )
      reply.author = auth.state.user as IUser
      props.onReply(reply)
      setInput({ ...input, content: '' })
      swal.success('Reply created!')
    } catch (e: any) {
      const err = errorResponse(e)
      setErrors({ ...{ content: '' }, ...err.errors })
      if (err.message) swal.error(err.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <UIInput
        name="content"
        label=" "
        rows={2}
        placeholder="Write a message..."
        textarea={true}
        value={input.content}
        error={errors.content}
        onChange={handleChange}
      />
      <button
        type="submit"
        className="btn btn-sm btn-primary"
        disabled={loading}
      >
        Create reply
      </button>
    </form>
  )
}

export const ReplyList = (props: {
  reply: IReply
  onDeleted: (replyId: string) => void
}) => {
  const auth = useAuth()
  const { reply, onDeleted } = props

  const handleDelete = async () => {
    const { isConfirmed } = await swal.dangerConfirm()
    if (!isConfirmed) return
    try {
      await api(auth.state.token).deleteReply(reply.id)
      onDeleted(reply.id)
    } catch (e: any) {
      swal.error(errorMessage(e))
    }
  }

  return (
    <div className="py-3">
      <div className="mb-3 d-flex">
        <div className="pe-3 my-auto">
          <Link to={`/@${reply.author.username}`}>
            <Avatar name={reply.author.name} />
          </Link>
        </div>
        <p className="my-auto">
          <span className="d-block">
            <strong>
              <Link to={`/@${reply.author.username}`}>{reply.author.name}</Link>
            </strong>
          </span>
          <span className="d-block text-muted small">
            {moment(reply.createdAt).fromNow()}
          </span>
        </p>
      </div>
      <div style={{ paddingLeft: 61 }}>
        <p>{reply.content}</p>
        {auth.state.user && auth.state.user.id === reply.author.id && (
          <button
            className="btn btn-sm p-0 text-danger font-weight-bold mb-3"
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
