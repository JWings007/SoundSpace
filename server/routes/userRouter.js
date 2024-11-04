const router = require("express").Router();
const axios = require("axios");
const userModel = require("../models/UserSchema");
const postModel = require("../models/PostSchema");
const PlaylistModel = require("../models/PlaylistSchema");
const {
  ensureSpotifyAccessToken,
} = require("../middlewares/ensureAuthorization");
const upload = require("../middlewares/multer");
const cloudinary = require("../utils/cloudinary.config");
const fs = require("fs");
const User = require("../models/UserSchema");
async function generateCustomId() {
  const { nanoid } = await import("nanoid");
  return nanoid(12);
}

// ## /me route
router.get("/me", ensureSpotifyAccessToken, async (req, res) => {
  try {
    const user = await userModel
      .findOne({ access_token: req.accessToken })
      .populate([
        { path: "posts" },
        {
          path: "followers",
          select:
            "-_id -uid -email -access_token -followers -following -posts -playlists",
        },
        {
          path: "following",
          select:
            "-_id -uid -email -access_token -followers -following -posts -playlists",
        },
      ]);
    if (user) {
      const {
        name,
        uid,
        tagline,
        avatar,
        playlists,
        followers,
        following,
        posts,
      } = user;
      res.status(200).json({
        name,
        uid,
        tagline,
        avatar,
        playlists,
        followers,
        following,
        posts,
      });
    } else {
      res.status(301).json({
        message: "User not found",
        status: 301,
      });
    }
  } catch (error) {
    console.error("Error fetching user data from Spotify:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/profile/:username", ensureSpotifyAccessToken, async (req, res) => {
  const username = req.params.username;
  try {
    const user = await userModel.findOne({ name: username }).populate([
      { path: "posts" },
      {
        path: "followers",
        select:
          "-_id -uid -email -access_token -followers -following -posts -playlists",
      },
      {
        path: "following",
        select:
          "-_id -uid -email -access_token -followers -following -posts -playlists",
      },
    ]);
    if (user) {
      const {
        name,
        uid,
        tagline,
        avatar,
        playlists,
        followers,
        following,
        posts,
      } = user;
      res.status(200).json({
        name,
        uid,
        tagline,
        avatar,
        playlists,
        followers,
        following,
        posts,
      });
    } else {
      res.status(301).json({
        message: "User not found",
        status: 301,
      });
    }
  } catch (error) {
    console.error("Error fetching user data from Spotify:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ## /search route
router.get("/search/:query", ensureSpotifyAccessToken, async (req, res) => {
  const query = req.params.query;
  if (query) {
    try {
      const tracks = await axios.get(
        `https://api.spotify.com/v1/search?query=${query}&type=track`,
        {
          headers: {
            Authorization: `Bearer ${req.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (tracks) {
        res.json(tracks.data);
      } else res.send("No tracks found");
    } catch (err) {
      console.log("catch error", err);
    }
  }
});

// ## /playlist-create
router.post(
  "/playlist-create",
  ensureSpotifyAccessToken,
  upload.single("cover"),
  async (req, res) => {
    const { name, desc, songIds } = req.body;
    const coverPath = req.file ? req.file.path : null;
    let imageUrl = null;
    try {
      if (coverPath) {
        const result = await cloudinary.uploader.upload(coverPath, {
          folder: "SoundSpace",
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });
        imageUrl = result.secure_url;
      }
      if (imageUrl) {
        fs.unlinkSync(coverPath);
        const user = await userModel.findOne({ access_token: req.accessToken });
        if (user) {
          const playlist = new PlaylistModel({
            title: name,
            description: desc,
            pid: await generateCustomId(),
            coverImage: imageUrl,
            songs: JSON.parse(songIds),
            owner: user._id,
          });
          await playlist.save();
          res.status(200).json({
            message: "Playlist created successfully",
            status: 200,
          });
        }
      } else {
        console.log("Cloudinary error");
      }
    } catch (err) {
      console.log("Error in saving playlist", err);
      res.status(301).json({
        message: "Unable to create Playlist at the moment",
        status: 301,
      });
    }
  }
);

router.post(
  "/create-post",
  ensureSpotifyAccessToken,
  upload.single("coverImage"),
  async (req, res) => {
    let { title, description, tags, mood, playlisId } = req.body;
    let coverPath = req.file ? req.file.path : null;
    let imageUrl;
    try {
      if (coverPath) {
        const result = await cloudinary.uploader.upload(coverPath, {
          folder: "SoundSpace",
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });
        imageUrl = result.secure_url;
      }
      if (imageUrl) {
        fs.unlinkSync(coverPath);
        const user = await userModel.findOne({ access_token: req.accessToken });
        if (user) {
          const post = new postModel({
            title,
            description,
            tags: JSON.parse(tags),
            coverImage: imageUrl,
            mood: mood,
            owner: user._id,
          });
          await post.save();
          const userUpdate = await userModel.findByIdAndUpdate(user._id, {
            $push: {
              posts: post._id,
            },
          });
          if (userUpdate) {
            res.status(200).json({
              message: "Playlist created successfully",
              status: 200,
            });
          }
        }
      } else {
        res.status(501).json({
          message: "Unauthorized",
        });
        console.log("User not found Access Token invalid");
      }
    } catch (err) {
      console.log("Error creating post", err);
      res.status(301).json({
        message: "Unable to create Post at the moment",
        status: 301,
      });
    }
  }
);

router.post("/user/follow", ensureSpotifyAccessToken, async (req, res) => {
  const { userId, targetUserId } = req.body; // current user and target user IDs

  try {
    const user = await User.findOne({ name: userId });
    const targetUser = await User.findOne({ name: targetUserId }).populate([
      {
        path: "followers",
        select:
          "name _id",
      },
    ]);
    // Check if already following
    const isFollowing = user.following.includes(targetUser._id);

    if (isFollowing) {
      user.following.pull(targetUser._id);
      targetUser.followers.pull(user._id);
      await user.save();
      await targetUser.save();
      res.status(200).json({
        message: "Unfollowed successfully",
        type: "Follow",
        count: targetUser.followers,
      });
    } else {
      // Follow logic
      user.following.push(targetUser._id);
      targetUser.followers.push(user._id);
      await user.save();
      await targetUser.save();
      res.status(200).json({
        message: "Followed successfully",
        type: "Unfollow",
        count: targetUser.followers,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
