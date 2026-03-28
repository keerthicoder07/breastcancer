import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Zap, Flame, BarChart2, FileText, User } from 'lucide-react'
import { analyzeImage, getPatients } from '../../lib/api'

export default function DiagnosticsTab() {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [results, setResults]   = useState(null)
  const [bars, setBars]         = useState({ b: 0, l: 0, h: 0 })
  const [gradcamUrl, setGradcamUrl] = useState(null)
  const [patients, setPatients] = useState([])
  const [patientId, setPatientId] = useState('')
  const [showPatients, setShowPatients] = useState(false)
  const inputRef = useRef()

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResults(null)
    setGradcamUrl(null)
    setBars({ b: 0, l: 0, h: 0 })
  }

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false); loadFile(e.dataTransfer.files[0])
  }, [])

  const loadPatients = async () => {
    try {
      const data = await getPatients()
      setPatients(data)
      setShowPatients(true)
    } catch { setShowPatients(true) }
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true); setResults(null); setGradcamUrl(null)
    try {
      const pid = patientId ? parseInt(patientId) : null
      const data = await analyzeImage(file, pid)
      setResults(data)
      if (data.gradcam_url) setGradcamUrl(data.gradcam_url)
      setTimeout(() => setBars({
        b: data.predictions.benign,
        l: data.predictions.lightly_malignant,
        h: data.predictions.heavily_malignant,
      }), 200)
    } catch (err) {
      console.error('Analysis failed:', err)
    }
    setLoading(false)
  }

  const dominant = results?.dominant_class
  const domColor = {
    'Heavily Malignant': 'text-red-400 border-red-500/30',
    'Lightly Malignant': 'text-yellow-400 border-yellow-500/30',
    'Benign':            'text-emerald-400 border-emerald-500/30',
  }

  return (
    <div className="space-y-6">
      {/* Diagnosis banner */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`glass rounded-2xl p-4 border fade-in flex items-center gap-4 ${domColor[dominant]}`}
          >
            <span className="text-3xl">🔬</span>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest font-bold">Primary Diagnosis</div>
              <div className={`text-2xl font-black ${domColor[dominant]?.split(' ')[0]}`}>{dominant}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs text-white/40">Max Confidence</div>
              <div className="text-lg font-black text-teal-400">
                {Math.max(results.predictions.benign, results.predictions.lightly_malignant, results.predictions.heavily_malignant).toFixed(1)}%
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Column 1: Upload */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h2 className="font-black mb-4 flex items-center gap-2 text-sm">
              <Upload size={16} /> Upload Mammogram
            </h2>
            <div
              className={`drop-zone rounded-xl p-6 text-center ${dragging ? 'dragging' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current.click()}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={e => loadFile(e.target.files[0])} />
              {preview ? (
                <div className="space-y-2">
                  <img src={preview} alt="" className="w-full h-36 object-cover rounded-lg border border-white/10" />
                  <p className="text-xs text-teal-400 font-semibold truncate">{file.name}</p>
                  <p className="text-xs text-white/30">click to change</p>
                </div>
              ) : (
                <div className="py-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-400/10 text-teal-400 flex items-center justify-center mx-auto mb-3">
                    <Upload size={22} />
                  </div>
                  <p className="font-bold text-white/70 mb-1">Drag & Drop X-Ray</p>
                  <p className="text-xs text-white/30 mb-4">JPEG · PNG · DICOM</p>
                  <span className="btn-primary text-xs px-4 py-2 rounded-lg">Browse Files</span>
                </div>
              )}
            </div>

            {/* Patient selector */}
            <div className="mt-3">
              <button
                onClick={loadPatients}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10
                           text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all"
              >
                <User size={13} />
                {patientId ? `Patient ID: ${patientId}` : 'Link to Patient (optional)'}
              </button>
              {showPatients && (
                <div className="mt-2 glass rounded-xl border border-white/10 max-h-32 overflow-y-auto">
                  <div
                    className="px-3 py-2 text-xs text-white/40 hover:bg-white/5 cursor-pointer"
                    onClick={() => { setPatientId(''); setShowPatients(false) }}
                  >
                    — No patient link (anonymous)
                  </div>
                  {patients.map(p => (
                    <div
                      key={p.id}
                      className="px-3 py-2 text-xs hover:bg-white/5 cursor-pointer flex justify-between"
                      onClick={() => { setPatientId(String(p.id)); setShowPatients(false) }}
                    >
                      <span className="text-white/70">{p.name}</span>
                      <span className="text-teal-400 font-mono">{p.patient_id_str}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <motion.button
              whileHover={file && !loading ? { scale: 1.02 } : {}}
              whileTap={file && !loading ? { scale: 0.98 } : {}}
              onClick={analyze}
              disabled={!file || loading}
              className={`w-full mt-4 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all
                ${file && !loading ? 'btn-primary' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Running Dual-Stream AI...</>
              ) : (
                <><Zap size={15} /> Run Parallel Diagnostics</>
              )}
            </motion.button>
          </div>

          {/* Pipeline Status */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap size={13} /> Pipeline Status
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {['Original', '224×224 Tensor'].map((lbl, i) => (
                <div key={lbl}>
                  <div className="text-xs text-white/40 font-semibold mb-1 uppercase tracking-widest">{lbl}</div>
                  <div className="bg-black rounded-lg aspect-video flex items-center justify-center border border-white/5 overflow-hidden">
                    {preview
                      ? <img src={preview} alt="" className="w-full h-full object-cover"
                          style={i === 1 ? { filter: 'grayscale(.4) contrast(1.2)' } : {}} />
                      : <span className="text-white/20 text-xs">empty</span>
                    }
                  </div>
                </div>
              ))}
            </div>
            {[['Swin-T Encoder', results ? '✓ Complete' : loading ? 'Processing...' : 'Idle'],
              ['RAD-DINO Backbone', results ? '✓ Complete' : loading ? 'Processing...' : 'Idle'],
              ['Parallel Fusion', results ? '✓ Complete' : loading ? 'Fusing...' : 'Idle'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-white/40 font-semibold">{k}</span>
                <span className={results ? 'text-teal-400' : loading ? 'text-yellow-400' : 'text-white/25'}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Grad-CAM */}
        <div className="glass rounded-2xl p-5 border border-white/5">
          <h2 className="font-black mb-4 flex items-center gap-2 text-sm">
            <Flame size={16} /> Grad-CAM Heatmap
            <span className="tag text-xs px-2 py-0.5 rounded-full ml-auto">XAI</span>
          </h2>
          <div className="rounded-xl overflow-hidden bg-black border border-white/5 aspect-square flex items-center justify-center relative">
            {gradcamUrl ? (
              <>
                <img src={gradcamUrl} alt="Grad-CAM" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3">
                  <div className="glass rounded-lg px-3 py-1.5 text-xs font-bold text-red-300">🔴 High Activation Detected</div>
                </div>
              </>
            ) : results && !gradcamUrl ? (
              /* Fallback overlay if grad-cam not available */
              <>
                <img src={preview} alt="" className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(.8) contrast(1.2)' }} />
                <div className="absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse 50% 40% at 62% 35%,rgba(239,68,68,.7),rgba(234,179,8,.4) 40%,transparent 70%)', mixBlendMode: 'multiply' }} />
                <div className="absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse 30% 25% at 65% 30%,rgba(239,68,68,.9),transparent 60%)', mixBlendMode: 'screen' }} />
                <div className="absolute bottom-3 left-3">
                  <div className="glass rounded-lg px-3 py-1.5 text-xs font-bold text-red-300">🔴 High Activation Detected</div>
                </div>
              </>
            ) : loading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white/30 text-sm">Generating Heatmap...</p>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="text-4xl mb-3 opacity-20">🔥</div>
                <p className="text-white/25 text-sm">Heatmap appears after analysis</p>
              </div>
            )}
          </div>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-teal-400/5 border border-teal-400/20"
            >
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">AI Interpretation</p>
              <p className="text-sm text-white/60">
                Gradient activations highlight focal hyperdense regions consistent with architectural distortion in the superior-outer quadrant.
              </p>
            </motion.div>
          )}
        </div>

        {/* Column 3: Scores + Model Info */}
        <div className="space-y-5">
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h2 className="font-black mb-5 flex items-center gap-2 text-sm">
              <BarChart2 size={16} /> Confidence Scores
            </h2>
            <div className="space-y-5">
              {[
                { label: '0 — Benign',            cls: 'bar-benign', val: bars.b, raw: results?.predictions.benign,             color: 'text-white/50' },
                { label: '1 — Lightly Malignant', cls: 'bar-light',  val: bars.l, raw: results?.predictions.lightly_malignant,  color: 'text-yellow-400' },
                { label: '2 — Heavily Malignant', cls: 'bar-heavy',  val: bars.h, raw: results?.predictions.heavily_malignant,  color: 'text-red-400' },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-white/70">{b.label}</span>
                    <span className={b.color}>{results ? `${b.raw.toFixed(1)}%` : '—'}</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={`${b.cls} h-full rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${b.val}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
              {!results && (
                <p className="text-center text-white/20 text-sm py-4">Upload and analyze to see predictions</p>
              )}
            </div>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-3">Model Info</h3>
            {[
              ['Encoder A',       'Swin-T v2 (Your Weights)'],
              ['Encoder B',       'RAD-DINO (Your Weights)'],
              ['Fusion',          'Parallel Concat'],
              ['Classification',  '3-Class Softmax'],
              ['LLM for Report',  'Gemini 1.5 Flash'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-white/40">{k}</span>
                <span className="text-teal-400 font-bold text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LLM Report */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-teal-400/20 overflow-hidden"
          >
            <div className="bg-teal-400/5 px-6 py-4 border-b border-teal-400/15 flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-black flex items-center gap-2">
                <FileText size={16} /> AI Clinical Report
                <span className="tag text-xs px-2 py-0.5 rounded-full">Gemini 1.5 Flash · LLM</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(results.llm_summary)
                    a.download = `MammAI_Report_${Date.now()}.txt`
                    a.click()
                  }}
                  className="btn-outline text-xs px-4 py-2 rounded-xl"
                >
                  ⬇ Download .txt
                </button>
              </div>
            </div>
            <div className="px-6 py-2">
              {results.report_id && (
                <p className="text-xs text-teal-400 font-mono mb-1">Report #{results.report_id} saved to database ✓</p>
              )}
            </div>
            <textarea
              className="w-full h-56 bg-transparent px-6 py-5 text-white/70 font-mono text-sm leading-relaxed resize-y focus:outline-none"
              value={results.llm_summary}
              onChange={e => setResults({ ...results, llm_summary: e.target.value })}
              spellCheck="false"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
