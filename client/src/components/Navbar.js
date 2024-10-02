import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex items-center justify-between px-16 py-8 bg-white/30 fixed z-50 backdrop-blur-xl shadow-md">
      <div className="w-[50%]">
        <h1 className="text-3xl font-bold">
          SoundSpace<span className="text-purple-500">.</span>
        </h1>
      </div>
      <div className="flex items-center justify-center gap-14">
        <div className="flex  items-center gap-10 justify-center">
          <i
            className="fi fi-rr-house-blank flex items-center justify-center text-2xl hover:-translate-y-2 transition-all hover:text-slate-500 cursor-pointer py-2"
            onClick={() => navigate("/")}
          ></i>
          <i
            className="fi fi-rr-list-music flex items-center justify-center text-2xl hover:-translate-y-2 transition-all hover:text-slate-500 cursor-pointer py-2"
            onClick={() => navigate("/playlists")}
          ></i>
          <i className="fi fi-rr-multiple flex items-center justify-center text-2xl hover:-translate-y-2 transition-all hover:text-slate-500 cursor-pointer py-2"
          onClick={() => navigate("/create-post")}
          ></i>
          <i
            className="fi fi-rr-bell-ring flex items-center justify-center text-2xl hover:-translate-y-2 transition-all hover:text-slate-500 cursor-pointer py-2"
            onClick={() => navigate("/profile")}
          ></i>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search playlists, users..."
            className="h-10 w-[23rem] pl-5 pr-10 outline-none rounded-md text-sm border border-slate-400"
          />
          <i className="fi fi-rr-search absolute top-0 right-0 h-full flex items-center justify-center w-10 rounded-md"></i>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
