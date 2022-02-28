const { body, validationResult } = require('express-validator');

const validationController = require('./validationController');

exports.validate = () => {
  return [
    // validate and sanitize
    body('title')
      .exists().withMessage('Title required')
      .escape().trim(),
    body('text')
      .exists().withMessage('Text required')
      .escape().trim(),
    body('postStatus')
      .isIn(['draft', 'published']).withMessage('postStatus must be "draft" or "published"')
      .escape(),

    validationController.throwValidationErrors,
    
  ];
}