from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def upgrade():
    """Create GRC-specific tables"""
    
    # Create GRC documents table
    op.create_table('grc_documents',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('document_id', sa.Integer(), nullable=False),
        sa.Column('document_type', sa.Enum('POLICY', 'PROCEDURE', 'CONTROL', 'RISK_ASSESSMENT', 'AUDIT_REPORT', 'COMPLIANCE_REPORT', 'INCIDENT_REPORT', 'TRAINING_MATERIAL', 'CONTRACT', 'OTHER', name='documenttype'), nullable=False),
        sa.Column('compliance_framework', sa.Enum('SOX', 'GDPR', 'ISO27001', 'NIST', 'COSO', 'PCI_DSS', 'HIPAA', 'SOC2', name='complianceframework'), nullable=False),
        sa.Column('control_id', sa.String(length=100), nullable=True),
        sa.Column('risk_level', sa.Enum('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='risklevel'), nullable=False),
        sa.Column('status', sa.Enum('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ARCHIVED', 'SUPERSEDED', name='documentstatus'), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('version', sa.String(length=20), nullable=False),
        sa.Column('effective_date', sa.DateTime(), nullable=True),
        sa.Column('review_date', sa.DateTime(), nullable=True),
        sa.Column('ai_summary', sa.Text(), nullable=True),
        sa.Column('compliance_score', sa.Float(), nullable=True),
        sa.Column('risk_score', sa.Float(), nullable=True),
        sa.Column('created_by', sa.String(length=100), nullable=False),
        sa.Column('approved_by', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create document audit logs table
    op.create_table('document_audit_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('grc_document_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('user_id', sa.String(length=100), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.ForeignKeyConstraint(['grc_document_id'], ['grc_documents.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create compliance controls table
    op.create_table('compliance_controls',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('framework', sa.Enum('SOX', 'GDPR', 'ISO27001', 'NIST', 'COSO', 'PCI_DSS', 'HIPAA', 'SOC2', name='complianceframework'), nullable=False),
        sa.Column('control_id', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=200), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create risk assessments table
    op.create_table('risk_assessments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('grc_document_id', sa.Integer(), nullable=False),
        sa.Column('risk_category', sa.String(length=200), nullable=False),
        sa.Column('risk_description', sa.Text(), nullable=False),
        sa.Column('likelihood', sa.Integer(), nullable=False),
        sa.Column('impact', sa.Integer(), nullable=False),
        sa.Column('risk_score', sa.Float(), nullable=False),
        sa.Column('mitigation_strategy', sa.Text(), nullable=True),
        sa.Column('residual_risk', sa.Float(), nullable=True),
        sa.Column('assessed_by', sa.String(length=100), nullable=False),
        sa.Column('assessed_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['grc_document_id'], ['grc_documents.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_grc_documents_document_id'), 'grc_documents', ['document_id'], unique=False)
    op.create_index(op.f('ix_grc_documents_compliance_framework'), 'grc_documents', ['compliance_framework'], unique=False)
    op.create_index(op.f('ix_grc_documents_document_type'), 'grc_documents', ['document_type'], unique=False)
    op.create_index(op.f('ix_grc_documents_risk_level'), 'grc_documents', ['risk_level'], unique=False)
    op.create_index(op.f('ix_grc_documents_status'), 'grc_documents', ['status'], unique=False)
    op.create_index(op.f('ix_document_audit_logs_grc_document_id'), 'document_audit_logs', ['grc_document_id'], unique=False)
    op.create_index(op.f('ix_document_audit_logs_timestamp'), 'document_audit_logs', ['timestamp'], unique=False)
    op.create_index(op.f('ix_compliance_controls_framework'), 'compliance_controls', ['framework'], unique=False)
    op.create_index(op.f('ix_compliance_controls_control_id'), 'compliance_controls', ['control_id'], unique=False)
    op.create_index(op.f('ix_risk_assessments_grc_document_id'), 'risk_assessments', ['grc_document_id'], unique=False)


def downgrade():
    """Drop GRC-specific tables"""
    op.drop_index(op.f('ix_risk_assessments_grc_document_id'), table_name='risk_assessments')
    op.drop_index(op.f('ix_compliance_controls_control_id'), table_name='compliance_controls')
    op.drop_index(op.f('ix_compliance_controls_framework'), table_name='compliance_controls')
    op.drop_index(op.f('ix_document_audit_logs_timestamp'), table_name='document_audit_logs')
    op.drop_index(op.f('ix_document_audit_logs_grc_document_id'), table_name='document_audit_logs')
    op.drop_index(op.f('ix_grc_documents_status'), table_name='grc_documents')
    op.drop_index(op.f('ix_grc_documents_risk_level'), table_name='grc_documents')
    op.drop_index(op.f('ix_grc_documents_document_type'), table_name='grc_documents')
    op.drop_index(op.f('ix_grc_documents_compliance_framework'), table_name='grc_documents')
    op.drop_index(op.f('ix_grc_documents_document_id'), table_name='grc_documents')
    
    op.drop_table('risk_assessments')
    op.drop_table('compliance_controls')
    op.drop_table('document_audit_logs')
    op.drop_table('grc_documents')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS documentstatus')
    op.execute('DROP TYPE IF EXISTS risklevel')
    op.execute('DROP TYPE IF EXISTS documenttype')
    op.execute('DROP TYPE IF EXISTS complianceframework')
