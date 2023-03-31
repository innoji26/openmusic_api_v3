const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this._pool.query(query);
  }

  async verifyRefreshToken(refreshToken) {
    const query = {
      text: 'SELECT * FROM authentications WHERE "refreshToken" = $1',
      values: [refreshToken],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Refresh Token tidak ditemukan');
    }
  }

  async deleteRefreshToken(refreshToken) {
    const query = {
      text: 'DELETE FROM authentications WHERE "refreshToken" = $1 RETURNING "refreshToken"',
      values: [refreshToken],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError(
        'Gagal menghapus token. Refresh Token tidak ditemukan'
      );
    }
  }
}

module.exports = AuthenticationsService;
