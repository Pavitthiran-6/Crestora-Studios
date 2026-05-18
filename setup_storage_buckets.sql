-- ========================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- Run this query in your Supabase Dashboard -> SQL Editor
-- This will create/update your buckets and lift the file size limits!
-- ========================================================

-- 1. Create the buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('project-images', 'project-images', true),
  ('gallery-images', 'gallery-images', true),
  ('review-avatars', 'review-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Lift the bucket-level file size limits (set to NULL so it uses your plan's max limit)
UPDATE storage.buckets 
SET file_size_limit = NULL 
WHERE id IN ('project-images', 'gallery-images', 'review-avatars');
