import React, { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import { useDispatch } from "react-redux";
import { setPlaylist } from "../features/playlist/PlaylistSlice";
import { useSelector } from "react-redux";
import PlaylistHeader from "../components/PlaylistHeader";
import { useParams } from "react-router-dom";
import axios from "axios";
import EditOverlay from "../components/EditOverlay";
import SongFinder from "../components/SongFinder";
import { ToastContainer, toast } from "react-toastify";
import { timeConverter } from "../utils/timeFormatter";


const TableRow = ({ song, index, onDragStart, onDrop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  function autoScroll(e) {
    const threshold = 130;
    if (e.clientY < threshold) {
      window.scrollBy(0, -5);
    } else if (window.innerHeight - e.clientY < threshold) {
      window.scrollBy(0, 10);
    }
  }

  const handlePlayPauseClick = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <tr
      className={`${isDragging ? "dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        autoScroll(e);
      }}
      onDrop={(e) => onDrop(e, index)}
    >
      <td className="p-2 text-sm">{index + 1}</td>
      <td className="p-2 flex items-center space-x-4 text-sm">
        <img
          src={song.album.images[0].url}
          alt="Album cover"
          className="w-10 h-10 rounded-md mic-shadow"
        />
        <div>
          <p className="font-medium">{song.name}</p>
          <p className="text-sm text-gray-400">
            {song.artists.map((artist) => artist.name).join(", ")}
          </p>
        </div>
      </td>
      <td className="p-2 text-sm">{song.album.name.length > 30 ? song.album.name.slice(0, 30) + ' ...' : song.album.name}</td>
      <td className="p-2 text-sm">{timeConverter(song.duration_ms)}</td>
      <td className="p-2 text-sm pl-8 text-left">
        <i
          className={`fi fi-rr-${isPlaying ? "pause pulse" : "play"} cursor-pointer flex items-center justify-start w-fit p-[10px] rounded-[50%]`}
          onClick={handlePlayPauseClick}
        ></i>
        <audio src={song.preview_url} ref={audioRef} />
      </td>
      <td className="p-2 text-right text-sm">
        <i
          className={`fi fi-rr-menu-burger ${
            isDragging ? "grabbing" : "grab"
          } text-gray-400`}
          draggable
          onDragStart={(e) => {
            setIsDragging(true);
            onDragStart(e, index);
          }}
          onDragEnd={(e) => {
            setIsDragging(false);
          }}
        ></i>
      </td>
    </tr>
  );
};

function EditPlaylist() {
  const pid = useParams().pid;
  const storedPlaylist = useSelector((state) => state.playlists.playlist);
  const playlist = useSelector((state) =>
    state.playlists.playlist.find((p) => p.pid === pid)
  );
  const [edit, setEdit] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [songs, setSongs] = useState([]);
  const [playlistData, setPlaylistData] = useState({
    name: "",
    desc: "",
    cover: null,
    songs: [],
  });
  const [editedData, setEditedData] = useState({
    name: "",
    desc: "",
    cover: null,
  });

  const dispatch = useDispatch();
  const mainCoverRef = useRef();
  const mainCoverBgRef = useRef();

  //FUNCTIONS

  const updateEditedData = (data) => {
    setEditedData({ ...editedData, ...data });
  };

  const updatePlaylistData = (data) => {
    setPlaylistData({ ...playlistData, ...data });
    setIsEdited(true)
  };

  const updateSongs = (data) => {
    setSongs(data);
    setIsEdited(true)
  };

  const updateIsEdited = (data) => {
    setIsEdited(true);
  };

  const handleToggle = () => {
    setEdit(!edit);
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

  const handleSave = async () => {
    let formData = new FormData();
    formData.append("pid", playlist.pid);
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
      formData.append("oldCover", playlist.coverImage);
    }
    if (JSON.stringify(pSongs) !== JSON.stringify(playlistData.songs)) {
      formData.append("songs", JSON.stringify(playlistData.songs));
    }

    if (formData) {
      try {
        const response = await axios.post(
          "http://localhost:1060/api/playlist-update",
          formData,
          {
            withCredentials: true,
          }
        );
        if (response.data.status === 200) {
          setIsEdited(false);
          toast.success(response.data.message);
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
      } catch (err) {
        console.log(err);
      }
    }
  };

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

  return (
    <>
      <Navbar />
      <div className="pt-32 px-16 relative">
        <EditOverlay
          ref={{ mainCoverRef, mainCoverBgRef }}
          handleToggle={handleToggle}
          edit={edit}
          updateIsEdited={updateIsEdited}
          editedData={editedData}
          playlistData={playlistData}
          updateEditedData={updateEditedData}
          updatePlaylistData={updatePlaylistData}
        />
        <PlaylistHeader
          ref={{ mainCoverRef, mainCoverBgRef }}
          playlist={playlist}
          playlistData={playlistData}
          handleToggle={handleToggle}
        />
        <table className="table-auto w-full text-left mt-10">
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
          <div className="flex items-center justify-end">
            <button
              className="bg-black px-5 py-3 text-white rounded-full text-sm mt-5"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        ) : (
          <div className="py-10"></div>
        )}
        <SongFinder
          updatePlaylistData={updatePlaylistData}
          updateSongs={updateSongs}
          playlistData={playlistData}
          songs={songs}
        />
        <ToastContainer position="bottom-center" />
      </div>
    </>
  );
}
export default EditPlaylist;
