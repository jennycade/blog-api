var express = require('express');
const passport = require('passport');
var router = express.Router();

const User = require('../models/user');
const userController = require('../controllers/userController');

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
  userController.validate(),
  passport.authenticate('signup', {session: false}),
  async (req, res, next) => {
    res.json({
      message: 'Signup successful',
      user: req.user,
    });
  }
);

// TODO: get one user

// update
router.put('/:userId',
  userController.validateObjectId,
  passport.authenticate('jwt', {session: false}),
  userController.validate(),
  async (req, res, next) => {
    try { 
      // allow signed in user OR admin to update user
      const user = await User.findById(req.params.userId).exec();
      
      // 404 user not found
      if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
      }
      
      // 403 no permission
      if (req.user._id !== user._id.toString() &&
        !req.user.roles.includes('admin')
      ) {
        const err = new Error('You do not have permission to update this user');
        err.status = 403;
        throw err;
      }

      // update permitted
      user.username = req.body.username;
      user.password = req.body.password;
      user.displayName = req.body.displayname;
      const roles = [];
      if (req.body.iscommenter === 'true') roles.push('commenter');
      if (req.body.isauthor === 'true') roles.push('author');
      if (req.body.isadmin === 'true') roles.push('admin');
      user.roles = roles;

      const updatedUser = await user.save();
      res.json(updatedUser);

    } catch (err) {
      return next(err);
    }
  }
);

// TODO: DELETE

module.exports = router;
