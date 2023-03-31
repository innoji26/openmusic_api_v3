const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(validator, playlistsservice, songsservice) {
    this._validator = validator;
    this._playlistsservice = playlistsservice;
    this._songsservice = songsservice;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { userId: owner } = request.auth.credentials;
    const playlistId = await this._playlistsservice.addPlaylist(name, owner);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const owner = request.auth.credentials.userId;
    const playlists = await this._playlistsservice.getPlaylists(owner);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const owner = request.auth.credentials.userId;

    await this._playlistsservice.verifyPlaylistOwnership(id, owner);
    await this._playlistsservice.deletePlaylistById(id);

    const response = h.response({
      status: 'success',
      message: 'playlist berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async postSongIntoPlaylistByPlaylistIdHandler(request, h) {
    this._validator.validateSongIdPayload(request.payload);
    const { songId: songId } = request.payload;
    const { id: playlistId } = request.params;
    const owner = request.auth.credentials.userId;

    await this._songsservice.verifySongId(songId);
    await this._playlistsservice.verifyPlaylistAccess(playlistId, owner);
    await this._playlistsservice.addSongIntoPlaylist(playlistId, songId);

    const data = { playlistId, owner, songId };
    await this._playlistsservice.addDataActivities(data, 'add');

    const response = h.response({
      status: 'success',
      message: 'lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsInsidePlaylistByPlaylistIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const owner = request.auth.credentials.userId;

    await this._playlistsservice.verifyPlaylistAccess(playlistId, owner);

    const playlist = await this._playlistsservice.getSongsInsidePlaylist(
      playlistId
    );

    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
    response.code(200);
    return response;
  }

  async deleteSongInsidePlaylistByPlaylistIdHandler(request, h) {
    this._validator.validateSongIdPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const owner = request.auth.credentials.userId;

    await this._songsservice.verifySongId(songId);
    await this._playlistsservice.verifyPlaylistAccess(playlistId, owner);
    await this._playlistsservice.deleteSongFromPlaylist(playlistId, songId);

    const data = { playlistId, owner, songId };
    await this._playlistsservice.addDataActivities(data, 'delete');

    const response = h.response({
      status: 'success',
      message: 'lagu berhasil di hapus dari playlist',
    });
    response.code(200);
    return response;
  }

  async getPlaylistActivitiesByPlaylistIdHandler(request, h) {
    // try {
    const userId = request.auth.credentials.userId;
    const { id: playlistId } = request.params;

    await this._playlistsservice.verifyPlaylistAccess(playlistId, userId);

    const data = await this._playlistsservice.getPlaylistActivities(playlistId);

    const response = h.response({
      status: 'success',
      data: data,
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;
