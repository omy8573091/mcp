from __future__ import annotations

from typing import Dict, List, Optional
from openai import OpenAI

from rag.retriever import retrieve_similar
from rag.openai_utils import _client
from .models import ComplianceFramework, DocumentType, RiskLevel


class GRCAgent:
    """Specialized AI agent for GRC document management and compliance queries"""
    
    def __init__(self):
        self.client = _client()
    
    def answer_grc_question(self, question: str, context_documents: Optional[List[int]] = None) -> Dict:
        """Answer GRC-specific questions with enhanced context"""
        
        # Retrieve relevant document chunks
        contexts = retrieve_similar(question, top_k=8)
        context_text = "\n\n".join(t for t, _, _ in contexts)
        
        # Enhanced GRC-specific prompt
        prompt = f"""
        You are a specialized GRC (Governance, Risk, and Compliance) expert assistant. 
        Your role is to provide accurate, actionable compliance guidance based on the provided document context.
        
        CONTEXT DOCUMENTS:
        {context_text}
        
        USER QUESTION: {question}
        
        INSTRUCTIONS:
        1. Provide a comprehensive, accurate answer based on the document context
        2. Include specific compliance framework references (SOX, GDPR, ISO 27001, etc.)
        3. Identify relevant controls, policies, or procedures
        4. Highlight any compliance risks or gaps
        5. Provide actionable recommendations
        6. Include relevant citations from the source documents
        
        RESPONSE FORMAT:
        **Answer:**
        [Your comprehensive answer here]
        
        **Compliance Framework:** [Relevant framework(s)]
        
        **Key Controls/Requirements:**
        - [Control 1]
        - [Control 2]
        
        **Risk Assessment:**
        - [Risk factors identified]
        
        **Recommendations:**
        - [Actionable recommendation 1]
        - [Actionable recommendation 2]
        
        **References:**
        - [Document/chunk references]
        
        **Follow-up Questions:**
        - [Suggested follow-up question 1]
        - [Suggested follow-up question 2]
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=2000
            )
            
            answer = response.choices[0].message.content or ""
            
            # Extract citations
            citations = []
            for _, score, meta in contexts:
                citations.append({
                    "chunk_id": meta.get("chunk_id"),
                    "score": score,
                    "document_id": meta.get("document_id")
                })
            
            return {
                "answer": answer,
                "citations": citations,
                "question_type": self._classify_question_type(question),
                "compliance_frameworks": self._extract_frameworks(answer),
                "risk_level": self._assess_risk_level(answer)
            }
            
        except Exception as e:
            return {
                "answer": f"I apologize, but I encountered an error processing your GRC question: {str(e)}",
                "citations": [],
                "question_type": "ERROR",
                "compliance_frameworks": [],
                "risk_level": "UNKNOWN"
            }
    
    def generate_compliance_report(self, framework: ComplianceFramework, document_ids: List[int]) -> Dict:
        """Generate a comprehensive compliance report for a specific framework"""
        
        # Get document context for the specified documents
        context_prompt = f"""
        Generate a comprehensive compliance report for {framework.value} framework.
        
        Analyze the following aspects:
        1. Control coverage and implementation status
        2. Identified gaps and deficiencies
        3. Risk assessment and mitigation strategies
        4. Recommendations for improvement
        5. Compliance score and maturity level
        
        Provide specific, actionable insights based on the document analysis.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": context_prompt}],
                temperature=0.1,
                max_tokens=3000
            )
            
            report = response.choices[0].message.content or ""
            
            return {
                "framework": framework.value,
                "report": report,
                "compliance_score": self._calculate_compliance_score(report),
                "maturity_level": self._assess_maturity_level(report),
                "key_findings": self._extract_key_findings(report),
                "recommendations": self._extract_recommendations(report)
            }
            
        except Exception as e:
            return {
                "framework": framework.value,
                "report": f"Error generating compliance report: {str(e)}",
                "compliance_score": 0.0,
                "maturity_level": "UNKNOWN",
                "key_findings": [],
                "recommendations": []
            }
    
    def assess_risk_factors(self, question: str, context: str) -> Dict:
        """Assess risk factors in a specific context"""
        
        prompt = f"""
        As a GRC risk assessment expert, analyze the following context for risk factors:
        
        CONTEXT: {context}
        
        QUESTION/SCENARIO: {question}
        
        Provide a detailed risk assessment including:
        1. Identified risk factors
        2. Risk likelihood and impact assessment
        3. Risk scoring (1-5 scale)
        4. Mitigation strategies
        5. Residual risk assessment
        6. Monitoring recommendations
        
        Format as a structured risk assessment report.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=2000
            )
            
            assessment = response.choices[0].message.content or ""
            
            return {
                "assessment": assessment,
                "risk_score": self._extract_risk_score(assessment),
                "risk_factors": self._extract_risk_factors(assessment),
                "mitigation_strategies": self._extract_mitigation_strategies(assessment)
            }
            
        except Exception as e:
            return {
                "assessment": f"Error in risk assessment: {str(e)}",
                "risk_score": 0.0,
                "risk_factors": [],
                "mitigation_strategies": []
            }
    
    def _classify_question_type(self, question: str) -> str:
        """Classify the type of GRC question"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ["policy", "procedure", "process"]):
            return "POLICY_QUERY"
        elif any(word in question_lower for word in ["risk", "threat", "vulnerability"]):
            return "RISK_ASSESSMENT"
        elif any(word in question_lower for word in ["compliance", "audit", "control"]):
            return "COMPLIANCE_QUERY"
        elif any(word in question_lower for word in ["incident", "breach", "violation"]):
            return "INCIDENT_RESPONSE"
        else:
            return "GENERAL_GRC"
    
    def _extract_frameworks(self, text: str) -> List[str]:
        """Extract mentioned compliance frameworks from text"""
        frameworks = []
        text_upper = text.upper()
        
        for framework in ComplianceFramework:
            if framework.value in text_upper:
                frameworks.append(framework.value)
        
        return frameworks
    
    def _assess_risk_level(self, text: str) -> str:
        """Assess risk level from text content"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["critical", "severe", "high risk", "urgent"]):
            return "HIGH"
        elif any(word in text_lower for word in ["medium", "moderate", "acceptable"]):
            return "MEDIUM"
        elif any(word in text_lower for word in ["low", "minimal", "acceptable"]):
            return "LOW"
        else:
            return "UNKNOWN"
    
    def _calculate_compliance_score(self, report: str) -> float:
        """Calculate compliance score from report text"""
        # Simple heuristic - could be enhanced with more sophisticated analysis
        positive_indicators = ["compliant", "implemented", "effective", "adequate", "meets requirements"]
        negative_indicators = ["non-compliant", "deficient", "gap", "missing", "inadequate"]
        
        text_lower = report.lower()
        positive_count = sum(1 for indicator in positive_indicators if indicator in text_lower)
        negative_count = sum(1 for indicator in negative_indicators if indicator in text_lower)
        
        if positive_count + negative_count == 0:
            return 0.5
        
        return positive_count / (positive_count + negative_count)
    
    def _assess_maturity_level(self, report: str) -> str:
        """Assess maturity level from report"""
        text_lower = report.lower()
        
        if any(word in text_lower for word in ["mature", "advanced", "optimized", "excellent"]):
            return "ADVANCED"
        elif any(word in text_lower for word in ["developing", "basic", "initial", "improving"]):
            return "DEVELOPING"
        elif any(word in text_lower for word in ["ad-hoc", "reactive", "inconsistent"]):
            return "BASIC"
        else:
            return "UNKNOWN"
    
    def _extract_key_findings(self, report: str) -> List[str]:
        """Extract key findings from report"""
        # Simple extraction - could be enhanced with NLP
        lines = report.split('\n')
        findings = []
        
        for line in lines:
            if any(keyword in line.lower() for keyword in ["finding", "issue", "gap", "deficiency", "strength"]):
                findings.append(line.strip())
        
        return findings[:5]  # Limit to top 5 findings
    
    def _extract_recommendations(self, report: str) -> List[str]:
        """Extract recommendations from report"""
        lines = report.split('\n')
        recommendations = []
        
        for line in lines:
            if any(keyword in line.lower() for keyword in ["recommend", "suggest", "should", "must", "action"]):
                recommendations.append(line.strip())
        
        return recommendations[:5]  # Limit to top 5 recommendations
    
    def _extract_risk_score(self, assessment: str) -> float:
        """Extract risk score from assessment text"""
        import re
        
        # Look for numeric risk scores
        score_patterns = [
            r'risk score[:\s]*(\d+(?:\.\d+)?)',
            r'score[:\s]*(\d+(?:\.\d+)?)/5',
            r'(\d+(?:\.\d+)?)/5'
        ]
        
        for pattern in score_patterns:
            match = re.search(pattern, assessment, re.IGNORECASE)
            if match:
                return float(match.group(1))
        
        return 0.0
    
    def _extract_risk_factors(self, assessment: str) -> List[str]:
        """Extract risk factors from assessment"""
        lines = assessment.split('\n')
        factors = []
        
        for line in lines:
            if any(keyword in line.lower() for keyword in ["risk", "threat", "vulnerability", "exposure"]):
                factors.append(line.strip())
        
        return factors[:10]  # Limit to top 10 factors
    
    def _extract_mitigation_strategies(self, assessment: str) -> List[str]:
        """Extract mitigation strategies from assessment"""
        lines = assessment.split('\n')
        strategies = []
        
        for line in lines:
            if any(keyword in line.lower() for keyword in ["mitigate", "control", "prevent", "reduce", "address"]):
                strategies.append(line.strip())
        
        return strategies[:5]  # Limit to top 5 strategies
