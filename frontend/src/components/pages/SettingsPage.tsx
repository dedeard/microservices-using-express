import React from 'react'
import { Navigate } from 'react-router-dom'
import { errorResponse } from '../../common/errorConverter'
import swal from '../../common/swal'
import { useAuth } from '../../contexts/auth/context'
import api from '../../services/api.service'
import FormWrapper from '../FormWrapper'
import UIInput from '../UIInput'

export default function SettingsPage() {
  const auth = useAuth()

  const initialData = {
    name: '',
    username: '',
    bio: '',
    newPassword: '',
    password: '',
  }

  const [loading, setLoading] = React.useState(false)

  const [errors, setErrors] = React.useState<{
    name: string
    username: string
    bio: string
    newPassword: string
    password: string
  }>(initialData)

  const [input, setInput] = React.useState<{
    name: string
    username: string
    bio: string
    newPassword: string
    password: string
  }>(initialData)

  React.useEffect(() => {
    setInput({
      ...input,
      name: auth.state.user?.name || '',
      username: auth.state.user?.username || '',
      bio: auth.state.user?.bio || '',
    })
  }, [auth.state.user])

  const handleChange = (e: React.FormEvent<any>) => {
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      setErrors(initialData)
      const user = await api(auth.state.token).updateProfile(input)
      swal.success('Profile updated successfully')
      auth.dispatch({ type: 'SET_USER', payload: user })
    } catch (e: any) {
      const err = errorResponse(e)
      setErrors({ ...initialData, ...err.errors })
      if (err.message) swal.error(err.message)
    }
    setLoading(false)
  }

  if (!auth.state.user) return <Navigate to="/login" replace={true} />
  return (
    <FormWrapper title="SETTINGS" onSubmit={handleSubmit}>
      <UIInput
        name="name"
        label="Your name"
        value={input.name}
        error={errors.name}
        onChange={handleChange}
      />
      <UIInput
        name="username"
        label="Username"
        value={input.username}
        error={errors.username}
        onChange={handleChange}
      />
      <UIInput
        name="bio"
        label="Bio"
        textarea={true}
        value={input.bio}
        error={errors.bio}
        onChange={handleChange}
      />
      <UIInput
        name="newPassword"
        type="password"
        label="New Password"
        value={input.newPassword}
        error={errors.newPassword}
        onChange={handleChange}
      />
      <UIInput
        name="password"
        type="password"
        label="Password"
        value={input.password}
        error={errors.password}
        onChange={handleChange}
      />
      <div className="d-grid gap-2 pt-3">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Update
        </button>
      </div>
    </FormWrapper>
  )
}
