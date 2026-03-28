from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "radiologist"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    user_email: str
    role: str


# ── Patient ───────────────────────────────────────────────────────────────────
class PatientCreate(BaseModel):
    patient_id_str: str
    name: str
    age: Optional[int] = None
    dob: Optional[str] = None


class PatientOut(BaseModel):
    id: int
    patient_id_str: str
    name: str
    age: Optional[int]
    dob: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Scan / Report ─────────────────────────────────────────────────────────────
class PredictionScores(BaseModel):
    benign: float
    lightly_malignant: float
    heavily_malignant: float


class AnalyzeResponse(BaseModel):
    filename: str
    predictions: PredictionScores
    dominant_class: str
    llm_summary: str
    gradcam_url: Optional[str] = None
    report_id: Optional[int] = None


class ReportOut(BaseModel):
    id: int
    report_id_str: str
    scan_id: int
    patient_name: str
    patient_id_str: str
    benign_pct: float
    light_pct: float
    heavy_pct: float
    dominant_class: str
    llm_summary: Optional[str]
    gradcam_path: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Analytics (aggregated stats) ──────────────────────────────────────────────
class AnalyticsOut(BaseModel):
    total_scans: int
    benign_count: int
    lightly_malignant_count: int
    heavily_malignant_count: int
    total_patients: int
