const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: {
      type: String,
    },
    text: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postStatus: {
      type: String,
      required: true,
      enum: ['draft', 'published'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Post', PostSchema);