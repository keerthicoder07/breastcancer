const reports = [
  { id: 'RPT-2503-001', patient: 'Ananya Sharma', date: '2025-03-20', type: 'Heavily Malignant', llm: 'Gemini 1.5 Flash' },
  { id: 'RPT-2503-002', patient: 'Meera Pillai',  date: '2025-03-19', type: 'Benign',            llm: 'Gemini 1.5 Flash' },
  { id: 'RPT-2503-003', patient: 'Kavitha Nair',  date: '2025-03-18', type: 'Lightly Malignant', llm: 'Gemini 1.5 Flash' },
  { id: 'RPT-2503-004', patient: 'Priya Ramesh',  date: '2025-03-17', type: 'Heavily Malignant', llm: 'Gemini 1.5 Flash' },
]

const typeColor = {
  'Heavily Malignant': 'text-red-400',
  'Lightly Malignant': 'text-yellow-400',
  'Benign':            'text-emerald-400',
}

export default function ReportsTab() {
  return (
    <div className="space-y-4 fade-in">
      {reports.map(r => (
        <div key={r.id} className="glass rounded-2xl p-5 border border-white/5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="font-mono text-teal-400 text-xs mb-1">{r.id}</div>
            <div className="font-black">{r.patient}</div>
            <div className="text-xs text-white/40 mt-1">{r.date} · LLM: {r.llm}</div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`font-bold ${typeColor[r.type]}`}>{r.type}</span>
            <button
              onClick={() => window.open('/report.html', '_blank')}
              className="btn-outline text-xs px-4 py-2 rounded-xl"
            >
              ⬇ Download PDF
            </button>
            <button
              onClick={() => window.open('/report.html', '_blank')}
              className="btn-primary text-xs px-4 py-2 rounded-xl"
            >
              👁 View
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
