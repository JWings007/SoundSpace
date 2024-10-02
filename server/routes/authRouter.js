const router = require("express").Router();
const axios = require("axios");
const userModel = require("../models/UserSchema");
const refreshTokenModel = require("../models/RefreshTokenSchema");



function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const state = generateRandomString(10);


// ##'/login route'
router.get("/login", (req, res) => {
  const scopes =
    "user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-follow-read user-follow-modify user-top-read user-read-recently-played user-library-modify user-library-read";
  res.json({
    authUrl: `https://accounts.spotify.com/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&scope=${scopes}&redirect_uri=${process.env.REDIRECT_URI}&state=${state}`,
  });
});


// ##'/callback route'
router.get("/callback", async (req, res) => {
  if (req.query.state != state) {
    return res.status(401).json({
      message: "State mismatch",
      status: 401
    });
  }

  const creds = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${Buffer.from(creds).toString("base64")}`,
  };

  const requestBody = {
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: process.env.REDIRECT_URI,
  };

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams(requestBody).toString(),
      { headers: headers }
    );

    if (response) {
      const userResponse = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
          "Content-Type": "application/json",
        },
      });

      let user = await userModel.findOne({ uid: userResponse.data.id });

      if (user && response.data.refresh_token) {
        await refreshTokenModel.findOneAndUpdate(
          { user: user._id },
          {
            $set: {
              token: response.data.refresh_token,
              expireTime: Date.now() + response.data.expires_in * 1000
            },
          }
        );
        await userModel.findOneAndUpdate(
          { _id: user._id },
          {
            $set: {
              access_token: response.data.access_token,
            },
          }
        );
        console.log("only token refreshed");
      } else {
        user = new userModel({
          uid: userResponse.data.id,
          name: userResponse.data.display_name,
          email: userResponse.data.email,
          access_token: response.data.access_token,
          avatar: userResponse.data.images ? userResponse.data.images[1].url : ''
        });
        await user.save();
        let userToken = new refreshTokenModel({
          token: response.data.refresh_token,
          user: user._id,
          expireTime: Date.now() + response.data.expires_in * 1000
        });
        await userToken.save();

        console.log("user created");
      }
    }

    res.cookie("accessToken", response.data.access_token, {
      httpOnly: true,
      maxAge: response.data.expires_in * 1000,
    });

    res.cookie("refreshToken", response.data.refresh_token, {
      httpOnly: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:3000");
  } catch (err) {
    console.error("Error exchanging code for token:", err);
    res.redirect("http://localhost:3000/login");
  }
});

module.exports = router;
