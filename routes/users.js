var express = require('express');
var router = express.Router();

const User = require('../models/user');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const users = await User
      .find('displayName createdAt')
      .sort('-createdAt')
      .exec();

    res.json(users);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
