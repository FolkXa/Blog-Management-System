import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken } from '../api/client.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'blog_token'
const USER_KEY = 'blog_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
    // ensure axios has the correct Authorization header whenever token changes
    setAuthToken(token)
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  }, [user])

  // initialize axios Authorization on first render
  useEffect(() => { setAuthToken(token) }, [])

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token,
    login: (newToken, newUser) => { setToken(newToken); setUser(newUser); setAuthToken(newToken) },
    logout: () => { setToken(''); setUser(null); setAuthToken('') }
  }), [token, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
