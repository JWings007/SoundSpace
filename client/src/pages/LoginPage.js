import React from "react";
import illustration from "../assets/images/illustration.svg";
import axios from 'axios'

function LoginPage() {
  const handleLogin = async () => {
    try{
      const response = await axios.get('http://localhost:1060/api/auth/login');
      if(response){
        window.open(response.data.authUrl, '_self')
      }
    }
    catch(err) {
      console.log(err)
    }
  }
  return (
    <div className="flex gap-10">
      <img src={illustration} alt="" className="h-screen" />
      <div className="flex justify-evenly flex-col">
        <div>
          <h1 className="text-5xl font-semibold leading-snug">
            Discover, Create, and Share Your Musical World on{" "}
            <span className="bg-black text-white px-3">
              SoundSpace<span className="text-purple-500">.</span>
            </span>
          </h1>
          <p>
            Seamlessly link your Spotify account to enjoy personalized features.
          </p>
        </div>
        <div>
          <button className="bg-green-400 text-black flex items-center gap-5 px-14 py-4 rounded-full" onClick={handleLogin}>
            <i className="fi fi-brands-spotify flex items-center justify-center text-2xl" ></i>
            <span>Login</span>
          </button>
            <p className="pt-3 text-sm">Privacy policy &copy; SoundSpace. 2024</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
