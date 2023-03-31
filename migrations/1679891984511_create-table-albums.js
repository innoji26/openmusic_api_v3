/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(25)',
      primaryKey: true,
      unique: true,
      notNull: true,
    },
    name: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums');
};
