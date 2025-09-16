-- Initialize database with required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database user for application (optional)
-- CREATE USER mcp_user WITH PASSWORD 'mcp_password';
-- GRANT ALL PRIVILEGES ON DATABASE mcp TO mcp_user;
