import React, { useState, useCallback } from "react";
import _ from "lodash";
import axios from "axios";

function SongFinder(props) {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('')

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
          setQuery(searchQuery)
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
    <div className={`mt-30}`}>
      <div>
        <h1 className="text-xl font-semibold pb-3">
          Find somthing for the playlist
        </h1>
        <input
          type="text"
          className="h-10 outline-none border border-slate-400 rounded-md pl-5 text-sm w-[20rem]"
          placeholder="Search for songs"
          onChange={(e) => {
            debouncedSearch(e.target.value);
          }}
        />
      </div>
      {results && (
        <div className="mt-5 flex flex-col gap-1">
          { results.length != 0 ? <p className="font-light pb-5">Showing results for '{query}'</p> : null}
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
                    props.updateSongs([...props.songs, song]);
                    props.updatePlaylistData({songs: [...props.playlistData.songs, song.id]})
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
  );
}

export default SongFinder;
