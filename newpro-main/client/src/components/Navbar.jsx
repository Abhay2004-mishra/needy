import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Modal from './Modal'

export default function Navbar() {
  const { user, login, register, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/jobs', label: 'Find Jobs' }
  ]

  if (user) {
    navItems.push({ path: '/post', label: 'Post Job' })
    navItems.push({ path: '/dashboard', label: 'Dashboard' })
    navItems.push({ path: '/messages', label: 'Messages' })
    navItems.push({ path: '/payments', label: 'Payments' })
    if (user.role === 'admin') {
      navItems.push({ path: '/admin', label: 'Admin' })
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      await login(fd.get('email'), fd.get('password'))
      setShowLogin(false)
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      await register({
        firstName: fd.get('firstName'),
        lastName: fd.get('lastName'),
        email: fd.get('email'),
        password: fd.get('password'),
        role: fd.get('role'),
        skills: fd.get('skills') || ''
      })
      setShowRegister(false)
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1c]/90 backdrop-blur-xl border-b border-[#2d3748]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center animate-pulse-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight font-grotesk">JobConnect</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth buttons */}
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                <>
                  <button onClick={() => setShowLogin(true)} className="btn-secondary text-sm py-2 px-5">Sign In</button>
                  <button onClick={() => setShowRegister(true)} className="btn-primary text-sm py-2 px-5">Get Started</button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/dashboard')} className="relative p-2 rounded-lg hover:bg-[#1a2234] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0f1c]"></span>
                  </button>
                  <div className="flex items-center gap-3 cursor-pointer group" onClick={logout}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user.avatar || (user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                    </div>
                    <span className="text-sm font-medium group-hover:text-emerald-400 transition-colors">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-[#1a2234]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 w-4/5 max-w-xs h-screen bg-bg-card border-l border-border-custom z-[1001] transition-transform duration-300 p-20 pt-20 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 p-2 rounded-lg hover:bg-bg-secondary">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col gap-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="text-lg font-medium py-3 border-b border-[#2d3748]"
            >
              {item.label}
            </Link>
          ))}
          {!user && (
            <div className="mt-4 flex flex-col gap-3">
              <button onClick={() => { setShowLogin(true); setMobileOpen(false); }} className="btn-secondary w-full">Sign In</button>
              <button onClick={() => { setShowRegister(true); setMobileOpen(false); }} className="btn-primary w-full">Get Started</button>
            </div>
          )}
          {user && (
            <button onClick={() => { logout(); setMobileOpen(false); }} className="btn-secondary w-full mt-4">Logout</button>
          )}
        </div>
      </div>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-[1000]" onClick={() => setMobileOpen(false)} />}

      {/* Login Modal */}
      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <div className="w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-grotesk">Welcome Back</h2>
              <button onClick={() => setShowLogin(false)} className="p-2 rounded-lg hover:bg-bg-secondary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" name="email" required placeholder="your@email.com" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input type="password" name="password" required placeholder="Enter your password" className="input-field" />
                </div>
                <button type="submit" className="btn-primary w-full py-4">Sign In</button>
              </div>
            </form>
            <p className="text-center mt-6 text-slate-400">
              Don't have an account?{' '}
              <button onClick={() => { setShowLogin(false); setShowRegister(true); }} className="text-emerald-400 hover:underline font-medium">Sign up</button>
            </p>
          </div>
        </Modal>
      )}

      {/* Register Modal */}
      {showRegister && (
        <Modal onClose={() => setShowRegister(false)}>
          <div className="w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-grotesk">Create Account</h2>
              <button onClick={() => setShowRegister(false)} className="p-2 rounded-lg hover:bg-bg-secondary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleRegister}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input type="text" name="firstName" required placeholder="John" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input type="text" name="lastName" required placeholder="Doe" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" name="email" required placeholder="your@email.com" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input type="password" name="password" required minLength="8" placeholder="Min 8 characters" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">I want to...</label>
                  <select name="role" required className="input-field">
                    <option value="">Select your role</option>
                    <option value="worker">Find Jobs (Worker)</option>
                    <option value="poster">Post Jobs (Employer)</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Skills (optional)</label>
                  <input type="text" name="skills" placeholder="e.g., Driving, Programming, Design" className="input-field" />
                </div>
                <button type="submit" className="btn-primary w-full py-4">Create Account</button>
              </div>
            </form>
            <p className="text-center mt-6 text-slate-400">
              Already have an account?{' '}
              <button onClick={() => { setShowRegister(false); setShowLogin(true); }} className="text-emerald-400 hover:underline font-medium">Sign in</button>
            </p>
          </div>
        </Modal>
      )}
    </>
  )
}
