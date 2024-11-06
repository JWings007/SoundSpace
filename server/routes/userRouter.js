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
const Post = require("../models/PostSchema");
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

router.get("/profile/:uid", ensureSpotifyAccessToken, async (req, res) => {
  const uid = req.params.uid;
  try {
    const user = await userModel.findOne({ uid: uid }).select("-_id -access_token").populate([
      { path: "posts" },
      {
        path: "followers",
        select:
          "name avatar -_id",
      },
      {
        path: "following",
        select:
          "name avatar -_id",
      },
      {
        path: "posts.playlist"
      }
    ]);
    if (user) {
      res.status(200).json(user);
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
    let totalDuration = 0;
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
          //START
          const songs = JSON.parse(songIds);
          const trackChunks = [];
          const chunkSize = 50;
          for (let i = 0; i < songs.length; i += chunkSize) {
            trackChunks.push(songs.slice(i, i + chunkSize).join(","));
          }

          const songDetails = await Promise.all(
            trackChunks.map(async (tracks) => {
              const response = await axios.get(
                `https://api.spotify.com/v1/tracks?ids=${tracks}`,
                {
                  headers: {
                    Authorization: `Bearer ${req.accessToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              return response.data.tracks;
            })
          );

          const flattenedSongDetails = songDetails.flat();
          flattenedSongDetails.forEach((s) => {
            totalDuration += s.duration_ms;
          });
          const allArtists = flattenedSongDetails.map((song) =>
            song.artists.map((artist) => artist.name)
          );
          const flattenedArtists = allArtists.flat();
          const uniqueArtists = [...new Set(flattenedArtists)];
          const artists = uniqueArtists.join(", ");

          //END
          const playlist = new PlaylistModel({
            title: name,
            description: desc,
            pid: await generateCustomId(),
            coverImage: imageUrl,
            songs: JSON.parse(songIds),
            owner: user._id,
            duration: totalDuration,
            artists: artists,
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
    let { title, description, tags, mood, playlistId } = req.body;
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
            postId: await generateCustomId(),
            mood: mood,
            owner: user._id,
            playlist: playlistId,
          });
          await post.save();
          const userUpdate = await userModel.findByIdAndUpdate(user._id, {
            $push: {
              posts: post._id,
            },
          });
          const populatedPost = await postModel.findById(post._id).populate([
            {
              path: "owner",
              select: "avatar name -_id",
            },
            {
              path: "playlist",
              select: "-_id -owner",
            },
          ]);
          if (userUpdate) {
            global.io.emit("new-post", populatedPost);
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
        select: "name _id",
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

router.post("/user/like", ensureSpotifyAccessToken, async (req, res) => {
  const { userId, postId } = req.body;

  try {
    const user = await User.findOne({ name: userId });
    const post = await postModel.findOne({ postId });

    if (post) {
      const isLiked = post.likes.includes(user._id);

      if (isLiked) {
        post.likes.pull(user._id);
        await post.save();
        const updatedPost = await postModel
          .findById({ _id: post._id })
          .populate([
            {
              path: "likes",
              select: "name avatar -_id",
            },
          ])
          .select("-owner -_id");
        res.status(200).json({
          message: "Unliked successfully",
          type: "Unlike",
          likes: updatedPost.likes,
        });
      } else {
        post.likes.push(user._id);
        await post.save();
        const updatedPost = await postModel
          .findById({ _id: post._id })
          .populate([
            {
              path: "likes",
              select: "name avatar -_id",
            },
          ])
          .select("-owner -_id");
        res.status(200).json({
          message: "Liked successfully",
          type: "Like",
          likes: updatedPost.likes,
        });
      }
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/feed", ensureSpotifyAccessToken, async (req, res) => {
  const user = await User.findOne({ access_token: req.accessToken }).select(
    "name"
  );
  const userId = user ? user._id : null;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (userId) {
    try {
      const mainUser = await User.findById(userId).select("following");
      const followingIds = mainUser.following;

      // Fetch posts from followed users
      let allPosts = await Post.find({ owner: { $in: followingIds } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate([
          {
            path: "owner",
            select: "name avatar -_id",
          },
          {
            path: "playlist",
            select: "-_id -owner",
          },
          {
            path: "likes",
            select: "name avatar -_id",
          },
        ]);

      // If followed posts are fewer than the limit, fetch additional posts
      if (allPosts.length < limit) {
        const remainingLimit = limit - allPosts.length;

        const additionalPosts = await Post.find({
          owner: { $nin: [userId, ...followingIds] },
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * remainingLimit) // Offset by page for additional posts
          .limit(remainingLimit)
          .populate([
            {
              path: "owner",
              select: "name avatar -_id",
            },
            {
              path: "playlist",
              select: "-_id -owner",
            },
            {
              path: "likes",
              select: "name avatar -_id",
            },
          ]);

        allPosts.push(...additionalPosts);
      }
      res.status(200).json(allPosts);
    } catch (err) {
      res.status(500).json("Internal Server Error");
      console.log(err.message);
    }
  } else {
    res.status(400).json("User not found");
  }
});

router.post("/user/comment", ensureSpotifyAccessToken, async(req, res) => {
  const {commentBody, userId, postId} = req.body;
  const user = await User.findOne({uid: userId});
  if(user) {
    const post = await postModel.findOneAndUpdate({postId}, {
      $push: {
        comments: {
          commentBody,
          owner: user._id
        }
      }
    }, {
      new: true
    }).populate("comments.owner", "name avatar -_id")
    if(post) {
      res.status(200).json(post.comments)
    }
  }
})


router.get("/comments/:postId", ensureSpotifyAccessToken, async(req, res) => {
  const postId = req.params.postId
  if(postId) {
    const comments = await postModel.findOne({postId}).populate([
      {
        path: "comments",
        select: "-_id"
      },
      {
        path: "comments.owner",
        select: "name avatar -_id"
      }
    ])
    if(comments) {
      res.status(200).json(comments.comments)
    }
  }
})

module.exports = router;
