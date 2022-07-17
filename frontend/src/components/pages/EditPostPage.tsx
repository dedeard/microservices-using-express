import React from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { errorResponse } from '../../common/errorConverter'
import swal from '../../common/swal'
import { useAuth } from '../../contexts/auth/context'
import api from '../../services/api.service'
import FormWrapper from '../FormWrapper'
import UIInput from '../UIInput'

type initialDataTypes = {
  title: string
  description: string
  content: string
}

export default function EditPostPage() {
  const { id } = useParams()
  const auth = useAuth()
  const initialData = { title: '', description: '', content: '' }

  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<initialDataTypes>(initialData)
  const [input, setInput] = React.useState<initialDataTypes>(initialData)

  React.useEffect(() => {
    const fetchPost = async (id: string) => {
      setLoading(true)
      setErrors(initialData)
      try {
        const post = await api(auth.state.token).getPost(id)
        setInput({
          ...input,
          title: post.title,
          description: post.description,
          content: post.content || '',
        })
      } catch (e) {
        const err = errorResponse(e)
        setErrors({ ...initialData, ...err.errors })
        if (err.message) swal.error(err.message)
      }
      setLoading(false)
    }
    if (id) fetchPost(id)
  }, [id])

  const handleChange = (e: React.FormEvent<any>) => {
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors(initialData)
    try {
      const post = await api(auth.state.token).updatePost(id || '', input)
      swal.success('Post updated!')
      setInput({
        ...input,
        title: post.title,
        description: post.description,
        content: post.content || '',
      })
    } catch (e: any) {
      const err = errorResponse(e)
      setErrors({ ...initialData, ...err.errors })
      if (err.message) swal.error(err.message)
    }
    setLoading(false)
  }

  if (!auth.state.user) return <Navigate to="/login" replace={true} />

  return (
    <FormWrapper title="EDIT POST" onSubmit={handleSubmit}>
      <UIInput
        name="title"
        label="Title"
        value={input.title}
        error={errors.title}
        onChange={handleChange}
      />
      <UIInput
        name="description"
        label="Description"
        textarea={true}
        value={input.description}
        error={errors.description}
        onChange={handleChange}
      />
      <UIInput
        name="content"
        label="Content"
        textarea={true}
        placeholder="Write your post markdown here..."
        rows={10}
        value={input.content}
        error={errors.content}
        onChange={handleChange}
      />
      <div className="d-grid gap-2 pt-3">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Update post
        </button>
      </div>
    </FormWrapper>
  )
}
