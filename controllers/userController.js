const { body } = require('express-validator');

const validationController = require('./validationController');

exports.validate = () => {
  return [
    body('username')
      .exists({checkFalsy: true}).withMessage('Username required')
      .isLength({max: 100}).withMessage('Maximum username length is 100 characters')
      .trim().escape(),
    body('password')
      .exists({checkFalsy: true}).withMessage('Password required')
      .trim().escape(),
    body('password2')
      .escape(),
    body('displayname')
      .exists({checkFalsy: true}).withMessage('Display name required')
      .isLength({max: 100}).withMessage('Maximum display name length is 100 characters')
      .trim().escape(),
    body('isadmin').escape(),
    body('isauthor').escape(),
    body('iscommenter').escape(),

    validationController.throwValidationErrors,
  ]
}