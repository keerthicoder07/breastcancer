import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Search, X } from 'lucide-react'
import { getReports } from '../../lib/api'

const typeColor = {
  'Heavily Malignant': 'text-red-400',
  'Lightly Malignant': 'text-yellow-400',
  'Benign':            'text-emerald-400',
}

const typeBadge = {
  'Heavily Malignant': 'bg-red-500/10 border-red-500/30',
  'Lightly Malignant': 'bg-yellow-500/10 border-yellow-500/30',
  'Benign':            'bg-emerald-500/10 border-emerald-500/30',
}

export default function ReportsTab() {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getReports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = reports.filter(r =>
    r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    r.report_id_str.toLowerCase().includes(search.toLowerCase()) ||
    r.dominant_class.toLowerCase().includes(search.toLowerCase())
  )

  const handleDownload = (r) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download the report.");
      return;
    }
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>MammAI Clinical Report - ${r.patient_name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
          body { 
            font-family: 'Outfit', sans-serif; 
            color: #000; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
            line-height: 1.6;
          }
          .header { 
            border-bottom: 2px solid #2dd4bf; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end;
          }
          .header h1 { margin: 0; font-weight: 900; font-size: 28px; }
          .header p { margin: 5px 0 0; color: #666; font-family: monospace; }
          .meta { font-size: 14px; text-align: right; color: #666; }
          
          .section { margin-bottom: 30px; }
          .section-title { 
            font-size: 14px; 
            text-transform: uppercase; 
            letter-spacing: 2px; 
            color: #666; 
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          
          .stat-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }
          .stat-item { background: #f9f9f9; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
          .stat-label { font-weight: bold; }
          .stat-val { font-size: 18px; font-weight: 900; }
          
          .summary-box {
            background: #fdfdfd;
            border: 1px solid #eee;
            border-left: 4px solid #2dd4bf;
            padding: 20px;
            white-space: pre-wrap;
            font-family: inherit;
            border-radius: 4px;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        
        <div class="header">
          <div>
            <h1>MammAI Clinical Report</h1>
            <p>Report ID: ${r.report_id_str}</p>
          </div>
          <div class="meta">
            <strong>Patient:</strong> ${r.patient_name}<br />
            <strong>Date:</strong> ${new Date(r.created_at).toLocaleDateString()}<br />
            <strong>Primary Class:</strong> ${r.dominant_class}
          </div>
        </div>

        <div class="section">
          <div class="section-title">AI Probabilities Analysis</div>
          <div class="stat-grid">
            <div class="stat-item" style="border-left: 4px solid #10b981;">
              <span class="stat-label">Benign Probability</span>
              <span class="stat-val">${r.benign_pct.toFixed(1)}%</span>
            </div>
            <div class="stat-item" style="border-left: 4px solid #f59e0b;">
              <span class="stat-label">Lightly Malignant Probability</span>
              <span class="stat-val">${r.light_pct.toFixed(1)}%</span>
            </div>
            <div class="stat-item" style="border-left: 4px solid #ef4444;">
              <span class="stat-label">Heavily Malignant Probability</span>
              <span class="stat-val">${r.heavy_pct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">AI Clinical Summary (Gemini 1.5 Flash)</div>
          <div class="summary-box">${r.llm_summary.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>

        <div class="footer">
          Generated automatically by MammAI Portal • Confidential Clinical Record
        </div>

      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4 fade-in">
      {/* Search bar */}
      <div className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-3 print:hidden">
        <Search size={16} className="text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient, report ID, or diagnosis…"
          className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-white/30 hover:text-white/70">
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20 print:hidden">
          <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 border border-white/5 text-center print:hidden">
          <div className="text-4xl mb-3 opacity-30">📋</div>
          <p className="text-white/40">{search ? 'No reports match your search.' : 'No reports yet. Run your first analysis!'}</p>
        </div>
      ) : (
        filtered.map(r => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 border border-white/5 flex items-center justify-between flex-wrap gap-4 print:hidden"
          >
            <div>
              <div className="font-mono text-teal-400 text-xs mb-1">{r.report_id_str}</div>
              <div className="font-black">{r.patient_name}</div>
              <div className="text-xs text-white/40 mt-1">
                {new Date(r.created_at).toLocaleDateString('en-IN')} · LLM: Gemini
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-3 py-1.5 rounded-lg border font-bold ${typeColor[r.dominant_class]} ${typeBadge[r.dominant_class]}`}>
                {r.dominant_class}
              </span>
              <button
                onClick={() => setSelected(r)}
                className="btn-primary text-xs px-4 py-2 rounded-xl"
              >
                👁 View
              </button>
            </div>
          </motion.div>
        ))
      )}

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 print:absolute print:inset-0 print:bg-white print:p-0"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass rounded-3xl border border-teal-400/20 w-full max-w-2xl max-h-[80vh] overflow-y-auto print:max-w-none print:max-h-none print:border-none print:rounded-none print:shadow-none print:text-black"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-teal-400/5 px-6 py-4 border-b border-teal-400/15 flex items-center justify-between print:bg-transparent print:border-gray-300">
                <div>
                  <div className="font-mono text-teal-400 text-xs print:text-gray-500">{selected.report_id_str}</div>
                  <h2 className="font-black flex items-center gap-2 print:text-black">
                    <FileText size={16} /> {selected.patient_name}
                  </h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white/80 print:hidden">
                  <X size={20} />
                </button>
              </div>

              {/* Confidence bars */}
              <div className="px-6 pt-5 space-y-3">
                {[
                  { label: 'Benign', val: selected.benign_pct, cls: 'bar-benign' },
                  { label: 'Lightly Malignant', val: selected.light_pct, cls: 'bar-light' },
                  { label: 'Heavily Malignant', val: selected.heavy_pct, cls: 'bar-heavy' },
                ].map(b => (
                  <div key={b.label}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-white/60 print:text-black">{b.label}</span>
                      <span className="text-teal-400 print:text-black">{b.val.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden print:bg-gray-200">
                      <motion.div className={`${b.cls} h-full rounded-full print:bg-gray-600`}
                        initial={{ width: 0 }} animate={{ width: `${b.val}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* LLM Summary */}
              <div className="px-6 pb-6 mt-4">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 print:text-black">AI Clinical Report</p>
                <pre className="text-xs text-white/60 font-mono whitespace-pre-wrap leading-relaxed bg-black/30 rounded-xl p-4 border border-white/5 print:bg-gray-50 print:border-gray-200 print:text-black">
                  {selected.llm_summary}
                </pre>
                <button
                  onClick={() => handleDownload(selected)}
                  className="mt-4 btn-primary text-xs px-5 py-2.5 rounded-xl font-bold min-w-[150px] !bg-teal-400 !text-black shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:shadow-[0_0_25px_rgba(45,212,191,0.5)] transition-all print:hidden"
                >
                  📄 Download PDF / Print
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
