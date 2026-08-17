import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";

const SocketContext = createContext(null);

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());

  useEffect(() => {
    const token = user?.token || user?.accessToken || localStorage.getItem("token");

    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["polling", "websocket"],
      withCredentials: true,
    });

    socketInstance.on("connect", () => setConnected(true));
    socketInstance.on("disconnect", () => setConnected(false));

    socketInstance.on("presence_update", ({ userId, isOnline }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (isOnline) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected, onlineUserIds }}>
      {children}
    </SocketContext.Provider>
  );
};

const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default useSocket;