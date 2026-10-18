-- Seed data aligned with src/lib/data/songs.ts so static and Supabase modes
-- render the same catalogue (including album artwork).

insert into songs (id, title, artist, album, duration, color, artwork) values
(1, 'Come Together', 'The Beatles', 'Abbey Road', 258, '#1a1a2e', 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/600x600bb.jpg'),
(2, 'Something', 'The Beatles', 'Abbey Road', 182, '#1a1a2e', 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/600x600bb.jpg'),
(3, 'Here Comes the Sun', 'The Beatles', 'Abbey Road', 185, '#1a1a2e', 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/600x600bb.jpg'),
(4, 'Octopus''s Garden', 'The Beatles', 'Abbey Road', 170, '#1a1a2e', 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/600x600bb.jpg'),
(5, 'Dreams', 'Fleetwood Mac', 'Rumours', 254, '#2d4a3e', 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d2/48/f4/d248f4ae-a7e4-a48e-1588-6617de3e8d76/mzi.izeorbmm.jpg/600x600bb.jpg'),
(6, 'Go Your Own Way', 'Fleetwood Mac', 'Rumours', 223, '#2d4a3e', 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/4d/13/ba/4d13bac3-d3d5-7581-2c74-034219eadf2b/081227970949.jpg/600x600bb.jpg'),
(7, 'Don''t Stop', 'Fleetwood Mac', 'Rumours', 193, '#2d4a3e', 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/dd/77/35/dd773533-06a7-4566-bef4-2c43c24d08f6/603497925759.jpg/600x600bb.jpg'),
(8, 'Billie Jean', 'Michael Jackson', 'Thriller', 293, '#3b1f1f', 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg'),
(9, 'Beat It', 'Michael Jackson', 'Thriller', 258, '#3b1f1f', 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg'),
(10, 'Thriller', 'Michael Jackson', 'Thriller', 358, '#3b1f1f', 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg'),
(11, 'Back In Black', 'AC/DC', 'Back In Black', 256, '#1f1f1f', 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/14/58/1e145814-281a-58e0-3ab1-145f5d1af421/886443673441.jpg/600x600bb.jpg'),
(12, 'You Shook Me All Night Long', 'AC/DC', 'Back In Black', 210, '#1f1f1f', 'https://is1-ssl.mzstatic.com/image/thumb/Features114/v4/12/ec/14/12ec1405-f963-4f7c-b107-356fb229f091/dj.sehkbvta.jpg/600x600bb.jpg');

insert into albums (id, title, artist, year, color, artwork) values
('a1', 'Abbey Road', 'The Beatles', 1969, '#1a1a2e', 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/600x600bb.jpg'),
('a2', 'Rumours', 'Fleetwood Mac', 1977, '#2d4a3e', 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/4d/13/ba/4d13bac3-d3d5-7581-2c74-034219eadf2b/081227970949.jpg/600x600bb.jpg'),
('a3', 'Thriller', 'Michael Jackson', 1982, '#3b1f1f', 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg'),
('a4', 'Back In Black', 'AC/DC', 1980, '#1f1f1f', 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/14/58/1e145814-281a-58e0-3ab1-145f5d1af421/886443673441.jpg/600x600bb.jpg');

insert into playlists (id, name, cover, system) values
('p1', 'Liked Songs', '#e50914', true),
('p2', 'Late Night Drives', '#b20710', false),
('p3', 'Workout', '#7f1d1d', false);

insert into playlist_songs (playlist_id, song_id, position) values
('p1', 1, 0),
('p1', 3, 1),
('p1', 5, 2),
('p1', 8, 3),
('p1', 10, 4),
('p2', 2, 0),
('p2', 6, 1),
('p2', 9, 2),
('p3', 4, 0),
('p3', 11, 1),
('p3', 1, 2);
