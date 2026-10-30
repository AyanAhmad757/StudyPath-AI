-- ==============================================================================
-- FRIDAY AI - ADD EXTRACTION METADATA TO SYLLABI
-- Migration: 20260905010000_add_extraction_metadata_to_syllabi.sql
-- Description: Adds extraction metadata columns (file_type, page_count,
--              word_count, character_count, extraction_status) to public.syllabi.
-- ==============================================================================

ALTER TABLE public.syllabi 
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS character_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS extraction_status TEXT DEFAULT 'extracted';

-- Index for searching raw text
CREATE INDEX IF NOT EXISTS idx_syllabi_status ON public.syllabi(status);
CREATE INDEX IF NOT EXISTS idx_syllabi_extraction_status ON public.syllabi(extraction_status);
