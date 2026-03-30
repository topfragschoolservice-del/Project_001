import Joi from 'joi';
import AppError from './appError.js';

/**
 * Generic validation middleware
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(', ');
    return next(new AppError(message, 400));
  }
  next();
};

export const signupValidator = validate(
  Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().required(),
    role: Joi.string().valid('parent', 'driver', 'admin').required(),
    children: Joi.array().items(
      Joi.object({
        name: Joi.string().required()
      })
    ),
    vehicleDetails: Joi.string()
  })
);

export const loginValidator = validate(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
);

export const updateChildrenValidator = validate(
  Joi.object({
    children: Joi.array().items(Joi.object({ name: Joi.string().required() })).required()
  })
);