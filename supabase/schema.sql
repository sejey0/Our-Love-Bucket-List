-- Supabase Schema for Anniversary Bucket List
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the buckets table
CREATE TABLE IF NOT EXISTS buckets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Personal',
  target_date DATE,
  status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT DEFAULT 'default',
  sort_order INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  photo_url TEXT
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_buckets_user_id ON buckets(user_id);
CREATE INDEX IF NOT EXISTS idx_buckets_status ON buckets(status);
CREATE INDEX IF NOT EXISTS idx_buckets_category ON buckets(category);
CREATE INDEX IF NOT EXISTS idx_buckets_priority ON buckets(priority);

-- Enable Row Level Security
ALTER TABLE buckets ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (simple auth via app)
-- For production with real auth, restrict by user_id matching auth.uid()
CREATE POLICY "Allow all operations" ON buckets
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_buckets_updated_at
  BEFORE UPDATE ON buckets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create the checklists table (groups of checklist items)
CREATE TABLE IF NOT EXISTS checklists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT DEFAULT 'default'
);

CREATE INDEX IF NOT EXISTS idx_checklists_user_id ON checklists(user_id);

ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on checklists" ON checklists
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create the checklist_items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT DEFAULT 'default'
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_user_id ON checklist_items(user_id);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on checklist_items" ON checklist_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_checklist_items_updated_at
  BEFORE UPDATE ON checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Insert some sample data
INSERT INTO buckets (title, description, category, status, priority, sort_order) VALUES
  ('Watch the sunset together', 'Find a beautiful spot to watch the sunset', 'Romance', 'Not Started', 'High', 0),
  ('Learn to cook a new dish together', 'Try making homemade pasta from scratch', 'Learning', 'Not Started', 'Medium', 1),
  ('Visit a new city', 'Plan a weekend trip to explore somewhere new', 'Travel', 'Not Started', 'High', 2),
  ('Have a picnic in the park', 'Pack our favorite snacks and enjoy nature', 'Adventure', 'Not Started', 'Low', 3),
  ('Write love letters to each other', 'Express our feelings through heartfelt letters', 'Romance', 'Not Started', 'Medium', 4);
