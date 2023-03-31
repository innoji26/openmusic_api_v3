const autoBind = require('auto-bind');

class AlbumsHandler {
    constructor(service, validator, storageService) {
        this._service = service;
        this._validator = validator;
        this._storageService = storageService;

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

    // cover
    async postUploadCoverHandler(request, h) {
        const { cover } = request.payload;
        const { id } = request.params;
        this._validator.validateAlbumCover(cover.hapi.headers);

        const filename = await this._storageService.writeFile(cover, cover.hapi);
        const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/file/covers/${filename}`;

        await this._service.postAlbumCoverById(id, fileLocation);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });

        response.code(201);
        return response;
    }

    // like
    async postAlbumLikeHandler(request, h) {
        const owner = request.auth.credentials.userId;
        const { id: albumId } = request.params;

        const message = await this._service.postUserAlbumLikeById(owner, albumId);

        const response = h.response({
            status: 'success',
            message: message,
        });

        response.code(201);
        return response;
    }

    async getAlbumLikesHandler(request, h) {
        const { id: albumId } = request.params;
        const likes = await this._service.getUserAlbumLikesById(albumId);

        const response = h.response({
            status: 'success',
            data: {
                likes: likes.albumLikes,
            },
        });
        if (likes.source === 'cache') {
            response.header('X-Data-Source', 'cache');
            return response;
        }
        return response;
    }
}

module.exports = AlbumsHandler;