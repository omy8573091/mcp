# GRC Document Management System - Setup Guide

## Overview
This is a comprehensive GRC (Governance, Risk, and Compliance) document management system built with:
- **Backend**: FastAPI + FastMCP (Model Context Protocol)
- **Frontend**: Next.js + Material-UI + Kendo UI
- **Database**: PostgreSQL with pgvector for embeddings
- **AI**: OpenAI GPT-4 for document analysis and responses
- **Queue**: Redis + RQ for background processing

## Prerequisites

### Required Software
- Docker and Docker Compose
- Python 3.9+ (for local development)
- Node.js 18+ (for frontend development)
- OpenAI API key

### System Requirements
- 8GB RAM minimum (16GB recommended)
- 20GB free disk space
- Internet connection for OpenAI API

## Quick Start with Docker

### 1. Clone and Setup
```bash
git clone <repository-url>
cd mcp
cp env.example .env
```

### 2. Configure Environment
Edit `.env` file and add your OpenAI API key:
```bash
OPENAI_API_KEY=openai_api_key
```

### 3. Start Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379
- MCP Server on port 8000
- Frontend on port 3000
- RQ Worker for background processing

### 4. Initialize Database
```bash
# Run database migrations
docker-compose exec mcp-server alembic upgrade head
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/healthz

## Local Development Setup

### Backend Setup
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e .

# Start PostgreSQL and Redis (using Docker)
docker-compose up -d postgres redis

# Set environment variables
export OPENAI_API_KEY=openai_api_key
export DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/mcp

# Run database migrations
alembic upgrade head

# Start the server
mcp-server-sse
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Features

### 1. Document Management
- **Upload**: PDF, DOCX, TXT, CSV, Excel files
- **Auto-classification**: AI-powered document categorization
- **Version Control**: Track document changes and approvals
- **Metadata Extraction**: Extract compliance information

### 2. GRC Compliance Engine
- **Framework Support**: SOX, GDPR, ISO 27001, NIST, COSO, PCI DSS, HIPAA, SOC2
- **Control Mapping**: Link documents to specific controls
- **Gap Analysis**: Identify compliance gaps
- **Remediation Tracking**: Monitor compliance actions

### 3. AI-Powered Analysis
- **Document Classification**: Automatic categorization by type and framework
- **Risk Assessment**: AI-driven risk scoring and analysis
- **Compliance Checking**: Automated compliance validation
- **Natural Language Queries**: Ask questions about documents
- **Fine-tuned Responses**: GRC-specific AI responses

### 4. User Interface
- **Dashboard**: Real-time compliance metrics and KPIs
- **Document Browser**: Advanced search and filtering with Kendo Grid
- **Upload Interface**: Drag-and-drop file upload with progress tracking
- **AI Chat**: Interactive document querying
- **Risk Matrix**: Visual risk assessment tools
- **Compliance Reports**: Comprehensive reporting

## API Endpoints

### Document Management
- `POST /grc/upload` - Upload and classify documents
- `GET /api/documents` - List documents
- `GET /api/documents/{id}` - Get document details
- `PUT /grc/documents/{id}/classify` - Update classification

### GRC Operations
- `POST /grc/query` - AI-powered document queries
- `GET /grc/frameworks` - List compliance frameworks
- `POST /grc/reports/compliance` - Generate compliance reports
- `POST /grc/risk/assess` - Risk assessment

### MCP Tools
- `grc_ask(question)` - Ask questions about documents
- `grc_upload_document(filename, content)` - Upload documents
- `grc_generate_compliance_report(framework)` - Generate reports
- `grc_assess_risk(question, context)` - Risk assessment

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: openai_api_key
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `CORS_ORIGINS`: Allowed CORS origins
- `AUTH_TOKEN`: API authentication token

### GRC Settings
- `RAG_ASYNC_INGEST`: Enable background processing
- `RAG_BM25`: Enable BM25 text search
- `RAG_EMBED_CACHE`: Cache embeddings for performance

## Usage Examples

### 1. Upload Documents
```bash
# Using curl
curl -X POST http://localhost:8000/grc/upload \
  -F "files=@policy.pdf" \
  -F "files=@procedure.docx" \
  -F "user_id=admin"
```

### 2. Query Documents
```bash
curl -X POST http://localhost:8000/grc/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What are our data protection policies?"}'
```

### 3. Generate Compliance Report
```bash
curl -X POST http://localhost:8000/grc/reports/compliance \
  -H "Content-Type: application/json" \
  -d '{"framework": "GDPR", "document_ids": [1, 2, 3]}'
```

### 4. Using MCP Tools
```python
# In your MCP client
result = client.call_tool("grc_ask", {
    "question": "What are the key controls for data privacy?"
})
```

## Monitoring and Logging

### Health Checks
- Server health: `GET /healthz`
- Database connectivity: `GET /readyz`
- Metrics: `GET /metrics`

### Logging
- Structured JSON logging with `structlog`
- Request/response logging
- Error tracking and monitoring

### Metrics
- Prometheus metrics for monitoring
- Request latency and throughput
- Document processing statistics

## Security Features

- **JWT Authentication**: Secure API access
- **Role-based Access Control**: Granular permissions
- **Data Encryption**: At rest and in transit
- **Audit Logging**: Complete activity tracking
- **CORS Configuration**: Secure cross-origin requests
- **Rate Limiting**: Prevent abuse

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres
   
   # Check database logs
   docker-compose logs postgres
   ```

2. **OpenAI API Errors**
   ```bash
   # Verify API key is set
   echo $OPENAI_API_KEY
   
   # Check API quota and billing
   ```

3. **Frontend Build Issues**
   ```bash
   # Clear node modules and reinstall
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Memory Issues**
   ```bash
   # Increase Docker memory limits
   # Check system resources
   docker stats
   ```

### Performance Optimization

1. **Enable Embedding Cache**
   ```bash
   RAG_EMBED_CACHE=1
   ```

2. **Use Async Processing**
   ```bash
   RAG_ASYNC_INGEST=1
   ```

3. **Optimize Database**
   ```sql
   -- Create indexes for better performance
   CREATE INDEX idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops);
   ```

## Support

For issues and questions:
1. Check the logs: `docker-compose logs`
2. Review the API documentation: http://localhost:8000/docs
3. Check the health endpoints: http://localhost:8000/healthz

## License

MIT License - see LICENSE file for details.
