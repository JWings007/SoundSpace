import React, { useState, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import _ from "lodash";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";
import { useDispatch } from "react-redux";
import { setPlaylist } from "../features/playlist/PlaylistSlice";

function CreatePlaylist() {
  const [edit, setEdit] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState();
  const [selectedList, setSelectedList] = useState([]);
  const [playlistData, setPlaylistData] = useState({
    name: "Playlist 5036",
    desc: "",
    cover: "",
    songs: [],
  });
  const nameRef = useRef();
  const descRef = useRef();
  const fileRef = useRef();
  const previewRef = useRef();
  const mainCoverRef = useRef();
  const mainCoverBgRef = useRef();

  const dispatch = useDispatch();

  const handleToggle = () => {
    setEdit(!edit);
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", playlistData.name);
    formData.append("desc", playlistData.desc);
    formData.append("cover", playlistData.cover);
    formData.append("songIds", JSON.stringify(playlistData.songs));
    try {
      const response = await axios.post(
        "http://localhost:1060/api/playlist-create",
        formData,
        {
          withCredentials: true,
        }
      );
      if (response.data.status === 200){
        toast.success(response.data.message)
        try {
          const response = await axios.get(
            "http://localhost:1060/api/playlists",
            { withCredentials: true }
          );
          if (response.status === 200) {
            dispatch(setPlaylist(response.data));
          }
        } catch (err) {
          console.log(err);
        }
      };
    } catch (err) {
      console.log(err);
    }
  };

  function previewImage(file) {
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        previewRef.current.src = e.target.result;
        mainCoverRef.current.src = e.target.result;
        mainCoverBgRef.current.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function timeConverter(ms) {
    let mins = Math.floor(ms / 1000 / 60);
    let secs = Math.floor((ms / 1000) % 60);
    secs = secs < 10 ? "0" + secs : secs;

    return `${mins}:${secs}`;
  }

  const fetchSearchResults = async (searchQuery) => {
    if (searchQuery) {
      try {
        const result = await axios.get(
          `http://localhost:1060/api/search/${searchQuery}`,
          {
            withCredentials: true,
          }
        );
        if (result) {
          setResults(result.data.tracks.items);
        }
      } catch (err) {
        console.log("error in fetching songs", err);
      }
    }
  };

  const debouncedSearch = useCallback(
    _.debounce((searchQuery) => fetchSearchResults(searchQuery), 500),
    []
  );
  return (
    <div>
      <Navbar />
      <div className="pt-32 px-16 relative">
        <div
          className={`${
            edit ? "flex" : "hidden"
          } items-center justify-center w-[calc(100%-8rem)] h-[calc(100vh-8rem)] bg-white/30 backdrop-blur-md absolute z-30 rounded-lg`}
        >
          <form
            className="bg-white px-16 py-8 rounded-lg shadow-2xl"
            method="POST"
            encType="multipart/form-data"
          >
            <div className="flex justify-between items-center mb-7">
              <h2 className="text-2xl font-semibold">Edit playlist</h2>
              <i
                className="fi fi-rr-cross-small flex items-center justify-center text-2xl hover:bg-gray-300 rounded-full p-3 transition-all cursor-pointer"
                onClick={handleToggle}
              ></i>
            </div>
            <div className="flex gap-5">
              {!playlistData.cover ? (
                <div
                  className="w-40 h-40 rounded-md bg-slate-400 flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-all"
                  onClick={() => fileRef.current.click()}
                >
                  <i className="fi fi-rr-add-image flex justify-center items-center text-3xl"></i>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileRef}
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      const options = {
                        maxSizeMB: 1, // Maximum file size (in MB)
                        maxWidthOrHeight: 800, // Max width/height of the image
                        useWebWorker: true, // Use a web worker for faster compression
                      };

                      try {
                        const compressedFile = await imageCompression(
                          file,
                          options
                        );
                        console.log("Compressed file:", compressedFile);
                        setPlaylistData({
                          ...playlistData,
                          cover: compressedFile,
                        });
                        previewImage(compressedFile);
                      } catch (error) {
                        console.error("Error during compression:", error);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-40 h-40 rounded-md bg-red-200 overflow-hidden">
                  <img
                    src=""
                    alt=""
                    ref={previewRef}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Add a name"
                  ref={nameRef}
                  className="min-h-10 outline-none pl-4 rounded-md border border-slate-500 text-sm"
                  onChange={(e) =>
                    setPlaylistData({ ...playlistData, name: e.target.value })
                  }
                />
                <textarea
                  type="text"
                  ref={descRef}
                  placeholder="Add description"
                  className="h-full outline-none pl-4 rounded-md border border-slate-500 pt-2 text-sm"
                  onChange={(e) =>
                    setPlaylistData({ ...playlistData, desc: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="w-full flex justify-end mt-5">
              <button
                className="px-6 bg-black text-white py-3 rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  nameRef.current.value = "";
                  descRef.current.value = "";
                  handleToggle();
                  toast.success("Playlist info saved");
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
        <div className="flex items-center h-[50vh] overflow-hidden relative rounded-lg px-8">
          <button
            className="absolute right-[2%] top-[5%] bg-black p-5 rounded-[50%]"
            onClick={handleToggle}
          >
            <i className="fi fi-rr-file-edit flex items-center justify-center text-white"></i>
          </button>
          <img
            src="https://ibighit.com/bts/images/bts/discography/love_yourself-her/album-cover.jpg"
            alt=""
            className="blur-3xl absolute -z-10 top-0 object-cover w-full"
            ref={mainCoverBgRef}
          />
          <div className="w-1/2">
            <img
              src="https://ibighit.com/bts/images/bts/discography/love_yourself-her/album-cover.jpg"
              alt=""
              className="w-72 h-72 shadow-lg rounded-lg object-cover"
              ref={mainCoverRef}
            />
          </div>
          <div className="w-1/2">
            <p>Playlist</p>
            <h1 className="text-3xl font-bold pb-5">{playlistData.name}</h1>
            <p>{playlistData.desc}</p>
            <div className="flex gap-5">
              <span className="text-slate-800">1 song</span>
              <span className="text-slate-800">•</span>
              <span className="text-slate-800">2 hrs 5 mins</span>
            </div>
          </div>
        </div>
        {selectedList && (
          <div className="mt-8 mb-8">
            <table className="table-auto w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="p-2 font-semibold"></th>
                  <th className="p-2 font-semibold">Title</th>
                  <th className="p-2 font-semibold">Album</th>
                  <th className="p-2 font-semibold">Duration</th>
                  <th className="p-2 font-semibold text-right"></th>
                  <th className="p-2 font-semibold text-right">Options</th>
                </tr>
              </thead>
              <tbody>
                {selectedList.map((track, i) => {
                  return (
                    <tr className="" key={i}>
                      <td className="p-2 text-sm">{i + 1}</td>
                      <td className="p-2 flex items-center space-x-4 text-sm">
                        <img
                          src={track.album.images[0].url}
                          alt="Album cover"
                          className="w-10 h-10"
                        />
                        <div>
                          <p className="font-medium">{track.name}</p>
                          <p className="text-sm text-gray-400">
                            {track.artists[0].name}
                          </p>
                        </div>
                      </td>
                      <td className="p-2 text-sm">{track.album.name}</td>
                      <td className="p-2 text-sm">
                        {timeConverter(track.duration_ms)}
                      </td>
                      <td className="p-2 text-right text-sm">
                        <i className="fi fi-rr-play"></i>
                      </td>
                      <td
                        className="p-2 text-right text-xl text-red-500 hover:bg-red-300 hover:text-black transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedList(
                            selectedList.filter((song) => song.id !== track.id)
                          );
                          setPlaylistData({
                            ...playlistData,
                            songs: playlistData.songs.filter(
                              (s) => s != track.id
                            ),
                          });
                        }}
                      >
                        <i className="fi fi-rr-minus-small"></i>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {selectedList.length > 0 && (
          <div className="flex items-center justify-end">
            <button
              className="bg-black px-5 py-3 text-white rounded-full text-sm mt-5"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        )}
        <div className={`mt-${selectedList.length === 0 ? "32" : "5"}`}>
          <div>
            <h1 className="text-xl font-semibold pb-3">
              Find somthing for the playlist
            </h1>
            <input
              type="text"
              className="h-10 outline-none border border-slate-400 rounded-md pl-5 text-sm w-[20rem]"
              placeholder="Search for songs"
              onChange={(e) => {
                setQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
            />
          </div>
          {results && (
            <div className="mt-5 flex flex-col gap-1">
              {results.map((song, i) => {
                return (
                  <div
                    className="flex justify-between items-center w-full px-3 py-2 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
                    key={i}
                  >
                    <div className="flex items-center gap-7 w-1/2">
                      <img
                        src={song.album.images[0].url}
                        alt=""
                        className="w-12 rounded-md"
                      />
                      <div className="">
                        <h2 className="text-sm font-semibold">{song.name}</h2>
                        <p className="text-sm text-slate-500">
                          {song.artists[0].name}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-sm">{song.album.name}</h2>
                    </div>
                    <button
                      className="bg-black text-white px-4 py-2 rounded-full text-sm"
                      onClick={() => {
                        const selectedTrack = song;
                        setSelectedList([...selectedList, selectedTrack]);
                        setPlaylistData({
                          ...playlistData,
                          songs: [...playlistData.songs, song.id],
                        });
                        toast.success("Song added successfully!");
                      }}
                    >
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatePlaylist;
