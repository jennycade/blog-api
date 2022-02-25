const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const User = require('../models/user');

// signing up
passport.use(
  'signup',
  new localStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        // construct roles
        const roles = [];
        if (req.headers.isadmin) roles.push('admin');
        if (req.headers.isauthor) roles.push('author');
        if (req.headers.iscommenter) roles.push('commenter');
        if (req.headers.isreader) roles.push('reader');

        const user = await User.create(
          {
            username,
            password,
            displayName: req.headers.displayname,
            roles,
          }
        );
        return done(null, user); // TODO: remove password field
      } catch (err) {
        done(err);
      }
    }
  )
);

// log in
passport.use(
  'login',
  new localStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username, password, done ) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, {message: 'User not found'});
        }
        const validate = await user.isValidPassword(password);

        if (!validate) {
          return done(null, false, {message: 'Incorrect password'});
        }

        return done(false, user, { message: 'Logged in successfully'});
      } catch (err) {
        done(err);
      }
    }
  )
)