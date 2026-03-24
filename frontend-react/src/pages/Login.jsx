import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [id, setId] = useState('DR-2025-001')
  const [pw, setPw] = useState('mammAI@secure')
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    // In production: validate against backend /auth/login
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 1200)
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
            <div>
              <label className="text-xs font-bold text-white/50 block mb-2 tracking-widest uppercase">
                Medical ID
              </label>
              <input
                value={id}
                onChange={e => setId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-medium
                           focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/15 transition-all"
                placeholder="DR-XXXX-XXX"
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

          {/* Demo hint */}
          <div className="mt-5 p-4 rounded-xl bg-teal-400/5 border border-teal-400/20 text-center">
            <p className="text-xs text-white/40 mb-1 font-bold tracking-widest uppercase">Demo Credentials</p>
            <p className="text-xs text-teal-400 font-mono">DR-2025-001 / mammAI@secure</p>
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
