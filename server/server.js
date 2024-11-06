const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

global.io = io;

// Import routers
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const playlistRouter = require("./routes/PlaylistRouter");
const searchRouter = require("./routes/searchRouter");

// DATABASE CONNECTION
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://localhost:27017/soundspaceDB").then(() => {
  console.log("Database connected successfully");
});

// ESSENTIAL SETTINGS
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Setup routes
app.use("/api/auth", authRouter);
app.use("/api", userRouter);
app.use("/api", playlistRouter);
app.use("/api", searchRouter);

// Start the server
const PORT = process.env.PORT || 1060;
server.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
