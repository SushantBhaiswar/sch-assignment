const httpStatus = require('http-status').default;
const logger = require('../config/logger');
const ApiError = require('../utils/apiError');

const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode
                ? httpStatus.BAD_REQUEST
                : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);

        // Preserve additional properties from the original error
        if (err.code) error.code = err.code;
        if (err.details) error.details = err.details;
        if (err.cause) error.cause = err.cause;
        if (err.info) error.info = err.info;
        if (err.time) error.time = err.time;
        if (Object.prototype.hasOwnProperty.call(err, 'isOperational')) {
            if (typeof err.isOperational === 'string') {
                error.isOperational = !(
                    err.isOperational.toLowerCase() === 'false' || err.isOperational === ''
                );
            } else {
                error.isOperational = Boolean(err.isOperational);
            }
        }
    }
    next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;
console.log("statusCode" ,statusCode)


    // Use standardized response format
    const response = {
        success: false,
        code: statusCode,
        message,
        isShowMessage: statusCode <= 500 ? false : true,
        stack: err.stack,
    };

    logger.error(err);
    if (res.writableEnded) {
        return
    }
    res.status(statusCode).json(response);
};

module.exports = {
    errorConverter,
    errorHandler,
};
