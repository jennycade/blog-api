var express = require('express');
const passport = require('passport');
var router = express.Router();
const jwt = require('jsonwebtoken');

require('dotenv').config();

// login
router.post('/login', async (req, res, next) => {
  passport.authenticate(
    'login',
    async (err, user, info) => {
      try {
        if (err || !user) {
          if (err) return next(err);
          const error = new Error('An error occurred while signing in.');
          error.status = 401;
          return next(error);
        }

        req.login(
          user,
          { session: false },
          async (err) => {
            if (err) return next(err);
            const body = {
              _id: user._id,
              username: user.username,
              displayName: user.displayName,
              roles: user.roles,
            };
            const token = jwt.sign({ user: body }, process.env.TOKEN_SECRET);

            return res.json({ token, user });
          }
        );
      } catch (err) {
        return next(err);
      }
    }
  )(req, res, next);
});

module.exports = router;
