const patients = [
  { id: 'PT-001', name: 'Ananya Sharma',  age: 45, date: '2025-03-20', result: 'Heavily Malignant', conf: '89.2%', status: 'Urgent' },
  { id: 'PT-002', name: 'Meera Pillai',   age: 52, date: '2025-03-19', result: 'Benign',            conf: '94.5%', status: 'Clear'  },
  { id: 'PT-003', name: 'Kavitha Nair',   age: 38, date: '2025-03-18', result: 'Lightly Malignant', conf: '78.3%', status: 'Review' },
  { id: 'PT-004', name: 'Priya Ramesh',   age: 61, date: '2025-03-17', result: 'Heavily Malignant', conf: '95.1%', status: 'Urgent' },
  { id: 'PT-005', name: 'Divya Krishnan', age: 43, date: '2025-03-16', result: 'Benign',            conf: '91.8%', status: 'Clear'  },
]

const statusStyle = {
  Urgent: 'text-red-400 bg-red-400/10 border-red-400/30',
  Clear:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  Review: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
}
const resultStyle = {
  'Heavily Malignant': 'text-red-400',
  'Lightly Malignant': 'text-yellow-400',
  'Benign':            'text-emerald-400',
}

export default function RecordsTab() {
  return (
    <div className="fade-in">
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-black">Patient Records</h3>
          <span className="tag text-xs px-3 py-1 rounded-full">{patients.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Patient ID','Name','Age','Scan Date','AI Result','Confidence','Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-black text-white/40 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <tr key={p.id}
                  className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                  <td className="px-6 py-4 font-mono text-teal-400 text-xs">{p.id}</td>
                  <td className="px-6 py-4 font-bold">{p.name}</td>
                  <td className="px-6 py-4 text-white/50">{p.age}</td>
                  <td className="px-6 py-4 text-white/50 font-mono text-xs">{p.date}</td>
                  <td className={`px-6 py-4 font-bold ${resultStyle[p.result]}`}>{p.result}</td>
                  <td className="px-6 py-4 text-white/60 font-semibold">{p.conf}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${statusStyle[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
