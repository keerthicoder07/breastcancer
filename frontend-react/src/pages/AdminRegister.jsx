import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Shield, ArrowLeft } from 'lucide-react'
import axios from 'axios'

export default function AdminRegister() {
  const navigate = useNavigate()
  
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPw, setAdminPw] = useState('')
  
  const [staffName, setStaffName] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffPw, setStaffPw] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteMsg, setDeleteMsg] = useState('')

  const handleRegister = async () => {
    if (!adminEmail || !adminPw || !staffName || !staffEmail || !staffPw) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    
    try {
      // 1. Authenticate Admin
      const loginRes = await axios.post('/api/auth/login', { email: adminEmail, password: adminPw })
      const token = loginRes.data.access_token
      
      // 2. Register Staff using Admin Token
      await axios.post('/api/auth/register', 
        { name: staffName, email: staffEmail, password: staffPw, role: 'radiologist' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Authorization failed. Ensure you have admin privileges.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!adminEmail || !adminPw || !deleteEmail) {
      setError('Please provide Admin Email/Password and the user email to delete.')
      return
    }
    if (!window.confirm(`Permanently delete account for ${deleteEmail}?`)) return
    setDeleteLoading(true)
    setError('')
    setDeleteMsg('')
    try {
      const loginRes = await axios.post('/api/auth/login', { email: adminEmail, password: adminPw })
      const token = loginRes.data.access_token
      await axios.delete(`/api/auth/users/${deleteEmail}`, { headers: { Authorization: `Bearer ${token}` } })
      setDeleteMsg("User deleted successfully.")
      setDeleteEmail('')
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete user.")
    }
    setDeleteLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0a0a0a]"
    >
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(45,212,191,0.07), transparent)' }} />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <Shield size={32} className="text-teal-400 mx-auto mb-3 glow-teal" />
          <h1 className="text-2xl font-black">Admin Registration</h1>
          <p className="text-white/40 text-sm mt-1">Authorized hospital IT staff only.</p>
        </div>

        <motion.div className="glass rounded-3xl p-8 glow-teal border border-teal-400/20">
          {success ? (
            <div className="text-center p-6 bg-teal-400/10 rounded-xl border border-teal-400/30">
              <h3 className="text-teal-400 font-bold mb-2">Registration Successful</h3>
              <p className="text-white/60 text-sm">Account created. Transferring to login...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle size={15} /> {error}
                </div>
              )}
              {deleteMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-400/10 border border-teal-400/30 text-teal-400 text-sm">
                  <AlertCircle size={15} /> {deleteMsg}
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-teal-400 mb-3 tracking-widest uppercase border-b border-white/10 pb-2">Admin Authorization</p>
                <div className="space-y-3">
                  <input type="email" placeholder="Admin Email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-400 transition-all" />
                  <input type="password" placeholder="Admin Password" value={adminPw} onChange={e => setAdminPw(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-400 transition-all" />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-teal-400 mb-3 tracking-widest uppercase border-b border-white/10 pb-2">New Staff Details</p>
                <div className="space-y-3">
                  <input type="text" placeholder="Full Name" value={staffName} onChange={e => setStaffName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-400 transition-all" />
                  <input type="email" placeholder="Staff Medical ID (Email)" value={staffEmail} onChange={e => setStaffEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-400 transition-all" />
                  <input type="password" placeholder="Staff Password" value={staffPw} onChange={e => setStaffPw(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-400 transition-all" />
                </div>
              </div>

              <button onClick={handleRegister} disabled={loading}
                className="btn-outline w-full py-3 mt-2 rounded-xl font-bold flex items-center justify-center gap-2">
                {loading ? 'Authorizing...' : 'Create Account'}
              </button>
              
              <div className="pt-4 mt-4 border-t border-white/10">
                <p className="text-xs font-bold text-red-400 mb-3 tracking-widest uppercase">Remove Staff</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Staff Email to Delete" value={deleteEmail} onChange={e => setDeleteEmail(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-400 transition-all" />
                  <button onClick={handleDeleteUser} disabled={deleteLoading}
                    className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-bold transition-colors">
                    {deleteLoading ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <button className="w-full text-center text-white/30 text-sm mt-5 hover:text-teal-400 transition-colors flex items-center justify-center gap-2"
          onClick={() => navigate('/login')}>
          <ArrowLeft size={14} /> Back to Login
        </button>
      </div>
    </motion.div>
  )
}
