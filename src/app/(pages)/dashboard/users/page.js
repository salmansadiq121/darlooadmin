"use client";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Loader from "@/app/utils/Loader";
import dynamic from "next/dynamic";
import { IoSearch } from "react-icons/io5";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import { format } from "date-fns";
import Image from "next/image";
import {
  MdModeEditOutline,
  MdDelete,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useAuth } from "@/app/context/authContext";
import { HiSwitchHorizontal } from "react-icons/hi";
import { FaUserCheck, FaUserSlash } from "react-icons/fa";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const MainLayout = dynamic(
  () => import("./../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("./../../../utils/Breadcrumb"), {
  ssr: false,
});
const UserModal = dynamic(
  () => import("./../../../components/Users/UserModal"),
  { ssr: false }
);

export default function Users() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [userData, setUserData] = useState([]);
  const [filterUser, setFilterUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeUsers, setActiveUsers] = useState(0);
  const [blockUsers, setBlockUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    byRole: {},
  });
  const itemsPerPage = 20;
  const [showAddUser, setShowAddUser] = useState(false);
  const closeModal = useRef(null);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");

  const fetchUsers = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...filters,
      });

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/allUsers?${params}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        setUserData(data.users || []);
        setFilterUsers(data.users || []);
        setTotalPages(data.pagination?.pages || 1);
        setStats({
          total: data.pagination?.total || 0,
          active: data.stats?.active || 0,
          blocked: data.stats?.blocked || 0,
          byRole: data.stats?.byRole || {},
        });
        setActiveUsers(data.stats?.active || 0);
        setBlockUsers(data.stats?.blocked || 0);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      const filters = {};
      if (role) filters.role = role;
      if (activeTab === "Active") filters.status = "true";
      if (activeTab === "Blocked") filters.status = "false";
      if (searchQuery) filters.search = searchQuery;
      fetchUsers(currentPage, filters);
    }
  }, [auth?.token, currentPage, activeTab, searchQuery, role]);

  // Debounce search input -> query (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.pathname);
    }
  }, []);

  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleDeleteConfirmation = (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c6080a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(userId);
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/delete/user/${id}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      if (data?.success) {
        toast.success("User deleted successfully");
        fetchUsers(currentPage);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedIds.length} user(s)!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c6080a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete them!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await axios.put(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/delete/multiple`,
            { userIds: selectedIds },
            {
              headers: {
                Authorization: auth?.token,
              },
            }
          );
          if (data?.success) {
            toast.success(`${selectedIds.length} user(s) deleted successfully`);
            setRowSelection({});
            fetchUsers(currentPage);
          }
        } catch (error) {
          console.error(error);
          toast.error(
            error.response?.data?.message || "Failed to delete users"
          );
        }
      }
    });
  };

  const handleBulkStatusUpdate = async (status) => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/bulk/status`,
        { userIds: selectedIds, status },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      if (data?.success) {
        toast.success(`${data.modifiedCount} user(s) status updated`);
        setRowSelection({});
        fetchUsers(currentPage);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleStatusToggle = useCallback(
    async (userId, currentStatus) => {
      try {
        const newStatus = !currentStatus;
        const { data } = await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/update/role/${userId}`,
          { status: newStatus },
          {
            headers: {
              Authorization: auth?.token,
            },
          }
        );
        if (data?.success) {
          toast.success(
            `User ${newStatus ? "activated" : "blocked"} successfully`
          );
          fetchUsers(currentPage);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to update status");
      }
    },
    [auth?.token, currentPage]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "avatar",
        minSize: 60,
        maxSize: 100,
        size: 70,
        grow: false,
        Header: "AVATAR",
        Cell: ({ cell, row }) => {
          const avatar = cell.getValue();
          const name = row.original?.name || "";

          return (
            <div className="w-12 h-12 relative rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden flex items-center justify-center border-2 border-white shadow-lg">
              {avatar && avatar !== "N/A" && avatar.startsWith("http") ? (
                <Image
                  src={avatar}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        minSize: 150,
        maxSize: 200,
        size: 180,
        Header: "USER NAME",
        Cell: ({ cell, row }) => {
          const name = cell.getValue();
          const lastName = row.original?.lastName || "";
          const email = row.original?.email || "";

          return (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {name} {lastName}
              </span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">
                {email}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        minSize: 180,
        maxSize: 250,
        size: 220,
        Header: "EMAIL",
        Cell: ({ cell }) => {
          const email = cell.getValue();
          return (
            <span className="text-sm text-gray-700 truncate block max-w-[200px]">
              {email}
            </span>
          );
        },
      },
      {
        accessorKey: "number",
        minSize: 120,
        maxSize: 150,
        size: 130,
        Header: "PHONE",
        Cell: ({ cell, row }) => {
          const number = cell.getValue();
          const phoneCode = row.original?.phoneCode || "";
          return (
            <span className="text-sm text-gray-700">
              {phoneCode} {number || "N/A"}
            </span>
          );
        },
      },
      {
        accessorKey: "addressDetails.city",
        minSize: 100,
        maxSize: 150,
        size: 120,
        Header: "LOCATION",
        Cell: ({ row }) => {
          const address = row.original?.addressDetails || {};
          return (
            <div className="flex flex-col">
              <span className="text-sm text-gray-700">
                {address.city || "N/A"}
              </span>
              {address.country && (
                <span className="text-xs text-gray-500">{address.country}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        minSize: 100,
        maxSize: 130,
        size: 110,
        Header: "ROLE",
        Cell: ({ cell, row }) => {
          const role = cell.getValue() || "user";

          const roleColors = {
            superadmin: "bg-purple-100 text-purple-800 border-purple-500",
            admin: "bg-blue-100 text-blue-800 border-blue-500",
            agent: "bg-green-100 text-green-800 border-green-500",
            seller: "bg-orange-100 text-orange-800 border-orange-500",
            user: "bg-gray-100 text-gray-800 border-gray-500",
          };

          const handleUpdate = async (value) => {
            try {
              const { data } = await axios.put(
                `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/update/role/${row.original._id}`,
                { role: value },
                {
                  headers: {
                    Authorization: auth?.token,
                  },
                }
              );
              if (data?.success) {
                toast.success("Role updated successfully");
                fetchUsers(currentPage);
              }
            } catch (error) {
              console.error(error);
              toast.error(
                error.response?.data?.message || "Failed to update role"
              );
            }
          };

          return (
            <div className="w-full">
              <select
                onChange={(e) => handleUpdate(e.target.value)}
                value={role}
                disabled={
                  auth.user?.role !== "superadmin" &&
                  auth.user?.role !== "admin"
                }
                className={`w-full border rounded-md p-1 text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-[#c6080a] ${
                  roleColors[role] || roleColors.user
                } ${
                  auth.user?.role !== "superadmin" &&
                  auth.user?.role !== "admin"
                    ? "cursor-not-allowed opacity-75"
                    : "cursor-pointer"
                }`}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
                <option value="agent">Agent</option>
              </select>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        minSize: 100,
        maxSize: 130,
        size: 110,
        Header: "STATUS",
        Cell: ({ cell, row }) => {
          const status = cell.getValue() || false;

          const handleToggle = async () => {
            const newStatus = !status;
            await handleStatusToggle(row.original._id, status);
          };

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#c6080a] focus:ring-offset-2 ${
                  status ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    status ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-xs text-gray-600">
                {status ? "Active" : "Blocked"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "isSeller",
        minSize: 100,
        maxSize: 130,
        size: 110,
        Header: "SELLER",
        Cell: ({ cell, row }) => {
          const isSeller = cell.getValue();
          const sellerStatus = row.original?.sellerStatus || "none";

          if (!isSeller) {
            return (
              <span className="px-2 py-1 rounded text-xs text-gray-500">
                No
              </span>
            );
          }

          const statusColors = {
            approved: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            rejected: "bg-red-100 text-red-800",
            suspended: "bg-gray-100 text-gray-800",
          };

          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Yes
              </span>
              {sellerStatus !== "none" && (
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    statusColors[sellerStatus] || statusColors.pending
                  }`}
                >
                  {sellerStatus}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        minSize: 120,
        maxSize: 150,
        size: 130,
        Header: "JOINED",
        Cell: ({ cell }) => {
          const date = cell.getValue();
          return (
            <span className="text-sm text-gray-600">
              {format(new Date(date), "MMM dd, yyyy")}
            </span>
          );
        },
      },
      ...(auth.user?.role === "superadmin" || auth.user?.role === "admin"
        ? [
            {
              accessorKey: "Actions",
              minSize: 150,
              maxSize: 180,
              size: 160,
              Header: "ACTIONS",
              Cell: ({ row }) => {
                return (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowAddUser(true);
                        setUserId(row.original._id);
                      }}
                      className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Edit"
                    >
                      <MdModeEditOutline className="text-yellow-600 text-lg" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirmation(row.original._id)}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Delete"
                    >
                      <MdDelete className="text-red-600 text-lg" />
                    </button>
                  </div>
                );
              },
            },
          ]
        : []),
    ],
    [
      auth.user?.role,
      currentPage,
      handleStatusToggle,
      handleDeleteConfirmation,
      setShowAddUser,
      setUserId,
      fetchUsers,
      auth?.token,
    ]
  );

  // Ensure columns is always an array
  const safeColumns = useMemo(() => {
    if (!columns || !Array.isArray(columns)) return [];
    return columns.filter(
      (col) => col && typeof col === "object" && col.accessorKey
    );
  }, [columns]);

  // Ensure data is always an array
  const safeData = useMemo(() => {
    if (!filterUser || !Array.isArray(filterUser)) return [];
    return filterUser.filter(
      (item) => item && typeof item === "object" && item !== null
    );
  }, [filterUser]);

  // Helpers
  const getValue = (row, accessor) => {
    if (!row || !accessor) return "";
    if (accessor.includes(".")) {
      return accessor.split(".").reduce((acc, key) => acc?.[key], row) ?? "";
    }
    return row[accessor] ?? "";
  };

  const renderCell = (col, row) => {
    const value = getValue(row, col.accessorKey);
    if (typeof col.Cell === "function") {
      return col.Cell({
        cell: { getValue: () => value },
        row: { original: row },
      });
    }
    return value;
  };

  // Selection handling for bulk actions
  const allRowIds = safeData.map((row, idx) =>
    String(row?._id || row?.id || idx)
  );
  const toggleSelectAll = () => {
    if (allRowIds.every((id) => rowSelection[id])) {
      setRowSelection({});
    } else {
      const next = {};
      allRowIds.forEach((id) => {
        next[id] = true;
      });
      setRowSelection(next);
    }
  };

  const toggleSelectRow = (id) => {
    setRowSelection((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (closeModal.current && !closeModal.current.contains(event.target)) {
        setUserId("");
        setShowAddUser(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <MainLayout
      title="User Management - Admin Dashboard"
      description="Manage users, roles, and permissions"
      keywords="users, admin, management"
    >
      <div className="relative p-4 sm:p-6 h-full w-full flex flex-col">
        <Breadcrumb path={currentUrl} />

        <div className="flex flex-col gap-6 mt-6">
          {/* Header Section */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#c6080a] to-[#e63946] bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            {(auth.user?.role === "superadmin" ||
              auth.user?.role === "admin") && (
              <div className="flex items-center gap-3">
                {Object.keys(rowSelection).length > 0 && (
                  <>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleBulkStatusUpdate(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                      <FaUserCheck className="text-lg" />
                      Activate ({Object.keys(rowSelection).length})
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleBulkStatusUpdate(false)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                      <FaUserSlash className="text-lg" />
                      Block ({Object.keys(rowSelection).length})
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      Delete ({Object.keys(rowSelection).length})
                    </motion.button>
                  </>
                )}
                <button
                  onClick={() => setShowAddUser(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#c6080a] to-[#e63946] hover:from-[#a00608] hover:to-[#c6080a] text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  Add New User
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Users",
                value: stats.total,
                color: "blue",
                icon: "👥",
                bg: "from-indigo-500 via-sky-500 to-cyan-400",
              },
              {
                label: "Active Users",
                value: stats.active,
                color: "green",
                icon: "✅",
                bg: "from-emerald-500 via-green-500 to-lime-400",
              },
              {
                label: "Blocked Users",
                value: stats.blocked,
                color: "red",
                icon: "🚫",
                bg: "from-rose-500 via-red-500 to-orange-400",
              },
              {
                label: "Sellers",
                value: stats.byRole?.seller || 0,
                color: "orange",
                icon: "🏪",
                bg: "from-amber-500 via-orange-500 to-pink-500",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${stat.bg}`}
              >
                {/* subtle glass overlay */}
                <div className="pointer-events-none absolute inset-0 bg-white/5" />
                <div className="relative flex items-center justify-between z-10">
                  <div>
                    <p className="text-sm text-white/80 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white drop-shadow-sm">
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-4xl drop-shadow-sm">{stat.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs and Filters */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-4 mb-4 overflow-x-auto">
              {["All", "Active", "Blocked"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {tab} (
                  {tab === "All"
                    ? stats.total
                    : tab === "Active"
                    ? stats.active
                    : stats.blocked}
                  )
                </button>
              ))}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600">Filter by Role:</span>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c6080a] text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
            </div>

            {/* Search and Pagination */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search users by name, email, or location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c6080a] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  <CiCircleChevLeft className="text-2xl text-[#c6080a]" />
                </button>
                <button
                  onClick={() => handlePageChange("next")}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  <CiCircleChevRight className="text-2xl text-[#c6080a]" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-lg p-4 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader />
              </div>
            ) : safeColumns.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={
                            allRowIds.length > 0 &&
                            allRowIds.every((id) => rowSelection[id])
                          }
                          className="accent-[#c6080a] w-4 h-4"
                        />
                      </TableHead>
                      {safeColumns.map((col) => (
                        <TableHead key={col.accessorKey} className="text-xs">
                          {col.Header || col.accessorKey}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={safeColumns.length + 1}>
                          <div className="flex items-center justify-center py-10 text-gray-500">
                            No users found
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeData.map((row, idx) => {
                        const rowId = String(row?._id || row?.id || idx);
                        return (
                          <TableRow key={rowId}>
                            <TableCell>
                              <input
                                type="checkbox"
                                className="accent-[#c6080a] w-4 h-4"
                                checked={!!rowSelection[rowId]}
                                onChange={() => toggleSelectRow(rowId)}
                              />
                            </TableCell>
                            {safeColumns.map((col) => (
                              <TableCell key={col.accessorKey}>
                                {renderCell(col, row)}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500 text-lg">No users found</p>
              </div>
            )}
          </div>
        </div>

        {/* User Modal */}
        <AnimatePresence>
          {showAddUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-black/50 backdrop-blur-sm overflow-y-auto"
            >
              <UserModal
                closeModal={closeModal}
                setShowAddUser={setShowAddUser}
                userId={userId}
                setUserId={setUserId}
                fetchUsers={() => fetchUsers(currentPage)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
