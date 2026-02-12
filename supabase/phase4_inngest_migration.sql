ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'queued'
  CHECK (status IN ('queued', 'processing', 'completed', 'failed'));

ALTER TABLE documents ADD COLUMN IF NOT EXISTS status_message TEXT DEFAULT NULL;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT DEFAULT NULL;

UPDATE documents SET status = 'completed' WHERE status IS NULL;
UPDATE documents SET status = 'queued', status_message = NULL WHERE status = 'processing';

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents (user_id, status);

ALTER PUBLICATION supabase_realtime ADD TABLE documents;
