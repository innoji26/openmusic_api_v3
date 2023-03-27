const autoBind = require('auto-bind');

class CollaborationsHandler {
    constructor(validator, collabsservice, playlistsservice) {
        this._validator = validator;
        this._collabsservice = collabsservice;
        this._playlistsservice = playlistsservice;

        autoBind(this);
    }

    async postCollaborationHandler(request, h) {
        this._validator.validatePostCollabPayload(request.payload);
        const { userId: owner } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        await this._playlistsservice.verifyPlaylistOwnership(playlistId, owner);

        const collab_id = await this._collabsservice.addCollaboration(
            playlistId,
            userId
        );

        const response = h.response({
            status: 'success',
            data: {
                collaborationId: collab_id,
            },
        });
        response.code(201);
        return response;
    }

    async deleteCollaborationHandler(request, h) {
        this._validator.validateDeleteCollabPayload(request.payload);
        const { userId: owner } = request.auth.credentials;
        const { playlistId, userId } = request.payload;

        await this._playlistsservice.verifyPlaylistOwnership(playlistId, owner);
        await this._collabsservice.deleteCollaborations(playlistId, userId);

        const response = h.response({
            status: 'success',
            message: 'kolaborasi berhasil dihapus',
        });
        response.code(200);
        return response;
    }
}

module.exports = CollaborationsHandler;