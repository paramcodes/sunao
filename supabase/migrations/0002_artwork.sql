-- Add optional artwork URLs so Supabase-backed mode can render album art
-- (matching the static dataset in src/lib/data/songs.ts).
alter table songs add column if not exists artwork text;
alter table albums add column if not exists artwork text;
