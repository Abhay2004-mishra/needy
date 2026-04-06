import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI, bookingsAPI, usersAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/constants'

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState({ activeJobs: 0, totalBookings: 0, earnings: 0, avgRating: 4.8 })
  const [myJobs, setMyJobs] = useState([])
  const [bookedJobs, setBookedJobs] = useState([])

  useEffect(() => {
    if (!user) { navigate('/'); return }
    loadStats()
  }, [user])

  useEffect(() => {
    if (tab === 'my-jobs') loadMyJobs()
    else if (tab === 'booked') loadBookedJobs()
    else if (tab === 'overview') loadStats()
  }, [tab])

  const loadStats = async () => {
    try { const r = await usersAPI.getStats(); setStats(r.data.stats) } catch {}
  }
  const loadMyJobs = async () => {
    try { const r = await jobsAPI.getMyJobs(); setMyJobs(r.data.data) } catch {}
  }
  const loadBookedJobs = async () => {
    try { const r = await bookingsAPI.getMy(); setBookedJobs(r.data.data) } catch {}
  }

  const resendVerification = async () => {
    try {
      await authAPI.resendVerification({ email: user.email })
      showToast('Verification email resent. Check your inbox.', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to resend verification email', 'error')
    }
  }
  const deleteJob = async (id) => {
    if (!confirm('Delete this job?')) return
    try { await jobsAPI.delete(id); showToast('Job deleted', 'success'); loadMyJobs() }
    catch { showToast('Delete failed', 'error') }
  }
  const cancelBooking = async (jobId) => {
    if (!confirm('Cancel this booking?')) return
    try { await bookingsAPI.cancel(jobId); showToast('Booking cancelled', 'success'); loadBookedJobs() }
    catch { showToast('Cancel failed', 'error') }
  }
  const handleProfile = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      const r = await usersAPI.updateProfile({
        firstName: fd.get('fullName')?.split(' ')[0] || '',
        lastName: fd.get('fullName')?.split(' ').slice(1).join(' ') || '',
        phone: fd.get('phone'), skills: fd.get('skills'), bio: fd.get('bio'), role: fd.get('role')
      })
      updateUser(r.data.user)
      showToast('Profile updated!', 'success')
    } catch { showToast('Update failed', 'error') }
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'my-jobs', label: 'My Posted Jobs' },
    { key: 'booked', label: 'Booked Jobs' },
    { key: 'profile', label: 'Profile Settings' }
  ]

  const activities = [
    { type: 'booking', msg: 'Someone booked your "Delivery Driver" job', time: '2 hours ago', color: 'bg-emerald-500/20', icon: '✓' },
    { type: 'new', msg: 'New job matching your skills: "React Developer"', time: '5 hours ago', color: 'bg-blue-500/20', icon: '✦' },
    { type: 'complete', msg: '"Office Cleaning" job marked as completed', time: '1 day ago', color: 'bg-yellow-500/20', icon: '★' },
    { type: 'message', msg: 'New message from QuickDeliver Co.', time: '2 days ago', color: 'bg-purple-500/20', icon: '✉' }
  ]

  if (!user) return null

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {user && !user.isVerified && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-semibold">Verify your email to unlock full access.</h2>
                <p className="text-sm text-amber-200 mt-1">Your account is active, but job postings and booking contact details are limited until verification is completed.</p>
              </div>
              <button onClick={resendVerification} className="btn-primary py-3 px-5">Resend Verification Email</button>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 font-grotesk">Dashboard</h1>
            <p className="text-slate-400">Welcome back, {user.firstName} {user.lastName}</p>
          </div>
          <button onClick={() => navigate('/post')} className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Post New Job
          </button>
        </div>

        <div className="card mb-8 overflow-hidden">
          <div className="flex border-b border-[#2d3748] overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Active Jobs', value: stats.activeJobs, color: 'bg-emerald-500/20' },
                  { label: 'Total Bookings', value: stats.totalBookings, color: 'bg-blue-500/20' },
                  { label: 'Total Earnings', value: `$${stats.earnings?.toLocaleString() || 0}`, color: 'bg-yellow-500/20' },
                  { label: 'Avg Rating', value: stats.avgRating, color: 'bg-purple-500/20' }
                ].map((s, i) => (
                  <div key={i} className="card p-6 stat-card">
                    <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mb-4`}>
                      <span className="text-lg">📊</span>
                    </div>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-sm text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {activities.map((a, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-[#111827] rounded-xl">
                    <div className={`w-10 h-10 rounded-lg ${a.color} flex items-center justify-center flex-shrink-0 text-sm`}>{a.icon}</div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium truncate">{a.msg}</p>
                      <p className="text-xs text-slate-500">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Jobs */}
          {tab === 'my-jobs' && (
            <div className="p-6 space-y-4">
              {myJobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400">You haven't posted any jobs yet.</p>
                  <button onClick={() => navigate('/post')} className="btn-primary mt-4">Post Your First Job</button>
                </div>
              ) : myJobs.map(job => (
                <div key={job._id} className="card p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        {job.isPremium && <span className="badge badge-premium text-xs">Premium</span>}
                        <span className={`badge ${job.status === 'closed' ? 'badge-danger' : 'badge-success'} text-xs`}>{job.status}</span>
                      </div>
                      <p className="text-sm text-slate-400">{job.category} · {job.locationDisplay} · {job.paymentDisplay}</p>
                      <p className="text-sm text-slate-400 mt-1">{job.bookedSeats}/{job.totalSeats} seats filled · <span className="text-emerald-400">{job.totalSeats - job.bookedSeats} available</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => deleteJob(job._id)} className="py-2 px-4 text-sm rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booked */}
          {tab === 'booked' && (
            <div className="p-6 space-y-4">
              {bookedJobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-400">You haven't booked any jobs yet.</p>
                  <button onClick={() => navigate('/jobs')} className="btn-primary mt-4">Browse Jobs</button>
                </div>
              ) : bookedJobs.map(booking => {
                const job = booking.jobId
                if (!job) return null
                return (
                  <div key={booking._id} className="card p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-grow">
                        <h3 className="font-semibold mb-1">{job.title}</h3>
                        <p className="text-sm text-slate-400">{job.postedByName} · {job.locationDisplay}</p>
                        <p className="text-sm text-emerald-400 mt-1">{job.paymentDisplay}</p>
                        <p className="text-xs text-slate-500 mt-2">Booked on {formatDate(booking.createdAt)}</p>
                      </div>
                      <button onClick={() => cancelBooking(job._id)} className="py-2 px-4 text-sm rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">Cancel</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Profile */}
          {tab === 'profile' && (
            <div className="p-6">
              <form onSubmit={handleProfile} className="max-w-2xl">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
                    {user.avatar || (user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input type="text" name="fullName" defaultValue={`${user.firstName} ${user.lastName}`} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input type="email" disabled value={user.email} className="input-field opacity-60" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input type="tel" name="phone" defaultValue={user.phone || ''} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select name="role" defaultValue={user.role} className="input-field">
                      <option value="worker">Worker / Job Seeker</option>
                      <option value="poster">Job Poster / Employer</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Skills</label>
                    <input type="text" name="skills" defaultValue={user.skills?.join(', ') || ''} className="input-field" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea name="bio" rows="3" defaultValue={user.bio || ''} className="input-field resize-none"></textarea>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
