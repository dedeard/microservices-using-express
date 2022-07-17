import React from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { errorResponse } from '../../common/errorConverter'
import swal from '../../common/swal'
import { useAuth } from '../../contexts/auth/context'
import api from '../../services/api.service'
import FormWrapper from '../FormWrapper'
import UIInput from '../UIInput'

export default function RegisterPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const initialData = { name: '', username: '', password: '' }

  const [loading, setLoading] = React.useState(false)

  const [errors, setErrors] = React.useState<{
    name: string
    username: string
    password: string
  }>(initialData)

  const [input, setInput] = React.useState<{
    name: string
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
    setErrors(initialData)
    try {
      await api().register(input)
      swal.success('You have successfully registered, please login')
      navigate('/login', { replace: true })
    } catch (e: any) {
      const err = errorResponse(e)
      setErrors({ ...initialData, ...err.errors })
      if (err.message) swal.error(err.message)
    }
    setLoading(false)
  }

  if (auth.state.user) return <Navigate to="/" replace={true} />

  return (
    <FormWrapper title="REGISTER" onSubmit={handleSubmit}>
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
        name="password"
        type="password"
        label="Password"
        value={input.password}
        error={errors.password}
        onChange={handleChange}
      />
      <div className="d-grid gap-2 pt-3">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Register
        </button>
        <hr />
        <Link to="/login" className="btn btn-light">
          Login
        </Link>
      </div>
    </FormWrapper>
  )
}
