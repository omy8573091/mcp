from __future__ import annotations

from typing import List, Optional
from fastmcp import FastMCP
from starlette.responses import JSONResponse
from starlette.requests import Request
from pydantic import BaseModel, Field

from .ingest import ingest_grc_document, update_document_classification, get_document_compliance_status
from .agent import GRCAgent
from .models import ComplianceFramework, DocumentType, RiskLevel
from mcp_server.logging_config import get_logger


class GRCQueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    context_documents: Optional[List[int]] = Field(default=None)


class DocumentClassificationRequest(BaseModel):
    document_type: Optional[str] = Field(default=None)
    compliance_framework: Optional[str] = Field(default=None)
    risk_level: Optional[str] = Field(default=None)
    control_id: Optional[str] = Field(default=None)


class ComplianceReportRequest(BaseModel):
    framework: str = Field(min_length=1)
    document_ids: List[int] = Field(default_factory=list)


def register_grc_routes(app: FastMCP) -> None:
    """Register GRC-specific routes"""
    logger = get_logger(__name__)
    grc_agent = GRCAgent()
    
    @app.custom_route("/grc/upload", methods=["POST"])
    async def upload_grc_document(request: Request):
        """Upload and classify GRC documents"""
        try:
            form = await request.form()
            files = form.getlist("files")
            user_id = form.get("user_id", "system")  # In production, get from JWT token
            
            if not files:
                return JSONResponse({"error": "No files provided"}, status_code=400)
            
            document_ids = []
            for file in files:
                content = await file.read()
                grc_doc_id = ingest_grc_document(
                    filename=file.filename,
                    data=content,
                    user_id=user_id
                )
                document_ids.append(grc_doc_id)
            
            logger.info("grc_document_upload", count=len(document_ids), user_id=user_id)
            return JSONResponse({
                "message": "Documents uploaded and classified successfully",
                "grc_document_ids": document_ids
            })
            
        except Exception as e:
            logger.error("grc_upload_error", error=str(e))
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.custom_route("/grc/query", methods=["POST"])
    async def query_grc(request: Request):
        """Query GRC documents with specialized AI agent"""
        try:
            data = await request.json()
            payload = GRCQueryRequest(**data)
            
            result = grc_agent.answer_grc_question(
                question=payload.question,
                context_documents=payload.context_documents
            )
            
            logger.info("grc_query", question_length=len(payload.question))
            return JSONResponse(result)
            
        except Exception as e:
            logger.error("grc_query_error", error=str(e))
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.custom_route("/grc/documents/{grc_doc_id}/classify", methods=["PUT"])
    async def update_classification(request: Request):
        """Update document classification"""
        try:
            grc_doc_id = int(request.path_params.get("grc_doc_id"))
            data = await request.json()
            payload = DocumentClassificationRequest(**data)
            user_id = data.get("user_id", "system")  # In production, get from JWT
            
            success = update_document_classification(
                grc_document_id=grc_doc_id,
                user_id=user_id,
                document_type=payload.document_type,
                compliance_framework=payload.compliance_framework,
                risk_level=payload.risk_level,
                control_id=payload.control_id
            )
            
            if success:
                return JSONResponse({"message": "Classification updated successfully"})
            else:
                return JSONResponse({"error": "Document not found"}, status_code=404)
                
        except Exception as e:
            logger.error("classification_update_error", error=str(e))
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.custom_route("/grc/documents/{grc_doc_id}/status", methods=["GET"])
    async def get_compliance_status(request: Request):
        """Get comprehensive compliance status for a document"""
        try:
            grc_doc_id = int(request.path_params.get("grc_doc_id"))
            status = get_document_compliance_status(grc_doc_id)
            
            if not status:
                return JSONResponse({"error": "Document not found"}, status_code=404)
            
            return JSONResponse(status)
            
        except Exception as e:
            logger.error("compliance_status_error", error=str(e))
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.custom_route("/grc/reports/compliance", methods=["POST"])
    async def generate_compliance_report(request: Request):
        """Generate compliance report for a specific framework"""
        try:
            data = await request.json()
            payload = ComplianceReportRequest(**data)
            
            # Validate framework
            try:
                framework = ComplianceFramework(payload.framework)
            except ValueError:
                return JSONResponse(
                    {"error": f"Invalid framework: {payload.framework}"}, 
                    status_code=400
                )
            
            report = grc_agent.generate_compliance_report(
                framework=framework,
                document_ids=payload.document_ids
            )
            
            logger.info("compliance_report_generated", framework=payload.framework)
            return JSONResponse(report)
            
        except Exception as e:
            logger.error("compliance_report_error", error=str(e))
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.custom_route("/grc/risk/assess", methods=["POST"])
    async def assess_risk(request: Request):
        """Perform risk assessment"""
        try:
            data = await request.json()
            question = data.get("question", "")
            context = data.get("context", "")
            
            if not question:
                return JSONResponse({"error": "Question is required"}, status_code=400)
            
            assessment = grc_agent.assess_risk_factors(question, context)
            
            logger.info("risk_assessment_performed", question_length=len(question))
            return JSONResponse(assessment)
            
        except Exception as e:
            logger.error("risk_assessment_error", error=str(e))
            return JSONResponse({"error": str(e)}, status_code=500)
    
    @app.custom_route("/grc/frameworks", methods=["GET"])
    async def list_frameworks(request: Request):
        """List available compliance frameworks"""
        frameworks = [
            {
                "value": framework.value,
                "name": framework.value,
                "description": f"{framework.value} compliance framework"
            }
            for framework in ComplianceFramework
        ]
        
        return JSONResponse({"frameworks": frameworks})
    
    @app.custom_route("/grc/document-types", methods=["GET"])
    async def list_document_types(request: Request):
        """List available document types"""
        document_types = [
            {
                "value": doc_type.value,
                "name": doc_type.value.replace("_", " ").title(),
                "description": f"{doc_type.value.replace('_', ' ').title()} document type"
            }
            for doc_type in DocumentType
        ]
        
        return JSONResponse({"document_types": document_types})
    
    @app.custom_route("/grc/risk-levels", methods=["GET"])
    async def list_risk_levels(request: Request):
        """List available risk levels"""
        risk_levels = [
            {
                "value": level.value,
                "name": level.value,
                "description": f"{level.value} risk level"
            }
            for level in RiskLevel
        ]
        
        return JSONResponse({"risk_levels": risk_levels})
    
    # Additional API endpoints for frontend
    @app.custom_route("/api/dashboard/stats", methods=["GET"])
    async def get_dashboard_stats(request: Request):
        """Get dashboard statistics"""
        return JSONResponse({
            "totalDocuments": 0,
            "complianceScore": 0.85,
            "riskAssessments": 0,
            "activeFrameworks": 3
        })
    
    @app.custom_route("/api/documents/recent", methods=["GET"])
    async def get_recent_documents(request: Request):
        """Get recent documents"""
        return JSONResponse([])
    
    @app.custom_route("/api/compliance/status", methods=["GET"])
    async def get_compliance_status_api(request: Request):
        """Get compliance status"""
        return JSONResponse({
            "frameworks": [
                {"name": "SOX", "score": 0.9},
                {"name": "GDPR", "score": 0.8},
                {"name": "ISO27001", "score": 0.75}
            ]
        })
