import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/auth/context'
import api from '../../services/api.service'
import { IUser } from '../../types'
import Avatar from '../Avatar'
import Posts from '../Posts'

export default function ProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const auth = useAuth()
  const [user, setUser] = React.useState<IUser | null>(null)

  React.useEffect(() => {
    api()
      .getUser(username || '')
      .then(setUser)
      .catch((e) => {
        navigate('/404')
      })
  }, [])

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-4">
          <div className="card card-body">
            <div className="text-center pt-5">
              <div className="mb-3">
                <Avatar name={user?.name || 'N'} size={80} fontSize={24} />
              </div>
              <h5 className="text-uppercase ">{user?.name}</h5>
              <p className="text-muted">@{user?.username}</p>
              <p className="text-muted small">{user?.bio}</p>
              {user?.id === auth.state.user?.id && (
                <button className="btn btn-danger ms-2">LOGOUT</button>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-8">{user && <Posts userId={user.id} />}</div>
      </div>
    </div>
  )
}
