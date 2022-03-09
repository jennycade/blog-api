const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

PostSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
});

PostSchema.virtual('numComments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true,
});

module.exports = mongoose.model('Post', PostSchema);