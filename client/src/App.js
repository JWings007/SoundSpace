import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Feed from "./pages/Feed";
import CreatePlaylist from "./pages/CreatePlaylist";
import UserPlaylists from "./pages/UserPlaylists";
import EditPlaylist from "./pages/EditPlaylist";
import Profile from "./components/Profile";
import LoginPage from "./pages/LoginPage";
import NewPost from "./pages/NewPost";
import PostDetails from "./pages/PostDetails";
import SearchResults from "./components/SearchResults";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/create" element={<CreatePlaylist />} />
        <Route path="/playlists" element={<UserPlaylists />} />
        <Route path="/playlist/:pid" element={<EditPlaylist />} />
        <Route path="/profile/:uid" element={<Profile />} />
        <Route path="/create-post" element={<NewPost />} />
        <Route path="/view/:pid" element={<PostDetails />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
