import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function AdminPanel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [pendingJobs, setPendingJobs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    if (user.role !== 'admin') { navigate('/dashboard'); return }
    loadData()
  }, [user, navigate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [jobsRes, usersRes] = await Promise.all([adminAPI.getPendingJobs(), adminAPI.getUsers()])
      setPendingJobs(jobsRes.data.data)
      setUsers(usersRes.data.data)
    } catch (err) {
      showToast('Failed to load admin data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updateJob = async (jobId, status) => {
    try {
      await adminAPI.updateJobStatus(jobId, status)
      showToast('Job updated', 'success')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    }
  }

  const updateUserStatus = async (userId, action) => {
    try {
      if (action === 'block') await adminAPI.blockUser(userId, true)
      if (action === 'unblock') await adminAPI.blockUser(userId, false)
      if (action === 'verify') await adminAPI.verifyUser(userId, true)
      if (action === 'unverify') await adminAPI.verifyUser(userId, false)
      showToast('User updated', 'success')
      loadData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error')
    }
  }

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 font-grotesk">Admin Panel</h1>
            <p className="text-slate-400">Moderate listings, verify users, and manage trust.</p>
          </div>
        </div>

        {loading ? (
          <div className="card p-10 text-center">Loading admin panel…</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Pending Job Reviews</h2>
              {pendingJobs.length === 0 ? (
                <p className="text-slate-400">No pending jobs at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {pendingJobs.map(job => (
                    <div key={job._id} className="p-4 border border-[#2d3748] rounded-2xl">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-sm text-slate-400">{job.postedBy?.firstName} {job.postedBy?.lastName} · {job.locationDisplay}</p>
                        </div>
                        <span className="badge badge-warning">Pending</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => updateJob(job._id, 'active')} className="btn-primary py-2 px-4">Approve</button>
                        <button onClick={() => updateJob(job._id, 'rejected')} className="btn-secondary py-2 px-4">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">User Moderation</h2>
              {users.length === 0 ? (
                <p className="text-slate-400">No users found.</p>
              ) : (
                <div className="space-y-4">
                  {users.map(person => (
                    <div key={person._id} className="p-4 border border-[#2d3748] rounded-2xl">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold">{person.firstName} {person.lastName}</h3>
                          <p className="text-sm text-slate-400">{person.email}</p>
                        </div>
                        <div className="text-right text-sm text-slate-400">
                          <div>{person.role}</div>
                          <div>{person.isVerified ? 'Verified' : 'Unverified'}</div>
                          <div>{person.isBlocked ? 'Blocked' : 'Active'}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {person.isVerified ? (
                          <button onClick={() => updateUserStatus(person._id, 'unverify')} className="btn-secondary py-2 px-4">Unverify</button>
                        ) : (
                          <button onClick={() => updateUserStatus(person._id, 'verify')} className="btn-primary py-2 px-4">Verify</button>
                        )}
                        {person.isBlocked ? (
                          <button onClick={() => updateUserStatus(person._id, 'unblock')} className="btn-secondary py-2 px-4">Unblock</button>
                        ) : (
                          <button onClick={() => updateUserStatus(person._id, 'block')} className="btn-secondary py-2 px-4">Block</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
