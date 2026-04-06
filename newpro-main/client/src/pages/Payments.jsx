import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI, paymentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Payments() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    loadJobs()
  }, [user, navigate])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const res = await jobsAPI.getMyJobs()
      setJobs(res.data.data)
    } catch (err) {
      showToast('Failed to load your jobs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedJob || !amount) {
      showToast('Please choose a job and amount', 'warning')
      return
    }

    try {
      const res = await paymentsAPI.create({ jobId: selectedJob, amount: parseFloat(amount), currency: 'usd' })
      setResult(res.data)
      showToast('Payment hold created', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Payment creation failed', 'error')
    }
  }

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8">
          <h1 className="text-3xl font-bold mb-4">Payment Escrow</h1>
          <p className="text-slate-400 mb-6">Create a secure payment hold for a job to protect both parties.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Select one of your jobs</label>
              <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="input-field w-full">
                <option value="">Choose a job</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>{job.title} — {job.locationDisplay}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount to hold (USD)</label>
              <input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field w-full" placeholder="Example: 100" />
            </div>
            <button type="submit" className="btn-primary py-3 px-6">Create Payment Hold</button>
          </form>
          {result && (
            <div className="bg-[#111827] rounded-2xl p-5 mt-8">
              <h2 className="text-xl font-semibold mb-3">Payment Created</h2>
              <p className="text-slate-400 mb-2">Status: {result.data.status}</p>
              <p className="text-slate-400 mb-2">Amount: ${result.data.amount}</p>
              <p className="text-slate-400 mb-2">Currency: {result.data.currency}</p>
              {result.clientSecret && <p className="text-slate-400">Client secret available for payment processing.</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
