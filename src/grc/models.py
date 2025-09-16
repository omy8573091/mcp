from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Integer, String, Text, Enum as SQLEnum, Float, Boolean
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class ComplianceFramework(str, Enum):
    SOX = "SOX"
    GDPR = "GDPR"
    ISO27001 = "ISO27001"
    NIST = "NIST"
    COSO = "COSO"
    PCI_DSS = "PCI_DSS"
    HIPAA = "HIPAA"
    SOC2 = "SOC2"


class DocumentType(str, Enum):
    POLICY = "POLICY"
    PROCEDURE = "PROCEDURE"
    CONTROL = "CONTROL"
    RISK_ASSESSMENT = "RISK_ASSESSMENT"
    AUDIT_REPORT = "AUDIT_REPORT"
    COMPLIANCE_REPORT = "COMPLIANCE_REPORT"
    INCIDENT_REPORT = "INCIDENT_REPORT"
    TRAINING_MATERIAL = "TRAINING_MATERIAL"
    CONTRACT = "CONTRACT"
    OTHER = "OTHER"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class DocumentStatus(str, Enum):
    DRAFT = "DRAFT"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    ARCHIVED = "ARCHIVED"
    SUPERSEDED = "SUPERSEDED"


class Base(DeclarativeBase):
    pass


class GRCDocument(Base):
    __tablename__ = "grc_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"), nullable=False)
    
    # GRC-specific fields
    document_type: Mapped[DocumentType] = mapped_column(SQLEnum(DocumentType), nullable=False)
    compliance_framework: Mapped[ComplianceFramework] = mapped_column(SQLEnum(ComplianceFramework), nullable=False)
    control_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    risk_level: Mapped[RiskLevel] = mapped_column(SQLEnum(RiskLevel), default=RiskLevel.MEDIUM)
    status: Mapped[DocumentStatus] = mapped_column(SQLEnum(DocumentStatus), default=DocumentStatus.DRAFT)
    
    # Metadata
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    version: Mapped[str] = mapped_column(String(20), default="1.0")
    effective_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    review_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # AI Analysis
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    compliance_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    # Audit fields
    created_by: Mapped[str] = mapped_column(String(100), nullable=False)
    approved_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="grc_metadata")
    audit_logs: Mapped[list["DocumentAuditLog"]] = relationship(back_populates="grc_document", cascade="all, delete-orphan")


class DocumentAuditLog(Base):
    __tablename__ = "document_audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    grc_document_id: Mapped[int] = mapped_column(ForeignKey("grc_documents.id"), nullable=False)
    
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # CREATE, UPDATE, DELETE, APPROVE, etc.
    user_id: Mapped[str] = mapped_column(String(100), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    
    # Relationships
    grc_document: Mapped["GRCDocument"] = relationship(back_populates="audit_logs")


class ComplianceControl(Base):
    __tablename__ = "compliance_controls"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    framework: Mapped[ComplianceFramework] = mapped_column(SQLEnum(ComplianceFramework), nullable=False)
    control_id: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(200), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    grc_document_id: Mapped[int] = mapped_column(ForeignKey("grc_documents.id"), nullable=False)
    
    risk_category: Mapped[str] = mapped_column(String(200), nullable=False)
    risk_description: Mapped[str] = mapped_column(Text, nullable=False)
    likelihood: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5 scale
    impact: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5 scale
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)  # likelihood * impact
    
    mitigation_strategy: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    residual_risk: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    
    assessed_by: Mapped[str] = mapped_column(String(100), nullable=False)
    assessed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    grc_document: Mapped["GRCDocument"] = relationship()
