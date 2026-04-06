import { categoryColors, categoryIcons } from '../utils/constants'

export default function JobCard({ job, isBookedByUser, onClick }) {
  const remainingSeats = job.totalSeats - job.bookedSeats
  const seatPercentage = (job.bookedSeats / job.totalSeats) * 100
  const isFullyBooked = remainingSeats === 0

  return (
    <div
      className={`card p-6 cursor-pointer ${job.isPremium ? 'featured-job' : ''} ${isFullyBooked ? 'opacity-60' : ''}`}
      onClick={() => onClick(job)}
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${categoryColors[job.category]} flex items-center justify-center`}>
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {categoryIcons[job.category]}
            </svg>
          </div>
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-semibold hover:text-emerald-400 transition-colors">{job.title}</h3>
              <p className="text-sm text-slate-400">{job.postedByName}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {job.isPremium && <span className="badge badge-premium">Premium</span>}
              <span className={`badge ${isFullyBooked ? 'badge-danger' : remainingSeats <= 2 ? 'badge-warning' : 'badge-success'}`}>
                {isFullyBooked ? 'Full' : `${remainingSeats} seats left`}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{job.description}</p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1 text-sm text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.locationDisplay}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.paymentDisplay}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${seatPercentage}%` }}></div>
              </div>
            </div>
            <span className="text-sm text-slate-400">{job.bookedSeats}/{job.totalSeats} booked</span>
            {isBookedByUser && <span className="badge badge-success">Booked</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
