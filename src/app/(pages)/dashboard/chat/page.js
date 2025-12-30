"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoSend,
  IoClose,
  IoSearch,
  IoChevronBack,
  IoEllipsisVertical,
  IoCheckmarkDone,
  IoCheckmark,
  IoHappy,
  IoAttach,
  IoImage,
  IoDocument,
  IoVideocam,
  IoTrash,
  IoExitOutline,
  IoStorefront,
  IoBag,
} from "react-icons/io5";
import { TbFileDownload } from "react-icons/tb";
import { useAuth } from "@/app/context/authContext";
import axios from "axios";
import toast from "react-hot-toast";
import { fileType } from "@/app/utils/CommonFunction";
import { format, isToday, isYesterday } from "date-fns";
import Swal from "sweetalert2";
import socketIO from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

// Message skeleton loader
const MessageSkeleton = () => (
  <div className="space-y-4 p-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
      >
        {i % 2 !== 0 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mr-2" />
        )}
        <div
          className={`space-y-2 ${i % 2 === 0 ? "items-end" : "items-start"}`}
        >
          <div
            className={`h-16 ${
              i % 2 === 0 ? "w-48" : "w-56"
            } rounded-2xl bg-gray-200 animate-pulse`}
          />
          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
        </div>
        {i % 2 === 0 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse ml-2" />
        )}
      </div>
    ))}
  </div>
);

// Chat list skeleton
const ChatSkeleton = () => (
  <div className="space-y-3 p-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
      >
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-3 w-48 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-3 w-10 bg-gray-200 animate-pulse rounded" />
      </div>
    ))}
  </div>
);

// Emoji list
const emojis = [
  "😊",
  "😂",
  "❤️",
  "👍",
  "🙏",
  "🔥",
  "😍",
  "😎",
  "🤔",
  "😢",
  "😡",
  "🎉",
  "👋",
  "🤝",
  "👏",
  "🙌",
  "💯",
  "🚀",
  "✅",
  "😘",
  "🥰",
  "😭",
  "😱",
  "🤗",
  "😴",
  "🤩",
  "😇",
  "🥺",
  "👌",
  "✌️",
  "🤞",
  "👀",
  "💪",
  "🎁",
  "💰",
  "📦",
  "🛒",
  "⭐",
  "💖",
  "🙂",
];

export default function AdminChat() {
  const { auth } = useAuth();
  const [socketId, setSocketId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const [messageLoad, setMessageLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const messageContainerRef = useRef(null);
  const emojiRef = useRef(null);
  const attachRef = useRef(null);
  const optionsRef = useRef(null);
  const initialChatLoad = useRef(true);
  const initialMessagesLoad = useRef(true);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // Initialize Socket Connection
  useEffect(() => {
    const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
    if (!auth?.user?._id || !ENDPOINT) return;

    const socket = socketIO(ENDPOINT, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      query: { userID: auth.user._id },
    });

    socket.on("connect", () => {
      console.log("Admin chat socket connected!");
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    setSocketId(socket);

    return () => {
      socket.disconnect();
    };
  }, [auth?.user?._id]);

  // Socket event listeners
  useEffect(() => {
    if (!socketId) return;

    socketId.on("typing", () => setIsTyping(true));
    socketId.on("stopTyping", () => setIsTyping(false));

    socketId.on("fetchMessages", (data) => {
      if (data?.chatId === selectedChat?._id) {
        fetchMessages();
      }
      fetchChats();
    });

    socketId.on("chatListUpdate", () => {
      fetchChats();
    });

    return () => {
      socketId.off("typing");
      socketId.off("stopTyping");
      socketId.off("fetchMessages");
      socketId.off("chatListUpdate");
    };
  }, [socketId, selectedChat?._id]);

  // Join chat room
  useEffect(() => {
    if (socketId && selectedChat?._id) {
      socketId.emit("join chat", selectedChat._id);
    }
  }, [socketId, selectedChat?._id]);

  // Fetch Chats
  const fetchChats = async () => {
    if (!auth?.user?._id) return;
    if (initialChatLoad.current) setChatLoad(true);

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/chat/fetch/${auth?.user?._id}`
      );
      if (data) setChats(data.results || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      if (initialChatLoad.current) {
        setChatLoad(false);
        initialChatLoad.current = false;
      }
    }
  };

  useEffect(() => {
    fetchChats();
  }, [auth?.user?._id]);

  // Fetch Messages
  const fetchMessages = async () => {
    if (!selectedChat?._id) return;
    if (initialMessagesLoad.current) setMessageLoad(true);

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/messages/all/${selectedChat._id}`
      );
      setChatMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (initialMessagesLoad.current) {
        setMessageLoad(false);
        initialMessagesLoad.current = false;
      }
    }
  };

  useEffect(() => {
    if (selectedChat) {
      initialMessagesLoad.current = true;
      fetchMessages();
    }
  }, [selectedChat?._id]);

  // Load chat from localStorage
  useEffect(() => {
    const localChat = localStorage.getItem("admin_chat");
    if (localChat) setSelectedChat(JSON.parse(localChat));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target))
        setShowEmoji(false);
      if (attachRef.current && !attachRef.current.contains(e.target))
        setShowAttachments(false);
      if (optionsRef.current && !optionsRef.current.contains(e.target))
        setShowOptions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get other user in chat
  const getOtherUser = (chat) => {
    if (!chat?.users || !auth?.user?._id) return null;
    return chat.users.find((u) => u._id !== auth.user._id) || chat.users[0];
  };

  // Format time
  const formatMessageTime = (date) => format(new Date(date), "HH:mm");

  const formatChatTime = (date) => {
    if (!date) return "";
    const msgDate = new Date(date);
    if (isToday(msgDate)) return format(msgDate, "HH:mm");
    if (isYesterday(msgDate)) return "Yesterday";
    return format(msgDate, "dd/MM");
  };

  // Format date for grouping
  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM dd, yyyy");
  };

  // Group messages by date
  const groupedMessages = chatMessages
    ?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    ?.reduce((groups, msg) => {
      const date = formatMessageDate(msg.createdAt);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
      return groups;
    }, {});

  // Filter chats
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    const otherUser = getOtherUser(chat);
    return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Handle typing
  const typingHandler = (e) => {
    setMessage(e.target.value);

    if (!socketId || !selectedChat?._id) return;

    if (!typing) {
      setTyping(true);
      socketId.emit("typing", selectedChat._id);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (socketId && selectedChat?._id) {
        socketId.emit("stopTyping", selectedChat._id);
        setTyping(false);
      }
    }, 1500);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || !selectedChat?._id || loading) return;

    const msgContent = message.trim();
    setMessage("");
    setShowEmoji(false);

    if (socketId && selectedChat?._id) {
      socketId.emit("stopTyping", selectedChat._id);
      setTyping(false);
    }

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/messages/send`,
        {
          content: msgContent,
          contentType: "text",
          chatId: selectedChat._id,
        },
        { headers: { Authorization: auth?.token } }
      );

      if (data?.success && data?.message) {
        setChatMessages((prev) => [...prev, data.message]);
        if (socketId) {
          socketId.emit("NewMessageAdded", {
            chatId: selectedChat._id,
            message: data.message,
          });
        }
        fetchChats();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessage(msgContent);
    }
  };

  // Send file
  const handleSendFiles = async (content, mediaType) => {
    if (!selectedChat?._id) return;
    setLoading(true);
    setShowAttachments(false);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/messages/send`,
        {
          content: content,
          contentType: mediaType,
          chatId: selectedChat._id,
        },
        { headers: { Authorization: auth?.token } }
      );

      if (data?.success && data?.message) {
        setChatMessages((prev) => [...prev, data.message]);
        if (socketId) {
          socketId.emit("NewMessageAdded", {
            chatId: selectedChat._id,
            message: data.message,
          });
        }
        fetchChats();
        toast.success("File sent!");
      }
    } catch (error) {
      console.error("Error sending file:", error);
      toast.error("Failed to send file");
    } finally {
      setLoading(false);
    }
  };

  // Send like
  const handleSendLike = async () => {
    if (!selectedChat?._id) return;

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/messages/send`,
        {
          content: "👍",
          contentType: "like",
          chatId: selectedChat._id,
        },
        { headers: { Authorization: auth?.token } }
      );

      if (data?.success && data?.message) {
        setChatMessages((prev) => [...prev, data.message]);
        if (socketId) {
          socketId.emit("NewMessageAdded", {
            chatId: selectedChat._id,
            message: data.message,
          });
        }
        fetchChats();
      }
    } catch (error) {
      console.error("Error sending like:", error);
    }
  };

  // Delete chat
  const handleDeleteChat = () => {
    Swal.fire({
      title: "Delete Chat?",
      text: "This conversation will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/chat/delete/${selectedChat._id}`
          );
          setChats((prev) => prev.filter((c) => c._id !== selectedChat._id));
          localStorage.removeItem("admin_chat");
          setSelectedChat(null);
          setShowOptions(false);
          toast.success("Chat deleted");
        } catch (error) {
          toast.error("Failed to delete chat");
        }
      }
    });
  };

  // Select chat
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    localStorage.setItem("admin_chat", JSON.stringify(chat));
    setShowSidebar(false);
  };

  // Close chat
  const handleCloseChat = () => {
    localStorage.removeItem("admin_chat");
    setSelectedChat(null);
    setShowOptions(false);
  };

  // Add emoji
  const onEmojiClick = (event) => {
    setMessage((prev) => prev + event.emoji);
  };

  return (
    <div className="h-screen w-full bg-gray-100 overflow-hidden">
      <div className="h-full max-w-[1800px] mx-auto flex">
        {/* Sidebar */}
        <aside
          className={`
            ${showSidebar ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            fixed lg:static
            z-50 lg:z-0
            w-[85%] sm:w-[380px] lg:w-[320px] xl:w-[350px]
            h-full
            bg-white
            border-r border-gray-200
            transition-transform duration-300
            flex flex-col
            shadow-xl lg:shadow-none
          `}
        >
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l4.93-1.36C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.46 14.12c-.23.65-1.36 1.24-1.86 1.29-.46.04-.84.21-2.79-.58-2.32-.94-3.79-3.34-3.9-3.49-.11-.15-.89-1.18-.89-2.26 0-1.07.56-1.6.76-1.82.2-.22.44-.27.59-.27.15 0 .3 0 .43.01.14.01.33-.05.51.39.19.46.64 1.56.69 1.67.06.11.1.25.02.4-.08.15-.12.24-.23.37-.12.13-.25.29-.35.39-.12.11-.24.23-.1.45.14.22.61 1.01 1.31 1.63.9.8 1.66 1.05 1.9 1.17.23.11.37.1.51-.06.14-.16.58-.68.74-.91.16-.23.32-.19.53-.12.22.08 1.37.65 1.61.77.23.12.39.17.45.27.05.1.05.57-.18 1.22z" />
                </svg>
                Admin Chat
              </h1>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <IoClose className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-300 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {chatLoad ? (
              <ChatSkeleton />
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 px-4">
                <svg
                  className="w-14 h-14 mb-3 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="font-medium text-gray-600">No conversations</p>
                <p className="text-sm text-gray-400">
                  Start chatting with customers
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredChats.map((chat) => {
                  const otherUser = getOtherUser(chat);
                  const isSelected = selectedChat?._id === chat._id;

                  return (
                    <div
                      key={chat._id}
                      onClick={() => handleSelectChat(chat)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-red-50 border-l-4 border-l-red-500"
                          : "hover:bg-gray-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200">
                          <Image
                            src={
                              otherUser?.avatar && otherUser.avatar !== "N/A"
                                ? otherUser.avatar
                                : "/profile.png"
                            }
                            alt={otherUser?.name || "User"}
                            width={44}
                            height={44}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            otherUser?.isOnline ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 truncate text-sm">
                            {otherUser?.name || "Unknown User"}
                          </h3>
                          <span className="text-[11px] text-gray-400 flex-shrink-0">
                            {formatChatTime(
                              chat.latestMessage?.createdAt || chat.updatedAt
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {chat.latestMessage?.contentType === "text"
                            ? chat.latestMessage.content
                            : chat.latestMessage?.contentType === "Image"
                            ? "📷 Photo"
                            : chat.latestMessage?.contentType === "Video"
                            ? "🎥 Video"
                            : chat.latestMessage?.contentType === "like"
                            ? "👍"
                            : chat.latestMessage?.contentType === "product"
                            ? "📦 Product"
                            : chat.latestMessage?.contentType
                            ? "📎 File"
                            : "No messages yet"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Chat Area */}
        <main className="flex-1 flex flex-col h-full bg-[#efeae2]">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <header className="bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 flex items-center gap-3 shadow-sm">
                {/* Mobile back button */}
                <button
                  onClick={() => setShowSidebar(true)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors -ml-2"
                >
                  <IoChevronBack className="w-5 h-5 text-white" />
                </button>

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/30">
                    <Image
                      src={
                        getOtherUser(selectedChat)?.avatar &&
                        getOtherUser(selectedChat)?.avatar !== "N/A"
                          ? getOtherUser(selectedChat)?.avatar
                          : "/profile.png"
                      }
                      alt="User"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {getOtherUser(selectedChat)?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-red-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-white truncate">
                    {getOtherUser(selectedChat)?.name || "Unknown User"}
                  </h2>
                  <p className="text-xs text-red-100">
                    {isTyping ? (
                      <span className="flex items-center gap-1">
                        typing
                        <span className="flex gap-0.5">
                          <span
                            className="w-1 h-1 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-1 h-1 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-1 h-1 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </span>
                      </span>
                    ) : getOtherUser(selectedChat)?.isOnline ? (
                      "online"
                    ) : (
                      "offline"
                    )}
                  </p>
                </div>

                {/* Options */}
                <div className="relative" ref={optionsRef}>
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <IoEllipsisVertical className="w-5 h-5 text-white" />
                  </button>

                  <AnimatePresence>
                    {showOptions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100"
                      >
                        <button
                          onClick={handleCloseChat}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        >
                          <IoExitOutline className="w-4 h-4" />
                          Close Chat
                        </button>
                        <button
                          onClick={handleDeleteChat}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                        >
                          <IoTrash className="w-4 h-4" />
                          Delete Chat
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </header>

              {/* Messages Area */}
              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8c8c8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                {messageLoad ? (
                  <MessageSkeleton />
                ) : Object.keys(groupedMessages || {}).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="w-24 h-24 bg-white/80 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <svg
                        className="w-12 h-12 text-red-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-700">No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([date, messages]) => (
                    <div key={date}>
                      {/* Date Separator */}
                      <div className="flex justify-center my-4">
                        <span className="text-xs bg-white/90 text-gray-600 px-3 py-1.5 rounded-lg shadow-sm font-medium">
                          {date}
                        </span>
                      </div>

                      {/* Messages */}
                      {messages.map((msg, idx) => {
                        const isMine = msg.sender?._id === auth?.user?._id;
                        const showAvatar =
                          !isMine &&
                          (idx === 0 ||
                            messages[idx - 1]?.sender?._id !== msg.sender?._id);

                        return (
                          <motion.div
                            key={msg._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex mb-1 ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            {/* Avatar */}
                            {!isMine && showAvatar && (
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 mt-auto flex-shrink-0">
                                <Image
                                  src={
                                    msg.sender?.avatar &&
                                    msg.sender.avatar !== "N/A"
                                      ? msg.sender.avatar
                                      : "/profile.png"
                                  }
                                  alt=""
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {!isMine && !showAvatar && (
                              <div className="w-8 mr-2 flex-shrink-0" />
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2 shadow-sm ${
                                isMine
                                  ? "bg-red-500 text-white rounded-br-sm"
                                  : "bg-white text-gray-900 rounded-bl-sm"
                              }`}
                            >
                              {/* Content */}
                              {msg.contentType === "text" ? (
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {msg.content}
                                </p>
                              ) : msg.contentType === "like" ? (
                                <span className="text-4xl">{msg.content}</span>
                              ) : msg.contentType === "product" &&
                                msg.product ? (
                                <Link
                                  href={`/dashboard/products/${msg.product._id}`}
                                  className="block border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white min-w-[220px] max-w-[260px]"
                                >
                                  {/* Product Image - check thumbnails, images.gallery, variations */}
                                  {(() => {
                                    const productImage =
                                      msg.product.thumbnails ||
                                      msg.product.images?.gallery?.[0]?.url ||
                                      msg.product.variations?.[0]?.imageURL;
                                    return productImage ? (
                                      <div className="relative w-full h-36 bg-gradient-to-br from-gray-100 to-gray-50">
                                        <Image
                                          src={productImage}
                                          alt={msg.product.name || "Product"}
                                          fill
                                          className="object-cover"
                                        />
                                        {/* Product badge */}
                                        <div className="absolute top-2 left-2">
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-medium text-gray-700 shadow-sm">
                                            <IoBag className="w-3 h-3 text-red-500" />
                                            Product
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                        <div className="text-center">
                                          <IoBag className="w-10 h-10 text-gray-300 mx-auto mb-1" />
                                          <span className="text-xs text-gray-400">
                                            No image
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  <div className="p-3">
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                                      {msg.product.name || "Product"}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-base font-bold text-emerald-600">
                                        €
                                        {msg.product.price?.toFixed(2) ||
                                          "0.00"}
                                      </p>
                                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <IoStorefront className="w-3 h-3" />
                                        View
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ) : msg.contentType === "Image" ? (
                                <a
                                  href={msg.content}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <Image
                                    src={msg.content}
                                    alt="Sent image"
                                    width={250}
                                    height={200}
                                    className="rounded-lg max-w-full h-auto object-cover"
                                  />
                                </a>
                              ) : msg.contentType === "Video" ? (
                                <video
                                  controls
                                  className="rounded-lg max-w-full"
                                  style={{ maxHeight: "250px" }}
                                >
                                  <source src={msg.content} type="video/mp4" />
                                </video>
                              ) : msg.contentType === "Audio" ? (
                                <audio
                                  controls
                                  className="w-full max-w-[250px]"
                                >
                                  <source src={msg.content} type="audio/mpeg" />
                                </audio>
                              ) : (
                                <a
                                  href={msg.content}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 py-2 px-3 rounded-lg ${
                                    isMine ? "bg-red-400" : "bg-gray-100"
                                  }`}
                                >
                                  <TbFileDownload className="h-5 w-5" />
                                  <span className="text-sm">Download File</span>
                                </a>
                              )}

                              {/* Time */}
                              <div
                                className={`flex items-center justify-end gap-1 mt-1 ${
                                  isMine ? "text-red-100" : "text-gray-400"
                                }`}
                              >
                                <span className="text-[10px]">
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                                {isMine &&
                                  (msg.read ? (
                                    <IoCheckmarkDone className="w-4 h-4 text-blue-300" />
                                  ) : (
                                    <IoCheckmark className="w-4 h-4" />
                                  ))}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))
                )}

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex justify-start mb-2"
                    >
                      <div className="w-8 mr-2" />
                      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Message Input */}
              <div className="bg-gray-100 px-4 py-3">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2"
                >
                  {/* Emoji Picker */}
                  <div className="relative" ref={emojiRef}>
                    <button
                      type="button"
                      onClick={() => setShowEmoji(!showEmoji)}
                      className="p-2.5 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <IoHappy className="w-6 h-6 text-gray-500" />
                    </button>

                    <AnimatePresence>
                      {showEmoji && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute bottom-full left-0 mb-2 z-50"
                        >
                          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 w-72">
                            <div className="grid grid-cols-8 gap-1">
                              {emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    onEmojiClick({ emoji });
                                    setShowEmoji(false);
                                  }}
                                  className="h-8 w-8 hover:bg-gray-100 rounded flex items-center justify-center text-xl transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Attachments */}
                  <div className="relative" ref={attachRef}>
                    <button
                      type="button"
                      onClick={() => setShowAttachments(!showAttachments)}
                      disabled={loading}
                      className="p-2.5 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                    >
                      <IoAttach
                        className={`w-6 h-6 ${
                          loading
                            ? "text-gray-300 animate-pulse"
                            : "text-gray-500"
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {showAttachments && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute bottom-full left-0 mb-2 z-50"
                        >
                          <div className="bg-white rounded-xl shadow-lg border border-gray-200 py-2 w-48">
                            <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                              <IoImage className="w-5 h-5 text-purple-500" />
                              <span className="text-sm text-gray-700">
                                Image
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    fileType(
                                      e.target.files[0],
                                      handleSendFiles,
                                      setLoading,
                                      setShowAttachments
                                    );
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                              <IoVideocam className="w-5 h-5 text-red-500" />
                              <span className="text-sm text-gray-700">
                                Video
                              </span>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    fileType(
                                      e.target.files[0],
                                      handleSendFiles,
                                      setLoading,
                                      setShowAttachments
                                    );
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors">
                              <IoDocument className="w-5 h-5 text-blue-500" />
                              <span className="text-sm text-gray-700">
                                Document
                              </span>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    fileType(
                                      e.target.files[0],
                                      handleSendFiles,
                                      setLoading,
                                      setShowAttachments
                                    );
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={typingHandler}
                      disabled={loading}
                      className="w-full px-5 py-3 bg-white rounded-full text-sm outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50 shadow-sm"
                    />
                  </div>

                  {/* Send / Like */}
                  {message.trim() ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="p-3 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <IoSend className="w-5 h-5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleSendLike}
                      disabled={loading}
                      className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      <span className="text-2xl">👍</span>
                    </motion.button>
                  )}
                </form>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 px-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden absolute top-4 left-4 p-2 bg-white rounded-full shadow-md"
              >
                <IoChevronBack className="w-5 h-5 text-gray-600" />
              </button>

              <div className="text-center max-w-md">
                <div className="w-48 h-48 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-50 rounded-full opacity-50" />
                  <div className="absolute inset-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-red-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l4.93-1.36C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.46 14.12c-.23.65-1.36 1.24-1.86 1.29-.46.04-.84.21-2.79-.58-2.32-.94-3.79-3.34-3.9-3.49-.11-.15-.89-1.18-.89-2.26 0-1.07.56-1.6.76-1.82.2-.22.44-.27.59-.27.15 0 .3 0 .43.01.14.01.33-.05.51.39.19.46.64 1.56.69 1.67.06.11.1.25.02.4-.08.15-.12.24-.23.37-.12.13-.25.29-.35.39-.12.11-.24.23-.1.45.14.22.61 1.01 1.31 1.63.9.8 1.66 1.05 1.9 1.17.23.11.37.1.51-.06.14-.16.58-.68.74-.91.16-.23.32-.19.53-.12.22.08 1.37.65 1.61.77.23.12.39.17.45.27.05.1.05.57-.18 1.22z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Admin Chat Center
                </h2>
                <p className="text-gray-500 mb-6">
                  Manage customer conversations and provide support. Select a
                  chat from the sidebar to start messaging.
                </p>
                <button
                  onClick={() => setShowSidebar(true)}
                  className="lg:hidden px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors shadow-md"
                >
                  View Conversations
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
