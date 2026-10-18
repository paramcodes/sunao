-- Likes are the source of truth for the system "Liked Songs" playlist
-- (see docs/roadmap-post-mvp.md, phase 9). `liked_at` gives a stable order.
create table liked_songs (
  user_id uuid not null references profiles(id) on delete cascade,
  song_id bigint not null references songs(id) on delete cascade,
  liked_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

alter table liked_songs enable row level security;

create policy "liked_songs_select_own" on liked_songs for select using (auth.uid() = user_id);
create policy "liked_songs_insert_own" on liked_songs for insert with check (auth.uid() = user_id);
create policy "liked_songs_delete_own" on liked_songs for delete using (auth.uid() = user_id);

create index liked_songs_user_liked_at_idx on liked_songs(user_id, liked_at);
