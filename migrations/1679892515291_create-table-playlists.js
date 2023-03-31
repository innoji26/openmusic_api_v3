/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(30)',
      notNull: true,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(25)',
      notNull: true,
      references: 'users',
    },
  });

  pgm.addConstraint('playlists', 'fk_user', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlists', 'fk_user');

  pgm.dropTable('playlists');
};
