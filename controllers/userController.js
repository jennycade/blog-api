const { body } = require('express-validator');
const User = require('../models/user');

const validationController = require('./validationController');

exports.validate = () => {
  return [
    body('username')
      .exists({checkFalsy: true}).withMessage('Username required')
      .isLength({max: 100}).withMessage('Maximum username length is 100 characters')
      // .trim().escape(),
      .trim(),
    body('password')
      .exists({checkFalsy: true}).withMessage('Password required')
      // .trim().escape(),
      .trim(),
    body('password2')
      // .escape(),
      ,
    body('displayname')
      .exists({checkFalsy: true}).withMessage('Display name required')
      .isLength({max: 100}).withMessage('Maximum display name length is 100 characters')
      // .trim().escape(),
      .trim(),
    // body('isadmin').escape(),
    // body('isauthor').escape(),

    validationController.throwValidationErrors,
  ]
};

exports.validateObjectId = (req, res, next) => {
  const isValid = validationController.validateObjectId(req.params.userId);
  if (!isValid) {
    const err = new Error('Invalid user id');
    err.status = 400;
    return next(err);
  } else {
    next();
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).exec();
    
    // 404 user not found
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    res.locals.user = user;
    next();
  } catch (err) {
    return next(err)
  }
}

exports.checkForSelf = (req, res, next) => {
  try {
    let result = false;
    if (req.user) {
      result = (req.user._id === res.locals.user._id.toString());
    }
    res.locals.currentUserIsSelf = result;
    next();
  } catch (err) {
    return next(err);
  }
}