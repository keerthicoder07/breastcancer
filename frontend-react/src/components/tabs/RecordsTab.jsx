import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, X, Trash2 } from 'lucide-react'
import { getPatients, createPatient, getReports, deletePatient } from '../../lib/api'

const resultStyle = {
  'Heavily Malignant': 'text-red-400',
  'Lightly Malignant': 'text-yellow-400',
  'Benign':            'text-emerald-400',
}

export default function RecordsTab() {
  const [patients, setPatients]   = useState([])
  const [reports, setReports]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ patient_id_str: '', name: '', age: '', dob: '' })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    try {
      const [pts, rpts] = await Promise.all([getPatients(), getReports()])
      setPatients(pts)
      setReports(rpts)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Build a quick lookup: patient_id_str → latest report
  const latestReport = {}
  reports.forEach(r => { latestReport[r.patient_id_str] = r })

  const handleCreate = async () => {
    if (!form.patient_id_str || !form.name) { setFormError('Patient ID and Name are required.'); return }
    setSaving(true); setFormError('')
    try {
      await createPatient({ ...form, age: form.age ? parseInt(form.age) : null })
      setShowForm(false)
      setForm({ patient_id_str: '', name: '', age: '', dob: '' })
      await load()
    } catch (e) {
      setFormError(e.response?.data?.detail || 'Failed to create patient.')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: This will permanently delete the patient, imaging scans, and AI reports. Continue?")) return
    setDeletingId(id)
    try {
      await deletePatient(id)
      await load()
    } catch (e) {
      alert("Failed to delete patient. Ensure you have the proper permissions.")
    }
    setDeletingId(null)
  }

  return (
    <div className="fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-black flex items-center gap-2"><Users size={18} /> Patient Records</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={14} /> Add Patient
        </button>
      </div>

      {/* Add Patient Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 border border-teal-400/20 space-y-3"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-black text-sm">New Patient</h3>
            <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/70"><X size={16} /></button>
          </div>
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'patient_id_str', placeholder: 'PT-2025-001', label: 'Patient ID *' },
              { key: 'name',           placeholder: 'Full Name',   label: 'Name *' },
              { key: 'age',            placeholder: '45',          label: 'Age' },
              { key: 'dob',            placeholder: 'YYYY-MM-DD',  label: 'Date of Birth' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-white/40 font-bold uppercase tracking-widest block mb-1">{f.label}</label>
                <input
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white
                             focus:outline-none focus:border-teal-400 transition-all"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="btn-primary text-xs px-5 py-2 rounded-xl"
          >
            {saving ? 'Saving...' : 'Save Patient'}
          </button>
        </motion.div>
      )}

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-black">All Patients</h3>
          <span className="tag text-xs px-3 py-1 rounded-full">{patients.length} records</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          </div>
        ) : patients.length === 0 ? (
          <div className="p-10 text-center text-white/30">No patients yet. Add one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Patient ID', 'Name', 'Age', 'Registered', 'Latest Diagnosis', 'Confidence', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-black text-white/40 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map((p, i) => {
                  const r = latestReport[p.patient_id_str]
                  const conf = r ? Math.max(r.benign_pct, r.light_pct, r.heavy_pct).toFixed(1) + '%' : '—'
                  return (
                    <tr key={p.id}
                      className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}
                    >
                      <td className="px-6 py-4 font-mono text-teal-400 text-xs">{p.patient_id_str}</td>
                      <td className="px-6 py-4 font-bold">{p.name}</td>
                      <td className="px-6 py-4 text-white/50">{p.age ?? '—'}</td>
                      <td className="px-6 py-4 text-white/50 font-mono text-xs">
                        {new Date(p.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className={`px-6 py-4 font-bold ${r ? resultStyle[r.dominant_class] : 'text-white/20'}`}>
                        {r ? r.dominant_class : '—'}
                      </td>
                      <td className="px-6 py-4 text-white/60 font-semibold">{conf}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
                          title="Delete Patient"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
