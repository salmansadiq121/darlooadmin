"use client";
import Loader from "@/app/utils/Loader";
import dynamic from "next/dynamic";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoSearch, IoRefresh } from "react-icons/io5";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";
import { ImSpinner4 } from "react-icons/im";
import { useAuth } from "@/app/context/authContext";
import { FaCheckCircle, FaTimesCircle, FaClock, FaRetry } from "react-icons/fa";

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
  const router = useRouter();
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
          <span className="font-semibold text-green-600">
            ${parseFloat(cell.getValue() || 0).toFixed(2)}
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
                    <FaRetry className="text-xs text-blue-600" />
                  )}
                </button>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "affiliate.affiliateId",
        header: "Affiliate ID",
        size: 150,
        Cell: ({ cell }) => (
          <span className="text-sm text-gray-700">
            {cell.getValue() || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "affiliate.commissionAmount",
        header: "Commission",
        size: 120,
        Cell: ({ cell }) => (
          <span className="font-semibold text-purple-600">
            ${parseFloat(cell.getValue() || 0).toFixed(2)}
          </span>
        ),
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
              <div className="text-2xl font-bold text-purple-600">
                ${stats.totalCommission?.toFixed(2) || "0.00"}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-bold text-indigo-600">
                ${stats.totalRevenue?.toFixed(2) || "0.00"}
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
            <button
              onClick={fetchAffiliateData}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all duration-300 hover:shadow-md"
            >
              <IoRefresh className="text-lg" />
              Refresh
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md p-4 mt-4 overflow-x-auto">
            <MaterialReactTable table={table} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
