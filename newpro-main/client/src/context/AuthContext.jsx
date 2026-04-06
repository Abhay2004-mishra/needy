import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { useToast } from './ToastContext'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('jobconnect_token')
    const savedUser = localStorage.getItem('jobconnect_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      // Verify token is still valid
      authAPI.getMe()
        .then(res => {
          setUser(res.data.user)
          localStorage.setItem('jobconnect_user', JSON.stringify(res.data.user))
        })
        .catch(() => {
          localStorage.removeItem('jobconnect_token')
          localStorage.removeItem('jobconnect_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, user: userData } = res.data
    localStorage.setItem('jobconnect_token', token)
    localStorage.setItem('jobconnect_user', JSON.stringify(userData))
    setUser(userData)
    showToast(`Welcome back, ${userData.firstName}!`, 'success')
    return userData
  }

  const register = async (data) => {
    const res = await authAPI.register(data)
    const { token, user: userData } = res.data
    localStorage.setItem('jobconnect_token', token)
    localStorage.setItem('jobconnect_user', JSON.stringify(userData))
    setUser(userData)
    showToast('Account created successfully!', 'success')
    return userData
  }

  const logout = () => {
    localStorage.removeItem('jobconnect_token')
    localStorage.removeItem('jobconnect_user')
    setUser(null)
    showToast('Logged out successfully', 'success')
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('jobconnect_user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
