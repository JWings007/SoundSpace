import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Post from "../components/Post";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../features/user/UserSlice";
import axios from "axios";
import Comments from "../components/Comments";

function Feed() {
  const dispatch = useDispatch();
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [postId, setPostId] = useState("");

  const handleSetPostID = useCallback((id) => {
    setPostId(id);
    setIsCommentOpen(true);
  }, []);

  const commentClose = () => {
    setIsCommentOpen(false);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const res = await axios.get("http://localhost:1060/api/me", {
        withCredentials: true,
      });
      if (res) {
        dispatch(setUser(res.data));
      }
    };
    try {
      fetchUser();
    } catch (err) {
      console.log(err);
    }
  }, []);

  const navigate = useNavigate();
  return (
    <div className="relative h-fit">
      <Navbar />
      <Post
        setCommentState={() => setIsCommentOpen(!isCommentOpen)}
        setPostID={handleSetPostID}
      />
      <Comments isCommentOpen={isCommentOpen} commentClose={commentClose} postId={postId}/>
      <button
        className="fixed bottom-[5%] right-[4%] bg-black p-8 rounded-[50%] group"
        onClick={() => navigate("/create")}
      >
        <i className="fi fi-rr-list-music text-white flex items-center justify-center group-hover:scale-150 transition-all duration-200"></i>
      </button>
    </div>
  );
}

export default Feed;
