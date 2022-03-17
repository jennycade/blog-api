const { body, validationResult } = require('express-validator');

const Post = require('../models/post');
const validationController = require('./validationController');

exports.validate = () => {
  return [
    // validate and sanitize
    body('title')
      .exists().withMessage('Title required')
      // .escape().trim(),
      .trim(),
    body('text')
      .exists().withMessage('Text required')
      // .escape().trim(),
      .trim(),
    body('postStatus')
      .isIn(['draft', 'published']).withMessage('postStatus must be "draft" or "published"')
      // .escape(),
      ,

    validationController.throwValidationErrors,
  ];
}

exports.validateObjectId = (req, res, next) => {
  const isValid = validationController.validateObjectId(req.params.postId);
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
    const post = await Post.findById(req.params.postId)
      .populate('author', '-password -updatedAt -username')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: '-password -updatedAt -username' }
      })  
      .populate('numComments')
      .exec();
    
    // 404 post not found
    if (!post) {
      const err = new Error('Post not found');
      err.status = 404;
      throw err;
    }
    res.locals.post = post;
    next();
  } catch (err) {
    return next(err)
  }
}

exports.checkForSelf = (req, res, next) => {
  try {
    let result = false;
    if (req.user) {
      if (res.locals.post.author._id) {
        // not populated
        result = (req.user._id === res.locals.post.author._id.toString());
      } else {
        // populated
        result = (req.user._id === res.locals.post.author.toString());
      }
    }
    res.locals.currentUserIsSelf = result;
    next();
  } catch (err) {
    return next(err);
  }
}