/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(25)',
      primaryKey: true,
      unique: true,
      notNull: true,
    },
    title: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(15)',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(20)',
      notNull: true,
    },
    duration: {
      type: 'SMALLINT',
      notNull: false,
    },
    albumId: {
      type: 'VARCHAR(25)',
      notNull: false,
    },
  });

  pgm.addConstraint('songs', 'fk_album', {
    foreignKeys: {
      columns: 'albumId',
      references: 'albums(id)',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_album');

  pgm.dropTable('songs');
};
