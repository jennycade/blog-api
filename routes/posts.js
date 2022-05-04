const express = require('express');
const router = express.Router();
const passport = require('passport');

const Post = require('../models/post');
const Comment = require('../models/comment');

const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

// get all posts
router.get('/',
  authController.authenticateAllowNonuser,
  authController.checkForAdmin,
  authController.checkForAuthor,
  async (req, res, next) => {
    try {
      let postQuery;
      // admin: everything
      if (res.locals.currentUserIsAdmin) {
        postQuery = {};
      } else if (res.locals.currentUserIsAuthor) {
      // authors: published OR author === self
        postQuery = {
          '$or': [
            {postStatus: 'published'},
            {author: req.user._id},
          ]
        }
      } else {
      // non-authors: published
        postQuery = {
          postStatus: 'published'
        }
      }
      
      const posts = await Post
        .find(postQuery)
        .populate('author', '-password -updatedAt -username')
        .populate({
          path: 'comments',
          populate: { path: 'author', select: '-password -updatedAt -username' }
        })
        .populate('numComments')
        .sort('-createdAt')
        .exec();

      res.json(posts);
    } catch (err) {
      return next(err);
    }
  }
);

// post a post!
router.post('/', 
  passport.authenticate('jwt', {session: false}),

  postController.validate(),

  authController.checkForAuthor,

  async (req, res, next) => {
    try {
      // check for author role
      if (!res.locals.currentUserIsAuthor) {
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
  postController.validateObjectId,
  postController.getOne,
  authController.authenticateAllowNonuser,
  authController.checkForAdmin,
  postController.checkForSelf,

  async (req, res, next) => {
    try {
      if (
        res.locals.post.postStatus === 'published' ||
        res.locals.currentUserIsAdmin ||
        res.locals.currentUserIsSelf
      ) {
        res.json(res.locals.post);
      } else {
        if (req.user) { // logged in
          const err = new Error(`You do not have permission to view this post`);
          err.status = 403;
          throw err;
        } else {
          // not logged in
          const err = new Error(`You are not logged in`);
          err.status = 401;
          throw err;
        }
      }
    } catch (err) {
      return next(err);
    }
  },
);

// update post
router.put('/:postId', 
  postController.validateObjectId,

  passport.authenticate('jwt', {session: false}),

  // validate and sanitize
  postController.validate(),

  postController.getOne,
  authController.checkForAdmin,
  postController.checkForSelf,

  async (req, res, next) => {
    try {
      // admin and authors can update
      if (
        res.locals.currentUserIsAdmin ||
        res.locals.currentUserIsSelf
      ) {
        // allow the update
        const post = res.locals.post;
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

// delete post
router.delete('/:postId',
  postController.validateObjectId,

  passport.authenticate('jwt', {session: false}),

  postController.getOne,
  authController.checkForAdmin,
  postController.checkForSelf,

  async (req, res, next) => {
    try {
      // check - admin or post author?
      if (
        res.locals.currentUserIsAdmin ||
        res.locals.currentUserIsSelf
      ) {
        // allow deletion
        await res.locals.post.remove();
        res.status(204).send();
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


//////////////
// COMMENTS //
//////////////

const commentController = require('../controllers/commentController');

// post a comment
router.post('/:postId/comments/',
  postController.validateObjectId,

  passport.authenticate('jwt', {session: false}),

  commentController.validate(),

  async (req, res, next) => {
    try {
      // any user can comment, no need to check roles
      const comment = await Comment.create({
        text: req.body.text,
        author: req.user._id,
        post: req.params.postId,
      });
      res.json(comment);
    } catch (err) {
      return next(err);
    }
  }
);

// get comments for post
router.get('/:postId/comments',
  postController.validateObjectId,
  async (req, res, next) => {
    try {
      const comments = await Comment.find({ post: req.params.postId })
        .populate('author', '-password -updatedAt -username')
        .exec();
      res.json(comments);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
