const { body, validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  return [
    body('text')
      .exists({checkFalsy: true}).withMessage('Text required')
      .trim().escape(),
      
    body('author')
      .exists({checkFalsy: true}).withMessage('Author required')
      .equals(req.user._id).withMessage('Comment author must be current authenticated user')
      .trim().escape(),
      // TODO: only authenticated user can be the author
    
    body('post')
      .exists({checkFalsy: true}).withMessage('Post required')
      .trim().escape(),

    (req, res, next) => {
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
    },
  ];
};