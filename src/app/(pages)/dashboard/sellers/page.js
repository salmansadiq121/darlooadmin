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
import { IoClose, IoSearch } from "react-icons/io5";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import { format } from "date-fns";
import Image from "next/image";
import {
  MdModeEditOutline,
  MdDelete,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import { Style } from "@/app/utils/CommonStyle";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useAuth } from "@/app/context/authContext";
import { HiSwitchHorizontal } from "react-icons/hi";
import { TbShieldCheck, TbShieldX } from "react-icons/tb";
import { FaStore, FaUserCheck, FaStar } from "react-icons/fa";
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

export default function Sellers() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [sellerData, setSellerData] = useState([]);
  const [filterSellers, setFilterSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const itemsPerPage = 20;
  const [verificationStatus, setVerificationStatus] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Suspension modal state
  const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
  const [suspensionSeller, setSuspensionSeller] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isSuspensionSubmitting, setIsSuspensionSubmitting] = useState(false);

  const fetchSellers = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...filters,
      });

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/all?${params}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        setSellerData(data.sellers || []);
        setFilterSellers(data.sellers || []);
        setTotalPages(data.pagination?.pages || 1);
        setStats({
          total: data.pagination?.total || 0,
          active: data.sellers?.filter((s) => s.isActive)?.length || 0,
          pending:
            data.sellers?.filter((s) => s.verificationStatus === "pending")
              ?.length || 0,
          approved:
            data.sellers?.filter((s) => s.verificationStatus === "approved")
              ?.length || 0,
          rejected:
            data.sellers?.filter((s) => s.verificationStatus === "rejected")
              ?.length || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error(error.response?.data?.message || "Failed to fetch sellers");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (auth?.token) {
      const filters = {};
      if (activeTab !== "All") {
        if (activeTab === "Active") filters.status = "true";
        if (activeTab === "Pending") filters.verificationStatus = "pending";
        if (activeTab === "Approved") filters.verificationStatus = "approved";
        if (activeTab === "Rejected") filters.verificationStatus = "rejected";
      }
      if (debouncedSearchQuery) filters.search = debouncedSearchQuery;
      fetchSellers(currentPage, filters);
    }
  }, [auth?.token, currentPage, activeTab, debouncedSearchQuery]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.pathname);
    }
  }, []);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
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

  const handleDeleteConfirmation = (sellerId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this seller!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c6080a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(sellerId);
      }
    });
  };

  const handleDelete = async (id) => {
    try {
      // Note: You may need to add a delete seller endpoint
      toast.success("Delete functionality - implement API endpoint");
      fetchSellers(currentPage);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete seller");
    }
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) {
      toast.error("Please select at least one seller");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedIds.length} seller(s)!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c6080a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete them!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Implement bulk delete
        toast.success("Bulk delete - implement API endpoint");
        setRowSelection({});
        fetchSellers(currentPage);
      }
    });
  };

  const openSuspensionModal = (seller) => {
    setSuspensionSeller(seller);
    setSuspensionReason(seller.suspensionReason || "");
    setSuspensionModalOpen(true);
  };

  const closeSuspensionModal = () => {
    setSuspensionModalOpen(false);
    setSuspensionSeller(null);
    setSuspensionReason("");
    setIsSuspensionSubmitting(false);
  };

  const handleStatusUpdate = async (
    sellerId,
    verificationStatus,
    isActive,
    suspensionReason
  ) => {
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/status/${sellerId}`,
        { verificationStatus, isActive, suspensionReason },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        toast.success("Seller status updated successfully");
        fetchSellers(currentPage);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status, isActive) => {
    if (!isActive) {
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 shadow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          Inactive
        </motion.span>
      );
    }

    const statusConfig = {
      approved: {
        bg: "from-emerald-100 to-emerald-200",
        text: "text-emerald-800",
        border: "border-emerald-400",
        dot: "bg-emerald-600",
        label: "Approved",
        icon: TbShieldCheck,
      },
      pending: {
        bg: "from-amber-100 to-amber-200",
        text: "text-amber-800",
        border: "border-amber-400",
        dot: "bg-amber-600",
        label: "Pending",
        icon: HiSwitchHorizontal,
      },
      rejected: {
        bg: "from-red-100 to-red-200",
        text: "text-red-800",
        border: "border-red-400",
        dot: "bg-red-600",
        label: "Rejected",
        icon: TbShieldX,
      },
      suspended: {
        bg: "from-gray-100 to-gray-200",
        text: "text-gray-800",
        border: "border-gray-400",
        dot: "bg-gray-600",
        label: "Suspended",
        icon: MdCancel,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${config.bg} ${config.text} border ${config.border} shadow-sm`}
      >
        <Icon className="text-xs" />
        {config.label}
      </motion.span>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "storeLogo",
        minSize: 60,
        maxSize: 100,
        size: 70,
        grow: false,
        Header: "LOGO",
        Cell: ({ cell, row }) => {
          const logo = cell.getValue();
          const storeName = row.original?.storeName || "";

          return (
            <div className="w-12 h-12 relative rounded-lg bg-gradient-to-br from-[#c6080a] to-[#e63946] overflow-hidden flex items-center justify-center">
              {logo ? (
                <Image
                  src={logo}
                  alt={storeName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <FaStore className="text-white text-xl" />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "storeName",
        minSize: 150,
        maxSize: 250,
        size: 200,
        Header: "STORE NAME",
        Cell: ({ cell, row }) => {
          const name = cell.getValue();
          const slug = row.original?.storeSlug || "";

          return (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{name}</span>
              <span className="text-xs text-gray-500">/{slug}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "user",
        minSize: 150,
        maxSize: 200,
        size: 180,
        Header: "OWNER",
        Cell: ({ cell }) => {
          const user = cell.getValue();
          if (!user) return <span className="text-gray-400">N/A</span>;

          return (
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {user.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {user.name}
                </span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "verificationStatus",
        minSize: 120,
        maxSize: 150,
        size: 130,
        Header: "VERIFICATION",
        Cell: ({ cell, row }) => {
          const status = cell.getValue();
          const isActive = row.original?.isActive || false;
          return getStatusBadge(status, isActive);
        },
      },
      {
        accessorKey: "rating.average",
        minSize: 140,
        maxSize: 180,
        size: 160,
        Header: "RATING",
        Cell: ({ cell, row }) => {
          const rating = cell.getValue() || 0;
          const reviews = row.original?.rating?.totalReviews || 0;
          const roundedRating = Math.round(rating * 10) / 10;

          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                {/* Rating Number */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-white font-bold text-sm shadow-md">
                  {roundedRating.toFixed(1)}
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => {
                    const isFilled = i < Math.floor(rating);
                    const isHalfFilled = !isFilled && i < rating;

                    return (
                      <div key={i} className="relative">
                        <FaStar
                          className={`text-xs ${
                            isFilled
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300 fill-gray-300"
                          } transition-colors duration-200`}
                        />
                        {isHalfFilled && (
                          <div className="absolute inset-0 overflow-hidden w-1/2">
                            <FaStar className="text-xs text-amber-400 fill-amber-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Count */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-600">
                  {reviews}
                </span>
                <span className="text-xs text-gray-400">
                  {reviews === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "totalProducts",
        minSize: 100,
        maxSize: 120,
        size: 110,
        Header: "PRODUCTS",
        Cell: ({ cell }) => {
          const count = cell.getValue() || 0;
          return <span className="font-semibold text-gray-700">{count}</span>;
        },
      },
      {
        accessorKey: "totalSales",
        minSize: 100,
        maxSize: 120,
        size: 110,
        Header: "SALES",
        Cell: ({ cell }) => {
          const sales = cell.getValue() || 0;
          return <span className="font-semibold text-gray-700">{sales}</span>;
        },
      },
      {
        accessorKey: "totalRevenue",
        minSize: 120,
        maxSize: 150,
        size: 130,
        Header: "REVENUE",
        Cell: ({ cell }) => {
          const revenue = cell.getValue() || 0;
          return (
            <span className="font-semibold text-green-600">
              €{revenue.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        minSize: 100,
        maxSize: 120,
        size: 110,
        Header: "STATUS",
        Cell: ({ cell, row }) => {
          const isActive = cell.getValue() || false;

          const handleToggle = async (e) => {
            if (e) {
              e.stopPropagation();
              e.preventDefault();
            }
            const newStatus = !isActive;
            await handleStatusUpdate(
              row.original._id,
              row.original.verificationStatus,
              newStatus,
              undefined
            );
          };

          return (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleToggle(e);
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#c6080a] focus:ring-offset-2 shadow-inner cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-gray-700">
                {isActive ? "Active" : "Inactive"}
              </span>
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
                const seller = row.original;

                return (
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        handleStatusUpdate(
                          seller._id,
                          "approved",
                          seller.isActive,
                          undefined
                        )
                      }
                      className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Approve Seller"
                    >
                      <TbShieldCheck className="text-lg" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        handleStatusUpdate(
                          seller._id,
                          "rejected",
                          seller.isActive,
                          undefined
                        )
                      }
                      className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Reject Seller"
                    >
                      <TbShieldX className="text-lg" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openSuspensionModal(seller)}
                      className="p-2.5 bg-gradient-to-br from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Suspend Seller"
                    >
                      <MdCancel className="text-lg" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteConfirmation(seller._id)}
                      className="p-2.5 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                      title="Delete Seller"
                    >
                      <MdDelete className="text-lg" />
                    </motion.button>
                  </div>
                );
              },
            },
          ]
        : []),
    ],
    [auth.user?.role, rowSelection]
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
    if (!filterSellers || !Array.isArray(filterSellers)) return [];
    return filterSellers.filter((item) => item && typeof item === "object");
  }, [filterSellers]);

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

  return (
    <MainLayout
      title="Sellers Management - Admin Dashboard"
      description="Manage sellers, verifications, and store settings"
      keywords="sellers, marketplace, admin, management"
    >
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6 h-full w-full flex flex-col">
        <Breadcrumb path={currentUrl} />

        <div className="flex flex-col gap-6 mt-0">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c6080a] via-[#e63946] to-rose-500 flex items-center justify-center shadow-xl shadow-red-500/30">
                <FaStore className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-600 bg-clip-text text-transparent">
                  Sellers Management
                </h1>
                <p className="text-gray-600 mt-1.5 text-sm sm:text-base">
                  Manage seller accounts, verifications, and store settings
                </p>
              </div>
            </div>
            {(auth.user?.role === "superadmin" ||
              auth.user?.role === "admin") && (
              <div className="flex items-center gap-3">
                {Object.keys(rowSelection).length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <MdDelete className="text-lg" />
                    <span>
                      Delete Selected ({Object.keys(rowSelection).length})
                    </span>
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                label: "Total Sellers",
                value: stats.total,
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100/50",
                icon: FaStore,
              },
              {
                label: "Active",
                value: stats.active,
                color: "from-emerald-500 to-emerald-600",
                bgColor: "from-emerald-50 to-emerald-100/50",
                icon: MdCheckCircle,
              },
              {
                label: "Pending",
                value: stats.pending,
                color: "from-amber-500 to-amber-600",
                bgColor: "from-amber-50 to-amber-100/50",
                icon: HiSwitchHorizontal,
              },
              {
                label: "Approved",
                value: stats.approved,
                color: "from-green-500 to-green-600",
                bgColor: "from-green-50 to-green-100/50",
                icon: TbShieldCheck,
              },
              {
                label: "Rejected",
                value: stats.rejected,
                color: "from-red-500 to-red-600",
                bgColor: "from-red-50 to-red-100/50",
                icon: TbShieldX,
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="relative overflow-hidden group bg-white rounded-2xl p-5 shadow-lg border border-gray-200/60 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="text-white text-xl" />
                    </div>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tr from-transparent to-white/20 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              );
            })}
          </div>

          {/* Enhanced Tabs */}
          <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-2 flex items-center gap-2 overflow-x-auto">
            {["All", "Active", "Pending", "Approved", "Rejected"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <motion.button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "text-white"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 rounded-xl shadow-lg"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Enhanced Search and Pagination */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[280px]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c6080a]/5 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl z-10" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search sellers by name, email, or store..."
                className="relative w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6080a]/20 focus:border-[#c6080a] transition-all duration-200 bg-gray-50/50 hover:bg-white"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors disabled:hover:bg-transparent"
                >
                  <CiCircleChevLeft className="text-2xl text-[#c6080a]" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePageChange("next")}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors disabled:hover:bg-transparent"
                >
                  <CiCircleChevRight className="text-2xl text-[#c6080a]" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Suspension Reason Modal */}
          <AnimatePresence>
            {suspensionModalOpen && suspensionSeller && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={closeSuspensionModal}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold">
                        Suspend Seller
                      </h3>
                      <p className="text-xs text-gray-200 mt-0.5 truncate max-w-xs">
                        {suspensionSeller.storeName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeSuspensionModal}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-100 hover:text-white transition-colors"
                    >
                      <IoClose className="text-base" />
                    </button>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    <p className="text-xs text-gray-600">
                      Please provide a clear reason for suspending this seller.
                      This reason will be visible on the seller&apos;s profile.
                    </p>
                    <textarea
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      rows={4}
                      placeholder="Enter suspension reason..."
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6080a]/20 focus:border-[#c6080a] resize-none"
                    />
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeSuspensionModal}
                      className="px-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-white"
                      disabled={isSuspensionSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!suspensionReason.trim()) {
                          toast.error("Suspension reason is required");
                          return;
                        }
                        try {
                          setIsSuspensionSubmitting(true);
                          await handleStatusUpdate(
                            suspensionSeller._id,
                            "suspended",
                            false,
                            suspensionReason.trim()
                          );
                          closeSuspensionModal();
                        } catch (error) {
                          console.error(error);
                        } finally {
                          setIsSuspensionSubmitting(false);
                        }
                      }}
                      className="px-5 py-2 text-xs sm:text-sm rounded-xl font-semibold text-white bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={isSuspensionSubmitting}
                    >
                      {isSuspensionSubmitting
                        ? "Saving..."
                        : "Confirm Suspension"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader />
              </div>
            ) : safeColumns.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={
                            allRowIds.length > 0 &&
                            allRowIds.every((id) => rowSelection[id])
                          }
                          className="w-4 h-4 rounded border-gray-300 text-[#c6080a] focus:ring-2 focus:ring-[#c6080a]/20 cursor-pointer"
                        />
                      </TableHead>
                      {safeColumns.map((col) => (
                        <TableHead
                          key={col.accessorKey}
                          className="text-xs font-bold text-gray-700 uppercase tracking-wider py-4"
                        >
                          {col.Header || col.accessorKey}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={safeColumns.length + 1}>
                          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <FaStore className="text-5xl mb-4 opacity-30" />
                            <p className="text-lg font-medium">
                              No sellers found
                            </p>
                            <p className="text-sm mt-1">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      safeData.map((row, idx) => {
                        const rowId = String(row?._id || row?.id || idx);
                        return (
                          <motion.tr
                            key={rowId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-[#c6080a]/5 hover:to-transparent transition-all duration-200 group"
                          >
                            <TableCell className="py-4">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-[#c6080a] focus:ring-2 focus:ring-[#c6080a]/20 cursor-pointer"
                                checked={!!rowSelection[rowId]}
                                onChange={() => toggleSelectRow(rowId)}
                              />
                            </TableCell>
                            {safeColumns.map((col) => (
                              <TableCell
                                key={col.accessorKey}
                                className="py-4 group-hover:text-gray-900 transition-colors"
                              >
                                {renderCell(col, row)}
                              </TableCell>
                            ))}
                          </motion.tr>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <FaStore className="text-5xl mb-4 opacity-30" />
                <p className="text-lg font-medium">No sellers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
