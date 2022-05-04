var express = require('express');
const passport = require('passport');
var router = express.Router();

const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

/* GET all users - admin only */
router.get('/',
  passport.authenticate('jwt', { session: false }),
  authController.checkForAdmin,
  async (req, res, next) => {
    try {
      // check for admin role
      if (!res.locals.currentUserIsAdmin) {
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
  userController.getOne,
  userController.checkForSelf,
  authController.checkForAdmin,

  async (req, res, next) => {
    try {
      const fieldsToHide = ['password'];
      // if not admin or self: hide username too
      if (
        !res.locals.currentUserIsAdmin &&
        !res.locals.currentUserIsSelf
      ) {
        fieldsToHide.push('username', 'updatedAt');
      }
      const userObj = res.locals.user.toObject();
      const userToReturn = {};

      // filter out fields that should be hidden
      for (const [field, value] of Object.entries(userObj)) {
        if (!fieldsToHide.includes(field)) {
          userToReturn[field] = value;
        }
      }
      
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

// get user's posts
router.get('/:userId/posts',
  userController.validateObjectId,
  async (req, res, next) => {
    try {
      const posts = await Post.find({ author: req.params.userId })
        .exec();
      res.json(posts);
    } catch (err) {
      return next(err);
    }
  }
);

// get user's comments
router.get('/:userId/comments',
  userController.validateObjectId,
  async (req, res, next) => {
    try {
      const comments = await Comment.find({ author: req.params.userId })
        .populate('post')
        .exec();
      res.json(comments);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
