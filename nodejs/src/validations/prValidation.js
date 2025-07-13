const Joi = require('joi');



/**
 * Validation schema for PR processing request
 */
const processPRSchema = Joi.object({
  totalAmount: Joi.number().positive().required().messages({
    'number.base': 'Total amount must be a number',
    'number.positive': 'Total amount must be positive',
    'any.required': 'Total amount is required'
  }),
  deliveryDate: Joi.date().iso().greater('now').required().messages({
    'date.base': 'Delivery date must be a valid date',
    'date.format': 'Delivery date must be in ISO format (YYYY-MM-DD)',
    'date.greater': 'Delivery date must be in the future',
    'any.required': 'Delivery date is required'
  }),
  items: Joi.array().min(1).optional().messages({
    'array.base': 'Items must be an array',
    'array.min': 'At least one item is required',
    'any.required': 'Items are required'
  }),
  requester: Joi.string().email().required().messages({
    'string.email': 'Requester must be a valid email address',
    'any.required': 'Requester email is required'
  }),
  department: Joi.string().required().min(1).max(100).messages({
    'string.empty': 'Department cannot be empty',
    'string.min': 'Department must be at least 1 character long',
    'string.max': 'Department cannot exceed 100 characters',
    'any.required': 'Department is required'
  }),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional().messages({
    'any.only': 'Priority must be one of: Low, Medium, High'
  }),
});

const getPRsSchema = Joi.object({
  query: Joi.object({
    plant: Joi.string().optional().valid('PlantA', 'PlantB', 'PlantC', 'PlantD').messages({
      'any.only': 'Plant must be one of: PlantA, PlantB, PlantC, PlantD'
    }),
   
    maxAmount: Joi.number().positive().optional().messages({
      'number.base': 'Max amount must be a number',
      'number.positive': 'Max amount must be positive'
    }),
   
    limit: Joi.number().integer().positive().max(100).optional().messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.positive': 'Limit must be positive',
      'number.max': 'Limit cannot exceed 100'
    }),
    offset: Joi.number().integer().min(0).optional().messages({
      'number.base': 'Offset must be a number',
      'number.integer': 'Offset must be an integer',
      'number.min': 'Offset must be non-negative'
    })
  })
});


module.exports = {
  processPRSchema,
  getPRsSchema
}; 