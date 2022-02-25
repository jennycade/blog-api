const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcryptjs');

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
      select: false,
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

// from https://www.digitalocean.com/community/tutorials/api-authentication-with-json-web-tokensjwt-and-passport

UserSchema.pre('save',
  async function(next) {
    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
    next();
  }
);

UserSchema.method('isValidPassword',
  async function(password) {
    const compare = await bcrypt(password, user.password);
    return compare;
  }
);

module.exports = mongoose.model('User', UserSchema)