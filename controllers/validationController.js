const { validationResult } = require('express-validator');

exports.throwValidationErrors = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(fieldError => fieldError.msg).join(', ');

      const err = new Error(`Validation errors: ${errorMessages}`);
      err.status = 400;
      throw err;
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

exports.validateObjectId = (paramId) => {
  const objIdPattern = /^[a-f\d]{24}$/i;
  return objIdPattern.test(paramId);
}