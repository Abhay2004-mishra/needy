import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { jobsAPI, bookingsAPI, messagesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/constants'
import JobCard from '../components/JobCard'
import Modal from '../components/Modal'

export default function Jobs() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [location, setLocation] = useState('')
  const [availableOnly, setAvailableOnly] = useState(true)
  const [premiumOnly, setPremiumOnly] = useState(false)
  const [sortBy, setSortBy] = useState('newest')

  // Detail modal
  const [selectedJob, setSelectedJob] = useState(null)
  const [isBooked, setIsBooked] = useState(false)
  const [myBookings, setMyBookings] = useState([])
  const [messageText, setMessageText] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  useEffect(() => {
    if (user) {
      bookingsAPI.getMy().then(res => {
        setMyBookings(res.data.data.map(b => b.jobId?._id || b.jobId))
      }).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    fetchJobs()
  }, [page, search, category, location, availableOnly, premiumOnly, sortBy])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 5, sortBy }
      if (search) params.search = search
      if (category) params.category = category
      if (location) params.location = location
      if (availableOnly) params.availableOnly = 'true'
      if (premiumOnly) params.premiumOnly = 'true'

      const res = await jobsAPI.getAll(params)
      setJobs(res.data.data)
      setTotal(res.data.pagination.total)
      setTotalPages(res.data.pagination.pages)
    } catch (err) {
      showToast('Failed to load jobs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleJobClick = async (job) => {
    setSelectedJob(job)
    if (user) {
      try {
        const res = await bookingsAPI.check(job._id)
        setIsBooked(res.data.isBooked)
      } catch { setIsBooked(false) }
    }
  }

  const handleBook = async () => {
    if (!user) {
      showToast('Please sign in to book a job', 'warning')
      setSelectedJob(null)
      return
    }
    try {
      await bookingsAPI.create(selectedJob._id)
      showToast('Successfully booked! Contact info revealed.', 'success')
      setIsBooked(true)
      fetchJobs()
      // Refresh the selected job
      const res = await jobsAPI.getById(selectedJob._id)
      setSelectedJob(res.data.data)
      setMyBookings(prev => [...prev, selectedJob._id])
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed', 'error')
    }
  }

  const handleSendMessage = async () => {
    if (!user) {
      showToast('Please sign in to send a message', 'warning')
      return
    }
    if (!messageText.trim()) {
      showToast('Please enter a message', 'warning')
      return
    }
    if (!selectedJob?.postedBy?._id) {
      showToast('Unable to determine recipient', 'error')
      return
    }

    setIsSendingMessage(true)
    try {
      await messagesAPI.send({
        recipientId: selectedJob.postedBy._id,
        content: messageText,
        jobId: selectedJob._id
      })
      showToast('Message sent to the job poster', 'success')
      setMessageText('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send message', 'error')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const resetFilters = () => {
    setSearch('')
    setCategory('')
    setLocation('')
    setAvailableOnly(true)
    setPremiumOnly(false)
    setSortBy('newest')
    setPage(1)
  }

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-grotesk">Available Jobs</h1>
          <p className="text-slate-400">Discover opportunities that match your skills</p>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                placeholder="Search jobs by title or keywords..."
                className="input-field pl-12"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select className="input-field" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}>
              <option value="">All Categories</option>
              <option value="delivery">Delivery</option>
              <option value="labor">Labor</option>
              <option value="tech">Tech & IT</option>
              <option value="cleaning">Cleaning</option>
              <option value="freelance">Freelance</option>
              <option value="events">Events</option>
            </select>
            <select className="input-field" value={location} onChange={(e) => { setLocation(e.target.value); setPage(1) }}>
              <option value="">All Locations</option>
              <option value="new-york">New York</option>
              <option value="los-angeles">Los Angeles</option>
              <option value="chicago">Chicago</option>
              <option value="houston">Houston</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={availableOnly} onChange={(e) => { setAvailableOnly(e.target.checked); setPage(1) }} className="w-4 h-4 rounded accent-emerald-500" />
              <span className="text-sm text-slate-400">Available only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={premiumOnly} onChange={(e) => { setPremiumOnly(e.target.checked); setPage(1) }} className="w-4 h-4 rounded accent-emerald-500" />
              <span className="text-sm text-slate-400">Premium listings</span>
            </label>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-400"><span className="text-white font-semibold">{total}</span> jobs found</p>
          <select className="input-field w-auto text-sm py-2 px-4" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1) }}>
            <option value="newest">Newest First</option>
            <option value="seats-low">Fewest Seats Left</option>
            <option value="salary-high">Highest Pay</option>
          </select>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {loading ? (
            <div className="card p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              <p className="text-slate-400">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#111827] flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-slate-400 mb-4">Try adjusting your filters or search terms</p>
              <button onClick={resetFilters} className="btn-secondary">Reset Filters</button>
            </div>
          ) : (
            jobs.map(job => (
              <JobCard
                key={job._id}
                job={job}
                isBookedByUser={myBookings.includes(job._id)}
                onClick={handleJobClick}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`btn-secondary py-2 px-4 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`btn-secondary py-2 px-4 ${p === page ? 'bg-emerald-500 border-emerald-500' : ''}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`btn-secondary py-2 px-4 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <Modal onClose={() => setSelectedJob(null)}>
          <div className="w-full max-w-2xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {selectedJob.isPremium && <span className="badge badge-premium">Premium</span>}
                  <span className={`badge ${selectedJob.status === 'closed' ? 'badge-danger' : 'badge-success'}`}>
                    {selectedJob.status === 'closed' ? 'Closed' : 'Active'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold font-grotesk">{selectedJob.title}</h2>
                <p className="text-slate-400 mt-1">Posted by {selectedJob.postedByName} · {formatDate(selectedJob.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 rounded-lg hover:bg-[#111827] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#111827] rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-1">Location</div>
                <div className="font-medium flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {selectedJob.locationDisplay}
                </div>
              </div>
              <div className="bg-[#111827] rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-1">Payment</div>
                <div className="font-semibold text-emerald-400 text-lg">{selectedJob.paymentDisplay}</div>
              </div>
              <div className="bg-[#111827] rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-1">Available Seats</div>
                <div className="font-medium">{selectedJob.totalSeats - selectedJob.bookedSeats} of {selectedJob.totalSeats} remaining</div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${(selectedJob.bookedSeats / selectedJob.totalSeats) * 100}%` }}></div>
                </div>
              </div>
              <div className="bg-[#111827] rounded-xl p-4">
                <div className="text-sm text-slate-400 mb-1">Category</div>
                <div className="font-medium capitalize">{selectedJob.category}</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-slate-400 leading-relaxed">{selectedJob.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-[#111827] rounded-full text-sm">{skill}</span>
                ))}
              </div>
            </div>

            {/* Contact info (shown when booked) */}
            {isBooked && (
              <div className="bg-[#111827] rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div className="font-medium">{selectedJob.contactEmail}</div>
                    </div>
                  </div>
                  {selectedJob.contactPhone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Phone</div>
                        <div className="font-medium">{selectedJob.contactPhone}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {user && selectedJob.postedBy?._id !== user._id && (
              <div className="bg-[#111827] rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-4">Message the poster</h3>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows="4"
                  className="input-field w-full resize-none"
                  placeholder="Send a quick message to the job poster..."
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSendingMessage}
                  className="btn-primary mt-4 py-3 px-5"
                >
                  {isSendingMessage ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            )}

            <div className="flex gap-4">
              {selectedJob.bookedSeats < selectedJob.totalSeats && !isBooked ? (
                <button onClick={handleBook} className="btn-primary flex-1 py-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Book This Job ({selectedJob.totalSeats - selectedJob.bookedSeats} seats left)
                </button>
              ) : isBooked ? (
                <button disabled className="btn-secondary flex-1 py-4 opacity-70 cursor-not-allowed">
                  ✓ Already Booked
                </button>
              ) : (
                <button disabled className="btn-secondary flex-1 py-4 opacity-70 cursor-not-allowed">
                  All Seats Filled
                </button>
              )}
              <button onClick={() => setSelectedJob(null)} className="btn-secondary py-4 px-6">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}
