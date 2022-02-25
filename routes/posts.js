var express = require('express');
var router = express.Router();

const Post = require('../models/post');
const Comment = require('../models/comment');

// get all posts
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post
      .find({ postStatus: 'published'})
      .sort('-createdAt')
      .exec();

    res.json(posts);
  } catch (err) {
    return next(err);
  }
});

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
})

module.exports = router;
