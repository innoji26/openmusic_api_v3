/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('authentications', {
    refreshToken: {
      type: 'TEXT',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('authentications');
};
