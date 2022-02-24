var express = require('express');
var router = express.Router();

const Post = require('../models/post');

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

module.exports = router;
