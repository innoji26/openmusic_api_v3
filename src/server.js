require('dotenv').config();
const ClientError = require('../src/exceptions/ClientError');
const path = require('path');

// Eksternal Library
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');

// ALBUMS
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// SONGS
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// USERS
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// AUTHENTICATIONS
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

// PLAYLISTS
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// COLLABORATIONS
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// EXPORTS
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerServices');
const ExportsValidator = require('./validator/exports');

// storage
const StorageService = require('./services/storage/StorageService');

// chace
const CacheService = require('./services/redis/ChaceService');

const init = async() => {
    const cacheService = new CacheService();
    const albumsService = new AlbumsService(cacheService);
    const songsService = new SongsService();
    const usersService = new UsersService();
    const authservice = new AuthenticationsService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const storageService = new StorageService(
        path.resolve(__dirname, 'api/albums/file/covers')
    );

    const server = Hapi.server({
        host: process.env.HOST,
        port: process.env.PORT,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hello World!';
        },
    });

    // registrasi plugin eksternal
    await server.register([{
            plugin: Jwt,
        },
        { plugin: Inert },
    ]);

    // mendefinisikan strategi autentikasi jwt
    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => {
            return {
                isValid: true,
                credentials: {
                    userId: artifacts.decoded.payload.userId,
                },
            };
        },
    });

    // registrasi plugin internal
    await server.register([{
            plugin: albums,
            options: {
                service: albumsService,
                validator: AlbumsValidator,
                storageService: storageService,
            },
        },
        {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authservice: authservice,
                validator: AuthValidator,
                tokenmanager: TokenManager,
                usersservice: usersService,
            },
        },
        {
            plugin: playlists,
            options: {
                validator: PlaylistsValidator,
                playlistsservice: playlistsService,
                songsservice: songsService,
            },
        },
        {
            plugin: collaborations,
            options: {
                validator: CollaborationsValidator,
                collabsservice: collaborationsService,
                playlistsservice: playlistsService,
            },
        },
        {
            plugin: _exports,
            options: {
                service: ProducerService,
                validator: ExportsValidator,
                playlistsservice: playlistsService,
            },
        },
    ]);

    server.ext('onPreResponse', (request, h) => {
        // mendapatkan konteks response dari request
        const { response } = request;
        if (response instanceof Error) {
            // penanganan client error secara internal.
            if (response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                });
                newResponse.code(response.status);
                return newResponse;
            }
            // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
            if (!response.isServer) {
                return h.continue;
            }
            // penanganan server error sesuai kebutuhan
            const newResponse = h.response({
                status: 'error',
                message: 'terjadi kegagalan pada server kami',
            });
            newResponse.code(500);
            return newResponse;
        }
        // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
        return h.continue;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();