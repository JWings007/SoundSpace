import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPlaylist } from "../features/playlist/PlaylistSlice";

function UserPlaylists() {
  const dispatch = useDispatch();
  const playlist = useSelector((state) => state.playlists.playlist);
  const navigate = useNavigate();
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!isFetched && playlist.length === 0) { // Only fetch if not fetched before
        try {
          const response = await axios.get(
            "http://localhost:1060/api/playlists",
            { withCredentials: true }
          );
          if (response.status === 200) {
            dispatch(setPlaylist(response.data));
          }
          setIsFetched(true); // Set the flag to prevent multiple requests
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchPlaylists();
  }, [dispatch, isFetched]);

  return (
    <div>
      <Navbar />
      <div className="pt-32 px-16 grid grid-cols-6 gap-5">
        <button
          className="fixed bottom-[5%] right-[4%] bg-black p-8 rounded-[50%] group"
          onClick={() => navigate("/create")}
        >
          <i className="fi fi-rr-list-music text-white flex items-center justify-center group-hover:scale-150 transition-all duration-200"></i>
        </button>
        {playlist.length > 0 ? (
          playlist.map((p, i) => {
            return (
              <div
                className="px-5 py-3 flex h-80 items-start justify-start flex-col rounded-lg relative shadow-md overflow-hidden group cursor-pointer w-fit"
                onClick={() => navigate(`/playlist/${p.pid}`)}
                key={i}
              >
                <img
                  src={p.coverImage}
                  alt=""
                  className="absolute object-cover w-full h-full -z-10 blur-3xl group-hover:scale-125 transition-all duration-700"
                />
                <div className="mb-3">
                  <img
                    src={p.coverImage}
                    alt=""
                    className="w-52 h-52 object-cover rounded-md"
                  />
                </div>
                <div>
                  <h1
                    className="text-md font-semibold"
                    style={{ textShadow: "0px 0px 15px #ffffff" }}
                  >
                    {p.title}
                  </h1>
                  <div>
                    <span className="text-gray-500 text-sm">{p.artists.slice(0, 22) + '...'}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No playlists available</p>
        )}
      </div>
    </div>
  );
}

export default UserPlaylists;
