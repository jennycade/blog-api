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

  // validate and sanitize
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
router.get('/:postId',
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.postId)
        .populate('author', '-password')
        .exec();
      if (post.postStatus === 'published') {
        res.json(post);
      } else {
        // need to authenticate. pass the post along.
        res.locals.post = post;
        next(null);
      }
    } catch (err) {
      return next(err);
    }
  },
  // viewing a draft post requires validation
  passport.authenticate('jwt', {session: false}),
  async (req, res, next) => {
    try {
      // admin or post author
      if (
        req.user.roles.includes('admin') ||
        req.user._id === res.locals.post.author._id.toString()
      ) {
        res.json(res.locals.post);
      } else {
        const err = new Error('You do not have permission to view this post');
        err.status = 403;
        throw err;
      }
    } catch (err) {
      return next(err);
    }
  }
);

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

// update post
router.put('/:postId', 

  // validate and sanitize
  body('title')
    .exists().withMessage('Title required')
    .escape().trim(),
  body('text')
    .exists().withMessage('Text required')
    .escape().trim(),
  body('postStatus')
    .isIn(['draft', 'published']).withMessage('postStatus must be "draft" or "published"')
    .escape(),

  passport.authenticate('jwt', {session: false}),

  async (req, res, next) => {
    try {
      // find the post
      const post = await Post.findById(req.params.postId).exec();
      // check - admin or post author?
      if (
        req.user.roles.includes('admin') ||
        req.user._id === post.author.toString()
      ) {
        // allow the update
        post.title = req.body.title;
        post.text = req.body.text;
        post.postStatus = req.body.postStatus;
        const updatedPost = await post.save();
        res.json(updatedPost);
      } else {
        const err = new Error('You do not have permission to update the post');
        err.status = 403;
        throw err;
      }
    } catch (err) {
      return next(err);
    }
  },
);

// update post
router.delete('/:postId',

  passport.authenticate('jwt', {session: false}),

  async (req, res, next) => {
    try {
      // find the post
      const post = await Post.findById(req.params.postId).exec();
      // check - admin or post author?
      if (
        req.user.roles.includes('admin') ||
        req.user._id === post.author.toString()
      ) {
        // allow deletion
        await post.remove();
        res.json(post);
      } else {
        const err = new Error('You do not have permission to delete this post');
        err.status = 403;
        throw err;
      }
    } catch (err) {
      return next(err);
    }
  },
);

module.exports = router;
