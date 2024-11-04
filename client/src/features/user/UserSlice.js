import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {}
};

const UserSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        deleteUser: (state) => {
            state.user = {};
        }
    }
});

export const { setUser, deleteUser } = UserSlice.actions;
export default UserSlice.reducer;
