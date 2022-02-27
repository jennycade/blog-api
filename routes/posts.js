const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body } = require('express-validator');

const Post = require('../models/post');
const Comment = require('../models/comment');

// get all posts
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post
      .find({ postStatus: 'published'})
      .populate('author', '-password')
      .sort('-createdAt')
      .exec();

    res.json(posts);
  } catch (err) {
    return next(err);
  }
});

// post a post!
router.post('/', 
  passport.authenticate('jwt', {session: false}),
  // TODO: validate title, text, postStatus
  body('title')
    .exists().withMessage('Title required')
    .escape().trim(),
  body('Text')
    .exists().withMessage('Text required')
    .escape().trim(),
  body('postStatus')
    .isIn(['draft', 'published']).withMessage('postStatus must be "draft" or "published"')
    .escape(),
  async (req, res, next) => {
    try {
      // check for author role
      if (!req.user.roles.includes('author')) {
        const err = new Error('You do not have the author role');
        err.status = 403;
        throw err;
      }
      // do it
      const post = await Post.create(
        {
          title: req.body.title,
          text: req.body.text,
          postStatus: req.body.postStatus,
          author: req.user._id,
        }
      );
      res.json(post);
    } catch (err) {
      return next(err);
    }
  }
);

// get one post
router.get('/:postId', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', '-password')
      .exec();
    if (post.postStatus === 'published') {
      res.json(post);
    } else {
      // TODO: check that user has permission to view draft
      // admin and post author
      res.json(post);
    }
  } catch (err) {
    return next(err);
  }
});

// get comments for post
router.get('/:postId/comments', async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .exec();
    res.json(comments);
  } catch (err) {
    return next(err);
  }
});

// create post
router.post('/', 
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    res.json('You made it');
  }
);

module.exports = router;
