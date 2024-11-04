import React, { useRef, useState } from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import imageCompression from "browser-image-compression";
import axios from "axios"
import { toast } from "react-toastify";

const moods = [
  { id: 1, name: "Happy", icon: "smile" },
  { id: 2, name: "Sad", icon: "sad-tear" },
  { id: 3, name: "Energetic", icon: "bolt" },
  { id: 4, name: "Romantic", icon: "heart" },
  { id: 5, name: "Chill", icon: "snow-blowing" },
  { id: 6, name: "Party", icon: "glass-cheers" },
  { id: 7, name: "Focused", icon: "bullseye-arrow" },
  { id: 8, name: "Dark", icon: "moon-stars" },
  { id: 9, name: "Upbeat", icon: "swing" },
  { id: 10, name: "Melancholic", icon: "cloud-rain" },
  { id: 11, name: "Aggressive", icon: "flame" },
  { id: 12, name: "Calm", icon: "wave" },
];

function NewPost() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [postData, setPostData] = useState({
    title: "",
    description: "",
    mood: "",
    playlistID: "",
    tags: [],
    coverImage: "",
  });
  const [selectedPlaylist, setSelectedPlaylist] = useState([]);
  const playlist = useSelector((state) => state.playlists.playlist);

  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
    setPostData({ ...postData, mood });
  };

  const inputRef = useRef();
  const previewRef = useRef();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault(); // Prevent the default behavior of form submission
      addTag();
      setPostData({ ...postData, tags });
    }
  };

  const addTag = () => {
    setTags((prevTags) => {
      const newTags = [...prevTags, tagInput.toLowerCase().trim()];
      setPostData((prevData) => ({ ...prevData, tags: newTags })); // Sync postData with the latest tags
      return newTags;
    });
    setTagInput(""); // Clear the input after adding the tag
  };

  const removeTag = (indexToRemove) => {
    setTags((prevTags) => {
      const updatedTags = prevTags.filter(
        (_, index) => index !== indexToRemove
      );
      setPostData((prevData) => ({ ...prevData, tags: updatedTags })); // Sync postData with updated tags
      return updatedTags;
    });
  };

  function previewImage(file) {
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        previewRef.current.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  const handlePost = async (e) => {
    e.preventDefault()
    let formData = new FormData();
    formData.append('title', postData.title)
    formData.append('description', postData.description)
    formData.append('coverImage', postData.coverImage)
    formData.append('playlistId', postData.playlistID)
    formData.append('tags', JSON.stringify(postData.tags))
    formData.append('mood', postData.mood)
    try{
    if(formData) {
      const res = await axios.post("http://localhost:1060/api/create-post", formData, {
        withCredentials: true
      })
      if(res.status === 200) {
        toast.success("Post Created Successfully");
        setPostData({
          title: "",
          description: "",
          mood: "",
          playlistID: "",
          tags: [],
          coverImage: "",
        })
        setSelectedMood("");
        setTags([])
      }
    }
  }catch(err) {
    console.log("Frontend Error")
  }
  };

  return (
    <>
      <Navbar />
      <div className="pt-32 pb-20 px-16 relative">
        <h1 className="text-3xl font-bold pb-5">
          Create a Post{" "}
          <sup>
            <i className="fi fi-rr-music-alt text-sm"></i>
          </sup>
        </h1>
        <form >
          <div className="flex justify-between">
            <div className="flex flex-col gap-5 w-fit">
              <div className="w-fit flex px-6 rounded-lg">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="title" className="font-semibold pb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      className="outline-none border border-slate-400 rounded-md pl-5 text-sm h-10"
                      placeholder="Playlist title"
                      onChange={(e) =>
                        setPostData({ ...postData, title: e.target.value })
                      }
                      value={postData.title}
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="font-semibold">
                      Description
                    </label>
                    <textarea
                      name=""
                      id="description"
                      className="w-full h-40 outline-none resize-none border-slate-400 border rounded-lg px-5 py-3 text-sm mt-2"
                      rows={15}
                      placeholder="Share your thoughts about this playlist…"
                      onChange={(e) =>
                        setPostData({
                          ...postData,
                          description: e.target.value,
                        })
                      }
                      value={postData.description}
                    ></textarea>
                  </div>
                  <div className="flex gap-10">
                    <div className="mood-selector w-full">
                      <h2 className="font-semibold mb-3">
                        Select a mood for your playlist
                      </h2>
                      <div className="grid grid-cols-6 gap-2">
                        {moods.map((mood, i) => {
                          return (
                            <div
                              className={`border border-slate-400 px-2 py-3 rounded-md flex flex-col items-center gap-2 cursor-pointer group hover:border-black transition-all ${
                                selectedMood === mood.name
                                  ? "bg-purple-300 hover:border-purple-300 border-purple-300"
                                  : null
                              }`}
                              onClick={() => handleSelectMood(mood.name)}
                              key={i}
                            >
                              <p className="text-sm">{mood.name}</p>
                              <i
                                className={`fi fi-rr-${
                                  mood.icon
                                } text-xl flex items-center justify-center group-hover:scale-125 transition-all ${
                                  selectedMood === mood.name
                                    ? "scale-125"
                                    : null
                                }`}
                              ></i>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/2 flex flex-col justify-between">
              <div className="flex justify-between">
                <div>
                  <h1 className="font-semibold pb-2">Select the playlist</h1>
                  <div className="flex gap-10 flex-col">
                    <select
                      name=""
                      id=""
                      className="h-10 py-2 px-4 outline-none bg-white border border-slate-400 rounded-md text-sm"
                      onChange={(e) => {
                        setPostData({
                          ...postData,
                          playlistID: e.target.value,
                        });
                        if (e.target.value) {
                          const p = playlist.filter((playL) => {
                            return playL.pid === e.target.value;
                          });
                          setSelectedPlaylist(p);
                        }
                      }}
                    >
                      {playlist
                        ? playlist.map((p) => {
                            return (
                              <option value={p.pid} key={p.pid}>
                                {p.title}
                              </option>
                            );
                          })
                        : null}
                    </select>
                    <div className="bg-purple-100 w-full flex items-center flex-col px-3 py-3 rounded-md">
                      <img
                        src={
                          selectedPlaylist.length > 0
                            ? selectedPlaylist[0].coverImage
                            : ""
                        }
                        alt=""
                        className="w-28 h-28 object-cover rounded-md"
                      />
                      <div className="mt-2">
                        {selectedPlaylist.length > 0 ? (
                          <p className="text-sm">
                            {selectedPlaylist[0].title.length > 15
                              ? selectedPlaylist[0].title.slice(0, 15) + "..."
                              : selectedPlaylist[0].title}
                          </p>
                        ) : (
                          <p className="text-sm">Playlist title</p>
                        )}
                      </div>
                    </div>
                    <div>
                      {postData.coverImage === "" ? (
                        <div
                          className="w-full h-40 rounded-md bg-purple-100 flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-all"
                          onClick={() => inputRef.current.click()}
                        >
                          <i className="fi fi-rr-add-image flex justify-center items-center text-3xl"></i>
                          <input
                            type="file"
                            className="hidden"
                            ref={inputRef}
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
                                setPostData({
                                  ...postData,
                                  coverImage: compressedFile,
                                });
                                previewImage(compressedFile);
                              } catch (error) {
                                console.error(
                                  "Error during compression:",
                                  error
                                );
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-44 rounded-md bg-red-200 overflow-hidden">
                          <img
                            src=""
                            alt=""
                            ref={previewRef}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="flex flex-col">
                    <label htmlFor="tags" className="font-semibold pb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      value={tagInput}
                      placeholder="Enter tags"
                      className="outline-none border border-slate-400 text-sm rounded-md h-10 pl-5 w-3/4"
                      onChange={(e) => {
                        setTagInput(e.target.value);
                      }}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <div className="w-full h-fit mt-5 flex gap-3 flex-wrap mb-5">
                    {tags &&
                      tags.map((t, i) => {
                        return (
                          <div
                            className="border border-slate-400 w-fit px-3 py-2 rounded-full flex gap-2"
                            key={i}
                          >
                            <p className="text-blue-500 text-sm">#{t}</p>
                            <i
                              className="fi fi-rr-cross-small flex items-center justify-center cursor-pointer"
                              onClick={() => removeTag(i)}
                            ></i>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-5 ml-6 mt-5">
            <button className="bg-black text-white px-7 py-3 rounded-md" onClick={handlePost}>
              Share
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default NewPost;
