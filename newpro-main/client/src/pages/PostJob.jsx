import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function PostJob() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { showToast('Please sign in to post a job', 'warning'); return }
    const fd = new FormData(e.target)
    setSubmitting(true)
    try {
      await jobsAPI.create({
        title: fd.get('title'), description: fd.get('description'),
        category: fd.get('category'), location: fd.get('location'),
        skills: fd.get('skills') || '', totalSeats: fd.get('seats'),
        salary: fd.get('salary'), paymentType: fd.get('paymentType'),
        contactEmail: fd.get('contactEmail'), contactPhone: fd.get('contactPhone') || '',
        isPremium: fd.get('isPremium') === 'on'
      })
      showToast('Job posted successfully!', 'success')
      navigate('/jobs')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post job', 'error')
    } finally { setSubmitting(false) }
  }

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-grotesk">Post a New Job</h1>
          <p className="text-slate-400">Fill in the details below to create your job listing</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Job Title *</label>
              <input type="text" name="title" required placeholder="e.g., Delivery Driver Needed" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select name="category" required className="input-field">
                <option value="">Select category</option>
                <option value="delivery">Delivery</option><option value="labor">Labor</option>
                <option value="tech">Tech & IT</option><option value="cleaning">Cleaning</option>
                <option value="freelance">Freelance</option><option value="events">Events</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <select name="location" required className="input-field">
                <option value="">Select location</option>
                <option value="new-york">New York</option><option value="los-angeles">Los Angeles</option>
                <option value="chicago">Chicago</option><option value="houston">Houston</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea name="description" required rows="4" placeholder="Describe the job requirements..." className="input-field resize-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Required Skills</label>
              <input type="text" name="skills" placeholder="e.g., Driving License" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Seats *</label>
              <input type="number" name="seats" required min="1" max="50" placeholder="1-50" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Type *</label>
              <select name="paymentType" required className="input-field">
                <option value="">Select type</option>
                <option value="hourly">Per Hour</option><option value="fixed">Fixed Price</option><option value="daily">Per Day</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount ($) *</label>
              <input type="number" name="salary" required min="1" placeholder="e.g., 25" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Email *</label>
              <input type="email" name="contactEmail" required placeholder="your@email.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Phone</label>
              <input type="tel" name="contactPhone" placeholder="+1 (555) 000-0000" className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="isPremium" className="w-5 h-5 rounded accent-emerald-500" />
                <div>
                  <span className="font-medium">List as Premium ($9.99)</span>
                  <p className="text-sm text-slate-400">Get highlighted placement and priority visibility</p>
                </div>
              </label>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button type="submit" disabled={submitting} className="btn-primary flex-1 py-4">
              {submitting ? 'Publishing...' : 'Publish Job Listing'}
            </button>
            <button type="reset" className="btn-secondary py-4 px-8">Clear Form</button>
          </div>
        </form>
      </div>
    </section>
  )
}
