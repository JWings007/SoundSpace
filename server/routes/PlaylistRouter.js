const axios = require("axios");
const {
  ensureSpotifyAccessToken,
} = require("../middlewares/ensureAuthorization");
const Playlist = require("../models/PlaylistSchema");
const User = require("../models/UserSchema");
const upload = require("../middlewares/multer");
const cloudinary = require("../utils/cloudinary.config");
const fs = require("fs");
const router = require("express").Router();

router.get("/playlists", ensureSpotifyAccessToken, async (req, res) => {
  try {
    const user = await User.findOne({ access_token: req.accessToken });
    if (user) {
      const playlists = await Playlist.find(
        { owner: user._id },
        { _id: 0, owner: 0 }
      );

      const playlistDetails = await Promise.all(
        playlists.map(async (playlist) => {
          // Spotify allows up to 50 track IDs at once, so split them into chunks if necessary
          const trackChunks = [];
          const chunkSize = 50;
          for (let i = 0; i < playlist.songs.length; i += chunkSize) {
            trackChunks.push(playlist.songs.slice(i, i + chunkSize).join(","));
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

          const allArtists = flattenedSongDetails.map((song) =>
            song.artists.map((artist) => artist.name)
          );
          const flattenedArtists = allArtists.flat();
          const uniqueArtists = [...new Set(flattenedArtists)];
          const artists = uniqueArtists.join(", ");

          return {
            ...playlist.toObject(),
            songs: flattenedSongDetails,
            artists,
          };
        })
      );

      res.status(200).json(playlistDetails);
    } else {
      res.status(401).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error fetching playlists", status: 500 });
    console.error("Playlist fetching error:", err);
  }
});

// ## /update-playlist route
router.post(
  "/playlist-update",
  ensureSpotifyAccessToken,
  upload.single("cover"),
  async (req, res) => {
    const coverPath = req.file ? req.file.path : null;
    const { title, desc, songs, pid, oldCover } = req.body;
    let imageUrl = null;
    let toBeUpdated = {};

    if (title) toBeUpdated.title = title;
    if (desc) toBeUpdated.description = desc;
    if (songs) toBeUpdated.songs = JSON.parse(songs);
    if (coverPath && oldCover) {
      const publicId = oldCover.split("/").slice(-2).join("/").split(".")[0];
      console.log(publicId);
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error("Error deleting old image:", error);
        }
      });
      const result = await cloudinary.uploader.upload(coverPath, {
        folder: "SoundSpace",
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });
      imageUrl = result.secure_url;
      if (imageUrl) {
        toBeUpdated.coverImage = imageUrl;
      } else console.log("Image url not generated");
    }

    try {
      const updatedPlaylist = await Playlist.findOneAndUpdate(
        { pid },
        { $set: toBeUpdated },
        { new: true }
      );

      if (updatedPlaylist) {
        return res.status(200).json({
          status: 200,
          message: "Playlist updated successfully",
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: "Playlist not found",
        });
      }
    } catch (err) {
      res.status(501).json({
        message: "Error updating playlist",
        status: 501,
      });
    }
  }
);

router.get("/playlist/:pid", ensureSpotifyAccessToken, async (req, res) => {
  const { pid } = req.params;

  if (pid) {
    try {
      // Find the playlist by its pid
      const playlist = await Playlist.findOne({ pid: pid });
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      // Divide song IDs into chunks
      const trackChunks = [];
      const chunkSize = 50;
      for (let i = 0; i < playlist.songs.length; i += chunkSize) {
        trackChunks.push(playlist.songs.slice(i, i + chunkSize).join(","));
      }

      // Fetch song details for each chunk from Spotify
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

      // Flatten the array of song details
      const allSongs = songDetails.flat();

      // Send the response with the full playlist and populated songs
      res.status(200).json({ ...playlist.toObject(), songs: allSongs });
    } catch (error) {
      console.error("Error fetching playlist details:", error);
      res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(400).json({ message: "Playlist ID not provided" });
  }
});


module.exports = router;
