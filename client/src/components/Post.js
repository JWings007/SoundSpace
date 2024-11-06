import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import { formatDuration } from "../utils/timeFormatter";

import io from "socket.io-client";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const socket = io("http://localhost:1060");

function Post(props) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likes, setLikes] = useState({});
  const [liked, setLiked] = useState({});

  const navigate = useNavigate();
  const storedUser = useSelector((state) => state.user.user);

  useEffect(() => {
    if (storedUser && hasMore) fetchPosts();
  }, [page]);

  const handleScroll = useCallback(
    debounce(() => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    }, 300),
    [loading, hasMore]
  );

  useEffect(() => {
    socket.on("new-post", (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    });

    return () => {
      socket.off("new-post");
    };
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const fetchPosts = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:1060/api/feed", {
        params: { page },
        withCredentials: true,
      });
      if (res.status === 200) {
        setPosts((prev) => [...prev, ...res.data]);
        setHasMore(res.data.length > 0);

        // Initialize liked and likes state based on fetched data
        const newLikes = {};
        const newLiked = {};
        res.data.forEach((post) => {
          newLikes[post.postId] = post.likes.length;
          newLiked[post.postId] = post.likes.some(
            (like) => like.name === storedUser.name
          );
        });
        setLikes((prev) => ({ ...prev, ...newLikes }));
        setLiked((prev) => ({ ...prev, ...newLiked }));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setLoading(false);
  };

  const handleLike = async (id) => {
    try {
      const res = await axios.post(
        "http://localhost:1060/api/user/like",
        { userId: storedUser.name, postId: id },
        { withCredentials: true }
      );

      if (res) {
        const isLiked = res.data.type === "Like"; // Determine if it's a like or unlike
        setLikes((prevLikes) => ({
          ...prevLikes,
          [id]: res.data.likes.length,
        }));
        setLiked((prev) => ({
          ...prev,
          [id]: isLiked, // Update liked status for specific post
        }));
      }
    } catch (err) {
      console.error("Error updating likes:", err);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center py-14 gap-14 pt-32">
      {posts?.map((post) => {
        return (
          <div
            key={post.postId}
            className="w-1/2 bg-white px-16 py-8 shadow-md rounded-lg"
          >
            <div className="pb-4 flex flex-col gap-5">
              {post.owner ? (
                <div className="flex items-center gap-5 text-sm justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={post.owner?.avatar}
                      alt=""
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    <p>{post.owner.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">
                      {dayjs().to(dayjs(post.createdAt))}
                    </p>
                  </div>
                </div>
              ) : (
                <i className="fi fi-rr-user flex items-center justify-center"></i>
              )}
              <div>
                <h1 className="text-xl font-semibold">{post.title}</h1>
                <div className="flex gap-3 mt-3 text-slate-600">
                  {post.playlist.artists.split(", ").length > 4
                    ? post.playlist.artists
                        .split(", ")
                        .slice(0, 4)
                        .map((artist, i) => {
                          return (
                            <div>
                              <span key={i}>{artist}</span>
                              {i !== 3 ? (
                                <span className="pl-2">{"•"}</span>
                              ) : (
                                <span> and more</span>
                              )}
                            </div>
                          );
                        })
                    : post.playlist.artists.split(", ").map((artist, i) => {
                        return (
                          <div>
                            <span key={i}>{artist}</span>
                            {post.playlist.artists.split(", ").length - 1 !==
                            i ? (
                              <span className="pl-2">{"•"}</span>
                            ) : null}
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
            <div
              className="flex items-center justify-center mb-10 bg-red-200 relative overflow-hidden py-20 group cursor-pointer"
              onClick={() => navigate(`/view/${post.playlist.pid}`)}
            >
              <img
                src={post.coverImage}
                alt=""
                className="absolute top-0 left-0 w-full object-center blur-xl group-hover:scale-125 transition-all duration-700"
              />
              <img
                src={post.coverImage}
                alt=""
                className="w-60 h-60 rounded-md z-30 group-hover:scale-110 transition-all duration-300 object-cover"
              />
            </div>
            <div className="flex items-start gap-6 pb-5">
              <div
                className="flex gap-2 cursor-pointer"
                onClick={() => handleLike(post.postId)}
              >
                <i
                  className={`fi fi-rr-heart flex items-center justify-center text-xl ${
                    liked[post.postId] ? "text-red-600" : ""
                  }`}
                ></i>
                <span>{likes[post.postId] || post.likes.length}</span>
              </div>
              <div
                className="flex gap-2 cursor-pointer"
                onClick={() => {
                  props.setCommentState();
                  props.setPostID(post.postId);
                }}
              >
                <i className="fi fi-rr-messages flex items-center justify-center text-xl"></i>{" "}
                <span>{post.comments.length}</span>
              </div>
              <div className="flex gap-2 cursor-pointer">
                <i className="fi fi-rr-paper-plane flex items-center justify-center text-xl"></i>{" "}
                <span>200</span>
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="pb-4 w-3/4">{post.description}</p>
                <div className="flex gap-4">
                  <span className="text-gray-500">
                    {post.playlist.songs.length} songs
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">
                    {formatDuration(post.playlist.duration)}
                  </span>
                </div>
              </div>
              <div className="w-1/4 flex justify-end items-start">
                <button className="w-20 h-20 rounded-[50%] bg-green-300">
                  <i className="fi fi-brands-spotify text-3xl flex items-center justify-center"></i>
                </button>
              </div>
            </div>
            <div className="flex gap-4 pt-5 flex-wrap">
              {post.tags.map((tag, i) => (
                <span key={i} className="text-purple-500">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Post;
