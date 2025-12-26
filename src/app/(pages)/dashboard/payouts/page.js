"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "@/app/context/authContext";
import {
  FaWallet,
  FaMoneyBillWave,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaEye,
  FaCheck,
  FaTimes,
  FaPlay,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileInvoice,
  FaDownload,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaStore,
  FaCalendarAlt,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { TbCurrencyEuro, TbRefresh } from "react-icons/tb";
import { BsBank2, BsThreeDotsVertical } from "react-icons/bs";
import { HiOutlineCash } from "react-icons/hi";

const MainLayout = dynamic(
  () => import("../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function PayoutsManagementPage() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionType, setActionType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Action form
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.pathname);
    }
  }, []);

  const fetchPayouts = useCallback(async () => {
    if (!auth?.token) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (searchQuery) params.append("search", searchQuery);
      if (dateRange.start) params.append("startDate", dateRange.start);
      if (dateRange.end) params.append("endDate", dateRange.end);

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/admin/all?${params}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      if (data.success) {
        setPayouts(data.payouts);
        setPagination(data.pagination);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error("Failed to load payouts");
    } finally {
      setIsLoading(false);
    }
  }, [auth?.token, currentPage, statusFilter, priorityFilter, searchQuery, dateRange]);

  const fetchAnalytics = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/admin/analytics?period=month`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  }, [auth?.token]);

  useEffect(() => {
    fetchPayouts();
    fetchAnalytics();
  }, [fetchPayouts, fetchAnalytics]);

  const handleAction = async () => {
    if (!selectedPayout || !actionType) return;

    setIsSubmitting(true);
    try {
      let endpoint = "";
      let payload = {};

      switch (actionType) {
        case "review":
          endpoint = `/api/v1/payouts/admin/review/${selectedPayout._id}`;
          payload = { status: "under_review", adminNotes };
          break;
        case "approve":
          endpoint = `/api/v1/payouts/admin/review/${selectedPayout._id}`;
          payload = { status: "approved", adminNotes };
          break;
        case "reject":
          endpoint = `/api/v1/payouts/admin/review/${selectedPayout._id}`;
          payload = { status: "rejected", rejectionReason, adminNotes };
          break;
        case "process":
          endpoint = `/api/v1/payouts/admin/process/${selectedPayout._id}`;
          payload = { transactionId, referenceNumber, notes: adminNotes };
          break;
        case "complete":
          endpoint = `/api/v1/payouts/admin/complete/${selectedPayout._id}`;
          payload = { transactionId, referenceNumber, receiptUrl, notes: adminNotes };
          break;
      }

      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setShowActionModal(false);
        resetActionForm();
        fetchPayouts();
        fetchAnalytics();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetActionForm = () => {
    setAdminNotes("");
    setRejectionReason("");
    setTransactionId("");
    setReferenceNumber("");
    setReceiptUrl("");
    setSelectedPayout(null);
    setActionType("");
  };

  const openActionModal = (payout, type) => {
    setSelectedPayout(payout);
    setActionType(type);
    setShowActionModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      under_review: "bg-blue-100 text-blue-800 border-blue-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      processing: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="text-yellow-600" />,
      under_review: <FaEye className="text-blue-600" />,
      approved: <FaCheckCircle className="text-green-600" />,
      processing: <FaSpinner className="text-purple-600 animate-spin" />,
      completed: <FaCheckCircle className="text-emerald-600" />,
      rejected: <FaTimes className="text-red-600" />,
      cancelled: <FaTimes className="text-gray-600" />,
    };
    return icons[status] || <FaClock />;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      normal: "bg-gray-100 text-gray-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return styles[priority] || styles.normal;
  };

  const getAvailableActions = (status) => {
    switch (status) {
      case "pending":
        return ["review", "approve", "reject"];
      case "under_review":
        return ["approve", "reject"];
      case "approved":
        return ["process"];
      case "processing":
        return ["complete"];
      default:
        return [];
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      review: "Mark Under Review",
      approve: "Approve",
      reject: "Reject",
      process: "Start Processing",
      complete: "Mark Completed",
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    const colors = {
      review: "bg-blue-600 hover:bg-blue-700",
      approve: "bg-green-600 hover:bg-green-700",
      reject: "bg-red-600 hover:bg-red-700",
      process: "bg-purple-600 hover:bg-purple-700",
      complete: "bg-emerald-600 hover:bg-emerald-700",
    };
    return colors[action] || "bg-gray-600 hover:bg-gray-700";
  };

  return (
    <MainLayout
      title="Payout Management - Admin Dashboard"
      description="Manage seller payout requests, approve payments, and track transactions."
      keywords="payouts, admin, payments, sellers"
    >
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-0">
        <Breadcrumb path={currentUrl} />

        <div className="mt-6 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200"
          >
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-600 bg-clip-text text-transparent mb-2">
                Payout Management
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">
                Review and process seller payout requests
              </p>
            </div>
            <button
              onClick={() => {
                fetchPayouts();
                fetchAnalytics();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <TbRefresh className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-5 text-white"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Pending</p>
                    <p className="text-2xl font-bold mt-1">
                      €{(stats.totalPending || 0).toLocaleString()}
                    </p>
                    <p className="text-yellow-200 text-xs mt-1">
                      {(stats.pending?.count || 0) + (stats.under_review?.count || 0) + (stats.approved?.count || 0)} requests
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaClock />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Processing</p>
                    <p className="text-2xl font-bold mt-1">
                      €{(stats.totalProcessing || 0).toLocaleString()}
                    </p>
                    <p className="text-purple-200 text-xs mt-1">
                      {stats.processing?.count || 0} requests
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaSpinner className="animate-spin" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Completed</p>
                    <p className="text-2xl font-bold mt-1">
                      €{(stats.totalCompleted || 0).toLocaleString()}
                    </p>
                    <p className="text-emerald-200 text-xs mt-1">
                      {stats.completed?.count || 0} payouts
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaCheckCircle />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Rejected</p>
                    <p className="text-2xl font-bold mt-1">
                      €{(stats.rejected?.amount || 0).toLocaleString()}
                    </p>
                    <p className="text-red-200 text-xs mt-1">
                      {stats.rejected?.count || 0} requests
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaTimes />
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by request number..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              >
                <option value="all">All Priority</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Payouts Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-4xl text-red-500" />
              </div>
            ) : payouts.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Request
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Seller
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Priority
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payouts.map((payout) => (
                        <tr key={payout._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#c6080a] to-[#e63946] rounded-xl flex items-center justify-center text-white">
                                <FaWallet />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {payout.requestNumber}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {payout.paymentMethod?.type?.replace("_", " ")}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {payout.seller?.storeLogo ? (
                                <img
                                  src={payout.seller.storeLogo}
                                  alt={payout.seller.storeName}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <FaStore className="text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {payout.seller?.storeName || "Unknown"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {payout.seller?.user?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-lg font-bold text-gray-900">
                              €{payout.amount.toFixed(2)}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payout.status)}`}>
                              {getStatusIcon(payout.status)}
                              {payout.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(payout.priority)}`}>
                              {payout.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-gray-600">
                              {format(new Date(payout.createdAt), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(payout.createdAt), "HH:mm")}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setShowDetailsModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FaEye />
                              </button>
                              {getAvailableActions(payout.status).map((action) => (
                                <button
                                  key={action}
                                  onClick={() => openActionModal(payout, action)}
                                  className={`p-2 rounded-lg text-white transition-colors ${getActionColor(action)}`}
                                  title={getActionLabel(action)}
                                >
                                  {action === "approve" && <FaCheck />}
                                  {action === "reject" && <FaTimes />}
                                  {action === "review" && <FaEye />}
                                  {action === "process" && <FaPlay />}
                                  {action === "complete" && <FaCheckCircle />}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} results
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium ${
                              currentPage === page
                                ? "bg-[#c6080a] text-white"
                                : "border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                        disabled={currentPage === pagination.pages}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <FaWallet className="text-5xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Payout Requests</h3>
                <p className="text-gray-500">No payout requests match your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedPayout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedPayout(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Payout Details
                    </h3>
                    <p className="text-sm text-gray-500">{selectedPayout.requestNumber}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedPayout.status)}`}>
                    {getStatusIcon(selectedPayout.status)}
                    {selectedPayout.status.replace("_", " ")}
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {/* Amount */}
                  <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Payout Amount</p>
                    <p className="text-4xl font-bold text-gray-900">
                      €{selectedPayout.amount.toFixed(2)}
                    </p>
                  </div>

                  {/* Seller Info */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Seller Information</p>
                    <div className="flex items-center gap-4">
                      {selectedPayout.seller?.storeLogo ? (
                        <img
                          src={selectedPayout.seller.storeLogo}
                          alt={selectedPayout.seller.storeName}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                          <FaStore className="text-2xl text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedPayout.seller?.storeName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedPayout.seller?.user?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedPayout.seller?.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Payment Method</p>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <BsBank2 className="text-xl text-blue-600" />
                        <span className="font-medium capitalize">
                          {selectedPayout.paymentMethod?.type?.replace("_", " ")}
                        </span>
                      </div>
                      {selectedPayout.paymentMethod?.bankDetails && (
                        <div className="space-y-2 text-sm">
                          {selectedPayout.paymentMethod.bankDetails.accountHolderName && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Account Holder</span>
                              <span>{selectedPayout.paymentMethod.bankDetails.accountHolderName}</span>
                            </div>
                          )}
                          {selectedPayout.paymentMethod.bankDetails.bankName && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Bank</span>
                              <span>{selectedPayout.paymentMethod.bankDetails.bankName}</span>
                            </div>
                          )}
                          {selectedPayout.paymentMethod.bankDetails.iban && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">IBAN</span>
                              <span className="font-mono">{selectedPayout.paymentMethod.bankDetails.iban}</span>
                            </div>
                          )}
                          {selectedPayout.paymentMethod.bankDetails.swiftCode && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">SWIFT</span>
                              <span className="font-mono">{selectedPayout.paymentMethod.bankDetails.swiftCode}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {selectedPayout.paymentMethod?.paypalEmail && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">PayPal Email</span>
                          <span>{selectedPayout.paymentMethod.paypalEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Earnings Breakdown */}
                  {selectedPayout.earnings && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-3">Earnings Breakdown</p>
                      <div className="space-y-2 p-4 border border-gray-200 rounded-xl">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Gross Earnings</span>
                          <span>€{selectedPayout.earnings.totalEarnings?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Platform Fee ({selectedPayout.earnings.platformFeePercentage}%)
                          </span>
                          <span className="text-red-600">
                            -€{selectedPayout.earnings.platformFee?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Previous Payouts</span>
                          <span>€{selectedPayout.earnings.previousPayouts?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Net Payout</span>
                          <span>€{selectedPayout.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Timeline</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaCalendarAlt className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">Requested</p>
                          <p className="text-gray-500">
                            {format(new Date(selectedPayout.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                          </p>
                        </div>
                      </div>
                      {selectedPayout.reviewedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaEye className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Reviewed</p>
                            <p className="text-gray-500">
                              {format(new Date(selectedPayout.reviewedAt), "MMM dd, yyyy 'at' HH:mm")}
                              {selectedPayout.reviewedBy?.name && ` by ${selectedPayout.reviewedBy.name}`}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedPayout.approvedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <FaCheck className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Approved</p>
                            <p className="text-gray-500">
                              {format(new Date(selectedPayout.approvedAt), "MMM dd, yyyy 'at' HH:mm")}
                              {selectedPayout.approvedBy?.name && ` by ${selectedPayout.approvedBy.name}`}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedPayout.transaction?.confirmedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <FaCheckCircle className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">Completed</p>
                            <p className="text-gray-500">
                              {format(new Date(selectedPayout.transaction.confirmedAt), "MMM dd, yyyy 'at' HH:mm")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {selectedPayout.adminNotes && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Admin Notes</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                        {selectedPayout.adminNotes}
                      </p>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {selectedPayout.status === "rejected" && selectedPayout.rejectionReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm font-semibold text-red-700 mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-600">{selectedPayout.rejectionReason}</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAvailableActions(selectedPayout.status).map((action) => (
                      <button
                        key={action}
                        onClick={() => {
                          setShowDetailsModal(false);
                          openActionModal(selectedPayout, action);
                        }}
                        className={`px-4 py-2 rounded-xl text-white font-medium transition-colors ${getActionColor(action)}`}
                      >
                        {getActionLabel(action)}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPayout(null);
                    }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Modal */}
        <AnimatePresence>
          {showActionModal && selectedPayout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowActionModal(false);
                resetActionForm();
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-md shadow-xl"
              >
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {getActionLabel(actionType)}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedPayout.requestNumber} - €{selectedPayout.amount.toFixed(2)}
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Rejection Reason (for reject action) */}
                  {actionType === "reject" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this request is being rejected..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        required
                      />
                    </div>
                  )}

                  {/* Transaction Details (for process/complete actions) */}
                  {(actionType === "process" || actionType === "complete") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transaction ID
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Bank transaction ID"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reference Number
                        </label>
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="Payment reference"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  {/* Receipt URL (for complete action) */}
                  {actionType === "complete" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt URL
                      </label>
                      <input
                        type="url"
                        value={receiptUrl}
                        onChange={(e) => setReceiptUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any internal notes..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowActionModal(false);
                      resetActionForm();
                    }}
                    className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAction}
                    disabled={isSubmitting || (actionType === "reject" && !rejectionReason)}
                    className={`px-6 py-2.5 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${getActionColor(actionType)}`}
                  >
                    {isSubmitting && <FaSpinner className="animate-spin" />}
                    {getActionLabel(actionType)}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
