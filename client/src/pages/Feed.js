import React from "react";
import Navbar from "../components/Navbar";
import Post from "../components/Post";
import {useNavigate} from 'react-router-dom'

function Feed() {
  const navigate = useNavigate();
  return (
      <div className="">
        <Navbar />
        <Post />
        <button className="fixed bottom-[5%] right-[4%] bg-black p-8 rounded-[50%] group" onClick={() => navigate('/create')}><i className="fi fi-rr-list-music text-white flex items-center justify-center group-hover:scale-150 transition-all duration-200"></i></button>
      </div>
  );
}

export default Feed;
