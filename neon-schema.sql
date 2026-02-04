-- ============================================
-- AutoCoder Database Schema for Neon DB
-- ============================================
-- Compatible with PostgreSQL / Neon Serverless
-- Run this SQL in your Neon console or via psql
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Conversations table for chat sessions
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- Project context for persistent memory
  project_name TEXT,
  project_description TEXT,
  tech_stack TEXT[],
  features_built TEXT[],
  project_summary TEXT,
  last_code_generated TEXT,
  -- Enhanced features
  project_type TEXT,
  complexity TEXT,
  design_style TEXT,
  color_preferences TEXT[],
  plan_generated BOOLEAN DEFAULT FALSE,
  security_score INTEGER,
  tests_passed INTEGER,
  tests_failed INTEGER
);

-- Messages table for chat content
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Project files table for generated code
CREATE TABLE IF NOT EXISTS project_files (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- INTELLIGENCE TABLES
-- ============================================

-- Project plans for architecture documentation
CREATE TABLE IF NOT EXISTS project_plans (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  tech_stack JSONB,
  architecture TEXT,
  folder_structure TEXT,
  design_decisions JSONB,
  security_considerations TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Intel records for user preferences and learnings
CREATE TABLE IF NOT EXISTS intel_records (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence INTEGER DEFAULT 100,
  source TEXT DEFAULT 'inferred',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Test results for tracking test outcomes
CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  target_file TEXT NOT NULL,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  coverage INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Security scans for vulnerability assessments
CREATE TABLE IF NOT EXISTS security_scans (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  issues JSONB,
  passed_checks TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Generation logs for transparency
CREATE TABLE IF NOT EXISTS generation_logs (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_file TEXT NOT NULL,
  description TEXT NOT NULL,
  lines_changed INTEGER DEFAULT 0,
  reasoning TEXT,
  assumptions TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- VAPT DASHBOARD TABLES
-- ============================================

-- VAPT Assets
CREATE TABLE IF NOT EXISTS vapt_assets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  criticality TEXT NOT NULL,
  tags TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- VAPT Vulnerabilities
CREATE TABLE IF NOT EXISTS vapt_vulnerabilities (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES vapt_assets(id) ON DELETE CASCADE,
  cve_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  cvss_score TEXT,
  component TEXT,
  owasp_category TEXT,
  status TEXT DEFAULT 'open',
  assigned_to TEXT,
  deadline TIMESTAMP,
  remediation TEXT,
  evidence TEXT,
  scan_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP
);

-- VAPT Scans
CREATE TABLE IF NOT EXISTS vapt_scans (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES vapt_assets(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  findings_count INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- VAPT Schedules
CREATE TABLE IF NOT EXISTS vapt_schedules (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES vapt_assets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  scan_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- VAPT Audit Logs
CREATE TABLE IF NOT EXISTS vapt_audit_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- VAPT Team Members
CREATE TABLE IF NOT EXISTS vapt_team_members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_project_files_conversation_id ON project_files(conversation_id);
CREATE INDEX IF NOT EXISTS idx_project_plans_conversation_id ON project_plans(conversation_id);
CREATE INDEX IF NOT EXISTS idx_intel_records_conversation_id ON intel_records(conversation_id);
CREATE INDEX IF NOT EXISTS idx_intel_records_type ON intel_records(type);
CREATE INDEX IF NOT EXISTS idx_test_results_conversation_id ON test_results(conversation_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_conversation_id ON security_scans(conversation_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_conversation_id ON generation_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_vapt_vulnerabilities_asset_id ON vapt_vulnerabilities(asset_id);
CREATE INDEX IF NOT EXISTS idx_vapt_vulnerabilities_severity ON vapt_vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vapt_vulnerabilities_status ON vapt_vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_vapt_scans_asset_id ON vapt_scans(asset_id);
CREATE INDEX IF NOT EXISTS idx_vapt_scans_status ON vapt_scans(status);
CREATE INDEX IF NOT EXISTS idx_vapt_audit_logs_action ON vapt_audit_logs(action);

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================
-- 
-- 1. Create a Neon project at https://neon.tech
-- 2. Copy your connection string (DATABASE_URL)
-- 3. Run this schema in the Neon SQL Editor or via:
--    psql $DATABASE_URL -f neon-schema.sql
-- 
-- 4. Update your .env with:
--    DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
--
-- 5. The Drizzle ORM schema in shared/schema.ts matches this SQL
-- ============================================
