import { Link } from 'react-router-dom'
import { categoryBgColors, categoryTextColors, categoryIcons } from '../utils/constants'

const categories = [
  { key: 'delivery', name: 'Delivery', count: '245 jobs' },
  { key: 'labor', name: 'Labor', count: '189 jobs' },
  { key: 'tech', name: 'Tech & IT', count: '156 jobs' },
  { key: 'cleaning', name: 'Cleaning', count: '98 jobs' },
  { key: 'freelance', name: 'Freelance', count: '312 jobs' },
  { key: 'events', name: 'Events', count: '67 jobs' },
]

export default function Home() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Over 10,000 jobs available now
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-grotesk">
              Find Work.<br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Get Hired Fast.</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-lg">
              Connect with employers instantly. Book your seat, get the job done, and earn on your terms. The modern way to find work.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/jobs" className="btn-primary text-lg px-8 py-4">
                Browse Jobs
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/post" className="btn-secondary text-lg px-8 py-4">Post a Job</Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-[#2d3748]">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">50K+</div>
                <div className="text-sm text-slate-500">Active Users</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">12K+</div>
                <div className="text-sm text-slate-500">Jobs Posted</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">98%</div>
                <div className="text-sm text-slate-500">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="animate-fade-in-up relative" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-[#1a2234] rounded-3xl border border-[#2d3748] p-6 shadow-2xl">
              <div className="space-y-4">
                <div className="card p-5 featured-job animate-float" style={{ animationDelay: '0s' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">Urgent Delivery Driver</h4>
                        <p className="text-sm text-slate-400">QuickDeliver Co.</p>
                      </div>
                    </div>
                    <span className="badge badge-premium">$25/hr</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">Immediate start needed for delivery work in downtown area.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">3/5 seats</span>
                    <span className="text-xs text-emerald-400 font-medium">2 seats left</span>
                  </div>
                </div>

                <div className="card p-5 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">Web Developer Needed</h4>
                        <p className="text-sm text-slate-400">TechStartup Inc.</p>
                      </div>
                    </div>
                    <span className="badge badge-success">$45/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">1/2 seats</span>
                    <span className="text-xs text-emerald-400 font-medium">1 seat left</span>
                  </div>
                </div>

                <div className="card p-5 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">Office Cleaning Staff</h4>
                        <p className="text-sm text-slate-400">CleanPro Services</p>
                      </div>
                    </div>
                    <span className="badge badge-success">$18/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">4/4 seats</span>
                    <span className="text-xs text-red-400 font-medium">Full</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-24 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-grotesk">Browse by Category</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Find the perfect opportunity across various industries and job types.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.key}
                to={`/jobs?category=${cat.key}`}
                className="card p-6 text-center cursor-pointer group"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${categoryBgColors[cat.key]} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                  <svg className={`w-7 h-7 ${categoryTextColors[cat.key]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {categoryIcons[cat.key]}
                  </svg>
                </div>
                <h3 className="font-semibold text-sm">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-24 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-grotesk">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Get started in minutes with our simple process.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Create Account', desc: 'Sign up in seconds. Set your skills and preferences to get matched with the best opportunities.' },
              { num: '2', title: 'Find & Book', desc: "Browse available jobs or post your own requirements. Book your seat before it's gone!" },
              { num: '3', title: 'Connect & Earn', desc: "Get contact details after booking. Complete the work and get paid. It's that simple!" },
            ].map(step => (
              <div key={step.num} className="card p-8 text-center stat-card">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl font-bold">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
