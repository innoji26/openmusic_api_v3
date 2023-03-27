const autoBind = require('auto-bind');

class AuthenticationsHandler {
    constructor(authservice, validator, tokenmanager, usersservice) {
        this._authservice = authservice;
        this._validator = validator;
        this._usersservice = usersservice;
        this._tokenmanager = tokenmanager;

        autoBind(this);
    }

    async postAuthHandler(request, h) {
        this._validator.validatePostAuthPayload(request.payload);
        const userId = await this._usersservice.verifyUserCredential(
            request.payload
        );
        const accessToken = this._tokenmanager.generateAccessToken({ userId });
        const refreshToken = this._tokenmanager.generateRefreshToken({ userId });

        await this._authservice.addRefreshToken(refreshToken);

        const response = h.response({
            status: 'success',
            data: {
                accessToken,
                refreshToken,
            },
        });
        response.code(201);
        return response;
    }

    async putAuthHandler(request, h) {
        this._validator.validatePutAuthPayload(request.payload);
        const { refreshToken } = request.payload;

        await this._authservice.verifyRefreshToken(refreshToken);

        const { userId } = this._tokenmanager.verifyRefreshToken(refreshToken);
        const accessToken = this._tokenmanager.generateAccessToken({ userId });

        const response = h.response({
            status: 'success',
            data: {
                accessToken,
            },
        });
        response.code(200);
        return response;
    }

    async deleteAuthHandler(request, h) {
        // try {
        this._validator.validateDeleteAuthPayload(request.payload);
        const { refreshToken } = request.payload;

        await this._authservice.verifyRefreshToken(refreshToken);
        this._tokenmanager.verifyRefreshToken(refreshToken);
        await this._authservice.deleteRefreshToken(refreshToken);

        const response = h.response({
            status: 'success',
            message: 'Refresh Token berhasil dihapus',
        });
        response.code(200);
        return response;
    }
}

module.exports = AuthenticationsHandler;