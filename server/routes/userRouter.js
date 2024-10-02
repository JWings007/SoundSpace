const router = require("express").Router();
const axios = require("axios");
const userModel = require("../models/UserSchema");
const PlaylistModel = require("../models/PlaylistSchema");
const {
  ensureSpotifyAccessToken,
} = require("../middlewares/ensureAuthorization");
const upload = require("../middlewares/multer");
const cloudinary = require("../utils/cloudinary.config");
const fs = require("fs");
async function generateCustomId() {
  const { nanoid } = await import('nanoid');
  return nanoid(12);
}

// ## /me route
router.get("/me", ensureSpotifyAccessToken, async (req, res) => {
  try {
    const user = await userModel.findOne({ access_token: req.accessToken });
    if (user) {
      const { name, tagline, avatar, playlists, followers, following } = user;
      res.status(200).json({
        name,
        tagline,
        avatar,
        playlists,
        followers,
        following,
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
router.post("/playlist-create", ensureSpotifyAccessToken, upload.single("cover"), async (req, res) => {
    const { name, desc, songIds } = req.body;
    const coverPath = req.file ? req.file.path : null;
    let imageUrl = null;
    try{
        if (coverPath) {
            const result = await cloudinary.uploader.upload(coverPath, {
              folder: "SoundSpace",
              transformation: [{ width: 500, height: 500, crop: "limit" }]
            });
            imageUrl = result.secure_url
        }
        if(imageUrl) {
            fs.unlinkSync(coverPath);
            const user = await userModel.findOne({access_token: req.accessToken});
            if(user) {
                const playlist = new PlaylistModel({
                    title: name,
                    description: desc,
                    pid: await generateCustomId(),
                    coverImage: imageUrl,
                    songs: JSON.parse(songIds),
                    owner: user._id
                })
                await playlist.save();
                res.status(200).json({
                    message: "Playlist created successfully",
                    status: 200
                })
            }
        }
        else{
            console.log("Cloudinary error")
        }
    }catch(err) {
        console.log("Error in saving playlist", err)
        res.status(301).json({
            message: "Unable to create Playlist at the moment",
            status: 301
        })
    }
  }
);

module.exports = router;
