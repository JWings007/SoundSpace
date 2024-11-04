const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String
    },
    email: {
      type: String,
      unique: true
    },
    tagline: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      default: "#tagline"
    },
    bio: {
        type: String
    },
    avatar: {
      type: String,
      default: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?w=740&t=st=1726048638~exp=1726049238~hmac=7c6fcd50dd45e66b584bc70f81d1b9f6dff3cf864f0b0032ad7ea4cd555b0d2a'
    },
    access_token: {
      type: String
    },
    playlists: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Playlist',
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post"
      }
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
