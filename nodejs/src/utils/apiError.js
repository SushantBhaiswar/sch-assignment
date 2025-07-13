/**
 * @extends Error
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '', lng = 'en') {
        super();
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        this.lng = lng;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

}

module.exports = ApiError;
