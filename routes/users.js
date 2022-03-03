var express = require('express');
const passport = require('passport');
var router = express.Router();

const User = require('../models/user');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

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

// get one user
router.get('/:userId',
  userController.validateObjectId,
  authController.authenticateAllowNonuser,

  async (req, res, next) => {
    try {
      // get user
      const user = await User.findById(req.params.userId).exec();
      
      // 404 user not found
      if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        throw err;
      }
      const fields = ['displayName', 'roles']; // TODO: createdAt, what else?
      // if logged in AND admin or self: retrieve username too
      if (req.user) {
        if (
          req.user.roles.includes('admin') ||
          req.user._id === user._id.toString()
        ) {
          fields.push('username');
        }
      }
      const userToReturn = {
        _id: user._id,
      };
      fields.forEach(field => {
        userToReturn[field] = user[field];
      });
      
      res.json(userToReturn);
    } catch (err) {
      return next(err);
    }
  }
);

// update
router.put('/:userId',
  userController.validateObjectId,
  passport.authenticate('jwt', {session: false}),
  authController.checkForAdmin,
  userController.getOne,
  userController.checkForSelf,
  userController.validate(),
  async (req, res, next) => {
    try {
      // 403 no permission
      if (
        !res.locals.currentUserIsAdmin &&
        !res.locals.currentUserIsSelf
      ) {
        const err = new Error('You do not have permission to update this user');
        err.status = 403;
        throw err;
      }

      // update permitted
      const user = res.locals.user;
      user.username = req.body.username;
      user.password = req.body.password;
      user.displayName = req.body.displayname;
      //////////////////
      // START HERE. WHY ISN'T DISPLAYNAME COMING THROUGH FROM THE BODY?
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

// delete
router.delete('/:userId',
  userController.validateObjectId,
  passport.authenticate('jwt', {session: false}),
  authController.checkForAdmin,
  userController.getOne,
  userController.checkForSelf,
  async (req, res, next) => {
    try {
      // check permission: admin and self
      if (
        res.locals.currentUserIsAdmin ||
        res.locals.currentUserIsSelf
      ) {
        // allow it
        await res.locals.user.remove();
        res.status(204).send();
      } else {
        // 403
        const err = new Error('You do not have permission to delete this user');
        err.status = 403;
        throw err;
      }
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
