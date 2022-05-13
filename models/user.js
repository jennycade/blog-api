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
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    roles: {
      type: [String],
      enum: [
        'author',
        'admin',
      ],
    },
  },
  {
    timestamps: true,
    toObject: {
      transform: (doc, ret, opt) => {
        delete ret.password;
        return ret;
      }
    },
    toJSON: {
      transform: (doc, ret, opt) => {
        delete ret.password;
        return ret;
      }
    },
  },
);

// from https://www.digitalocean.com/community/tutorials/api-authentication-with-json-web-tokensjwt-and-passport

UserSchema.pre('save',
  async function(next) {
    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
    next();
  }
);

UserSchema.methods.isValidPassword = async function(password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);
  return compare;
};

module.exports = mongoose.model('User', UserSchema)