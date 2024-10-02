import React, { forwardRef, useRef } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";

const EditOverlay = forwardRef(
  (
    {
      handleToggle,
      edit,
      editedData,
      updateEditedData,
      updatePlaylistData,
      updateIsEdited
    },
    ref
  ) => {
    const nameRef = useRef();
    const descRef = useRef();
    const fileRef = useRef();
    const previewRef = useRef();

    function previewImage(file, apply) {
      if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
          if (apply == "save") {
            ref.mainCoverRef.current.src = e.target.result;
            ref.mainCoverBgRef.current.src = e.target.result;
          } else {
            previewRef.current.src = e.target.result;
          }
        };
        reader.readAsDataURL(file);
      }
    }
    return (
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
                      console.log("Compressed file:", compressedFile);
                      updateEditedData({
                        cover: compressedFile,
                      });
                      previewImage(compressedFile);
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
                onChange={(e) => updateEditedData({ name: e.target.value })}
                required
              />
              <textarea
                type="text"
                ref={descRef}
                placeholder="Add description"
                className="h-full outline-none pl-4 rounded-md border border-slate-500 pt-2 text-sm"
                onChange={(e) => updateEditedData({ desc: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="w-full flex justify-end mt-5">
            <button
              className="px-6 bg-black text-white py-3 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                previewImage(editedData.cover, 'save')
                nameRef.current.value = "";
                descRef.current.value = "";
                updateEditedData({ cover: null, name: "", desc: "" });

                const updatedData = {};
                if (editedData.name !== "") {
                  updatedData.name = editedData.name;
                }
                if (editedData.desc !== "") {
                  updatedData.desc = editedData.desc;
                }
                if (editedData.cover !== null) {
                  updatedData.cover = editedData.cover;
                }

                if (Object.keys(updatedData).length > 0) {
                  updatePlaylistData(updatedData);
                }
                handleToggle();
                updateIsEdited()
                toast.success("Playlist info saved");
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }
);

export default EditOverlay;
