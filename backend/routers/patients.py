"""
Patients router — CRUD
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.database import get_db
from backend.models import Patient
from backend.schemas import PatientCreate, PatientOut

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=list[PatientOut])
async def list_patients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).order_by(Patient.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=PatientOut)
async def create_patient(req: PatientCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Patient).where(Patient.patient_id_str == req.patient_id_str))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Patient ID already exists")

    patient = Patient(**req.model_dump())
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient


@router.get("/{patient_id}", response_model=PatientOut)
async def get_patient(patient_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.delete("/{patient_id}")
async def delete_patient(patient_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    from sqlalchemy import delete
    from backend.models import Scan, Report
    
    # 1. Manually resolve and delete dependencies to ensure DB deletion regardless of cascade config
    scans_res = await db.execute(select(Scan.id).where(Scan.patient_id == patient_id))
    scan_ids = [row[0] for row in scans_res]
    
    if scan_ids:
        await db.execute(delete(Report).where(Report.scan_id.in_(scan_ids)))
        await db.execute(delete(Scan).where(Scan.patient_id == patient_id))
        
    await db.delete(patient)
    await db.commit()
    return {"status": "success", "detail": f"Patient {patient_id} deleted"}
