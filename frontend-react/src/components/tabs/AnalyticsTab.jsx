import { motion } from 'framer-motion'

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const vals   = [12, 18, 14, 25, 22, 30, 28, 35, 32, 40, 38, 45]
const maxV   = Math.max(...vals)

export default function AnalyticsTab() {
  return (
    <div className="space-y-6 fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Scans Today',       v: '24',    c: 'text-teal-400'    },
          { l: 'Malignant Flags',   v: '7',     c: 'text-red-400'     },
          { l: 'Avg Confidence',    v: '91.2%', c: 'text-yellow-400'  },
          { l: 'Reports Generated', v: '18',    c: 'text-emerald-400' },
        ].map(s => (
          <div key={s.l} className="glass rounded-2xl p-5 border border-white/5">
            <div className={`text-3xl font-black ${s.c}`}>{s.v}</div>
            <div className="text-xs text-white/40 font-semibold uppercase tracking-widest mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="font-black mb-6">Monthly Scan Volume (2025)</h3>
        <div className="flex items-end gap-2 h-40">
          {vals.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(v / maxV) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
                className="w-full rounded-t-md"
                style={{ background: 'linear-gradient(180deg,#2dd4bf,#14b8a6)', opacity: 0.85 }}
              />
              <span className="text-xs text-white/30">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution */}
      <div className="glass rounded-2xl p-6 border border-white/5">
        <h3 className="font-black mb-4">Classification Distribution</h3>
        <div className="space-y-3">
          {[
            { l: 'Benign',            v: 58, cls: 'bar-benign' },
            { l: 'Lightly Malignant', v: 27, cls: 'bar-light'  },
            { l: 'Heavily Malignant', v: 15, cls: 'bar-heavy'  },
          ].map(b => (
            <div key={b.l}>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span className="text-white/70">{b.l}</span>
                <span className="text-white/50">{b.v}%</span>
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
      </div>
    </div>
  )
}
