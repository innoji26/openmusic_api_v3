const ClientError = require('./ClientError');

class AuthorizationError extends ClientError {
  constructor(message, status = 403) {
    super(message);
    this.name = 'AuthorizationError';
    this.status = status;
  }
}
module.exports = AuthorizationError;
