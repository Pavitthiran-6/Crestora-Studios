-- =====================================================================
-- SUPABASE STORAGE BUCKETS SECURITY POLICIES
-- Run this script in your Supabase Dashboard -> SQL Editor
-- This ensures only whitelisted admins can upload/delete images.
-- =====================================================================

-- 1. Policies for 'project-images' bucket
DROP POLICY IF EXISTS "Public Read project-images" ON storage.objects;
CREATE POLICY "Public Read project-images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Admin CRUD project-images" ON storage.objects;
CREATE POLICY "Admin CRUD project-images" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'project-images' AND 
    (auth.jwt() ->> 'email') IN ('crestorastudios@gmail.com', 'pavitthiran66@gmail.com')
  ) WITH CHECK (
    bucket_id = 'project-images' AND 
    (auth.jwt() ->> 'email') IN ('crestorastudios@gmail.com', 'pavitthiran66@gmail.com')
  );

-- 2. Policies for 'gallery-images' bucket
DROP POLICY IF EXISTS "Public Read gallery-images" ON storage.objects;
CREATE POLICY "Public Read gallery-images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Admin CRUD gallery-images" ON storage.objects;
CREATE POLICY "Admin CRUD gallery-images" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'gallery-images' AND 
    (auth.jwt() ->> 'email') IN ('crestorastudios@gmail.com', 'pavitthiran66@gmail.com')
  ) WITH CHECK (
    bucket_id = 'gallery-images' AND 
    (auth.jwt() ->> 'email') IN ('crestorastudios@gmail.com', 'pavitthiran66@gmail.com')
  );

-- 3. Policies for 'review-avatars' bucket
DROP POLICY IF EXISTS "Public Read review-avatars" ON storage.objects;
CREATE POLICY "Public Read review-avatars" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'review-avatars');

DROP POLICY IF EXISTS "Admin CRUD review-avatars" ON storage.objects;
CREATE POLICY "Admin CRUD review-avatars" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'review-avatars' AND 
    (auth.jwt() ->> 'email') IN ('crestorastudios@gmail.com', 'pavitthiran66@gmail.com')
  ) WITH CHECK (
    bucket_id = 'review-avatars' AND 
    (auth.jwt() ->> 'email') IN ('crestorastudios@gmail.com', 'pavitthiran66@gmail.com')
  );
