const passport = require('passport');

const User = require('../models/user');

exports.authenticateAllowNonuser = (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // not logged in
      next();
    } else {
      // manually log in
      req.login(user, {session: false}, next);
    }
  })(req, res, next);
};

exports.checkForAdmin = async (req, res, next) => {
  try {
    // note: don't throw error if user is not authenticated. This
    // middleware is used in endpoints that differentiate between
    // admin/user/non-user.
    let result = false;
    if (req.user) {
      const user = await User.findById(req.user._id).exec();
      result = user.roles.includes('admin');
    }
    res.locals.currentUserIsAdmin = result;
    next();
  } catch (err) {
    return next(err);
  }
};

exports.checkForAuthor = async (req, res, next) => {
  try {
    // note: don't throw error if user is not authenticated. This
    // middleware is used in endpoints that differentiate between
    // author/other user/non-user.
    let result = false;
    if (req.user) {
      const user = await User.findById(req.user._id).exec();
      result = user.roles.includes('author');
    }
    res.locals.currentUserIsAuthor = result;
    next();
  } catch (err) {
    return next(err);
  }
};