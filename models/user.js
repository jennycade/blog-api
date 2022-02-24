const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      maxlength: 100,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    roles: {
      type: [String],
      enum: [
        'reader',
        'commenter',
        'author',
        'admin',
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', UserSchema)