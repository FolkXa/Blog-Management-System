import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const onLogout = () => { logout(); navigate('/') }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand">Blog</Link>
      </div>
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <span className="welcome">Hi, {user?.username}</span>
            <Link to="/create" className="btn">New Post</Link>
            <button className="btn outline" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn">Login</Link>
            <Link to="/register" className="btn outline">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
