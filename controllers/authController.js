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
}