const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, validationResult } = require('express-validator');

const Comment = require('../models/comment');
const commentController = require('../controllers/commentController');

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

  commentController.validate(),

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
