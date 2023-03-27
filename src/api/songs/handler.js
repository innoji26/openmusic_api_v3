const autoBind = require('auto-bind');

class SongsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postSongHandler(request, h) {
        this._validator.validateSongPayload(request.payload);
        const songId = await this._service.addSong(request.payload);
        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil di disimpan',
            data: {
                songId,
            },
        });
        response.code(201);
        return response;
    }

    async getSongsHandler(request, h) {
        const { title, performer } = request.query;
        let songs;

        if (title && performer) {
            songs = await this._service.getSongs({
                title: title,
                performer: performer,
            });
        } else if (title) {
            songs = await this._service.getSongs({
                title: title,
                performer: undefined,
            });
        } else if (performer) {
            songs = await this._service.getSongs({
                title: undefined,
                performer: performer,
            });
        } else {
            songs = await this._service.getSongs({
                title: undefined,
                performer: undefined,
            });
        }

        const response = h.response({
            status: 'success',
            data: {
                songs,
            },
        });
        response.code(200);
        return response;
    }

    async getSongByIdHandler(request, h) {
        const { id } = request.params;
        const song = await this._service.getSongById(id);

        const response = h.response({
            status: 'success',
            data: {
                song,
            },
        });
        response.code(200);
        return response;
    }

    async putSongByIdHandler(request, h) {
        const { id } = request.params;
        this._validator.validateSongPayload(request.payload);
        await this._service.putSongById(id, request.payload);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil di update',
        });
        response.code(200);
        return response;
    }

    async deleteSongByIdHandler(request, h) {
        const { id } = request.params;
        await this._service.deleteSongById(id);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil dihapus',
        });
        response.code(200);
        return response;
    }
}

module.exports = SongsHandler;