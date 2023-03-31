const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message, status = 404) {
    super(message);
    this.name = 'NotFoundError';
    this.status = status;
  }
}

module.exports = NotFoundError;
