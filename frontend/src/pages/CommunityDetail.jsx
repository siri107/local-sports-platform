import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

const CommunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState({ title: "", description: "", location: "", date: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [communityRes, postsRes] = await Promise.all([
        api.get(`/communities/${id}`),
        api.get(`/communities/${id}/posts`),
      ]);
      setCommunity(communityRes.data);
      setPosts(postsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isMember = community?.members?.some((m) => m._id === user?._id);
  const isCreator = community?.creator?._id === user?._id;

  const handleJoinLeave = async () => {
    if (isMember) {
      await api.put(`/communities/${id}/leave`);
    } else {
      await api.put(`/communities/${id}/join`);
    }
    fetchData();
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      setPosting(true);
      const { data } = await api.post(`/communities/${id}/posts`, { content: newPost });
      setPosts([data, ...posts]);
      setNewPost("");
    } catch (error) {
      console.error(error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    const { data } = await api.put(`/communities/posts/${postId}/like`);
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, likes: data.liked ? [...p.likes, user._id] : p.likes.filter((l) => l !== user._id) }
          : p
      )
    );
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventData.title) return;
    await api.post(`/communities/${id}/events`, eventData);
    setEventData({ title: "", description: "", location: "", date: "" });
    setShowEventForm(false);
    fetchData();
  };

  if (loading) return <p className="text-center py-20 text-gray-400">Loading community...</p>;
  if (!community) return <p className="text-center py-20 text-gray-400">Community not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{community.name}</h1>
            <p className="text-sm text-gray-400 mb-2">{community.sportType}</p>
            <p className="text-gray-600">{community.description || "No description yet."}</p>
          </div>
          <button
            onClick={handleJoinLeave}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium ${
              isMember ? "bg-gray-100 text-cardText hover:bg-gray-200" : "bg-secondary text-white hover:opacity-90"
            }`}
          >
            {isMember ? "Leave Community" : "Join Community"}
          </button>
        </div>
        <div className="flex gap-6 mt-4 text-sm text-gray-500">
          <span>{community.members?.length || 0} members</span>
          <span>Created by {community.creator?.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main: discussions */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold mb-3">Discussion</h3>
            {isMember ? (
              <form onSubmit={handlePost} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share something with the community..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={posting}
                  className="bg-primary text-white px-4 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60"
                >
                  Post
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-400 mb-4">Join this community to post and discuss.</p>
            )}

            {posts.length === 0 ? (
              <p className="text-sm text-gray-400">No posts yet. Start the conversation!</p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post._id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm text-cardText">{post.author?.name}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`text-xs mt-2 ${
                        post.likes?.includes(user?._id) ? "text-primary" : "text-gray-400"
                      } hover:text-primary`}
                    >
                      👍 {post.likes?.length || 0} Like{post.likes?.length === 1 ? "" : "s"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: events + members */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Upcoming Events</h3>
              {isCreator && (
                <button
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="text-xs text-primary hover:underline"
                >
                  + Add
                </button>
              )}
            </div>

            {showEventForm && (
              <form onSubmit={handleAddEvent} className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                <input
                  type="text"
                  placeholder="Event title"
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={eventData.location}
                  onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs"
                />
                <input
                  type="date"
                  value={eventData.date}
                  onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs"
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-1.5 rounded-lg text-xs font-medium hover:opacity-90"
                >
                  Save Event
                </button>
              </form>
            )}

            {community.events?.length === 0 ? (
              <p className="text-xs text-gray-400">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {community.events?.map((ev, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium text-cardText">{ev.title}</p>
                    <p className="text-xs text-gray-400">
                      {ev.date ? new Date(ev.date).toLocaleDateString() : "Date TBD"}
                      {ev.location ? ` • ${ev.location}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold mb-3">Members ({community.members?.length || 0})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {community.members?.map((m) => (
                <Link
                  key={m._id}
                  to={`/players/${m._id}`}
                  className="flex items-center gap-2 text-sm hover:text-primary"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  {m.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
