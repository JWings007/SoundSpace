const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
require('dotenv').config();
const app = express();

//Router imports

const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const playlistRouter = require('./routes/PlaylistRouter');


// DATABASE CONNECTION
mongoose.set('strictQuery', false)
mongoose.connect('mongodb://localhost:27017/soundspaceDB')
.then(() => {
    console.log("Database connected successfully")
})

//ESSENTIAL SETTINGS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())


//ROUTES


app.use('/api/auth', authRouter);
app.use('/api', userRouter)
app.use('/api', playlistRouter)

app.listen(1060, () => {
    console.log('Server started at post 1060');
    
})