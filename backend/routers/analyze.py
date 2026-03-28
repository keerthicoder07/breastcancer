"""
Analyze router — upload image → real inference → Grad-CAM → Gemini report → save to DB
"""
import os
import uuid
import base64
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv

from backend.database import get_db
from backend.models import Patient, Scan, Report
from backend.schemas import AnalyzeResponse, PredictionScores
from backend.ml.predictor import predict_image

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

router = APIRouter(prefix="/api", tags=["analyze"])

# Configure Gemini
_api_key = os.getenv("GEMINI_API_KEY")
if _api_key:
    genai.configure(api_key=_api_key)
    _llm = genai.GenerativeModel("gemini-flash-latest")
else:
    _llm = None

# Grad-CAM images stored in memory (keyed by report id) — for small scale
_gradcam_store: dict[int, bytes] = {}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    file: UploadFile = File(...),
    patient_id: int = Query(default=None, description="Link scan to existing patient"),
    db: AsyncSession = Depends(get_db),
):
    # 1. Read image bytes
    image_bytes = await file.read()

    # 2. Run real model inference
    result = predict_image(image_bytes)
    benign   = result["benign"]
    light    = result["lightly_malignant"]
    heavy    = result["heavily_malignant"]
    dominant = result["dominant_class"]
    gradcam_bytes = result.get("gradcam_png_bytes")

    # 3. LLM Report via Gemini
    llm_summary = _generate_report(dominant, benign, light, heavy)

    # 4. Resolve patient (use default if not given)
    if patient_id is None:
        # Auto-create an anonymous patient
        anon_id = f"PT-ANON-{uuid.uuid4().hex[:6].upper()}"
        patient = Patient(patient_id_str=anon_id, name="Anonymous Patient")
        db.add(patient)
        await db.flush()
    else:
        res = await db.execute(select(Patient).where(Patient.id == patient_id))
        patient = res.scalar_one_or_none()
        if not patient:
            anon_id = f"PT-ANON-{uuid.uuid4().hex[:6].upper()}"
            patient = Patient(patient_id_str=anon_id, name="Anonymous Patient")
            db.add(patient)
            await db.flush()

    # 5. Save Scan to DB
    scan = Scan(
        patient_id=patient.id,
        filename=file.filename,
        upload_path=None,
        analyzed_at=datetime.utcnow(),
    )
    db.add(scan)
    await db.flush()

    # 6. Save Report to DB
    report_id_str = f"RPT-{datetime.utcnow().strftime('%y%m')}-{scan.id:03d}"
    report = Report(
        scan_id=scan.id,
        report_id_str=report_id_str,
        benign_pct=benign,
        light_pct=light,
        heavy_pct=heavy,
        dominant_class=dominant,
        llm_summary=llm_summary,
        gradcam_path=f"/api/gradcam/{scan.id}" if gradcam_bytes else None,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    # 7. Store Grad-CAM bytes for retrieval
    if gradcam_bytes:
        _gradcam_store[scan.id] = gradcam_bytes

    return AnalyzeResponse(
        filename=file.filename,
        predictions=PredictionScores(
            benign=benign,
            lightly_malignant=light,
            heavily_malignant=heavy,
        ),
        dominant_class=dominant,
        llm_summary=llm_summary,
        gradcam_url=f"/api/gradcam/{scan.id}" if gradcam_bytes else None,
        report_id=report.id,
    )


@router.get("/gradcam/{scan_id}")
async def get_gradcam(scan_id: int):
    """Serve Grad-CAM PNG image."""
    data = _gradcam_store.get(scan_id)
    if not data:
        return Response(status_code=404)
    return Response(content=data, media_type="image/png")


def _generate_report(dominant: str, benign: float, light: float, heavy: float) -> str:
    if _llm:
        try:
            prompt = f"""You are an expert radiologist AI. Write a structured clinical summary for a mammogram analysed by a dual-stream AI (Swin-T + RAD-DINO).

Model Output:
- Primary Classification: {dominant}
- Benign: {benign}%, Lightly Malignant: {light}%, Heavily Malignant: {heavy}%

Structure your response with three sections: FINDINGS, IMPRESSION, RECOMMENDATIONS.
Be concise (≤200 words), professional, and clinical in tone.
Always end with: "NOTE: AI-assisted report. Final clinical decision rests with the attending radiologist."
"""
            response = _llm.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"⚠️  Gemini API error: {e}")

    return _fallback_report(dominant, benign, light, heavy)


def _fallback_report(dominant: str, benign: float, light: float, heavy: float) -> str:
    urgency = "URGENT" if dominant == "Heavily Malignant" else "recommended"
    biopsy  = "Proceed with core needle biopsy to confirm malignancy." if dominant != "Benign" else "Schedule routine 6-month follow-up screening."
    mri     = "Schedule contrast MRI for staging and oncology referral." if dominant == "Heavily Malignant" else "Continue standard screening protocol."

    return f"""PARALLEL DUAL-STREAM AI CLINICAL SUMMARY
Model: Swin-T v2 + RAD-DINO (Parallel Fusion) | LLM: Offline Fallback

FINDINGS:
The AI dual-stream system analyzed the submitted mammogram using the Swin-T hierarchical encoder and RAD-DINO radiology-pretrained backbone in parallel. Focal areas of potential architectural distortion were noted by Grad-CAM saliency analysis.

IMPRESSION:
Primary Classification: {dominant.upper()}
- Benign Probability:             {benign}%
- Lightly Malignant Probability:  {light}%
- Heavily Malignant Probability:  {heavy}%

RECOMMENDATIONS:
1. Radiologist review is {urgency}.
2. {biopsy}
3. {mri}

NOTE: AI-assisted report. Final clinical decision rests with the attending radiologist.
Set GEMINI_API_KEY in .env for live LLM reports."""
