insert into songs (id, title, artist, album, duration, color) values
(1, 'Crimson Tide', 'The Hollows', 'Afterglow', 214, '#8b1a1a'),
(2, 'Red Sky at Night', 'Maren Voss', 'Horizon', 187, '#a32020'),
(3, 'Ember', 'Lowlight', 'Ash & Air', 243, '#c0392b'),
(4, 'Blood Moon', 'The Hollows', 'Afterglow', 198, '#7f1d1d'),
(5, 'Scarlet Letter', 'June Park', 'Margins', 221, '#991b1b'),
(6, 'Rust & Gold', 'Lowlight', 'Ash & Air', 176, '#b91c1c'),
(7, 'Vermilion', 'Maren Voss', 'Horizon', 205, '#dc2626'),
(8, 'Heartbeat', 'June Park', 'Margins', 169, '#ef4444'),
(9, 'After the Fire', 'The Hollows', 'Afterglow', 232, '#f87171'),
(10, 'Quiet Riot', 'Lowlight', 'Ash & Air', 191, '#fecaca');

insert into albums (id, title, artist, year, color) values
('a1', 'Afterglow', 'The Hollows', 2024, '#8b1a1a'),
('a2', 'Horizon', 'Maren Voss', 2025, '#a32020'),
('a3', 'Ash & Air', 'Lowlight', 2023, '#c0392b'),
('a4', 'Margins', 'June Park', 2025, '#991b1b');

insert into playlists (id, name, cover, system) values
('p1', 'Liked Songs', '#e50914', true),
('p2', 'Late Night Drives', '#b20710', false),
('p3', 'Workout', '#7f1d1d', false);

insert into playlist_songs (playlist_id, song_id, position) values
('p1', 1, 0),
('p1', 3, 1),
('p1', 5, 2),
('p1', 7, 3),
('p1', 9, 4),
('p2', 2, 0),
('p2', 6, 1),
('p2', 8, 2),
('p3', 4, 0),
('p3', 10, 1),
('p3', 1, 2);