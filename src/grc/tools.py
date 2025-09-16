from __future__ import annotations

from fastmcp import FastMCP
from .agent import GRCAgent
from .ingest import ingest_grc_document, get_document_compliance_status
from .models import ComplianceFramework


def register_grc_tools(app: FastMCP) -> None:
    """Register GRC-specific MCP tools"""
    
    grc_agent = GRCAgent()
    
    @app.tool()
    def grc_ask(question: str) -> str:
        """
        Ask questions about GRC documents and get AI-powered responses.
        
        Args:
            question: The question to ask about compliance, policies, or procedures
            
        Returns:
            AI-generated response with compliance insights
        """
        result = grc_agent.answer_grc_question(question)
        return result.get("answer", "I couldn't generate a response for your question.")
    
    @app.tool()
    def grc_upload_document(filename: str, content: str, user_id: str = "system") -> dict:
        """
        Upload and classify a GRC document.
        
        Args:
            filename: Name of the document file
            content: Base64 encoded content of the document
            user_id: ID of the user uploading the document
            
        Returns:
            Dictionary with document ID and classification results
        """
        import base64
        try:
            data = base64.b64decode(content)
            grc_doc_id = ingest_grc_document(filename, data, user_id)
            return {
                "grc_document_id": grc_doc_id,
                "status": "success",
                "message": "Document uploaded and classified successfully"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to upload document: {str(e)}"
            }
    
    @app.tool()
    def grc_get_compliance_status(grc_document_id: int) -> dict:
        """
        Get comprehensive compliance status for a document.
        
        Args:
            grc_document_id: ID of the GRC document
            
        Returns:
            Dictionary with compliance status, risks, and audit trail
        """
        return get_document_compliance_status(grc_document_id)
    
    @app.tool()
    def grc_generate_compliance_report(framework: str, document_ids: list = None) -> dict:
        """
        Generate a compliance report for a specific framework.
        
        Args:
            framework: Compliance framework (SOX, GDPR, ISO27001, etc.)
            document_ids: List of document IDs to include in the report
            
        Returns:
            Dictionary with compliance report and analysis
        """
        try:
            framework_enum = ComplianceFramework(framework.upper())
            report = grc_agent.generate_compliance_report(framework_enum, document_ids or [])
            return report
        except ValueError:
            return {
                "error": f"Invalid framework: {framework}. Valid frameworks: {[f.value for f in ComplianceFramework]}"
            }
    
    @app.tool()
    def grc_assess_risk(question: str, context: str = "") -> dict:
        """
        Perform risk assessment for a specific scenario.
        
        Args:
            question: Risk assessment question or scenario
            context: Additional context for the risk assessment
            
        Returns:
            Dictionary with risk assessment results
        """
        return grc_agent.assess_risk_factors(question, context)
    
    @app.tool()
    def grc_list_frameworks() -> list:
        """
        List available compliance frameworks.
        
        Returns:
            List of available compliance frameworks
        """
        return [{"value": f.value, "name": f.value} for f in ComplianceFramework]
    
    @app.tool()
    def grc_classify_document(text: str, filename: str) -> dict:
        """
        Classify a document for GRC purposes.
        
        Args:
            text: Text content of the document
            filename: Name of the document file
            
        Returns:
            Dictionary with document classification results
        """
        from .classifier import GRCDocumentClassifier
        classifier = GRCDocumentClassifier()
        return classifier.classify_document(text, filename)
