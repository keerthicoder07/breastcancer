from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(512), nullable=False)
    role = Column(String(50), default="radiologist")
    created_at = Column(DateTime, default=datetime.utcnow)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id_str = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    dob = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scans = relationship("Scan", back_populates="patient", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    filename = Column(String(512), nullable=False)
    upload_path = Column(String(1024), nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="scans")
    report = relationship("Report", back_populates="scan", uselist=False, cascade="all, delete-orphan")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    report_id_str = Column(String(50), unique=True, index=True)
    benign_pct = Column(Float, nullable=False)
    light_pct = Column(Float, nullable=False)
    heavy_pct = Column(Float, nullable=False)
    dominant_class = Column(String(100), nullable=False)
    llm_summary = Column(Text, nullable=True)
    gradcam_path = Column(String(1024), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="report")
