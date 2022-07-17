import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/auth/context'

export default function AppNavbar() {
  const auth = useAuth()
  return (
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom py-3">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <strong>MICRO</strong>
        </Link>
        <div className="navbar-nav">
          <Link className="nav-link" to="/">
            Home
          </Link>
          <a
            className="nav-link"
            target="_blank"
            href="https://github.com/dedeardiansya/microservices-using-express"
          >
            Source code
          </a>
          {auth.state.user ? (
            <>
              <Link className="nav-link" to={'/@' + auth.state.user.username}>
                Profile
              </Link>
              <Link className="nav-link" to="/new-post">
                New Post
              </Link>
              <Link className="nav-link" to="/settings">
                Settings
              </Link>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">
                Login
              </Link>
              <Link className="nav-link" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
