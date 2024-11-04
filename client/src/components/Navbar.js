import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SearchResults from "./SearchResults";
import axios from "axios";
import { useSelector } from "react-redux";

function Navbar() {
  const navigate = useNavigate();
  const queryRef = useRef();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState({ users: [], playlists: [] });
  const storedUser = useSelector((state) => state.user.user);
  const uid = useParams().uid;

  const setQuery = (query) => {
    setSearchQuery(query)
    queryRef.current.value = ""
  }

  const handleSearch = async () => {
    try {
      const res = await axios.post(
        "http://localhost:1060/api/search",
        { query: searchQuery },
        {
          withCredentials: true,
        }
      );
      setResults(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full flex items-center justify-between px-16 py-8 bg-white/30 fixed z-50 backdrop-blur-xl shadow-md">
      <SearchResults query={searchQuery} results={results} setQuery={setQuery}/>
      <div className="w-[50%]">
        <h1 className="text-3xl font-bold">
          SoundSpace<span className="text-purple-500">.</span>
        </h1>
      </div>
      <div className="flex items-center justify-center gap-14">
        <div className="flex  items-center gap-10 justify-center">
          <i
            className="fi fi-rr-house-blank flex items-center justify-center text-2xl hover:-translate-y-2 transition-all hover:text-slate-500 cursor-pointer py-2"
            onClick={() => {
              navigate("/");
              queryRef.current.value = "";
              setSearchQuery("");
            }}
          ></i>
          <i
            className="fi fi-rr-list-music flex items-center justify-center text-2xl hover:-translate-y-2 transition-all hover:text-slate-500 cursor-pointer py-2"
            onClick={() => {
              navigate("/playlists");
              queryRef.current.value = "";
              setSearchQuery("");
            }}
          ></i>
          <i
            className="fi fi-rr-multiple flex items-center justify-center text-2xl hover:-translate-y-2 transition-all hover:text-slate-500 cursor-pointer py-2"
            onClick={() => {
              navigate("/create-post");
              queryRef.current.value = "";
              setSearchQuery("");
            }}
          ></i>
          <i
            className="fi fi-rr-bell-ring flex items-center justify-center text-2xl hover:-translate-y-2 transition-all hover:text-slate-500 cursor-pointer py-2"
            onClick={() => {
              navigate(`/profile/${storedUser.name}`);
              queryRef.current.value = "";
              setSearchQuery("");
            }}
          ></i>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search playlists, users..."
            className="h-10 w-[23rem] pl-5 pr-10 outline-none rounded-md text-sm border border-slate-400"
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            ref={queryRef}
          />
          <i
            className="fi fi-rr-search absolute top-0 right-0 h-full flex items-center justify-center w-10 rounded-md cursor-pointer"
            onClick={handleSearch}
          ></i>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
