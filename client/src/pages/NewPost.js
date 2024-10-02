import React, { useRef, useState } from "react";
import Navbar from "../components/Navbar";
import dndImage from "../assets/images/drag-and-drop.png";

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
  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
  };

  const inputRef = useRef()

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault(); // Prevent the default behavior of form submission
      addTag();
    }
  };

  const addTag = () => {
    setTags([...tags, tagInput.toLowerCase().trim()]); // Add new tag to the state
    setTagInput(""); // Clear the input after adding the tag
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove)); // Remove tag on click
  };

  return (
    <>
      <Navbar />
      <div className="pt-32 px-16 relative">
        <h1 className="text-3xl font-bold pl-6 pb-5">
          Create a Post{" "}
          <sup>
            <i className="fi fi-rr-music-alt text-sm"></i>
          </sup>
        </h1>
        <form action="">
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
                    >
                      <option value="">All time best BTS</option>
                      <option value="">Twice Essentials</option>
                      <option value="">BTS Essentials</option>
                      <option value="">
                        Blackpink Essentials Blackpink Essentials
                      </option>
                    </select>
                    <div className="bg-slate-200 w-fit flex items-center flex-col px-3 py-3 rounded-md">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/en/d/db/BTS_-_Butter.png"
                        alt=""
                        className="w-20"
                      />
                      <div>
                        <p className="text-sm">All time best</p>
                      </div>
                    </div>
                    <div className="w-full h-52 bg-purple-200 flex items-center justify-center rounded-lg cursor-pointer hover:bg-purple-300 transition-all" onClick={() => inputRef.current.click()}>
                      <i className="fi fi-rr-add-image flex items-center justify-center text-4xl"></i>
                      <input
                        type="file"
                        name=""
                        id=""
                        accept="image/*"
                        className="hidden"
                        ref={inputRef}
                      />
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
            <button className="bg-black text-white px-7 py-3 rounded-md">
              Share
            </button>
            <button className="bg-black text-white px-7 py-3 rounded-md">
              Draft
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default NewPost;
