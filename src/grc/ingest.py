from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from rag.ingest import ingest_file as base_ingest_file
from rag.models import Document
from .models import GRCDocument, DocumentAuditLog, ComplianceControl, RiskAssessment
from .classifier import GRCDocumentClassifier


def ingest_grc_document(
    filename: str, 
    data: bytes, 
    user_id: str,
    source_path: Optional[str] = None,
    session: Optional[Session] = None
) -> int:
    """Enhanced document ingestion with GRC classification"""
    
    # First, ingest the document using the base RAG system
    document_id = base_ingest_file(filename, data, source_path=source_path)
    
    # Get the document text for classification
    from rag.db import db_session
    from sqlalchemy import text as sql_text
    
    with db_session() as s:
        # Get document text from chunks
        sql = sql_text("""
            SELECT string_agg(text, ' ') as full_text 
            FROM chunks 
            WHERE document_id = :doc_id 
            ORDER BY ordinal
        """)
        result = s.execute(sql, {"doc_id": document_id}).fetchone()
        document_text = result[0] if result else ""
        
        # Classify the document
        classifier = GRCDocumentClassifier()
        classification = classifier.classify_document(document_text, filename)
        
        # Create GRC document metadata
        grc_doc = GRCDocument(
            document_id=document_id,
            document_type=classification["document_type"],
            compliance_framework=classification["compliance_framework"],
            control_id=classification["control_id"],
            risk_level=classification["risk_level"],
            title=classification["title"],
            description=classification["description"],
            created_by=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        s.add(grc_doc)
        s.flush()
        
        # Create audit log
        audit_log = DocumentAuditLog(
            grc_document_id=grc_doc.id,
            action="CREATE",
            user_id=user_id,
            timestamp=datetime.utcnow(),
            details=f"Document uploaded and classified as {classification['document_type']} for {classification['compliance_framework']}",
            ip_address=None  # Could be passed from request context
        )
        s.add(audit_log)
        
        # Extract and store compliance requirements
        requirements = classifier.extract_compliance_requirements(document_text)
        for req in requirements:
            # Store requirements in a separate table or as JSON
            pass
        
        # Perform risk assessment
        risk_assessment = classifier.assess_risk_factors(document_text)
        if risk_assessment["risk_factors"]:
            for risk_factor in risk_assessment["risk_factors"]:
                risk = RiskAssessment(
                    grc_document_id=grc_doc.id,
                    risk_category=risk_factor.get("factor", "General"),
                    risk_description=risk_factor.get("factor", ""),
                    likelihood=self._convert_severity_to_score(risk_factor.get("likelihood", "MEDIUM")),
                    impact=self._convert_severity_to_score(risk_factor.get("impact", "MEDIUM")),
                    risk_score=risk_assessment.get("overall_risk_score", 0.5) * 5,  # Convert to 1-5 scale
                    mitigation_strategy="; ".join(risk_assessment.get("mitigation_suggestions", [])),
                    assessed_by=user_id,
                    assessed_at=datetime.utcnow()
                )
                s.add(risk)
        
        s.commit()
        return grc_doc.id


def _convert_severity_to_score(severity: str) -> int:
    """Convert severity string to numeric score"""
    mapping = {
        "LOW": 1,
        "MEDIUM": 3,
        "HIGH": 4,
        "CRITICAL": 5
    }
    return mapping.get(severity.upper(), 3)


def update_document_classification(
    grc_document_id: int,
    user_id: str,
    document_type: Optional[str] = None,
    compliance_framework: Optional[str] = None,
    risk_level: Optional[str] = None,
    control_id: Optional[str] = None,
    session: Optional[Session] = None
) -> bool:
    """Update document classification"""
    
    from rag.db import db_session
    
    with db_session() as s:
        grc_doc = s.query(GRCDocument).filter(GRCDocument.id == grc_document_id).first()
        if not grc_doc:
            return False
        
        # Update fields
        if document_type:
            grc_doc.document_type = document_type
        if compliance_framework:
            grc_doc.compliance_framework = compliance_framework
        if risk_level:
            grc_doc.risk_level = risk_level
        if control_id:
            grc_doc.control_id = control_id
        
        grc_doc.updated_at = datetime.utcnow()
        
        # Create audit log
        audit_log = DocumentAuditLog(
            grc_document_id=grc_doc.id,
            action="UPDATE_CLASSIFICATION",
            user_id=user_id,
            timestamp=datetime.utcnow(),
            details=f"Classification updated: type={document_type}, framework={compliance_framework}, risk={risk_level}",
            ip_address=None
        )
        s.add(audit_log)
        
        s.commit()
        return True


def get_document_compliance_status(grc_document_id: int) -> dict:
    """Get comprehensive compliance status for a document"""
    
    from rag.db import db_session
    
    with db_session() as s:
        grc_doc = s.query(GRCDocument).filter(GRCDocument.id == grc_document_id).first()
        if not grc_doc:
            return {}
        
        # Get risk assessments
        risks = s.query(RiskAssessment).filter(RiskAssessment.grc_document_id == grc_document_id).all()
        
        # Get audit logs
        audit_logs = s.query(DocumentAuditLog).filter(
            DocumentAuditLog.grc_document_id == grc_document_id
        ).order_by(DocumentAuditLog.timestamp.desc()).limit(10).all()
        
        return {
            "document": {
                "id": grc_doc.id,
                "title": grc_doc.title,
                "type": grc_doc.document_type,
                "framework": grc_doc.compliance_framework,
                "risk_level": grc_doc.risk_level,
                "status": grc_doc.status,
                "compliance_score": grc_doc.compliance_score,
                "created_at": grc_doc.created_at,
                "updated_at": grc_doc.updated_at
            },
            "risks": [
                {
                    "id": risk.id,
                    "category": risk.risk_category,
                    "description": risk.risk_description,
                    "score": risk.risk_score,
                    "mitigation": risk.mitigation_strategy
                }
                for risk in risks
            ],
            "audit_trail": [
                {
                    "action": log.action,
                    "user": log.user_id,
                    "timestamp": log.timestamp,
                    "details": log.details
                }
                for log in audit_logs
            ]
        }
