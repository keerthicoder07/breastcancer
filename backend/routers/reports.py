"""
Reports router — list and retrieve reports from DB
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func

from backend.database import get_db
from backend.models import Report, Scan, Patient
from backend.schemas import ReportOut, AnalyticsOut

router = APIRouter(prefix="/api", tags=["reports"])


@router.get("/reports", response_model=list[ReportOut])
async def list_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Report)
        .options(selectinload(Report.scan).selectinload(Scan.patient))
        .order_by(Report.created_at.desc())
    )
    reports = result.scalars().all()
    out = []
    for r in reports:
        out.append(ReportOut(
            id=r.id,
            report_id_str=r.report_id_str,
            scan_id=r.scan_id,
            patient_name=r.scan.patient.name,
            patient_id_str=r.scan.patient.patient_id_str,
            benign_pct=r.benign_pct,
            light_pct=r.light_pct,
            heavy_pct=r.heavy_pct,
            dominant_class=r.dominant_class,
            llm_summary=r.llm_summary,
            gradcam_path=r.gradcam_path,
            created_at=r.created_at,
        ))
    return out


@router.get("/reports/{report_id}", response_model=ReportOut)
async def get_report(report_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Report)
        .where(Report.id == report_id)
        .options(selectinload(Report.scan).selectinload(Scan.patient))
    )
    r = result.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportOut(
        id=r.id,
        report_id_str=r.report_id_str,
        scan_id=r.scan_id,
        patient_name=r.scan.patient.name,
        patient_id_str=r.scan.patient.patient_id_str,
        benign_pct=r.benign_pct,
        light_pct=r.light_pct,
        heavy_pct=r.heavy_pct,
        dominant_class=r.dominant_class,
        llm_summary=r.llm_summary,
        gradcam_path=r.gradcam_path,
        created_at=r.created_at,
    )


@router.get("/analytics", response_model=AnalyticsOut)
async def get_analytics(db: AsyncSession = Depends(get_db)):
    total_reports = (await db.execute(select(func.count(Report.id)))).scalar()
    benign_count  = (await db.execute(
        select(func.count(Report.id)).where(Report.dominant_class == "Benign"))).scalar()
    light_count   = (await db.execute(
        select(func.count(Report.id)).where(Report.dominant_class == "Lightly Malignant"))).scalar()
    heavy_count   = (await db.execute(
        select(func.count(Report.id)).where(Report.dominant_class == "Heavily Malignant"))).scalar()
    total_patients = (await db.execute(select(func.count(Patient.id)))).scalar()

    return AnalyticsOut(
        total_scans=total_reports,
        benign_count=benign_count,
        lightly_malignant_count=light_count,
        heavily_malignant_count=heavy_count,
        total_patients=total_patients,
    )
