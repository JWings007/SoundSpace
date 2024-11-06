import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { formatDuration, timeConverter } from "../utils/timeFormatter";


const TableRow = ({ song, index }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePlayPauseClick = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <tr>
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
      <td className="p-2 text-sm">
        {song.album.name.length > 30
          ? song.album.name.slice(0, 30) + " ..."
          : song.album.name}
      </td>
      <td className="p-2 text-sm">{timeConverter(song.duration_ms)}</td>
      <td className="p-2 text-sm pl-8 text-left">
        <i
          className={`fi fi-rr-${
            isPlaying ? "pause pulse" : "play"
          } cursor-pointer flex items-center justify-start w-fit p-[10px] rounded-[50%]`}
          onClick={handlePlayPauseClick}
        ></i>
        <audio src={song.preview_url} ref={audioRef} />
      </td>
    </tr>
  );
};

function PostDetails() {
  const [playlist, setPlaylist] = useState({ songs: [] });
  const pid = useParams().pid;

  useEffect(() => {
    const fetchPlaylist = async () => {
      const res = await axios.get(`http://localhost:1060/api/playlist/${pid}`, {
        withCredentials: true,
      });
      if (res) {
        setPlaylist(res.data);
      }
    };
    fetchPlaylist();
  }, [pid]);
  return (
    <>
      <Navbar />
      {playlist ? (
        <div className="pt-36 px-16 py-10 relative">
          <div className="flex items-center h-[50vh] overflow-hidden relative rounded-lg px-8">
            <img
              src={playlist ? playlist.coverImage : ""}
              alt=""
              className="blur-3xl absolute -z-10 top-0 object-cover w-full"
            />
            <div className="w-1/2">
              <img
                src={playlist ? playlist.coverImage : ""}
                alt=""
                className="w-72 h-72 shadow-lg rounded-lg object-cover"
              />
            </div>
            <div className="h-full py-14">
              <p className="font-semibold text-xl">Playlist</p>
              <h1 className="text-3xl font-bold pb-5">{playlist?.title}</h1>
              <p>{playlist?.description}</p>
              <div className="flex gap-5 pt-5">
                <span className="text-slate-800">
                  {playlist.songs.length} songs
                </span>
                <span className="text-slate-800">•</span>
                <span className="text-slate-800">
                  {formatDuration(playlist.duration)}
                </span>
              </div>
            </div>
          </div>
          <table className="table-auto w-full text-left mt-10">
            <thead className="border-b">
              <tr>
                <th className="p-2 font-semibold"></th>
                <th className="p-2 font-semibold">Title</th>
                <th className="p-2 font-semibold">Album</th>
                <th className="p-2 font-semibold">Duration</th>
                <th className="p-2 font-semibold">Preview</th>
              </tr>
            </thead>
            <tbody>
              {playlist.songs.map((song, index) => (
                <TableRow key={index} song={song} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}

export default PostDetails;
