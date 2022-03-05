const express = require('express');
const router = express.Router();
const passport = require('passport');

const Comment = require('../models/comment');
const commentController = require('../controllers/commentController');

/* get all comments. */
router.get('/', async (req, res, next) => {
  try {
    const comments = await Comment
      .find()
      .populate('author', '-password -updatedAt -username')
      .sort('-createdAt')
      .exec();

    res.json(comments);
  } catch (err) {
    return next(err);
  }
});

// get one comment
router.get('/:commentId', 
  commentController.validateObjectId,
  commentController.getOne,
  (req, res, next) => {
    try {
      res.json(res.locals.comment);
    } catch (err) {
      return next(err)
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

// delete a comment
router.delete('/:commentId',
  passport.authenticate('jwt', {session: false}),

  async (req, res, next) => {
    try {
      // check user: comment author OR admin
      const comment = await Comment.findById(req.params.commentId).exec();
      if (!comment) {
        const err = new Error('Comment not found');
        err.status = 404;
        throw err;
      }
      if (!req.user.roles.includes('admin') &&
        req.user._id !== comment.author.toString()
      ) {
        const err = new Error('You are not authorized to delete this comment');
        err.status = 403;
        throw err;
      } else {
        // delete it!
        await comment.remove();
        res.status(204).send(); // success, no body
      }
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
