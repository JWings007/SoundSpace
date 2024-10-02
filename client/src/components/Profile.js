import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState();
  useEffect(() => {
    const fetchUser = () => {
      axios
        .get("http://localhost:1060/api/me", {
          withCredentials: true,
        })
        .then((response) => {
          setUser(response.data);
        });
    };
    try {
      fetchUser();
    } catch (err) {
      console.log(err);
    }
  }, []);
  return (
    <div>
      <Navbar />
      {user && (
        <div className="pt-32 px-16">
          <div className="flex flex-col items-center relative">
            <button className="absolute top-0 right-0 bg-black p-5 rounded-[50%] group">
              <i className="fi fi-rr-edit text-white flex items-center justify-center group-hover:scale-110 transition-all duration-200"></i>
            </button>
            <div className="flex items-center justify-center rounded-[50%] overflow-hidden w-44 h-44 mb-7">
              <img src={user.avatar} alt="" className="w-44 rounded-[50%]" />
            </div>
            <div className="flex items-center justify-center flex-col">
              <p className="text-center text-slate-400 pb-3">{user.tagline}</p>
              <h1 className="text-center text-3xl font-semibold pb-5">
                {user.name}
              </h1>
              <p className="text-center w-3/4 text-sm">{user.bio}</p>
            </div>
            <div className="flex gap-32 mt-12">
              <div>
                <h2 className="text-center text-lg font-medium">Followers</h2>
                <p className="text-center text-slate-500 text-sm">1.2M</p>
              </div>
              <div>
                <h2 className="text-center text-lg font-medium">Posts</h2>
                <p className="text-center text-slate-500 text-sm">106</p>
              </div>
              <div>
                <h2 className="text-center text-lg font-medium">Following</h2>
                <p className="text-center text-slate-500 text-sm">0</p>
              </div>
            </div>
            <div className="mt-12">
              <button className="bg-black text-white text-sm px-12 py-3 rounded-md">
                Follow
              </button>
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
              <div className="px-5 py-3 flex items-center justify-center flex-col rounded-lg relative shadow-md overflow-hidden group cursor-pointer">
                <img
                  src="https://ibighit.com/bts/images/bts/discography/proof/discography-cover.png"
                  alt=""
                  className="absolute object-cover w-full h-full -z-10 blur-xl group-hover:scale-125 transition-all duration-700"
                />
                <div className="mb-3">
                  <img
                    src="https://ibighit.com/bts/images/bts/discography/proof/discography-cover.png"
                    alt=""
                    className="w-48 rounded-md"
                  />
                </div>
                <div className="">
                  <h1 className="text-xl font-semibold">
                    Butter - Afternoon Banger by BTS
                  </h1>
                  <div>
                    <span className="text-black text-sm">
                      BTS, Twice, Blackpink
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 flex items-center justify-center flex-col rounded-lg relative shadow-md overflow-hidden group cursor-pointer">
                <img
                  src="https://ibighit.com/bts/images/bts/discography/butter-2/butter-2-cover.jpg"
                  alt=""
                  className="absolute object-cover w-full h-full -z-10 blur-xl group-hover:scale-125 transition-all duration-700"
                />
                <div className="mb-3">
                  <img
                    src="https://ibighit.com/bts/images/bts/discography/butter-2/butter-2-cover.jpg"
                    alt=""
                    className="w-48 rounded-md"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">
                    Butter - Afternoon Banger by BTS
                  </h1>
                  <div>
                    <span className="text-gray-500 text-sm">
                      BTS, Twice, Blackpink
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 flex items-center justify-center flex-col rounded-lg relative shadow-md overflow-hidden group cursor-pointer">
                <img
                  src="https://i.pinimg.com/550x/e8/d7/3b/e8d73b195def8575e75c0f5e0d932f12.jpg"
                  alt=""
                  className="absolute object-cover w-full h-full -z-10 blur-xl group-hover:scale-125 transition-all duration-700"
                />
                <div className="mb-3">
                  <img
                    src="https://i.pinimg.com/550x/e8/d7/3b/e8d73b195def8575e75c0f5e0d932f12.jpg"
                    alt=""
                    className="w-48 rounded-md"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">
                    Butter - Afternoon Banger by BTS
                  </h1>
                  <div>
                    <span className="text-black text-sm">
                      BTS, Twice, Blackpink
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
