const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const cacheService = require('./services/cacheService');

class AppBootstrap {
    constructor() {
        this.server = null;
        this.isShuttingDown = false;
        this.connections = new Map();
    }

    async initialize() {
        try {
            // Set up graceful shutdown handlers first
            this.setupGracefulShutdown();

            // Initialize connections in order
            await this.connectRedis();
            await this.startServer();

            logger.info('Application initialized successfully');

        } catch (error) {
            logger.error('Failed to initialize application:', error);
            await this.shutdown('INITIALIZATION_ERROR');
        }
    }

    async startServer() {
        return new Promise((resolve, reject) => {
            try {
                this.server = app.listen(config.port, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    logger.info(`Server listening on port ${config.port}`);
                    logger.info(`Environment: ${config.env}`);
                    logger.info(`Process ID: ${process.pid}`);
                    resolve();
                });

                // Handle server errors
                this.server.on('error', (error) => {
                    if (error.code === 'EADDRINUSE') {
                        logger.error(`Port ${config.port} is already in use`);
                    } else {
                        logger.error('Server error:', error);
                    }
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    async connectRedis() {
        try {
            await cacheService.connect();
            
            if (cacheService.isConnected) {
                logger.info('Redis connected successfully');
                this.connections.set('redis', cacheService);
            } else {
                logger.warn('Redis connection failed, continuing without cache');
            }
        } catch (error) {
            logger.error('Failed to connect to Redis:', error);
            // Continue without Redis - cache operations will be skipped
        }
    }

    setupGracefulShutdown() {
        // Handle different shutdown signals
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
        process.on('SIGINT', () => this.shutdown('SIGINT'));

        // Handle uncaught exceptions and rejections
        process.on('uncaughtException', (error) => {
            logger.error(error);
            this.shutdown('UNCAUGHT_EXCEPTION');
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            this.shutdown('UNHANDLED_REJECTION');
        });

        // Handle specific process warnings
        process.on('warning', (warning) => {
            logger.warn('Process warning:', {
                name: warning.name,
                message: warning.message,
                stack: warning.stack
            });
        });
    }

    async shutdown(signal) {
        if (this.isShuttingDown) {
            logger.warn('Shutdown already in progress...');
            return;
        }

        this.isShuttingDown = true;
        logger.info(`${signal} received - initiating graceful shutdown`);

        // Set shutdown timeout
        const shutdownTimeout = setTimeout(() => {
            logger.error('Forced shutdown due to timeout');
            process.exit(1);
        }, 30000);

        try {
            // Close Redis connection
            if (this.connections.has('redis')) {
                logger.info('Closing Redis connection...');
                await cacheService.disconnect();
            }

            // Stop accepting new connections
            if (this.server) {
                logger.info('Closing HTTP server...');
                await this.closeServer();
            }

            clearTimeout(shutdownTimeout);
            logger.info('Graceful shutdown completed');
            process.exit(0);

        } catch (error) {
            clearTimeout(shutdownTimeout);
            logger.error('Error during shutdown:', error);
            process.exit(1);
        }
    }

    closeServer() {
        return new Promise((resolve) => {
            if (!this.server) {
                resolve();
                return;
            }

            this.server.close((error) => {
                if (error) {
                    logger.error('Error closing server:', error);
                } else {
                    logger.info('HTTP server closed');
                }
                resolve();
            });
        });
    }


}



// Initialize and start the application
const bootstrap = new AppBootstrap();
bootstrap.initialize().catch((error) => {
    logger.error('Application startup failed:', error);
    process.exit(1);
});