import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import useSocket from "../context/SocketContext";

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDay = (date) => {
  const d = new Date(date);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString();
};

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected, onlineUserIds } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [thread, setThread] = useState(null); // { partner, messages }
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const bottomRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const { data } = await api.get("/chat/conversations");
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      // Guarantees loading state ends even if network request fails
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!userId) {
      setThread(null);
      return;
    }
    const fetchThread = async () => {
      try {
        setLoadingThread(true);
        const { data } = await api.get(`/chat/${userId}`);
        setThread(data);
      } catch (error) {
        console.error("Failed to load thread:", error);
      } finally {
        // Prevents endless "Loading conversation..." spinner on errors
        setLoadingThread(false);
      }
    };
    fetchThread();
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages]);

  // Live incoming/outgoing messages
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      const otherParty =
        message.sender === userId || message.receiver === userId
          ? true
          : message.sender === user?._id || message.receiver === user?._id;

      if (
        userId &&
        (message.sender === userId || message.receiver === userId) &&
        otherParty
      ) {
        setThread((prev) =>
          prev ? { ...prev, messages: [...prev.messages, message] } : prev
        );
      }
      fetchConversations();
    };

    const handleTyping = ({ userId: fromId }) => {
      if (fromId === userId) setPartnerTyping(true);
    };
    const handleStopTyping = ({ userId: fromId }) => {
      if (fromId === userId) setPartnerTyping(false);
    };

    socket.on("receive_message", handleReceive);
    socket.on("partner_typing", handleTyping);
    socket.on("partner_stopped_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("partner_typing", handleTyping);
      socket.off("partner_stopped_typing", handleStopTyping);
    };
  }, [socket, userId, user, fetchConversations]);

  const handleSend = (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !userId || !socket) return;

    socket.emit("send_message", { receiverId: userId, content }, (response) => {
      if (!response?.success) {
        console.error(response?.error || "Message failed to send");
      }
    });
    setDraft("");
    socket.emit("stop_typing", { receiverId: userId });
  };

  const handleDraftChange = (e) => {
    setDraft(e.target.value);
    if (!socket || !userId) return;
    socket.emit("typing", { receiverId: userId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { receiverId: userId });
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Messages</h1>

      {!connected && (
        <div className="bg-orange-50 text-orange-600 text-sm px-4 py-2 rounded-lg mb-4">
          Reconnecting to chat... messages will send once you're back online.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl shadow-sm overflow-hidden" style={{ minHeight: "60vh" }}>
        {/* Conversation list */}
        <div className={`border-r border-gray-100 ${userId ? "hidden md:block" : ""}`}>
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-cardText">Conversations</p>
          </div>
          {loadingConversations ? (
            <p className="p-4 text-sm text-gray-400">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">
              No conversations yet. Message someone from their profile to start chatting.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.partnerId}
                  onClick={() => navigate(`/messages/${c.partnerId}`)}
                  className={`w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition ${
                    userId === c.partnerId ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      {c.partnerName?.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        onlineUserIds.has(c.partnerId) ? "bg-secondary" : "bg-gray-300"
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm font-medium text-cardText truncate">{c.partnerName}</p>
                      {c.unreadCount > 0 && (
                        <span className="bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {c.wasLastMessageMine ? "You: " : ""}
                      {c.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active thread */}
        <div className="md:col-span-2 flex flex-col">
          {!userId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-8 text-center">
              Select a conversation, or visit a player's profile and tap "Message" to start a new one.
            </div>
          ) : loadingThread ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Loading conversation...
            </div>
          ) : !thread ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Unable to load conversation. Please try again.
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => navigate("/messages")} className="md:hidden text-gray-400" aria-label="Back to conversation list">
                  ←
                </button>
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                    {thread.partner.name?.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      onlineUserIds.has(thread.partner._id) ? "bg-secondary" : "bg-gray-300"
                    }`}
                  />
                </div>
                <div>
                  <Link to={`/players/${thread.partner._id}`} className="text-sm font-semibold hover:text-primary">
                    {thread.partner.name}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {onlineUserIds.has(thread.partner._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "50vh" }}>
                {thread.messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-10">
                    No messages yet — say hello and set up your next game!
                  </p>
                ) : (
                  thread.messages.map((m, i) => {
                    const mine = m.sender === user?._id;
                    const showDay =
                      i === 0 || formatDay(m.createdAt) !== formatDay(thread.messages[i - 1].createdAt);
                    return (
                      <React.Fragment key={m._id}>
                        {showDay && (
                          <p className="text-center text-xs text-gray-400 my-2">{formatDay(m.createdAt)}</p>
                        )}
                        <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                              mine
                                ? "bg-primary text-white rounded-br-sm"
                                : "bg-gray-100 text-cardText rounded-bl-sm"
                            }`}
                          >
                            <p>{m.content}</p>
                            <p className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-gray-400"}`}>
                              {formatTime(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                {partnerTyping && (
                  <p className="text-xs text-gray-400 italic">{thread.partner.name} is typing...</p>
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={handleDraftChange}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || !connected}
                  className="bg-primary text-white px-5 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;