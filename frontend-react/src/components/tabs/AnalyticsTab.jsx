import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAnalytics, getReports } from '../../lib/api'

export default function AnalyticsTab() {
  const [stats, setStats]   = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAnalytics(), getReports()])
      .then(([s, r]) => { setStats(s); setReports(r) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Build monthly scan count from reports created_at
  const monthlyCounts = Array(12).fill(0)
  reports.forEach(r => {
    const month = new Date(r.created_at).getMonth()
    monthlyCounts[month]++
  })
  const maxMonthly = Math.max(...monthlyCounts, 1)

  const total = stats?.total_scans || 0
  const benignPct = total ? Math.round((stats.benign_count / total) * 100) : 0
  const lightPct  = total ? Math.round((stats.lightly_malignant_count / total) * 100) : 0
  const heavyPct  = total ? Math.round((stats.heavily_malignant_count / total) * 100) : 0

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="space-y-6 fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Total Scans',       v: loading ? '—' : String(stats?.total_scans ?? 0),    c: 'text-teal-400'    },
          { l: 'Malignant Flags',   v: loading ? '—' : String((stats?.heavily_malignant_count ?? 0) + (stats?.lightly_malignant_count ?? 0)), c: 'text-red-400' },
          { l: 'Heavily Malignant', v: loading ? '—' : String(stats?.heavily_malignant_count ?? 0), c: 'text-yellow-400' },
          { l: 'Total Patients',    v: loading ? '—' : String(stats?.total_patients ?? 0), c: 'text-emerald-400' },
        ].map(s => (
          <div key={s.l} className="glass rounded-2xl p-5 border border-white/5">
            {loading ? (
              <div className="w-12 h-8 bg-white/5 rounded animate-pulse mb-1" />
            ) : (
              <div className={`text-3xl font-black ${s.c}`}>{s.v}</div>
            )}
            <div className="text-xs text-white/40 font-semibold uppercase tracking-widest mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Monthly Bar Chart — from real report timestamps */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="font-black mb-6">Monthly Scan Volume (Real Data)</h3>
        <div className="flex items-end gap-2 h-40">
          {monthlyCounts.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(v / maxMonthly) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
                className="w-full rounded-t-md"
                style={{ background: v > 0 ? 'linear-gradient(180deg,#2dd4bf,#14b8a6)' : 'rgba(255,255,255,0.05)', opacity: 0.85, minHeight: '4px' }}
              />
              <span className="text-xs text-white/30">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution — from real DB counts */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="font-black mb-4">Classification Distribution (Real Data)</h3>
        {total === 0 && !loading ? (
          <p className="text-white/30 text-sm text-center py-6">No scans yet — run your first analysis!</p>
        ) : (
          <div className="space-y-3">
            {[
              { l: 'Benign',            v: benignPct, cls: 'bar-benign', count: stats?.benign_count ?? 0 },
              { l: 'Lightly Malignant', v: lightPct,  cls: 'bar-light',  count: stats?.lightly_malignant_count ?? 0 },
              { l: 'Heavily Malignant', v: heavyPct,  cls: 'bar-heavy',  count: stats?.heavily_malignant_count ?? 0 },
            ].map(b => (
              <div key={b.l}>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="text-white/70">{b.l}</span>
                  <span className="text-white/50">{b.v}% <span className="text-white/30">({b.count} scans)</span></span>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`${b.cls} h-full rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${b.v}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
