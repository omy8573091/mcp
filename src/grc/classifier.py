from __future__ import annotations

import os
from typing import Dict, List, Tuple
from openai import OpenAI

from .models import ComplianceFramework, DocumentType, RiskLevel
from rag.openai_utils import _client


class GRCDocumentClassifier:
    """AI-powered document classifier for GRC documents"""
    
    def __init__(self):
        self.client = _client()
    
    def classify_document(self, text: str, filename: str) -> Dict:
        """Classify a document for GRC purposes"""
        
        prompt = f"""
        Analyze the following document and classify it for GRC (Governance, Risk, and Compliance) purposes.
        
        Filename: {filename}
        Content: {text[:2000]}...
        
        Please provide a JSON response with the following structure:
        {{
            "document_type": "one of: POLICY, PROCEDURE, CONTROL, RISK_ASSESSMENT, AUDIT_REPORT, COMPLIANCE_REPORT, INCIDENT_REPORT, TRAINING_MATERIAL, CONTRACT, OTHER",
            "compliance_framework": "one of: SOX, GDPR, ISO27001, NIST, COSO, PCI_DSS, HIPAA, SOC2",
            "risk_level": "one of: LOW, MEDIUM, HIGH, CRITICAL",
            "title": "extracted or generated title",
            "description": "brief description of the document",
            "control_id": "relevant control identifier if applicable",
            "key_topics": ["list", "of", "key", "topics"],
            "compliance_keywords": ["list", "of", "compliance", "keywords"],
            "confidence_score": 0.95
        }}
        
        Focus on:
        1. Identifying the primary compliance framework
        2. Determining the document type
        3. Assessing risk level based on content
        4. Extracting relevant control identifiers
        5. Identifying key compliance topics
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            result = response.choices[0].message.content
            if result:
                import json
                classification = json.loads(result)
                
                # Validate and convert enums
                return {
                    "document_type": DocumentType(classification.get("document_type", "OTHER")),
                    "compliance_framework": ComplianceFramework(classification.get("compliance_framework", "SOX")),
                    "risk_level": RiskLevel(classification.get("risk_level", "MEDIUM")),
                    "title": classification.get("title", filename),
                    "description": classification.get("description", ""),
                    "control_id": classification.get("control_id"),
                    "key_topics": classification.get("key_topics", []),
                    "compliance_keywords": classification.get("compliance_keywords", []),
                    "confidence_score": classification.get("confidence_score", 0.5)
                }
        except Exception as e:
            print(f"Classification error: {e}")
        
        # Fallback classification
        return {
            "document_type": DocumentType.OTHER,
            "compliance_framework": ComplianceFramework.SOX,
            "risk_level": RiskLevel.MEDIUM,
            "title": filename,
            "description": "Document classification failed",
            "control_id": None,
            "key_topics": [],
            "compliance_keywords": [],
            "confidence_score": 0.0
        }
    
    def extract_compliance_requirements(self, text: str) -> List[Dict]:
        """Extract specific compliance requirements from document text"""
        
        prompt = f"""
        Extract specific compliance requirements, controls, and obligations from the following document:
        
        {text[:3000]}...
        
        Return a JSON array of requirements with this structure:
        [
            {{
                "requirement_id": "unique identifier",
                "description": "requirement description",
                "framework": "compliance framework",
                "control_reference": "control reference",
                "obligation_type": "MUST, SHOULD, MAY",
                "category": "category of requirement"
            }}
        ]
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            result = response.choices[0].message.content
            if result:
                import json
                data = json.loads(result)
                return data.get("requirements", [])
        except Exception as e:
            print(f"Requirement extraction error: {e}")
        
        return []
    
    def assess_risk_factors(self, text: str) -> Dict:
        """Assess risk factors in the document"""
        
        prompt = f"""
        Analyze the following document for risk factors and provide a risk assessment:
        
        {text[:2000]}...
        
        Return a JSON response with:
        {{
            "overall_risk_score": 0.75,
            "risk_factors": [
                {{
                    "factor": "risk factor description",
                    "severity": "LOW/MEDIUM/HIGH/CRITICAL",
                    "likelihood": "LOW/MEDIUM/HIGH",
                    "impact": "LOW/MEDIUM/HIGH"
                }}
            ],
            "mitigation_suggestions": ["suggestion1", "suggestion2"],
            "compliance_gaps": ["gap1", "gap2"]
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            
            result = response.choices[0].message.content
            if result:
                import json
                return json.loads(result)
        except Exception as e:
            print(f"Risk assessment error: {e}")
        
        return {
            "overall_risk_score": 0.5,
            "risk_factors": [],
            "mitigation_suggestions": [],
            "compliance_gaps": []
        }
