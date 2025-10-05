import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) navigate('/')
  }, [isAuthenticated, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/register', { username, email, password })
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      const remote = err.response?.data
      const msg = remote?.error?.formErrors?.join?.(', ') || remote?.error || 'Registration failed'
      setError(msg)
    }
  }

  return (
    <div className="card form-card">
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} minLength={4} maxLength={20} required />

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />

        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
