const { body } = require('express-validator');

const validationController = require('./validationController');
const Comment = require('../models/comment');

exports.validate = () => {
  return [
    body('text')
      .exists({checkFalsy: true}).withMessage('Text required')
      // .trim().escape(),
      .trim(),
    validationController.throwValidationErrors,
  ];
};

exports.validateObjectId = (req, res, next) => {
  const isValid = validationController.validateObjectId(req.params.commentId);
  if (!isValid) {
    const err = new Error('Invalid post id');
    err.status = 400;
    return next(err);
  } else {
    next();
  }
}

exports.getOne = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
      .populate('author', '-password -updatedAt -username')  
      .exec();
    
    // 404 post not found
    if (!comment) {
      const err = new Error('Post not found');
      err.status = 404;
      throw err;
    }
    res.locals.comment = comment;
    next();
  } catch (err) {
    return next(err)
  }
}

exports.checkForSelf = (req, res, next) => {
  try {
    let result = false;
    if (req.user) {
      if (res.locals.comment.author._id) {
        // not populated
        result = (req.user._id === res.locals.comment.author._id.toString());
      } else {
        // populated
        result = (req.user._id === res.locals.comment.author.toString());
      }
    }
    res.locals.currentUserIsSelf = result;
    next();
  } catch (err) {
    return next(err);
  }
}