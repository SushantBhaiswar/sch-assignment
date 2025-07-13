const logger = require("../config/logger");


const requestLogger = (req, res, next) => {
    if (req.path !== '/favicon.ico') {
        const startTime = Date.now();
        const { method, originalUrl, ip ,statusCode} = req;

        logger.info(`[Request] ${method} ${originalUrl} from ${ip}`);



        // Log when response finishes (success or client error)
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const { statusCode } = res;
            logger.info(
                `[Response] ${method} ${originalUrl} - Status: ${statusCode}, Duration: ${duration}ms`
            );
        });

        // Log if the connection was closed prematurely
        res.on('close', () => {
            const duration = Date.now() - startTime;

            if (!res.writableEnded) {
                logger.warn(`[Connection Closed] ${method} ${originalUrl} after ${duration}ms`);
            }
        });

        // Log aborted client request (tab closed, internet lost, etc.)
        req.on('aborted', () => {
            const duration = Date.now() - startTime;

            logger.warn(`[Request Aborted] ${method} ${originalUrl} after ${duration}ms`);
        });

        next();
    }
};

module.exports = requestLogger;
