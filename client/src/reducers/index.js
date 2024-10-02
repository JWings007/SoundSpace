import { combineReducers } from '@reduxjs/toolkit';
import userReducer from '../features/user/UserSlice'
import playlistReducer from '../features/playlist/PlaylistSlice'

const rootReducer = combineReducers({
    user: userReducer,
    playlists: playlistReducer
})

export default rootReducer;