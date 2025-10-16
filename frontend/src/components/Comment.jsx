import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function timeAgo(ts) {
  const d = new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Comment({ comment, depth = 0, onAction }) {
  const [isReplying, setIsReplying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [replyText, setReplyText] = useState("");

  const [userVoteState, setUserVoteState] = useState(comment.userVote ?? 0);
  const [netVoteState, setNetVoteState] = useState(comment.netVotes ?? 0);
  const [isVoting, setIsVoting] = useState(false);

  const vote = async (newVoteValue) => {
    if (isVoting) return;

    const prevUserVote = userVoteState;
    const prevNetVote = netVoteState;

    setIsVoting(true);

    let voteDelta = newVoteValue - prevUserVote;
    if (prevUserVote === newVoteValue) {
        voteDelta = -newVoteValue;
        setUserVoteState(0);
    } else {
        setUserVoteState(newVoteValue);
    }
    setNetVoteState(prevNetVote + voteDelta);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in to vote.");

      const { data } = await axios.post(
        `http://localhost:4000/api/comments/${comment._id}/vote`,
        { value: newVoteValue },
        { headers: { Authorization: "Bearer " + token } }
      );
      
      setUserVoteState(data.userVote);
      setNetVoteState(data.netVotes);

    } catch (err) {
      setUserVoteState(prevUserVote);
      setNetVoteState(prevNetVote);
      alert("An error occurred while voting.");
    } finally {
      setIsVoting(false);
    }
  };

  const reply = async () => {
    if (!replyText.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to reply.");

    try {
        await axios.post(
            "http://localhost:4000/api/comments",
            { text: replyText, parent_id: comment._id },
            { headers: { Authorization: "Bearer " + token } }
        );
        setReplyText("");
        setIsReplying(false);
        onAction(); // Refresh the entire comment tree
    } catch (error) {
        alert("Failed to post reply.");
    }
  };

  return (
    <div
      className={`comment-thread ${
        depth > 0 ? "ml-4 lg:ml-6 pl-4 lg:pl-6 border-l-2 border-gray-200" : ""
      }`}
    >
      <div className="comment bg-zinc-800 p-4 rounded-lg shadow-sm">
        <div className="flex items-start space-x-3">
          <img
            src={
              comment.user?.avatar ||
              `https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_hybrid&w=740&q=80`
            }
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <strong className="font-semibold text-gray-300">
                {comment.user?.name || "Anonymous"}
              </strong>
              <span className="text-xs text-gray-300">
                {timeAgo(comment.created_at)}
              </span>
            </div>
           
              <div className="mt-2 text-gray-200">{comment.text}</div>
            
          </div>
        </div>

        <div className="actions flex items-center space-x-4 mt-3 pl-12 text-xs font-semibold text-gray-500">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => vote(1)}
              disabled={isVoting}
              className={`p-1 rounded-full transition duration-150 ${
                userVoteState === 1
                  ? "text-blue-600 bg-blue-500"
                  : "hover:bg-zinc-600"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-200 h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 11-2 0V6.414L5.707 9.707a1 1 0 01-1.414-1.414l5-5A1 1 0 0110 3z" clipRule="evenodd" /></svg>
            </button>
            <span className="font-semibold text-gray-200 text-sm w-4 text-center">
              {netVoteState}
            </span>
            <button
              onClick={() => vote(-1)}
              disabled={isVoting}
              className={`p-1 rounded-full transition duration-150 ${
                userVoteState === -1
                  ? "text-red-600 bg-red-500"
                  : "hover:bg-zinc-600"
              }`}
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-200 h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 17a1 1 0 01-.707-.293l-5-5a1 1 0 011.414-1.414L9 13.586V4a1 1 0 112 0v9.586l3.293-3.293a1 1 0 011.414 1.414l-5 5A1 1 0 0110 17z" clipRule="evenodd" /></svg>
            </button>
          </div>
          <button onClick={() => setIsReplying(!isReplying)} className="text-gray-200 hover:text-blue-600 transition duration-150">
            Reply
          </button>
          {(comment.replies && comment.replies.length > 0) && (
             <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-200 hover:text-blue-600 transition duration-150">
            {isCollapsed ? "[+] Expand" : "[-] Collapse"}
          </button> )}
         
        </div>

        {isReplying && (
          <div className="reply-box mt-3 pl-12">
            <textarea
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder={`Replying to ${comment.user?.name || "Anonymous"}`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows="2"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button onClick={() => setIsReplying(false)} className="px-3 py-1 text-sm font-semibold text-gray-600 rounded-md hover:bg-gray-200 transition">
                Cancel
              </button>
              <button onClick={reply} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className="replies mt-4 space-y-4">
          {comment.replies.map((r) => (
            <Comment
              key={r._id}
              comment={r}
              depth={depth + 1}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
