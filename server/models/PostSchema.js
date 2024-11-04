const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  mood: { type: String },
  playlist: {
    type: String,
  },
  tags: [{ type: String }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  comments: [{
    commentBody: {
      type: String
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  }]
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
