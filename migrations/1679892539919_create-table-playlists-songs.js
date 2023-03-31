/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlists_songs', {
    id: {
      type: 'VARCHAR(30)',
      primaryKey: true,
    },
    playlistId: 'VARCHAR(30) NOT NULL',
    songId: 'VARCHAR(25) NOT NULL',
  });

  pgm.addConstraint('playlists_songs', 'fk_playlist', {
    foreignKeys: {
      columns: 'playlistId',
      references: 'playlists(id)',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  });

  pgm.addConstraint('playlists_songs', 'fk_song', {
    foreignKeys: {
      columns: 'songId',
      references: 'songs(id)',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlists_songs', 'fk_playlist');

  pgm.dropConstraint('playlists_songs', 'fk_song');

  pgm.dropTable('playlists_songs');
};
