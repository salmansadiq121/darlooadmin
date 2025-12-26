"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoClose,
  IoSearch,
  IoFilter,
  IoCheckmarkCircle,
  IoTrash,
  IoSend,
  IoMailOpen,
  IoMail,
  IoNotifications,
  IoEllipsisVertical,
  IoChevronDown,
  IoRefresh,
  IoSparkles,
  IoPeople,
  IoTime,
  IoTrendingUp,
  IoAlertCircle,
  IoCheckmarkDone,
  IoEye,
  IoCreate,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import {
  HiOutlineBell,
  HiOutlineMailOpen,
  HiOutlineTrash,
  HiOutlineUserGroup,
  HiOutlineTemplate,
  HiOutlinePaperAirplane,
  HiOutlineChartBar,
  HiOutlineFilter,
  HiOutlineDotsVertical,
} from "react-icons/hi";
import {
  BsThreeDotsVertical,
  BsEnvelopePaper,
  BsClock,
  BsCheckAll,
} from "react-icons/bs";
import {
  FiMail,
  FiUsers,
  FiSend,
  FiTrash2,
  FiCheck,
  FiEye,
} from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/app/context/authContext";

const MainLayout = dynamic(
  () => import("./../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("./../../../utils/Breadcrumb"), {
  ssr: false,
});
const NotificationModal = dynamic(
  () => import("./../../../components/Notification/NotificationModal"),
  { ssr: false }
);
const NotificationDetail = dynamic(
  () => import("./../../../components/Notification/NotificationDetail"),
  { ssr: false }
);

// Stats Card Component
const StatsCard = ({
  icon: Icon,
  label,
  value,
  color,
  trend,
  onClick,
  isActive,
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
      isActive
        ? `bg-gradient-to-br ${color} shadow-lg`
        : "bg-white hover:shadow-lg border border-gray-100"
    }`}
  >
    {/* Background decoration */}
    <div
      className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${
        isActive ? "bg-white/10" : "bg-gray-50"
      }`}
    />
    <div
      className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${
        isActive ? "bg-white/5" : "bg-gray-50/50"
      }`}
    />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`p-3 rounded-xl ${
            isActive
              ? "bg-white/20"
              : `bg-gradient-to-br ${color} bg-opacity-10`
          }`}
        >
          <Icon
            className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-700"}`}
          />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              isActive
                ? "bg-white/20 text-white"
                : "bg-green-100 text-green-700"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <h3
        className={`text-3xl font-bold ${
          isActive ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </h3>
      <p
        className={`text-sm mt-1 ${
          isActive ? "text-white/80" : "text-gray-500"
        }`}
      >
        {label}
      </p>
    </div>
  </motion.div>
);

// Notification Item Component
const NotificationItem = ({
  notification,
  isSelected,
  onSelect,
  onView,
  onMarkRead,
  onDelete,
  showMenu,
  setShowMenu,
}) => {
  const isUnread =
    notification?.status?.[0]?.state === "unread" ||
    notification?.status === "unread";
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowMenu]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 group ${
        isSelected
          ? "bg-red-50 border-red-200"
          : isUnread
          ? "bg-gradient-to-r from-blue-50/50 to-white border-blue-100 hover:shadow-md"
          : "bg-white border-gray-100 hover:shadow-md hover:border-gray-200"
      }`}
    >
      {/* Unread indicator */}
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-xl" />
      )}

      {/* Checkbox */}
      <label className="flex items-center cursor-pointer mt-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(notification._id, e.target.checked)}
          className="w-5 h-5 rounded-lg border-2 border-gray-300 text-red-600 focus:ring-red-500 focus:ring-offset-0 cursor-pointer transition-all"
        />
      </label>

      {/* Avatar */}
      <div
        className="relative flex-shrink-0"
        onClick={() => onView(notification)}
      >
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer">
          {notification?.user?.avatar ? (
            <Image
              src={notification.user.avatar}
              alt="Avatar"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100">
              <span className="text-lg font-bold text-red-500">
                {notification?.user?.name?.charAt(0)?.toUpperCase() || "N"}
              </span>
            </div>
          )}
        </div>
        {isUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onView(notification)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`font-semibold truncate ${
                  isUnread ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {notification?.user?.name || "System Notification"}
              </h4>
              {isUnread && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                  NEW
                </span>
              )}
              <span
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                  notification?.type === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : notification?.type === "marketing"
                    ? "bg-green-100 text-green-700"
                    : notification?.type === "seller"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {notification?.type?.toUpperCase() || "GENERAL"}
              </span>
            </div>
            <p
              className={`text-sm mt-1 line-clamp-2 ${
                isUnread ? "text-gray-700 font-medium" : "text-gray-500"
              }`}
            >
              {notification?.subject}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <BsClock className="w-3 h-3" />
                {formatDistanceToNow(new Date(notification?.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {notification?.user?.email && (
                <span className="flex items-center gap-1">
                  <FiMail className="w-3 h-3" />
                  {notification.user.email}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Menu */}
      <div className="relative" ref={menuRef}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() =>
            setShowMenu(showMenu === notification._id ? null : notification._id)
          }
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all opacity-0 group-hover:opacity-100"
        >
          <IoEllipsisVertical className="w-5 h-5" />
        </motion.button>

        <AnimatePresence>
          {showMenu === notification._id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
            >
              <button
                onClick={() => {
                  onView(notification);
                  setShowMenu(null);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <FiEye className="w-4 h-4 text-blue-500" />
                View Details
              </button>
              {isUnread && (
                <button
                  onClick={() => {
                    onMarkRead(notification._id);
                    setShowMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <BsCheckAll className="w-4 h-4 text-green-500" />
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => {
                  onDelete(notification._id);
                  setShowMenu(null);
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ filter }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
      <IoNotifications className="w-16 h-16 text-gray-300" />
    </div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      No Notifications
    </h3>
    <p className="text-gray-500 text-center max-w-md">
      {filter === "unread"
        ? "You're all caught up! No unread notifications."
        : filter === "read"
        ? "No read notifications to display."
        : "No notifications yet. Send your first notification to customers!"}
    </p>
  </motion.div>
);

export default function Notifications() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationData, setNotificationData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState([]);
  const [showMenu, setShowMenu] = useState(null);
  const [addNotification, setAddNotification] = useState(false);
  const [notificationId, setNotificationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const initialLoad = useRef(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Stats from server
  const [stats, setStats] = useState({
    all: 0,
    unread: 0,
    read: 0,
    today: 0,
  });

  // Calculate today's count locally
  const todayCount = useMemo(() => {
    return notificationData.filter((n) => {
      const notifDate = new Date(n?.createdAt);
      const todayDate = new Date();
      return notifDate.toDateString() === todayDate.toDateString();
    }).length;
  }, [notificationData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.pathname);
    }
  }, []);

  // Fetch all notifications with pagination
  const fetchNotifications = useCallback(async () => {
    if (initialLoad.current) {
      setLoading(true);
    }
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        filter: activeFilter,
        search: searchQuery,
      });

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/all/admin?${params}`
      );
      if (data?.success) {
        setNotificationData(data.notifications || []);
        setFilteredData(data.notifications || []);
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
        setStats({
          all: data.stats?.all || 0,
          unread: data.stats?.unread || 0,
          read: data.stats?.read || 0,
          today: 0, // Will be calculated locally
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      if (initialLoad.current) {
        setLoading(false);
        initialLoad.current = false;
      }
      setIsRefreshing(false);
    }
  }, [page, limit, activeFilter, searchQuery]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [activeFilter, searchQuery]);

  // Filter is now handled on server side via API params

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    toast.success("Notifications refreshed");
  };

  // Mark all selected as read
  const markAllAsRead = async () => {
    if (!selectedNotificationIds.length) {
      return toast.error("Please select notifications to mark as read");
    }
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/mark/all/read`,
        { notificationIds: selectedNotificationIds },
        { headers: { Authorization: auth?.token } }
      );
      if (data?.success) {
        fetchNotifications();
        setSelectedNotificationIds([]);
        toast.success("Notifications marked as read");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark as read");
    }
  };

  // Mark single notification as read
  const markSingleAsRead = async (id) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/read/${id}`,
        {},
        { headers: { Authorization: auth?.token } }
      );
      fetchNotifications();
      toast.success("Marked as read");
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark as read");
    }
  };

  // Delete selected notifications
  const handleBulkDelete = () => {
    if (!selectedNotificationIds.length) {
      return toast.error("Please select notifications to delete");
    }

    Swal.fire({
      title: "Delete Notifications?",
      text: `You are about to delete ${selectedNotificationIds.length} notification(s). This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await axios.put(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/delete/many`,
            { notificationIds: selectedNotificationIds }
          );
          if (data?.success) {
            fetchNotifications();
            setSelectedNotificationIds([]);
            toast.success("Notifications deleted successfully");
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete notifications");
        }
      }
    });
  };

  // Delete single notification
  const handleSingleDelete = (id) => {
    Swal.fire({
      title: "Delete Notification?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/notification/delete/${id}`
          );
          fetchNotifications();
          toast.success("Notification deleted");
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete notification");
        }
      }
    });
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotificationIds(filteredData.map((n) => n._id));
    } else {
      setSelectedNotificationIds([]);
    }
  };

  // Handle single select
  const handleSelect = (id, checked) => {
    if (checked) {
      setSelectedNotificationIds((prev) => [...prev, id]);
    } else {
      setSelectedNotificationIds((prev) => prev.filter((nId) => nId !== id));
    }
  };

  // View notification
  const handleView = (notification) => {
    setSelectedNotification(notification);
    setShowNotification(true);
  };

  return (
    <MainLayout title="Notifications - Darloo Admin">
      <div className="min-h-screen pb-8">
        {/* Header Section */}
        <div className="mb-6">
          <Breadcrumb path={currentUrl} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-200">
                  <IoNotifications className="w-6 h-6 text-white" />
                </div>
                Notifications
              </h1>
              <p className="text-gray-500 mt-1">
                Manage and send notifications to your customers
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAddNotification(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-red-200 hover:shadow-xl transition-all"
            >
              <IoSend className="w-5 h-5" />
              Send Notification
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            icon={IoNotifications}
            label="Total Notifications"
            value={stats.all}
            color="from-violet-500 to-purple-600"
            onClick={() => setActiveFilter("all")}
            isActive={activeFilter === "all"}
          />
          <StatsCard
            icon={IoMail}
            label="Unread"
            value={stats.unread}
            color="from-blue-500 to-cyan-600"
            trend={stats.unread > 0 ? "New" : null}
            onClick={() => setActiveFilter("unread")}
            isActive={activeFilter === "unread"}
          />
          <StatsCard
            icon={IoMailOpen}
            label="Read"
            value={stats.read}
            color="from-emerald-500 to-green-600"
            onClick={() => setActiveFilter("read")}
            isActive={activeFilter === "read"}
          />
          <StatsCard
            icon={IoTime}
            label="Today"
            value={todayCount}
            color="from-orange-500 to-amber-600"
            onClick={() => setActiveFilter("all")}
            isActive={false}
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Left side - Select All & Actions */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedNotificationIds.length === filteredData.length &&
                      filteredData.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All
                  </span>
                </label>

                {selectedNotificationIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm text-gray-500">
                      {selectedNotificationIds.length} selected
                    </span>
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <BsCheckAll className="w-4 h-4" />
                      Mark Read
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Right side - Search & Refresh */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notifications..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50"
                >
                  <IoRefresh
                    className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </motion.button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
              {[
                { key: "all", label: "All", count: stats.all },
                { key: "unread", label: "Unread", count: stats.unread },
                { key: "read", label: "Read", count: stats.read },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeFilter === tab.key
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeFilter === tab.key
                        ? "bg-red-200 text-red-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-4 space-y-3 max-h-[calc(100vh-150px)] overflow-y-auto">
            {loading ? (
              // Loading skeleton
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 animate-pulse"
                  >
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredData.length > 0 ? (
              <AnimatePresence>
                {filteredData.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    isSelected={selectedNotificationIds.includes(
                      notification._id
                    )}
                    onSelect={handleSelect}
                    onView={handleView}
                    onMarkRead={markSingleAsRead}
                    onDelete={handleSingleDelete}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <EmptyState filter={activeFilter} />
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-700">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">
                    {pagination.total}
                  </span>{" "}
                  results
                </p>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrevPage || loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <IoChevronBack className="w-4 h-4" />
                    Previous
                  </motion.button>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPage(pageNum)}
                            disabled={loading}
                            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                              page === pageNum
                                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-200"
                                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      }
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setPage((prev) =>
                        Math.min(pagination.totalPages, prev + 1)
                      )
                    }
                    disabled={!pagination.hasNextPage || loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <IoChevronForward className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Send Notification Modal */}
        <AnimatePresence>
          {addNotification && (
            <NotificationModal
              setAddNotification={setAddNotification}
              notificationId={notificationId}
              setNotificationId={setNotificationId}
            />
          )}
        </AnimatePresence>

        {/* Notification Detail Modal */}
        <AnimatePresence>
          {showNotification && selectedNotification && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowNotification(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <NotificationDetail
                  setShowNotification={setShowNotification}
                  selectedNotification={selectedNotification}
                  setSelectedNotification={setSelectedNotification}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
