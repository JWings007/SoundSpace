import React, { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";
import _ from "lodash";
import { useDispatch } from "react-redux";
import { setPlaylist } from "../features/playlist/PlaylistSlice";

function EditPlaylist() {
  const [edit, setEdit] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [songs, setSongs] = useState([]);
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [editedData, setEditedData] = useState({
    name: "",
    desc: "",
    cover: "",
  });
  const [playlistData, setPlaylistData] = useState({
    name: "",
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

  const pid = useParams().pid;
  const dispatch = useDispatch();
  const storedPlaylist = useSelector((state) => state.playlists.playlist);
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (storedPlaylist.length === 0) {
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
      }
    };
    fetchPlaylists();
  }, [dispatch, storedPlaylist]);
  const playlist = useSelector((state) =>
    state.playlists.playlist.find((p) => p.pid === pid)
  );

  useEffect(() => {
    if (playlist && playlist.songs) {
      setSongs(playlist.songs);
      const list = [];
      playlist.songs.map((s) => {
        list.push(s.id);
      });
      setPlaylistData({
        ...playlistData,
        name: playlist.title,
        desc: playlist.description,
        cover: playlist.coverImage,
        songs: list,
      });
    }
  }, [playlist]);

  function previewImage(file, apply) {
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        if (apply == "save") {
          mainCoverRef.current.src = e.target.result;
          mainCoverBgRef.current.src = e.target.result;
        } else {
          previewRef.current.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
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

  const handleToggle = () => {
    setEdit(!edit);
  };

  const handleSave = async () => {
    let formData = new FormData();
    let pSongs = [];
    playlist.songs.map((s) => {
      pSongs.push(s.id);
    });
    if (playlist.title !== playlistData.name) {
      formData.append("title", playlistData.name);
    }
    if (playlist.description !== playlistData.desc) {
      formData.append("desc", playlistData.desc);
    }
    if (playlist.coverImage !== playlistData.cover) {
      formData.append("cover", playlistData.cover);
    }
    if (JSON.stringify(pSongs) !== JSON.stringify(playlistData.songs)) {
      formData.append("songs", JSON.stringify(playlistData.songs));
    }
    try {
      const response = await axios.post(
        "http://localhost:1060/api/playlist-update",
        formData,
        {
          withCredentials: true,
        }
      );
      if (response.data.status === 200) {
        toast.success(response.data.message);
        // try {
        //   const response = await axios.get(
        //     "http://localhost:1060/api/playlists",
        //     { withCredentials: true }
        //   );
        //   if (response.status === 200) {
        //     dispatch(setPlaylist(response.data));
        //   }
        // } catch (err) {
        //   console.log(err);
        // }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onDragStart = (e, dragIndex) => {
    e.dataTransfer.setData("dragIndex", dragIndex.toString());
  };

  const onDrop = (e, dropIndex) => {
    const dragIndex = parseInt(e.dataTransfer.getData("dragIndex"), 10);
    if (dragIndex === dropIndex) return;

    const draggedSong = songs[dragIndex];
    let updatedSongs = [...songs];
    let songIds = [];
    updatedSongs.splice(dragIndex, 1);
    updatedSongs.splice(dropIndex, 0, draggedSong);
    updatedSongs.map((s) => {
      songIds.push(s.id);
    });
    setSongs(updatedSongs);
    setPlaylistData({ ...playlistData, songs: songIds });
    setIsEdited(true);
  };

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
              {!editedData.cover ? (
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
                        setEditedData({
                          ...editedData,
                          cover: compressedFile,
                        });
                        previewImage(compressedFile, "preview");
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
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                />
                <textarea
                  type="text"
                  ref={descRef}
                  placeholder="Add description"
                  className="h-full outline-none pl-4 rounded-md border border-slate-500 pt-2 text-sm"
                  onChange={(e) =>
                    setEditedData({ ...editedData, desc: e.target.value })
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
                  previewImage(editedData.cover, "save");
                  setPlaylist({...playlistData, cover: editedData.cover})
                  toast.success("Playlist info saved");
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>


        {/* Songs Table */}
        <div className="mt-8 mb-8">
          <table className="table-auto w-full text-left">
            <thead className="border-b">
              <tr>
                <th className="p-2 font-semibold"></th>
                <th className="p-2 font-semibold">Title</th>
                <th className="p-2 font-semibold">Album</th>
                <th className="p-2 font-semibold">Duration</th>
                <th className="p-2 font-semibold">Preview</th>
                <th className="p-2 font-semibold text-right"></th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, index) => (
                <TableRow
                  key={index}
                  song={song}
                  index={index}
                  onDragStart={onDragStart}
                  onDrop={onDrop}
                />
              ))}
            </tbody>
          </table>
          {isEdited ? (
            <button
              className="bg-black px-5 py-3 text-white rounded-full text-sm mt-5 float-right"
              onClick={handleSave}
            >
              Save
            </button>
          ) : null}
        </div>

        <div className={`mt-"32"`}>
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
                        setSongs((prev) => [...prev, song]);
                        setIsEdited(true);
                        setPlaylistData({
                          ...playlistData,
                          songs: [...playlistData.songs, selectedTrack.id],
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
          <ToastContainer position="bottom-center" />
        </div>
      </div>
    </div>
  );
}

export default EditPlaylist;
