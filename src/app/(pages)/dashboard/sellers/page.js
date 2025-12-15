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
import { FaStore, FaUserCheck } from "react-icons/fa";
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

  useEffect(() => {
    if (auth?.token) {
      const filters = {};
      if (activeTab !== "All") {
        if (activeTab === "Active") filters.status = "true";
        if (activeTab === "Pending") filters.verificationStatus = "pending";
        if (activeTab === "Approved") filters.verificationStatus = "approved";
        if (activeTab === "Rejected") filters.verificationStatus = "rejected";
      }
      if (searchQuery) filters.search = searchQuery;
      fetchSellers(currentPage, filters);
    }
  }, [auth?.token, currentPage, activeTab, searchQuery]);

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

  const handleStatusUpdate = async (sellerId, verificationStatus, isActive) => {
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/status/${sellerId}`,
        { verificationStatus, isActive },
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
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300">
          Inactive
        </span>
      );
    }

    const statusConfig = {
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-500",
        label: "Approved",
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-500",
        label: "Pending",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-500",
        label: "Rejected",
      },
      suspended: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-500",
        label: "Suspended",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}
      >
        {config.label}
      </span>
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
            <div className="flex items-center gap-2">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
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
        minSize: 100,
        maxSize: 120,
        size: 110,
        Header: "RATING",
        Cell: ({ cell, row }) => {
          const rating = cell.getValue() || 0;
          const reviews = row.original?.rating?.totalReviews || 0;

          return (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.round(rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-600">({reviews})</span>
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

          const handleToggle = async () => {
            const newStatus = !isActive;
            await handleStatusUpdate(
              row.original._id,
              row.original.verificationStatus,
              newStatus
            );
          };

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#c6080a] focus:ring-offset-2 ${
                  isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-xs text-gray-600">
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
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          seller._id,
                          "approved",
                          seller.isActive
                        )
                      }
                      className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Approve"
                    >
                      <TbShieldCheck className="text-green-600 text-lg" />
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          seller._id,
                          "rejected",
                          seller.isActive
                        )
                      }
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Reject"
                    >
                      <TbShieldX className="text-red-600 text-lg" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirmation(seller._id)}
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
      <div className="relative p-4 sm:p-6 h-full w-full flex flex-col">
        <Breadcrumb path={currentUrl} />

        <div className="flex flex-col gap-6 mt-6">
          {/* Header Section */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#c6080a] to-[#e63946] bg-clip-text text-transparent">
                Sellers Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage seller accounts, verifications, and store settings
              </p>
            </div>
            {(auth.user?.role === "superadmin" ||
              auth.user?.role === "admin") && (
              <div className="flex items-center gap-3">
                {Object.keys(rowSelection).length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Delete Selected ({Object.keys(rowSelection).length})
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Sellers", value: stats.total, color: "blue" },
              { label: "Active", value: stats.active, color: "green" },
              { label: "Pending", value: stats.pending, color: "yellow" },
              { label: "Approved", value: stats.approved, color: "emerald" },
              { label: "Rejected", value: stats.rejected, color: "red" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-1 flex items-center gap-2 overflow-x-auto">
            {["All", "Active", "Pending", "Approved", "Rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search and Pagination */}
          <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search sellers by name, email, or store..."
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
                            No sellers found
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
                <p className="text-gray-500 text-lg">No sellers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
