-- Migration: 02_tradition_and_bangla.sql
-- Adds wedding_type to sites and Bangla columns to messages

-- 1. Add wedding_type column to sites table
ALTER TABLE sites ADD COLUMN IF NOT EXISTS wedding_type TEXT DEFAULT 'muslim';

-- 2. Add Bangla columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS name_bn TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_bn TEXT;

-- 3. Copy any existing urdu data to bn columns if applicable
UPDATE messages SET name_bn = name_urdu WHERE name_bn IS NULL AND name_urdu IS NOT NULL;
UPDATE messages SET message_bn = message_urdu WHERE message_bn IS NULL AND message_urdu IS NOT NULL;
