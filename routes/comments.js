const express = require('express');
const router = express.Router();
const passport = require('passport');

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

// update a comment
router.put('/:commentId',
  passport.authenticate('jwt', {session: false}),

  commentController.validate(),

  async (req, res, next) => {
    try {
      // check to make sure user is original author
      const comment = await Comment.findById(req.params.commentId).exec();
      if (comment.author.toString() !== req.user._id) {
        const err = new Error('Only the comment author can update this comment');
        err.status = 403;
        throw err;
      }
      // update
      comment.text = req.body.text;
      comment.post = req.body.post;
      // don't allow changing author
      const updatedComment = await comment.save();
      res.json(updatedComment);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
