export const categoryColors = {
  delivery: 'from-orange-500 to-red-500',
  labor: 'from-yellow-500 to-orange-500',
  tech: 'from-blue-500 to-purple-500',
  cleaning: 'from-emerald-500 to-teal-500',
  freelance: 'from-pink-500 to-rose-500',
  events: 'from-cyan-500 to-blue-500'
}

export const categoryIcons = {
  delivery: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />,
  labor: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  tech: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  cleaning: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
  freelance: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
  events: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
}

export const categoryBgColors = {
  delivery: 'from-orange-500/20 to-red-500/20',
  labor: 'from-yellow-500/20 to-orange-500/20',
  tech: 'from-blue-500/20 to-purple-500/20',
  cleaning: 'from-emerald-500/20 to-teal-500/20',
  freelance: 'from-pink-500/20 to-rose-500/20',
  events: 'from-cyan-500/20 to-blue-500/20'
}

export const categoryTextColors = {
  delivery: 'text-orange-400',
  labor: 'text-yellow-400',
  tech: 'text-blue-400',
  cleaning: 'text-emerald-400',
  freelance: 'text-pink-400',
  events: 'text-cyan-400'
}

export const locationDisplayMap = {
  'new-york': 'New York, NY',
  'los-angeles': 'Los Angeles, CA',
  'chicago': 'Chicago, IL',
  'houston': 'Houston, TX',
  'remote': 'Remote'
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
