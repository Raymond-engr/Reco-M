import Joi from 'joi';
import validateRequest from '../middleware/validateRequest.js';

export const searchValidationSchema = Joi.object({
  q: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Query parameter cannot be empty.',
    'string.max': 'Query parameter cannot exceed 200 characters.',
    'any.required': 'Query parameter is required.',
  }),
});

export const validateSearchQuery = validateRequest(searchValidationSchema, 'query');