import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    playlist: []
};

const PlaylistSlice = createSlice({
    name: 'playlist',
    initialState,
    reducers: {
        setPlaylist: (state, action) => {
            state.playlist = action.payload
        },
        addPlaylist: (state, action) => {
            state.playlist.push(action.payload)
        },
        clearPlaylist: (state) => {
            state.playlist = []
        }
    }
})

export const { setPlaylist, addPlaylist, clearPlaylists, setLoading } = PlaylistSlice.actions;
export default PlaylistSlice.reducer;