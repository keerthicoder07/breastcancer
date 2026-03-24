import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, BarChart2, Users, FileText, LogOut } from 'lucide-react'
import ModelBanner from '../components/ModelBanner'
import DiagnosticsTab from '../components/tabs/DiagnosticsTab'
import AnalyticsTab from '../components/tabs/AnalyticsTab'
import RecordsTab from '../components/tabs/RecordsTab'
import ReportsTab from '../components/tabs/ReportsTab'

const navItems = [
  { to: '/dashboard',          label: 'Diagnostics',     icon: Zap       },
  { to: '/dashboard/analytics', label: 'Analytics',      icon: BarChart2 },
  { to: '/dashboard/records',   label: 'Patient Records', icon: Users     },
  { to: '/dashboard/reports',   label: 'Reports',         icon: FileText  },
]

const titles = {
  '/dashboard':            'Diagnostic Dashboard',
  '/dashboard/analytics':  'Analytics Overview',
  '/dashboard/records':    'Patient Records',
  '/dashboard/reports':    'Clinical Reports',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const path = window.location.pathname
  const title = titles[path] || 'Diagnostic Dashboard'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-screen overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 glass border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#2dd4bf,#d9f99d)' }}>
              <span className="text-black font-black text-sm">M</span>
            </div>
            <div>
              <div className="font-black tracking-tight">MammAI</div>
              <div className="text-xs text-white/30">Diagnostic Portal</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `nav-link w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold
                 ${isActive ? 'active' : 'text-white/50'}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: 'linear-gradient(135deg,#2dd4bf,#d9f99d)', color: '#0a0a0a' }}>
              DR
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">Dr. Radiologist</div>
              <div className="text-xs text-white/40">DR-2025-001</div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-white/30 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ModelBanner />
        <div className="glass border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black">{title}</h1>
            <p className="text-white/40 text-sm">MammAI · Parallel Dual-Stream Portal</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs text-teal-400 font-semibold">AI Pipeline Online</span>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route index                element={<DiagnosticsTab />} />
            <Route path="analytics"     element={<AnalyticsTab />} />
            <Route path="records"       element={<RecordsTab />} />
            <Route path="reports"       element={<ReportsTab />} />
          </Routes>
        </main>
      </div>
    </motion.div>
  )
}
