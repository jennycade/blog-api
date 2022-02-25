var express = require('express');
const passport = require('passport');
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

// create new user, a.k.a. sign up
router.post('/',
  // TODO: validate and sanitize?
  passport.authenticate('signup', {session: false}),
  async (req, res, next) => {
    res.json({
      message: 'Signup successful',
      user: req.user,
    });
  }
);

module.exports = router;
