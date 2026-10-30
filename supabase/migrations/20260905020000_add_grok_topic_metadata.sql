-- ==============================================================================
-- FRIDAY AI - GROK TOPIC METADATA MIGRATION
-- Migration: 20260905020000_add_grok_topic_metadata.sql
-- Description: Adds topic_number, subtopics, prerequisites, learning_objectives,
--              and recommended_order to public.topics table.
-- ==============================================================================

ALTER TABLE public.topics
ADD COLUMN IF NOT EXISTS topic_number TEXT,
ADD COLUMN IF NOT EXISTS subtopics TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recommended_order INTEGER DEFAULT 1;

-- Ensure indexes for fast lookup and ordering
CREATE INDEX IF NOT EXISTS idx_topics_unit_order ON public.topics(unit_id, order_number);
CREATE INDEX IF NOT EXISTS idx_units_syllabus_order ON public.units(syllabus_id, order_number);
