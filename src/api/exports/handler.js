const autoBind = require('auto-bind');
const playlists = require('../playlists');

class ExportsHandler {
    constructor(service, validator, playlistsservice) {
        this._service = service;
        this._validator = validator;
        this._playlistsservice = playlistsservice;

        autoBind(this);
    }

    async postExportPlaylistsHandler(request, h) {
        this._validator.validateExportPlaylistsPayload(request.payload);

        const { playlistId } = request.params;
        const owner = request.auth.credentials.userId;

        await this._playlistsservice.verifyPlaylistAccess(playlistId, owner);

        const message = {
            playlistId,
            targetEmail: request.payload.targetEmail,
        };

        await this._service.sendMessage(
            'export:playlists',
            JSON.stringify(message)
        );

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;