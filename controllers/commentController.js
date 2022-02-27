const { body } = require('express-validator');

exports.validate = () => {
  return [
    body('text')
      .exists().withMessage('Text required')
      .trim().escape(),
    
    body('author')
      .exists().withMessage('Author required')
      .trim().escape(),
    
    body('post')
      .exists().withMessage('Post required')
      .trim().escape(),
  ];
};