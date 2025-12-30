"use client";
import Loader from "@/app/utils/Loader";
import dynamic from "next/dynamic";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoSearch, IoRefresh, IoTrash } from "react-icons/io5";
import { format } from "date-fns";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";
import { ImSpinner4 } from "react-icons/im";
import { useAuth } from "@/app/context/authContext";
import { FaCheckCircle, FaTimesCircle, FaClock, FaRedo, FaPercent } from "react-icons/fa";
import { MdOutlineEuro } from "react-icons/md";

const MainLayout = dynamic(
  () => import("./../../../components/layout/MainLayout"),
  {
    ssr: false,
  }
);
const Breadcrumb = dynamic(() => import("./../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function Affiliates() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [affiliateData, setAffiliateData] = useState([]);
  const [stats, setStats] = useState({
    totalAffiliateOrders: 0,
    trackedOrders: 0,
    failedOrders: 0,
    pendingOrders: 0,
    totalCommission: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [retryingId, setRetryingId] = useState("");
  const [selectedRows, setSelectedRows] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionRate, setCommissionRate] = useState(5);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);
  const isInitialRender = useRef(true);

  // Current URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathArray = window.location.pathname;
      setCurrentUrl(pathArray);
    }
  }, []);

  // Fetch Affiliate Tracking Data
  const fetchAffiliateData = async () => {
    if (isInitialRender.current) {
      setIsloading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/affiliate/tracking`,
        {
          headers: {
            Authorization: `${auth?.token}`,
          },
        }
      );
      if (data && data.success) {
        setAffiliateData(data.orders || []);
        setStats(data.stats || stats);
        setFilteredData(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch affiliate data"
      );
    } finally {
      if (isInitialRender.current) {
        setIsloading(false);
        isInitialRender.current = false;
      }
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchAffiliateData();
    }
    // eslint-disable-next-line
  }, [auth?.token]);

  // Search Filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(affiliateData);
      return;
    }

    const filtered = affiliateData.filter((order) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        order.orderNumber?.toString().toLowerCase().includes(searchLower) ||
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower) ||
        order.affiliate?.affiliateId?.toLowerCase().includes(searchLower) ||
        order.affiliate?.affiliateEmail?.toLowerCase().includes(searchLower) ||
        order.totalAmount?.toString().toLowerCase().includes(searchLower)
      );
    });
    setFilteredData(filtered);
  }, [searchQuery, affiliateData]);

  // Retry Failed Tracking
  const handleRetryTracking = async (orderId) => {
    try {
      setRetryingId(orderId);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/affiliate/retry/${orderId}`,
        {},
        {
          headers: {
            Authorization: `${auth?.token}`,
          },
        }
      );

      if (data && data.success) {
        toast.success("Tracking retried successfully!");
        await fetchAffiliateData();
      } else {
        toast.error(data?.message || "Failed to retry tracking");
      }
    } catch (error) {
      console.error("Error retrying tracking:", error);
      toast.error(error.response?.data?.message || "Failed to retry tracking");
    } finally {
      setRetryingId("");
    }
  };

  // Get selected order IDs
  const getSelectedOrderIds = () => {
    return Object.keys(selectedRows).filter((key) => selectedRows[key]);
  };

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    const selectedIds = getSelectedOrderIds();
    if (selectedIds.length === 0) {
      toast.error("Please select at least one record to delete");
      return;
    }

    const result = await Swal.fire({
      title: "Delete Affiliate Records?",
      text: `Are you sure you want to delete ${selectedIds.length} affiliate tracking record(s)? This will remove the affiliate data from these orders.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(true);
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/affiliate/bulk-delete`,
          { orderIds: selectedIds },
          {
            headers: {
              Authorization: `${auth?.token}`,
            },
          }
        );

        if (data && data.success) {
          toast.success(data.message || "Records deleted successfully!");
          setSelectedRows({});
          await fetchAffiliateData();
        } else {
          toast.error(data?.message || "Failed to delete records");
        }
      } catch (error) {
        console.error("Error deleting records:", error);
        toast.error(error.response?.data?.message || "Failed to delete records");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Update Commission Handler
  const handleUpdateCommission = async () => {
    const selectedIds = getSelectedOrderIds();
    if (selectedIds.length === 0) {
      toast.error("Please select at least one record to update commission");
      return;
    }

    try {
      setIsUpdatingCommission(true);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/affiliate/update-commission`,
        { orderIds: selectedIds, commissionRate },
        {
          headers: {
            Authorization: `${auth?.token}`,
          },
        }
      );

      if (data && data.success) {
        toast.success(data.message || "Commission updated successfully!");
        setShowCommissionModal(false);
        setSelectedRows({});
        await fetchAffiliateData();
      } else {
        toast.error(data?.message || "Failed to update commission");
      }
    } catch (error) {
      console.error("Error updating commission:", error);
      toast.error(error.response?.data?.message || "Failed to update commission");
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  // Table Columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "orderNumber",
        header: "Order #",
        size: 100,
        Cell: ({ cell }) => (
          <span className="font-semibold text-blue-600">
            #{cell.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "user.name",
        header: "Customer",
        size: 150,
        Cell: ({ row }) => {
          const user = row.original.user;
          return (
            <div className="flex flex-col">
              <span className="font-medium">{user?.name || "N/A"}</span>
              <span className="text-xs text-gray-500">{user?.email || ""}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "totalAmount",
        header: "Amount",
        size: 120,
        Cell: ({ cell }) => (
          <span className="font-semibold text-green-600 flex items-center gap-1">
            <MdOutlineEuro />
            {parseFloat(cell.getValue() || 0).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "affiliate.trackingStatus",
        header: "Status",
        size: 130,
        Cell: ({ cell, row }) => {
          const status = cell.getValue() || "Pending";
          const statusConfig = {
            Tracked: {
              icon: FaCheckCircle,
              color: "text-green-600",
              bg: "bg-green-100",
              border: "border-green-600",
            },
            Failed: {
              icon: FaTimesCircle,
              color: "text-red-600",
              bg: "bg-red-100",
              border: "border-red-600",
            },
            Pending: {
              icon: FaClock,
              color: "text-yellow-600",
              bg: "bg-yellow-100",
              border: "border-yellow-600",
            },
          };

          const config = statusConfig[status] || statusConfig.Pending;
          const Icon = config.icon;

          return (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full border-2 ${config.border} ${config.bg} ${config.color}`}
              >
                <Icon className="text-sm" />
                <span className="text-xs font-medium">{status}</span>
              </div>
              {status === "Failed" && (
                <button
                  onClick={() => handleRetryTracking(row.original._id)}
                  disabled={retryingId === row.original._id}
                  className="p-1 bg-blue-100 hover:bg-blue-200 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer disabled:opacity-50"
                  title="Retry Tracking"
                >
                  {retryingId === row.original._id ? (
                    <ImSpinner4 className="text-xs text-blue-600 animate-spin" />
                  ) : (
                    <FaRedo className="text-xs text-blue-600" />
                  )}
                </button>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "affiliate.referredBy",
        header: "Affiliate ID",
        size: 150,
        Cell: ({ cell, row }) => (
          <span className="text-sm text-gray-700">
            {cell.getValue() || row.original.affiliate?.affiliateId || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "affiliate.commissionAmount",
        header: "Commission",
        size: 120,
        Cell: ({ cell, row }) => {
          const rate = row.original.affiliate?.commissionRate;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-purple-600 flex items-center gap-1">
                <MdOutlineEuro />
                {parseFloat(cell.getValue() || 0).toFixed(2)}
              </span>
              {rate && (
                <span className="text-xs text-gray-500">({rate}%)</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "affiliate.trackedAt",
        header: "Tracked At",
        size: 150,
        Cell: ({ cell }) => {
          const date = cell.getValue();
          return date ? (
            <span className="text-xs text-gray-600">
              {format(new Date(date), "MMM dd, yyyy HH:mm")}
            </span>
          ) : (
            <span className="text-xs text-gray-400">Not tracked</span>
          );
        },
      },
      {
        accessorKey: "affiliate.trackingError",
        header: "Error",
        size: 200,
        Cell: ({ cell, row }) => {
          const error = cell.getValue();
          const status = row.original.affiliate?.trackingStatus;
          if (status !== "Failed" || !error) return <span>-</span>;
          return (
            <span className="text-xs text-red-600 truncate" title={error}>
              {error}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Order Date",
        size: 150,
        Cell: ({ cell }) => (
          <span className="text-xs text-gray-600">
            {format(new Date(cell.getValue()), "MMM dd, yyyy")}
          </span>
        ),
      },
    ],
    [retryingId, auth?.token]
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    enableColumnResizing: true,
    enablePagination: true,
    paginationDisplayMode: "pages",
    enableRowSelection: true,
    onRowSelectionChange: setSelectedRows,
    state: { rowSelection: selectedRows },
    getRowId: (row) => row._id,
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
      density: "compact",
    },
    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "12px",
        backgroundColor: "#c6080a",
        color: "#fff",
        padding: ".7rem 0.3rem",
      },
    },
    muiTableBodyCellProps: {
      style: {
        fontSize: "13px",
        padding: ".5rem 0.3rem",
      },
    },
  });

  const selectedCount = getSelectedOrderIds().length;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <MainLayout title="Affiliate Tracking - Darloo Admin">
      <div className="p-1 sm:p-2 h-[100%] w-full pb-4 scroll-smooth">
        <div className="flex flex-col pb-2">
          <Breadcrumb path={currentUrl} />

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-4">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600">Total Orders</div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalAffiliateOrders}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="text-sm text-gray-600">Tracked</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.trackedOrders}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingOrders}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
              <div className="text-sm text-gray-600">Failed</div>
              <div className="text-2xl font-bold text-red-600">
                {stats.failedOrders}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
              <div className="text-sm text-gray-600">Total Commission</div>
              <div className="text-2xl font-bold text-purple-600 flex items-center gap-1">
                <MdOutlineEuro className="text-lg" />
                {stats.totalCommission?.toFixed(2) || "0.00"}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-bold text-indigo-600 flex items-center gap-1">
                <MdOutlineEuro />
                {stats.totalRevenue?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="bg-white rounded-lg shadow-md p-4 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, customer name, email, or affiliate ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-md focus:border-red-600 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCount > 0 && (
                <>
                  <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {selectedCount} selected
                  </span>
                  <button
                    onClick={() => setShowCommissionModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-all duration-300 hover:shadow-md"
                  >
                    <FaPercent className="text-sm" />
                    Set Commission
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all duration-300 hover:shadow-md disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <ImSpinner4 className="text-lg animate-spin" />
                    ) : (
                      <IoTrash className="text-lg" />
                    )}
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={fetchAffiliateData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-all duration-300 hover:shadow-md"
              >
                <IoRefresh className="text-lg" />
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md p-4 mt-4 overflow-x-auto">
            <MaterialReactTable table={table} />
          </div>
        </div>
      </div>

      {/* Commission Modal */}
      {showCommissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaPercent className="text-purple-600" />
              Set Commission Rate
            </h3>
            <p className="text-gray-600 mb-4">
              Set commission rate for {selectedCount} selected order(s). The commission amount will be calculated based on the order total.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex items-center gap-1 bg-purple-100 px-3 py-2 rounded-lg">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-transparent text-center font-bold text-purple-600 outline-none"
                  />
                  <span className="text-purple-600 font-bold">%</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (on 100 order)</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Commission:</span>
                <span className="font-bold text-purple-600">{(100 * commissionRate / 100).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCommissionModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCommission}
                disabled={isUpdatingCommission}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingCommission ? (
                  <>
                    <ImSpinner4 className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Apply Commission"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
