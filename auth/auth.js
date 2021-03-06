const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
require('dotenv').config();

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
        if (req.body.isadmin === 'true') roles.push('admin');
        if (req.body.isauthor === 'true') roles.push('author');

        try {
          const user = await User.create(
            {
              username,
              password,
              displayName: req.body.displayname,
              roles,
            }
          );
          return done(null, user);
        } catch (err) {
          const duplicateErrorMessage = 'E11000 duplicate key error collection: blog_api.users index: username';
          if (err.message.includes(duplicateErrorMessage)) {
            const duplicateErr = new Error('Username already in use');
            duplicateErr.status = 400;
            throw duplicateErr;
          }
          done(err);
        }
        
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
);

// authenticate with JWT
passport.use(
  new JWTStrategy(
    {
      secretOrKey: process.env.TOKEN_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken('secret_token'),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (err) {
        done(err);
      }
    }
  )
);