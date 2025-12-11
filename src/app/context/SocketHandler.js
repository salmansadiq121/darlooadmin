"use client";

import { useEffect, useRef } from "react";
import socketIO from "socket.io-client";
import { useAuth } from "./authContext";

const SocketHandler = () => {
  const { auth } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";

    if (!auth?.user?._id || !ENDPOINT) {
      return;
    }

    // Create socket connection
    const socketId = socketIO(ENDPOINT, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      query: { userID: auth.user._id },
    });

    socketRef.current = socketId;

    socketId.on("connect", () => {
      console.log("Socket connected!", socketId.id);
    });

    socketId.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socketId.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socketId.on("newUserData", (data) => {
      console.log("User status updated:", data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [auth?.user?._id]);

  return null;
};

export default SocketHandler;
