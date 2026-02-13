CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS page_number INTEGER DEFAULT 1;

ALTER TABLE document_chunks
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_chunks_fts ON document_chunks USING GIN (fts);

CREATE INDEX IF NOT EXISTS idx_chunks_trgm ON document_chunks USING GIN (content gin_trgm_ops);

CREATE OR REPLACE FUNCTION hybrid_search_chunks(
  query_text TEXT,
  target_doc_id UUID,
  target_user_id TEXT,
  match_count INT DEFAULT 10,
  bm25_weight FLOAT DEFAULT 1.0,
  trigram_weight FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  chunk_index INT,
  page_number INT,
  bm25_score FLOAT,
  trigram_score FLOAT,
  combined_score FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  k CONSTANT INT := 60;
BEGIN
  RETURN QUERY
  WITH bm25_results AS (
    SELECT
      dc.id,
      dc.content,
      dc.chunk_index,
      dc.page_number,
      ts_rank_cd(dc.fts, plainto_tsquery('english', query_text))::FLOAT AS score,
      ROW_NUMBER() OVER (ORDER BY ts_rank_cd(dc.fts, plainto_tsquery('english', query_text)) DESC) AS rank
    FROM document_chunks dc
    WHERE dc.document_id = target_doc_id
      AND dc.user_id = target_user_id
      AND dc.fts @@ plainto_tsquery('english', query_text)
    LIMIT match_count * 3
  ),
  trgm_results AS (
    SELECT
      dc.id,
      dc.content,
      dc.chunk_index,
      dc.page_number,
      similarity(dc.content, query_text)::FLOAT AS score,
      ROW_NUMBER() OVER (ORDER BY similarity(dc.content, query_text) DESC) AS rank
    FROM document_chunks dc
    WHERE dc.document_id = target_doc_id
      AND dc.user_id = target_user_id
      AND dc.content % query_text
    LIMIT match_count * 3
  ),
  all_chunks AS (
    SELECT dc.id, dc.content, dc.chunk_index, dc.page_number
    FROM document_chunks dc
    WHERE dc.document_id = target_doc_id
      AND dc.user_id = target_user_id
  ),
  rrf_scores AS (
    SELECT
      ac.id,
      ac.content,
      ac.chunk_index,
      ac.page_number,
      COALESCE(br.score, 0.0) AS bm25_s,
      COALESCE(tr.score, 0.0) AS trigram_s,
      (
        bm25_weight * COALESCE(1.0 / (k + br.rank), 0.0)
        + trigram_weight * COALESCE(1.0 / (k + tr.rank), 0.0)
      ) AS rrf
    FROM all_chunks ac
    LEFT JOIN bm25_results br ON ac.id = br.id
    LEFT JOIN trgm_results tr ON ac.id = tr.id
    WHERE br.id IS NOT NULL OR tr.id IS NOT NULL
  )
  SELECT
    rs.id,
    rs.content,
    rs.chunk_index,
    rs.page_number,
    rs.bm25_s,
    rs.trigram_s,
    rs.rrf
  FROM rrf_scores rs
  ORDER BY rs.rrf DESC
  LIMIT match_count;
END;
$$;
