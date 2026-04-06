import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import PostJob from './pages/PostJob'
import Dashboard from './pages/Dashboard'
import VerifyEmail from './pages/VerifyEmail'
import Messages from './pages/Messages'
import AdminPanel from './pages/AdminPanel'
import Payments from './pages/Payments'

export default function App() {
  return (
    <>
      <div className="bg-mesh"></div>
      <div className="noise-overlay"></div>
      <div className="relative z-[2]">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/post" element={<PostJob />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}
