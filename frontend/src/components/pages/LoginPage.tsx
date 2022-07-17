import React from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { errorResponse } from '../../common/errorConverter'
import swal from '../../common/swal'
import { useAuth } from '../../contexts/auth/context'
import api from '../../services/api.service'
import { saveRefreshToken } from '../../services/token.service'
import FormWrapper from '../FormWrapper'
import UIInput from '../UIInput'

export default function LoginPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const initialData = { username: '', password: '' }

  const [loading, setLoading] = React.useState(false)

  const [errors, setErrors] = React.useState<{
    username: string
    password: string
  }>(initialData)

  const [input, setInput] = React.useState<{
    username: string
    password: string
  }>(initialData)

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
      const { user, token } = await api().login(input)
      saveRefreshToken(token.refresh)
      auth.dispatch({ type: 'SET_USER', payload: user })
      auth.dispatch({ type: 'SET_TOKEN', payload: token.access.bearer })
      navigate('/')
    } catch (e: any) {
      const err = errorResponse(e)
      setErrors({ ...initialData, ...err.errors })
      if (err.message) swal.error(err.message)
    }
    setLoading(false)
  }

  if (auth.state.user) return <Navigate to="/" replace={true} />
  return (
    <FormWrapper title="LOGIN" onSubmit={handleSubmit}>
      <UIInput
        name="username"
        label="Username"
        value={input.username}
        error={errors.username}
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
          Login
        </button>
        <hr />
        <Link to="/register" className="btn btn-light">
          Register
        </Link>
      </div>
    </FormWrapper>
  )
}
