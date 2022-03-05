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
  commentController.validateObjectId,
  commentController.getOne,

  passport.authenticate('jwt', {session: false}),

  commentController.checkForSelf,

  commentController.validate(),

  async (req, res, next) => {
    try {
      if (!res.locals.currentUserIsSelf) {
        const err = new Error(`You do not have permission to update this comment`);
        err.status = 404;
        return next(err);
      }
      // update
      const comment = res.locals.comment;
      comment.text = req.body.text;
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
