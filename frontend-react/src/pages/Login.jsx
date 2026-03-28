import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, AlertCircle, Shield } from 'lucide-react'
import { loginUser } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !pw) { setError('Please enter email and password.'); return }
    setLoading(true)
    setError('')
    try {
      await loginUser(email, pw)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: '#0a0a0a' }}
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(45,212,191,0.07), transparent)' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 glow-teal"
            style={{ background: 'linear-gradient(135deg,#2dd4bf,#d9f99d)' }}
          >
            <span className="text-black font-black text-2xl">M</span>
          </motion.div>
          <h1 className="text-3xl font-black">Welcome Back</h1>
          <p className="text-white/40 mt-2">Secure Medical Portal Access</p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-3xl p-8 glow-teal border border-teal-400/20"
        >
          <div className="space-y-5">
            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                <AlertCircle size={15} />
                {error}
              </motion.div>
            )}

            <div>
              <label className="text-xs font-bold text-white/50 block mb-2 tracking-widest uppercase">
                Medical ID
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium
                           focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/15 transition-all"
                placeholder="doctor@hospital.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/50 block mb-2 tracking-widest uppercase">
                Password
              </label>
              <input
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium
                           focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/15 transition-all"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>Access Dashboard <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            
            {/* Admin Registration */}
            <button onClick={() => navigate('/admin-register')} className="w-full py-3 rounded-xl border border-white/5 hover:border-teal-400/30 hover:bg-teal-400/5 text-white/40 hover:text-teal-400 transition-all text-sm flex items-center justify-center gap-2">
              <Shield size={14} /> Hospital Admin: Register Staff
            </button>
          </div>
        </motion.div>

        <button
          className="w-full text-center text-white/30 text-sm mt-5 hover:text-teal-400 transition-colors"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
    </motion.div>
  )
}
