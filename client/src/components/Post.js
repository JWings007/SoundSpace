import React from "react";

function Post() {
  return (
    <div className="flex flex-col justify-center items-center py-14 gap-14 pt-32">
      <div className="w-1/2 bg-white px-16 py-8 shadow-md rounded-lg">
        <div className="pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Wings All time best</h1>
            <div className="flex gap-3 mt-3">
            <span className="text-gray-500">BTS</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">TWICE</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">BLACKPINK</span>
            </div>
          </div>
          <i className="fi fi-rr-user flex items-center justify-center"></i>
        </div>
        <div className="flex items-center justify-center mb-10 bg-red-200 relative overflow-hidden py-20 group cursor-pointer">
          <img
            src="https://ibighit.com/bts/images/bts/discography/butter/butter-cover.jpg"
            alt=""
            className="absolute top-0 left-0 w-full object-center blur-xl group-hover:scale-125 transition-all duration-700"
          />
          <img
            src="https://ibighit.com/bts/images/bts/discography/butter/butter-cover.jpg"
            alt=""
            className="w-60 rounded-md z-30 group-hover:scale-110 transition-all duration-300"
          />
        </div>
        <div className="flex items-start gap-5 pb-5">
          <div>
            <i className="fi fi-rr-heart"></i> <span>200k</span>
          </div>
          <div>
            <i className="fi fi-rr-messages"></i> <span>109</span>
          </div>
          <div>
            <i className="fi fi-rr-paper-plane"></i> <span>200</span>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <p className="pb-4 w-3/4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit
              natus ducimus neque blanditiis non, repudiandae adipisci et sit?
              Ullam, sequi?
            </p>
            <div className="flex gap-4">
              <span className="text-gray-500">25 songs</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">125 minutes</span>
            </div>
          </div>
          <div className="w-1/4">
            <button className="w-20 h-20 rounded-[50%] bg-green-300">
              <i className="fi fi-brands-spotify text-3xl flex items-center justify-center"></i>
            </button>
          </div>
        </div>
        <div className="flex gap-4 pt-5">
          <span className="text-blue-500">#chill</span>
          <span className="text-blue-500">#melody</span>
        </div>
      </div>
      <div className="w-1/2 bg-white px-16 py-8 shadow-md rounded-lg">
        <div className="pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Wings All time best</h1>
            <div className="flex gap-3 mt-3">
            <span className="text-gray-500">BTS</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">TWICE</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">BLACKPINK</span>
            </div>
          </div>
          <i className="fi fi-rr-user flex items-center justify-center"></i>
        </div>
        <div className="flex items-center justify-center mb-10 bg-red-200 relative overflow-hidden py-20 group cursor-pointer">
          <img
            src="https://ibighit.com/bts/images/bts/discography/butter/butter-cover.jpg"
            alt=""
            className="absolute top-0 left-0 w-full object-center blur-xl group-hover:scale-125 transition-all duration-700"
          />
          <img
            src="https://ibighit.com/bts/images/bts/discography/butter/butter-cover.jpg"
            alt=""
            className="w-60 rounded-md z-30 group-hover:scale-110 transition-all duration-300"
          />
        </div>
        <div className="flex items-start gap-5 pb-5">
          <div>
            <i className="fi fi-rr-heart"></i> <span>200k</span>
          </div>
          <div>
            <i className="fi fi-rr-messages"></i> <span>109</span>
          </div>
          <div>
            <i className="fi fi-rr-paper-plane"></i> <span>200</span>
          </div>
        </div>
        <div className="flex justify-between">
          <div>
            <p className="pb-4 w-3/4">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit
              natus ducimus neque blanditiis non, repudiandae adipisci et sit?
              Ullam, sequi?
            </p>
            <div className="flex gap-4">
              <span className="text-gray-500">25 songs</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">125 minutes</span>
            </div>
          </div>
          <div className="w-1/4">
            <button className="w-20 h-20 rounded-[50%] bg-green-300">
              <i className="fi fi-brands-spotify text-3xl flex items-center justify-center"></i>
            </button>
          </div>
        </div>
        <div className="flex gap-4 pt-5">
          <span className="text-blue-500">#chill</span>
          <span className="text-blue-500">#melody</span>
        </div>
      </div>
    </div>
  );
}

export default Post;
