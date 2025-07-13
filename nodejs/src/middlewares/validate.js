const httpStatus = require('http-status').default;
const Joi = require('joi');

const ApiError = require('../utils/apiError')
const pick = require('../utils/pick');

const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    // If schema is a function, call it to get the actual schema
    let validationSchema = schema;
    if (typeof schema === 'function') {
      validationSchema = schema(req);
    }

    // Check if schema is a Joi schema (has validate method) or a schema object
    if (validationSchema.validate && typeof validationSchema.validate === 'function') {
      // Direct Joi schema - validate the specified source
      const { value, error } = validationSchema.validate(req[source], {
        errors: { label: 'key' },
        abortEarly: false,
      });

      if (error) {
        const errorMessage = error.details.map(details => details.message).join(', ');
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
      }
      Object.assign(req, { [source]: value });
      return next();
    }

    // Schema object format (for multiple sources like body, query, params)
    const validSchema = pick(validationSchema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessage = error.details.map(details => details.message).join(', ');
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    Object.assign(req, value);
    return next();
  };

module.exports = validate; 