import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useToast } from '../context/ToastContext'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('pending')
  const [message, setMessage] = useState('Verifying your email...')
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Verification token missing.')
      return
    }

    authAPI.verifyEmail(token)
      .then(res => {
        setStatus('success')
        setMessage(res.data.message || 'Your email has been verified successfully.')
        showToast('Email verified successfully!', 'success')
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed. Please try again.')
        showToast('Email verification failed', 'error')
      })
  }, [searchParams, showToast])

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card p-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Email Verification</h1>
          <p className="text-slate-400 mb-8">{message}</p>
          {status === 'success' ? (
            <button onClick={() => navigate('/dashboard')} className="btn-primary py-3 px-8">
              Go to Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/jobs')} className="btn-secondary py-3 px-8">
              Browse Jobs
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
