const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  postId: {
    type: String
  },
  coverImage: {
    type: String,
  },
  mood: { type: String },
  playlist: {
    type: Schema.Types.ObjectId,
    ref: "Playlist"
  },
  tags: [{ type: String }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      commentBody: {
        type: String,
      },
      owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
