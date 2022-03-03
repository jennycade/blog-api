const passport = require('passport');

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

exports.checkForAdmin = (req, res, next) => {
  try {
    // TODO: query the db instead!
    let result = false;
    if (req.user) {
      result = req.user.roles.includes('admin');
    }
    res.locals.currentUserIsAdmin = result;
    next();
  } catch (err) {
    return next(err);
  }
};