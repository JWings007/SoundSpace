import React, { forwardRef } from "react";

const PlaylistHeader = forwardRef(
  ({ playlist, playlistData, handleToggle }, ref) => {
    return (
      <div className="flex items-center h-[50vh] overflow-hidden relative rounded-lg px-8">
        <button
          className="absolute right-[2%] top-[5%] bg-black p-5 rounded-[50%]"
          onClick={handleToggle}
        >
          <i className="fi fi-rr-file-edit flex items-center justify-center text-white"></i>
        </button>
        <img
          src={playlist ? playlist.coverImage : ""}
          ref={ref.mainCoverBgRef}
          alt=""
          className="blur-3xl absolute -z-10 top-0 object-cover w-full"
        />
        <div className="w-1/2">
          <img
            src={playlist ? playlist.coverImage : ""}
            ref={ref.mainCoverRef}
            alt=""
            className="w-72 h-72 shadow-lg rounded-lg object-cover"
          />
        </div>
        <div className="w-1/2">
          <p className="font-semibold text-xl">Playlist</p>
          <h1 className="text-3xl font-bold pb-5">{playlistData?.name}</h1>
          <p>{playlistData?.desc}</p>
          <div className="flex gap-5">
            <span className="text-slate-800">{playlistData.songs.length} songs</span>
            <span className="text-slate-800">•</span>
            <span className="text-slate-800">2 hrs 5 mins</span>
          </div>
        </div>
      </div>
    );
  }
);

export default PlaylistHeader;
