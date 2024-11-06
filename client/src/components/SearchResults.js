import React from "react";
import { useNavigate } from "react-router-dom";

function SearchResults(props) {
  const navigate = useNavigate()
  return (
    <>
      <div
        className={`pt-10 px-16 pb-20 absolute top-full bg-white w-full left-0 overflow-y-auto h-[90vh] ${
          props.query === "" ? "hidden" : "block"
        }`}
      >
        <p className="text-slate-400">Showing results for "{props.query}"</p>

        {/* Playlist Section */}
        <div className="mt-8">
          <h1 className="font-bold text-2xl">Playlists</h1>
          <div className="grid grid-cols-6 gap-5 mt-5">
            {props.results
              ? props.results.playlists?.map((p, i) => {
                  return (
                    <div className="px-5 py-3 flex h-80 items-start justify-start flex-col rounded-lg relative shadow-md overflow-hidden group cursor-pointer w-fit" onClick={() => {
                      navigate(`/view/${p.pid}`)
                      props.setQuery("")
                    }}
                    key={i}>
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
                          className="text-xl font-semibold"
                          style={{ textShadow: "0px 0px 15px #ffffff" }}
                        >
                          {p.title}
                        </h1>
                        <div>
                          <span className="text-gray-500 text-sm">
                            Total songs: {p.songs?.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        </div>

        {/* Users Section */}
        <div className="mt-8">
          <h1 className="font-bold text-2xl">Users</h1>
          <div className="mt-5 grid grid-cols-9 gap-10">
            {props.results.users
              ? props.results.users?.map((user, i) => {
                  return (
                    <div className="flex items-center justify-center w-fit flex-col gap-4" key={i} onClick={()=> {navigate(`/profile/${user.uid}`)
                    props.setQuery("")
                    }}>
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-32 h-32 rounded-full object-cover"
                      />
                      <div className="flex flex-col items-center justify-center gap-3">
                        <h3 className="font-semibold text-md">{user.name}</h3>
                        <p className="text-sm text-slate-500">30 Followers</p>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchResults;
