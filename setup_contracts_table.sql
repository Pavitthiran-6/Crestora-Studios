-- SQL script to set up the contracts table and Row Level Security (RLS) in Supabase.
-- Copy and run this script inside your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_reference TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  project_name TEXT NOT NULL,
  budget NUMERIC NOT NULL,
  electronic_signature TEXT NOT NULL,
  contract_status TEXT DEFAULT 'Draft',
  contract_version INT DEFAULT 1,
  accepted_at TIMESTAMPTZ,
  pdf_storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public select by reference" ON contracts;
DROP POLICY IF EXISTS "Allow public insert" ON contracts;
DROP POLICY IF EXISTS "Allow public update before finalization" ON contracts;
DROP POLICY IF EXISTS "Admin All" ON contracts;

-- RLS Policies:
-- 1. Allow public select by reference (so clients with the URL can view their contract)
CREATE POLICY "Allow public select by reference" ON contracts
  FOR SELECT TO public
  USING (true);

-- 2. Allow public insert (so clients can start a new contract form)
CREATE POLICY "Allow public insert" ON contracts
  FOR INSERT TO public
  WITH CHECK (true);

-- 3. Allow public updates before finalization (so clients can edit and sign drafts)
CREATE POLICY "Allow public update before finalization" ON contracts
  FOR UPDATE TO public
  USING (contract_status != 'Finalized')
  WITH CHECK (contract_status != 'Finalized');

-- 4. Admins can manage all contracts (read, edit, delete, insert)
CREATE POLICY "Admin All" ON contracts
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('crestorastudios@gmail.com', 'pavitthiran66@gmail.com')
  );
