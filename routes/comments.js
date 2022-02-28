const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, validationResult } = require('express-validator');

const Comment = require('../models/comment');
// const commentController = require('../controllers/commentController');

/* GET comments listing. */
router.get('/', async (req, res, next) => {
  try {
    const comments = await Comment
      .find()
      .sort('-createdAt')
      .exec();

    res.json(comments);
  } catch (err) {
    return next(err);
  }
});

// post a comment
router.post('/',
  passport.authenticate('jwt', {session: false}),

  // (req, res, next) => commentController.validate(req, res, next),
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

  async (req, res, next) => {
    try {
      // any user can comment, no need to check roles
      const comment = await Comment.create({
        text: req.body.text,
        author: req.user._id,
        post: req.body.post,
      });
      res.json(comment);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
