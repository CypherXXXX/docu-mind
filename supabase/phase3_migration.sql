-- ==========================================================================
-- DocuMind Phase 3: Feature Expansion — Supabase SQL Migration
-- Run this in your Supabase SQL Editor
-- ==========================================================================

-- 1. Add new columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS project_id TEXT DEFAULT NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_archived ON documents (user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_documents_starred ON documents (user_id, is_starred);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents (user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_documents_last_opened ON documents (user_id, last_opened_at);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects (user_id);

-- 4. RLS policies for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own projects"
    ON projects FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own projects"
    ON projects FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
