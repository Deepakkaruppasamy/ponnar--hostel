import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { attachToken } from '../api/client.js'

const AuthContext = createContext(null)

const storageKey = 'smart-hostel-auth'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const { token: t, user: u } = JSON.parse(raw)
      setToken(t)
      setUser(u)
    }
  }, [])

  // Keep axios auth header in sync
  useEffect(() => {
    attachToken(() => token)
  }, [token])

  const login = (t, u) => {
    setToken(t)
    setUser(u)
    localStorage.setItem(storageKey, JSON.stringify({ token: t, user: u }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(storageKey)
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


