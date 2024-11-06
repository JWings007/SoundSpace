const {
  ensureSpotifyAccessToken,
} = require("../middlewares/ensureAuthorization");
const Playlist = require("../models/PlaylistSchema");
const User = require("../models/UserSchema");
const router = require("express").Router();


router.post("/search", ensureSpotifyAccessToken, async (req, res) => {
  const { query } = req.body;
  const results = {
    users: [],
    playlists: [],
  };
  if (query) {
    const playlistTerms = query.split(" ").map((term) => ({
      title: { $regex: term, $options: "i" },
    }));
    const userTerms = query.split(" ").map((term) => ({
      name: { $regex: term, $options: "i" },
    }));
    const playlists = await Playlist.find({
      $and: playlistTerms,
    }, {_id: 0, owner: 0});
    const users = await User.find({
      $and: userTerms,
    }).select("-_id name avatar uid").populate({
      path: "posts",
      select: "-_id -owner"
    })

    if (users) {
      results.users = users;
    }
    if (playlists) {
      results.playlists = playlists;
    }
    res.send(results);
  }
});

module.exports = router;
