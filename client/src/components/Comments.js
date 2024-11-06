import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime);

function Comments(props) {
  const [pullDistance, setPullDistance] = useState(0);
  const [comments, setComments] = useState([]);
  const storedUser = useSelector((state) => state.user.user);
  const [comment, setComment] = useState("");
  const threshold = 120;
  const commentRef = useRef(null);
  const inputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:1060/api/user/comment",
        { commentBody: comment, userId: storedUser.uid, postId: props.postId },
        {
          withCredentials: true,
        }
      );
      if (res) {
        setComments(res.data);
        setComment("");
        inputRef.current.value = "";
        toast.success("Comment posted");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleMouseDown = (e) => {
    if (commentRef.current) {
      commentRef.current.isDragging = true;
      commentRef.current.startY = e.clientY;
    }
  };

  const handleMouseMove = (e) => {
    if (commentRef.current && commentRef.current.isDragging) {
      const newPullDistance = e.clientY - commentRef.current.startY;
      setPullDistance(newPullDistance);
    }
  };

  const handleMouseUp = () => {
    if (commentRef.current) {
      if (pullDistance > threshold) {
        console.log("Closing comment section");
        props.commentClose();
        setPullDistance(0);
      } else {
        setPullDistance(0);
      }
      commentRef.current.isDragging = false;
    }
  };

  const handleMouseMoveOnDiv = (e) => {
    handleMouseMove(e);
  };

  const handleMouseUpOnDiv = () => {
    handleMouseUp();
  };

  useEffect(() => {
    if (props.postId) fetchComments();
  }, [props.postId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:1060/api/comments/${props.postId}`,
        {
          withCredentials: true,
        }
      );
      if (res) {
        setComments(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {props.isCommentOpen && (
        <div
          className="sticky bottom-0 bg-black/50 w-full h-[87vh] z-50 flex items-end"
          style={{
            cursor: pullDistance > threshold ? "grab" : "default",
          }}
        >
          <div
            className="w-full h-3/4 bg-white flex flex-col"
            style={{
              transform: `translateY(${pullDistance}px)`,
              transition:
                pullDistance > threshold ? "transform 0.3s ease" : "none",
            }}
            ref={commentRef}
            onMouseMove={handleMouseMoveOnDiv}
            onMouseUp={handleMouseUpOnDiv}
            onMouseDown={handleMouseDown}
          >
            <div className="w-full py-2 flex justify-center items-center cursor-grab">
              <i className="fi fi-rr-grip-lines flex items-center justify-center"></i>
            </div>
            <div className="flex-grow overflow-y-auto px-16 pt-8">
              {comments.length > 0 ? (
                comments.map((c, i) => {
                  return (
                    <div
                      className="flex gap-6 text-sm pb-7 items-start"
                      key={i}
                    >
                      <div className="flex gap-6">
                        <img
                          src={c.owner.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-4 text-sm">
                          <p className="font-semibold">{c.owner.name}</p>
                          <p className="text-slate-500">
                            {dayjs().to(dayjs(c.createdAt))}
                          </p>
                        </div>
                        <p className="tracking-wide font-light">
                          {c.commentBody}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 h-full flex items-center justify-center">
                  <h1>No comments.</h1>
                </div>
              )}
            </div>

            <form className="sticky bottom-0 w-full flex bg-white">
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Type your comment"
                  className="h-16 w-full px-10 outline-none border-t-[1px] border-slate-200 text-sm"
                  required
                  onChange={(e) => setComment(e.target.value)}
                  ref={inputRef}
                />
              </div>
              <div>
                <button
                  className="h-full bg-black w-20 text-white"
                  onClick={handleSubmit}
                >
                  <i className="fi fi-rr-paper-plane flex items-center justify-center"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Comments;
