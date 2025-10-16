import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Comment from '../components/Comment.jsx';
import {Link} from 'react-router-dom';

export default function App() {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.reload();
      return;
    }
    try {
      await axios.post('http://localhost:4000/api/logout', {}, { headers: { Authorization: 'Bearer ' + token } });
    } catch (err) {
      console.warn('Logout request failed:', err);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.reload();
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/comments');
      setComments(res.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const postComment = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Login to comment');
    if (!text.trim()) return;
    
    try {
      await axios.post('http://localhost:4000/api/comments', { text }, { headers: { Authorization: 'Bearer ' + token } });
      setText('');
      fetchComments(); 
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  return (
    <div className="bg-black min-h-screen font-sans text-gray-800 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-200 mb-4">Sample Post Title</h1>
          {user && (
            <div className="flex items-center justify-end mb-4">
              <div className="text-sm text-gray-300 mr-3">Signed in as <strong>{user.name}</strong></div>
              <button onClick={logout} className="px-3 py-1 cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700">Logout</button>
            </div>
          )}
          {!user && (
            <div className="flex items-center justify-end mb-4">
              <Link to="/login"><button className="px-3 py-1 cursor-pointer bg-green-600 text-white rounded-md hover:bg-green-700">Login</button></Link>
            </div>
          )}
          <div className="bg-zinc-800 p-6 rounded-lg shadow-md">
            <p className="text-gray-200 leading-relaxed">
              This is a placeholder post for demonstrating a modern, nested comments section. Feel free to reply, upvote, and collapse threads to see the functionality in action.
            </p>
          </div>
        </header>

        <section className="comments">
          <div className="new-comment bg-zinc-800 p-4 rounded-lg  mb-8">
            <textarea
              className="w-full p-3  bg-zinc-700 text-white outline:none placeholder:text-gray-200 rounded-md "
              placeholder={user ? 'Write a comment...' : 'Login to leave a comment'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows="3"
            ></textarea>
            <div className="flex justify-end mt-3">
              <button
                onClick={postComment}
                className="px-5 py-2 cursor-pointer bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                disabled={!text.trim()}
              >
                Post Comment
              </button>
            </div>
          </div>

          <div className="comment-list space-y-6">
            {user && (() => {
              // helper: count total nested replies (depth-first)
              const totalReplies = (c) => {
                if (!c.replies || c.replies.length === 0) return 0;
                let count = c.replies.length;
                for (const r of c.replies) count += totalReplies(r);
                return count;
              };

              // sort top-level comments by net votes (descending)
              const sorted = [...comments].sort((a, b) => {
                const aNet = (a.netVotes ?? ( (a.upvoteCount ?? 0) - (a.downvoteCount ?? 0) )) || 0;
                const bNet = (b.netVotes ?? ( (b.upvoteCount ?? 0) - (b.downvoteCount ?? 0) )) || 0;
                if (bNet !== aNet) return bNet - aNet;
                // tie-breaker: comment with more total replies first
                const aReplies = totalReplies(a);
                const bReplies = totalReplies(b);
                if (bReplies !== aReplies) return bReplies - aReplies;
                // final tie-breaker: newer first
                const aTime = new Date(a.created_at).getTime() || 0;
                const bTime = new Date(b.created_at).getTime() || 0;
                return bTime - aTime;
              });
              return sorted.map(c => (
                <Comment key={c._id || c.id} comment={c} onAction={fetchComments} />
              ));
            })()}
          </div>
        </section>
      </div>
    </div>
  );
}