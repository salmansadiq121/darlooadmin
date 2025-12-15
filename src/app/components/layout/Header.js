"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRegBell } from "react-icons/fa";
import Image from "next/image";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import { MdArrowRightAlt, MdMarkEmailRead } from "react-icons/md";
import { IoLogOutOutline, IoPersonOutline } from "react-icons/io5";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { BiShieldAlt2 } from "react-icons/bi";

export default function Header() {
  const { auth, setAuth } = useAuth();
  const router = useRouter();
  const user = auth?.user;
  const [open, setOpen] = useState(false);
  const [notificationData, setNotificationData] = useState([]);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const headerNotification = useRef(null);
  const profileMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        headerNotification.current &&
        !headerNotification.current.contains(event.target) &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setOpen(false);
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Validate user authentication
  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
  }, [user, router]);

  // Enhanced logout with validation
  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Clear auth state
      setAuth({ ...auth, user: null, token: "" });
      localStorage.removeItem("auth");

      // Clear axios default headers
      delete axios.defaults.headers.common["Authorization"];

      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    } finally {
      setIsLoading(false);
    }
  }, [auth, setAuth, router]);

  // Fetch notifications with error handling and validation
  const fetchNotifications = useCallback(async () => {
    if (!auth?.user?._id) {
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/header/admin/${auth.user._id}`
      );

      if (data?.notifications && Array.isArray(data.notifications)) {
        setNotificationData(data.notifications);
        const unread = data.notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [auth?.user?._id, handleLogout]);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark notification as read with validation
  const markSingleNotificationAsRead = useCallback(
    async (id) => {
      if (!id) {
        toast.error("Invalid notification ID");
        return;
      }

      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/read/${id}`
        );
        fetchNotifications();
        toast.success("Marked as read");
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Failed to mark as read");
      }
    },
    [fetchNotifications]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notificationData
        .filter((n) => !n.isRead)
        .map((n) => n._id);

      if (unreadIds.length === 0) {
        toast.info("No unread notifications");
        return;
      }

      await Promise.all(
        unreadIds.map((id) =>
          axios.put(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/read/${id}`
          )
        )
      );

      fetchNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  }, [notificationData, fetchNotifications]);

  // Notification variants for animation
  const notificationVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  // Get user initials for avatar
  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    const names = user.name.trim().split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  }, [user?.name]);

  // Get role badge color
  const getRoleBadgeColor = useCallback((role) => {
    const colors = {
      superadmin: "bg-purple-500",
      admin: "bg-blue-500",
      agent: "bg-green-500",
      seller: "bg-orange-500",
    };
    return colors[role?.toLowerCase()] || "bg-gray-500";
  }, []);

  return (
    <motion.div
      className="w-full h-[3.8rem] bg-white/95 backdrop-blur-md border-b border-gray-200/80 text-black shadow-sm sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full h-full flex items-center justify-between px-4 sm:px-6 py-2">
        <div className="flex items-center gap-4">
          {/* Search or placeholder */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notifications */}
          <div className="relative" ref={headerNotification}>
            <motion.div
              className="relative cursor-pointer p-2.5 bg-gray-50 hover:bg-gray-100 transition-all duration-200 rounded-xl hover:shadow-md group"
              onClick={() => setOpen(!open)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaRegBell className="text-xl text-gray-700 group-hover:text-[#c6080a] transition-colors duration-200" />

              {/* Unread Badge */}
              {unreadCount > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full min-w-[20px] h-5 text-xs text-white flex items-center justify-center px-1.5 shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.div>
              )}

              {/* Pulse animation for unread */}
              {unreadCount > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.div>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {open && (
                <motion.div
                  className="absolute z-[999] top-[3.5rem] right-0 sm:right-4 w-[320px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden backdrop-blur-xl"
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#c6080a] to-[#e63946] p-4 text-white">
                    <div className="flex items-center justify-between">
                      <h5 className="text-lg font-semibold flex items-center gap-2">
                        <FaRegBell className="text-xl" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </h5>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs hover:bg-white/20 px-2 py-1 rounded-lg transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                      {notificationData && notificationData.length > 0 ? (
                        notificationData.map((item, index) => (
                          <motion.div
                            key={item._id || index}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={notificationVariants}
                            className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200 ${
                              !item.isRead ? "bg-blue-50/30" : ""
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p
                                      className={`font-semibold text-sm ${
                                        !item.isRead
                                          ? "text-gray-900"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {item?.subject || "Notification"}
                                    </p>
                                    {!item.isRead && (
                                      <motion.span
                                        className="w-2 h-2 bg-blue-500 rounded-full"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{
                                          duration: 1.5,
                                          repeat: Infinity,
                                        }}
                                      />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {item?.context || "No description"}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      {formatDistanceToNow(
                                        new Date(item?.createdAt),
                                        {
                                          addSuffix: true,
                                        }
                                      )}
                                    </span>
                                    {!item.isRead && (
                                      <button
                                        onClick={() =>
                                          markSingleNotificationAsRead(item._id)
                                        }
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                                      >
                                        <MdMarkEmailRead className="text-sm" />
                                        Mark read
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          className="w-full h-[40vh] flex items-center justify-center flex-col gap-3 p-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="text-5xl">🔔</div>
                          <p className="text-gray-500 text-sm text-center">
                            No notifications available
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer */}
                  {notificationData.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50/50 p-3">
                      <button
                        onClick={() => {
                          setOpen(false);
                          router.push("/dashboard/notifications");
                        }}
                        className="w-full text-sm font-medium text-[#c6080a] hover:text-[#e63946] flex items-center justify-center gap-2 transition-colors"
                      >
                        See All Notifications
                        <MdArrowRightAlt className="text-lg" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Section */}
          <div className="relative" ref={profileMenuRef}>
            <motion.div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setShow(!show)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#c6080a] to-[#e63946] overflow-hidden flex items-center justify-center text-white font-semibold border-2 border-white shadow-lg ring-2 ring-gray-200">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="Avatar"
                      fill
                      className="object-cover rounded-full"
                      sizes="44px"
                    />
                  ) : (
                    <span className="text-sm sm:text-base">{userInitials}</span>
                  )}
                </div>

                {/* Online Status */}
                {user?.isOnline && (
                  <motion.div
                    className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}

                {/* Role Badge */}
                <div
                  className={`absolute -top-1 -right-1 w-4 h-4 ${getRoleBadgeColor(
                    user?.role
                  )} rounded-full border-2 border-white flex items-center justify-center`}
                  title={user?.role}
                >
                  <BiShieldAlt2 className="text-white text-[8px]" />
                </div>
              </div>

              {/* User Info */}
              <div className="hidden sm:flex flex-col items-start">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-[120px]">
                  {user?.name || "User"}
                </h3>
                <span className="text-xs text-gray-500 line-clamp-1 max-w-[120px]">
                  {user?.email || ""}
                </span>
              </div>

              {/* Dropdown Icon */}
              <motion.span
                animate={{ rotate: show ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:block p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {show ? (
                  <FaAngleUp className="text-gray-600" />
                ) : (
                  <FaAngleDown className="text-gray-600" />
                )}
              </motion.span>
            </motion.div>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {show && (
                <motion.div
                  className="absolute w-56 top-[3.5rem] right-0 z-[999] bg-white rounded-xl shadow-2xl border border-gray-200/50 overflow-hidden backdrop-blur-xl"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* User Info Header */}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#c6080a] to-[#e63946] overflow-hidden flex items-center justify-center text-white font-semibold">
                        {user?.avatar ? (
                          <Image
                            src={user.avatar}
                            alt="Avatar"
                            fill
                            className="object-cover rounded-full"
                            sizes="48px"
                          />
                        ) : (
                          <span>{userInitials}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || ""}
                        </p>
                        <p className="text-xs font-medium text-gray-600 capitalize mt-1">
                          {user?.role || "user"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <ul className="py-2">
                    <li>
                      <button
                        onClick={() => {
                          setShow(false);
                          router.push("/dashboard/profile");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <IoPersonOutline className="text-lg" />
                        Profile Settings
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setShow(false);
                          router.push("/dashboard/settings");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <HiOutlineCog6Tooth className="text-lg" />
                        Settings
                      </button>
                    </li>
                    <li className="border-t border-gray-200 my-1" />
                    <li>
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <IoLogOutOutline className="text-lg" />
                        {isLoading ? "Logging out..." : "Logout"}
                      </button>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #c6080a, #e63946);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #a00608, #c6080a);
        }
      `}</style>
    </motion.div>
  );
}
