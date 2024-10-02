const refreshTokenModel = require("../models/RefreshTokenSchema");
const axios = require("axios");
const userModel = require("../models/UserSchema");

const refreshToken = async (storedToken) => {
  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: storedToken,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    const newAccessToken = response.data.access_token;
    const newExpirationTime = Date.now() + response.data.expires_in * 1000;

    return { newAccessToken, newExpirationTime };
  } catch (err) {
    console.error("Error refreshing access token:", err.message);
    throw new Error("Failed to refresh access token");
  }
};

const ensureSpotifyAccessToken = async (req, res, next) => {
  try {
    const storedRefreshToken = req.cookies.refreshToken;
    const storedAccessToken = req.cookies.accessToken;

    if (!storedRefreshToken) {
      console.error("No refresh token found in cookies");
      return res.status(401).json({ error: "Unauthorized: No refresh token" });
    }

    const refreshTokenDoc = await refreshTokenModel.findOne({
      token: storedRefreshToken,
    });

    if (!refreshTokenDoc) {
      console.error("Refresh token not found in the database");
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const { expireTime } = refreshTokenDoc;

    if (!storedAccessToken || Date.now() >= expireTime) {
      const newTokens = await refreshToken(storedRefreshToken);

      await refreshTokenModel.updateOne(
        { token: storedRefreshToken },
        { expireTime: newTokens.newExpirationTime }
      );

      const user = await userModel.findById(refreshTokenDoc.user);
      if (!user) {
        console.error("User not found for the refresh token");
        return res.status(401).json({ error: "Unauthorized: User not found" });
      }

      await userModel.updateOne(
        { _id: user._id },
        { access_token: newTokens.newAccessToken }
      );

      res.cookie("accessToken", newTokens.newAccessToken, {
        httpOnly: true,
        maxAge: newTokens.newExpirationTime - Date.now(),
      });

      res.cookie("refreshToken", storedRefreshToken, {
        httpOnly: true,
        maxAge: 2 * 24 * 60 * 60 * 1000,
      });

      req.accessToken = newTokens.newAccessToken;
      console.log("Token refreshed successfully");
    } else {
      req.accessToken = storedAccessToken;
    }
    next();
  } catch (error) {
    console.error("Error ensuring access token:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  ensureSpotifyAccessToken,
};
