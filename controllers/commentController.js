const { body } = require('express-validator');

const validationController = require('./validationController');

exports.validate = () => {
  return [
    body('text')
      .exists({checkFalsy: true}).withMessage('Text required')
      .trim().escape(),
      
    body('author')
      .exists({checkFalsy: true}).withMessage('Author required')
      .custom((value, { req }) => value === req.user._id).withMessage('Comment author must be current authenticated user')
      .trim().escape(),
    
    body('post')
      .exists({checkFalsy: true}).withMessage('Post required')
      .trim().escape(),

    validationController.throwValidationErrors,
    
  ];
};
