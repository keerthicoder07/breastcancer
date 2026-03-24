import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Brain, Flame, Shield, ArrowRight } from 'lucide-react'

const stats = [
  { v: '98.3%', l: 'Sensitivity' },
  { v: '2.4s',  l: 'Inference'  },
  { v: '3-Class', l: 'Output'  },
  { v: '224×224', l: 'Tensor'  },
]

const features = [
  { icon: Zap,    t: 'Swin-T Encoder',    d: 'Hierarchical shifted-window transformers for tissue-level feature extraction from mammogram tensors.' },
  { icon: Brain,  t: 'RAD-DINO Backbone', d: 'Radiology-pretrained DINO model capturing global semantic context across full mammogram fields.' },
  { icon: Flame,  t: 'Parallel Fusion',   d: 'Both streams fuse at inference — delivering multi-scale accuracy beyond any single-model approach.' },
  { icon: Shield, t: 'Grad-CAM XAI',      d: 'Gradient-weighted class activation maps visualize exactly where the AI detected malignant features.' },
]

const pipeline = [
  'Mammogram Input', 'Preprocessing 224×224', 'Swin-T Encoder',
  'RAD-DINO Backbone', 'Parallel Fusion', 'Grad-CAM', 'Gemini LLM Report', 'Radiologist Review',
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen"
      style={{ background: '#0a0a0a' }}
    >
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#2dd4bf,#d9f99d)' }}>
            <span className="text-black font-black text-sm">M</span>
          </div>
          <span className="font-black text-lg">MammAI</span>
          <span className="tag text-xs px-2 py-0.5 rounded-full">BETA</span>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline px-5 py-2 rounded-xl text-sm"
            onClick={() => navigate('/login')}>Radiologist Login</button>
          <button className="btn-primary flex items-center gap-1 px-5 py-2 rounded-xl text-sm"
            onClick={() => navigate('/login')}>Get Started <ArrowRight size={14} /></button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-8 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(45,212,191,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(45,212,191,0.03) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}>
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%,rgba(45,212,191,0.12),transparent)' }} />
        <div className="relative text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 tag px-4 py-2 rounded-full text-sm mb-8">
              <Zap size={14} />
              <span>Dual-Stream AI · Swin-T + RAD-DINO · Grad-CAM</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-none mb-6 tracking-tighter">
              <span className="tg-hero">Tireless Precision.</span><br />
              <span className="text-white/90">Instant Diagnostics.</span>
            </h1>
            <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 font-medium">
              The world's first parallel dual-stream AI for breast cancer mammogram analysis.
              Designed for radiologists. Built for lives.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="btn-primary flex items-center gap-2 px-8 py-4 rounded-2xl font-bold"
                onClick={() => navigate('/login')}>
                Access Diagnostic Portal <ArrowRight size={16} />
              </button>
              <button className="btn-outline flex items-center gap-2 px-8 py-4 rounded-2xl">
                View Architecture <Brain size={16} />
              </button>
            </div>
          </motion.div>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map(s => (
              <div key={s.l} className="glass rounded-2xl p-5 text-center">
                <div className="text-3xl font-black tg">{s.v}</div>
                <div className="text-xs text-white/40 tracking-widest uppercase mt-1">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-teal-400 font-bold tracking-widest uppercase text-sm mb-3">How It Works</p>
          <h2 className="text-4xl md:text-5xl font-black">The Dual-Stream Pipeline</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-teal-400/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-400/10 flex items-center justify-center text-teal-400 mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="font-black mb-2">{f.t}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.d}</p>
            </motion.div>
          ))}
        </div>
        {/* Pipeline flow */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
            {pipeline.map((s, i, a) => (
              <span key={s} className="flex items-center gap-3">
                <span className="glass px-4 py-2.5 rounded-xl text-white/80 border border-white/5">{s}</span>
                {i < a.length - 1 && <span className="text-teal-400/50">→</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24 text-center">
        <div className="glass rounded-3xl p-16 max-w-3xl mx-auto glow-teal border border-teal-400/20">
          <h2 className="text-4xl font-black mb-4">Ready to Diagnose?</h2>
          <p className="text-white/40 mb-8 text-lg">Log in with your Medical ID to access the portal.</p>
          <button className="btn-primary px-10 py-4 rounded-2xl font-bold"
            onClick={() => navigate('/login')}>
            Radiologist Sign In →
          </button>
        </div>
      </section>

      <footer className="border-t border-white/5 px-8 py-6 text-center text-white/25 text-sm">
        © 2025 MammAI · Parallel Dual-Stream AI Breast Cancer Diagnostic Portal · Research &amp; Clinical Use Only
      </footer>
    </motion.div>
  )
}
