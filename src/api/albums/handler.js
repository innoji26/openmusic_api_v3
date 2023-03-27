const autoBind = require('auto-bind');

class AlbumsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);

        const id = await this._service.addAlbum(request.payload);
        const response = h.response({
            status: 'success',
            data: {
                albumId: id,
            },
        });
        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request, h) {
        const { id } = request.params;
        const album = await this._service.getAlbumById(id);
        const response = h.response({
            status: 'success',
            data: {
                album,
            },
        });
        response.code(200);
        return response;
    }

    async putAlbumByIdHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;
        await this._service.updateAlbumById(id, request.payload);

        const response = h.response({
            status: 'success',
            message: `Album dengan id ${id} berhasil di update`,
        });
        response.code(200);
        return response;
    }

    async deleteAlbumByIdHandler(request, h) {
        const { id } = request.params;
        await this._service.deleteAlbumById(id);

        const response = h.response({
            status: 'success',
            message: `Album dengan id ${id} berhasil dihapus`,
        });
        response.code(200);
        return response;
    }
}

module.exports = AlbumsHandler;