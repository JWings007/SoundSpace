import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { setUser } from "../features/user/UserSlice";
import axios from "axios";
import { toast } from "react-toastify";

function Profile() {
  const [currentUser, setCurrentUser] = useState();
  const [refresher, setRefresher] = useState(0);
  const storedUser = useSelector((state) => state.user.user);
  const username = useParams().uid;
  const buttonRef = useRef();
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1060/api/profile/${username}`,
          {
            withCredentials: true,
          }
        );
        const mainRes = await axios.get("http://localhost:1060/api/me", {
          withCredentials: true,
        });
        if (mainRes) {
          dispatch(setUser(mainRes.data));
        }

        if (res.status === 200) {
          setCurrentUser(res.data);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, [username, refresher]);

  const handleFollow = async () => {
    try {
      const res = await axios.post(
        "http://localhost:1060/api/user/follow",
        { userId: storedUser.name, targetUserId: currentUser.name },
        {
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        toast.success(res.data.message);
        buttonRef.current.innerText = res.data.type;
      }
      setRefresher(Math.random());
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Navbar />
      {currentUser && (
        <div className="pt-32 px-16">
          <div className="flex flex-col items-center relative">
            <button className="absolute top-0 right-0 bg-black p-5 rounded-[50%] group">
              <i className="fi fi-rr-edit text-white flex items-center justify-center group-hover:scale-110 transition-all duration-200"></i>
            </button>
            <div className="flex items-center justify-center rounded-[50%] overflow-hidden w-44 h-44 mb-7">
              <img
                src={currentUser.avatar}
                alt=""
                className="w-44 rounded-[50%]"
              />
            </div>
            <div className="flex items-center justify-center flex-col">
              <p className="text-center text-slate-400 pb-3">
                {currentUser.tagline}
              </p>
              <h1 className="text-center text-3xl font-semibold pb-5">
                {currentUser.name}
              </h1>
              <p className="text-center w-3/4 text-sm">{currentUser.bio}</p>
            </div>
            <div className="flex gap-32 mt-12">
              <div>
                <h2 className="text-center text-lg font-medium">Followers</h2>
                <p className="text-center text-slate-500 text-sm">
                  {currentUser.followers.length}
                </p>
              </div>
              <div>
                <h2 className="text-center text-lg font-medium">Posts</h2>
                <p className="text-center text-slate-500 text-sm">
                  {currentUser.posts.length}
                </p>
              </div>
              <div>
                <h2 className="text-center text-lg font-medium">Following</h2>
                <p className="text-center text-slate-500 text-sm">
                  {currentUser.following.length}
                </p>
              </div>
            </div>
            <div className="mt-12">
              {storedUser.name !== currentUser.name ? (
                <button
                  className="bg-black text-white text-sm px-12 py-3 rounded-md"
                  onClick={handleFollow}
                  ref={buttonRef}
                >
                  {currentUser.followers.filter(user => user.name === storedUser.name).length > 0 ? "Unfollow" : "Follow"}
                </button>
              ) : null}
            </div>
          </div>
          <div className="mt-10">
            <div className="flex items-center justify-center gap-20 py-7">
              <div>
                <h1 className="font-semibold cursor-pointer border-t-[3px] border-t-black py-4">
                  POSTS
                </h1>
              </div>
              <div>
                <h1 className="text-slate-400 cursor-pointer">SAVED</h1>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-5">
              {currentUser
                ? currentUser.posts.map((post, i) => {
                    return (
                      <div className="px-5 py-3 flex items-center justify-center flex-col rounded-lg relative shadow-md overflow-hidden group cursor-pointer">
                        <img
                          src={post.coverImage}
                          alt=""
                          className="absolute object-cover w-full h-full -z-10 blur-xl group-hover:scale-125 transition-all duration-700"
                        />
                        <div className="mb-3">
                          <img
                            src={post.coverImage}
                            alt=""
                            className="w-60 h-60 rounded-md object-cover"
                          />
                        </div>
                        <div className="text-center">
                          <h1 className="text-xl font-semibold">
                            {post.title}
                          </h1>
                          <div>
                            <span className="text-black text-sm">
                              BTS, Twice, Blackpink
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
