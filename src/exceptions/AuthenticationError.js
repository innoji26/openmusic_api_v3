const ClientError = require('./ClientError');

class AuthenticationError extends ClientError {
  constructor(message, status = 401) {
    super(message);
    this.name = 'AuthenticationsError';
    this.status = status;
  }
}

module.exports = AuthenticationError;
