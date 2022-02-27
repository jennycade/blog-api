var express = require('express');
const passport = require('passport');
var router = express.Router();

const User = require('../models/user');

/* GET users listing. */
router.get('/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    try {
      // check for admin role
      if (!req.user.roles.includes('admin')) {
        const err = new Error('You do not have permission to see all users');
        err.status = 403;
        throw err;
      } else {
          const users = await User
            .find()
            .select('-password')
            .sort('-createdAt')
            .exec();

          res.json(users);
      }
    } catch (err) {
      return next(err);
    }
  }
);

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
