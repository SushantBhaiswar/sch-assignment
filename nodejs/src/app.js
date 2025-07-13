const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { errorConverter, errorHandler } = require('./middlewares/error');
const routes = require('./routes/prRoutes');
const ApiError = require('./utils/apiError');
const requestLogger = require('./middlewares/requestLogger');

const app = express();

// parse json request body
app.use(express.json());

// log the incoming request
app.use(requestLogger)

// set security HTTP headers
app.use(helmet());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));


// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// response handler middleware (adds sendJSONResponse method to res object)
app.use((req, res, next) => {
    res.sendJSONResponse = function ({
        code = 200,
        message = '',
        data = null,
        status = true,
        isShowMessage = true
    } = {}) {
        res.status(code).json({
            code,
            message: isShowMessage ? message : '',
            data,
            status
        });
    };
    next();

})



// api routes
app.use('/', routes);

// send back a 404 error for any unknown api request
app.use((req, res) => {
    throw new ApiError(404, "Route not found");
});

// send the response if its taking to much time to respond
app.use((req, res, next) => {
    res.setTimeout(5000, () => {
        if (!res.writableEnded) {
            res.status(503).json({ message: 'Request timeout' });
        }
    });
    next();
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
