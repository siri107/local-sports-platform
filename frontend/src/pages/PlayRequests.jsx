import React, { useEffect, useState } from "react";
import api from "../services/api";

const statusColors = {
  pending: "bg-orange-100 text-orange-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-600",
  completed: "bg-blue-100 text-blue-700",
};

const PlayRequests = () => {
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [activeTab, setActiveTab] = useState("received");
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/requests");
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    await api.put(`/requests/${id}/accept`);
    fetchRequests();
  };

  const handleReject = async (id) => {
    await api.put(`/requests/${id}/reject`);
    fetchRequests();
  };

  const handleCancel = async (id) => {
    await api.put(`/requests/${id}/cancel`);
    fetchRequests();
  };

  const list = activeTab === "received" ? requests.received : requests.sent;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Play Requests</h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("received")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "received" ? "bg-primary text-white" : "bg-white text-gray-500"
          }`}
        >
          Received ({requests.received.length})
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "sent" ? "bg-primary text-white" : "bg-white text-gray-500"
          }`}
        >
          Sent ({requests.sent.length})
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading requests...</p>
      ) : list.length === 0 ? (
        <p className="text-gray-400">No {activeTab} requests yet.</p>
      ) : (
        <div className="space-y-4">
          {list.map((req) => {
            const person = activeTab === "received" ? req.sender : req.receiver;
            return (
              <div key={req._id} className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-cardText">{person?.name}</p>
                  <p className="text-sm text-gray-500">Game: {req.game}</p>
                  {req.message && <p className="text-sm text-gray-400 mt-1">"{req.message}"</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full capitalize ${statusColors[req.status]}`}>
                    {req.status}
                  </span>
                  {activeTab === "received" && req.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="bg-secondary text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-90"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:opacity-90"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {activeTab === "sent" && req.status === "pending" && (
                    <button
                      onClick={() => handleCancel(req._id)}
                      className="bg-gray-200 text-cardText text-xs px-3 py-1.5 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayRequests;
