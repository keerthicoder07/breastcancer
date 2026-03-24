// src/components/ModelBanner.jsx
export default function ModelBanner() {
  return (
    <div className="model-banner px-6 py-2 text-xs flex items-center gap-3 text-white/60">
      <span className="tag px-2 py-0.5 rounded-full font-bold text-xs">🔬 YOUR MODEL</span>
      <span>
        This portal uses{' '}
        <span className="text-teal-400 font-bold">
          your locally trained PyTorch Dual-Stream model (Swin-T + RAD-DINO)
        </span>{' '}
        exclusively for 3-class classification (0_Benign · 1_Lightly Malignant · 2_Heavily Malignant).
        The AI output is passed to Gemini LLM only for clinical report generation — your weights remain private.
      </span>
    </div>
  )
}
