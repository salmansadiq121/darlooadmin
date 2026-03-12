"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "@/app/context/authContext";
import {
  FaMoneyBillWave,
  FaSpinner,
  FaSearch,
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaLandmark,
  FaCreditCard,
  FaFilter,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaUndo,
} from "react-icons/fa";
import { TbCurrencyEuro, TbRefresh } from "react-icons/tb";

const MainLayout = dynamic(
  () => import("../../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function WithdrawalManagement() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const serverUri = process.env.NEXT_PUBLIC_SERVER_URI;

  // Fetch withdrawal statistics
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${serverUri}/api/v1/wallet/withdrawals/stats`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching withdrawal stats:", error);
    }
  }, [auth.token, serverUri]);

  // Fetch withdrawals
  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const { data } = await axios.get(
        `${serverUri}/api/v1/wallet/withdrawals?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Failed to fetch withdrawals");
    } finally {
      setLoading(false);
    }
  }, [auth.token, serverUri, page, statusFilter]);

  useEffect(() => {
    if (auth.token) {
      fetchStats();
      fetchWithdrawals();
    }
  }, [auth.token, fetchStats, fetchWithdrawals]);

  const handleRefresh = () => {
    fetchStats();
    fetchWithdrawals();
    toast.success("Data refreshed");
  };

  const handleStatusUpdate = async (id, newStatus, transactionId = "") => {
    try {
      setProcessingId(id);
      const { data } = await axios.put(
        `${serverUri}/api/v1/wallet/withdrawals/${id}`,
        {
          status: newStatus,
          transactionId,
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      if (data.success) {
        toast.success(`Withdrawal ${newStatus} successfully`);
        fetchWithdrawals();
        fetchStats();
        setIsModalOpen(false);
        setSelectedWithdrawal(null);
      }
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      toast.error(error.response?.data?.message || "Failed to update withdrawal");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWithdrawals = withdrawals.filter(
    (w) =>
      w.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w._id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-green-500" />;
      case "failed":
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      case "processing":
        return <FaSpinner className="animate-spin text-blue-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaMoneyBillWave className="text-[#C6080A]" />
              Withdrawal Management
            </h1>
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Wallet", href: "/dashboard/wallet" },
                { label: "Withdrawals" },
              ]}
            />
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TbRefresh className="text-gray-600" />
              Refresh
            </button>
            <button
              onClick={() => toast.info("Export feature coming soon")}
              className="flex items-center gap-2 px-4 py-2 bg-[#C6080A] text-white rounded-lg hover:bg-[#a50709] transition-colors"
            >
              <FaDownload />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaClock className="text-xl text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <h3 className="text-xl font-bold">{stats.pending || 0}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaSpinner className="text-xl text-blue-600 animate-spin" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Processing</p>
                <h3 className="text-xl font-bold">{stats.processing || 0}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheck className="text-xl text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <h3 className="text-xl font-bold">{stats.completed || 0}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaTimes className="text-xl text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Failed</p>
                <h3 className="text-xl font-bold">{stats.failed || 0}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TbCurrencyEuro className="text-xl text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <h3 className="text-xl font-bold">
                  €{stats.totalAmount?.toFixed(2) || "0.00"}
                </h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-[#C6080A]" />
              </div>
            ) : filteredWithdrawals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No withdrawals found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaUser className="text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {withdrawal.user?.name || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {withdrawal.user?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold">
                              €{withdrawal.amount?.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Net: €{withdrawal.netAmount?.toFixed(2)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {withdrawal.paymentMethod?.type === "bank_transfer" ? (
                              <FaLandmark className="text-gray-400" />
                            ) : (
                              <FaCreditCard className="text-gray-400" />
                            )}
                            <span className="capitalize text-sm">
                              {withdrawal.paymentMethod?.type?.replace("_", " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                              withdrawal.status
                            )}`}
                          >
                            {getStatusIcon(withdrawal.status)}
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {format(new Date(withdrawal.createdAt), "MMM d, yyyy")}
                          <br />
                          {format(new Date(withdrawal.createdAt), "HH:mm")}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-gray-600 hover:text-[#C6080A] transition-colors"
                            disabled={processingId === withdrawal._id}
                          >
                            {processingId === withdrawal._id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaEye />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedWithdrawal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Withdrawal Details</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(
                        selectedWithdrawal.status
                      )}`}
                    >
                      {getStatusIcon(selectedWithdrawal.status)}
                      {selectedWithdrawal.status}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-xl font-bold">
                        €{selectedWithdrawal.amount?.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Net Amount</p>
                      <p className="text-xl font-bold text-green-600">
                        €{selectedWithdrawal.netAmount?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">User</p>
                    <p className="font-medium">
                      {selectedWithdrawal.user?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedWithdrawal.user?.email}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Payment Method</p>
                    <p className="font-medium capitalize">
                      {selectedWithdrawal.paymentMethod?.type?.replace("_", " ")}
                    </p>
                    {selectedWithdrawal.paymentMethod?.type === "bank_transfer" ? (
                      <div className="mt-2 text-sm">
                        <p>
                          <span className="text-gray-500">Account Holder:</span>{" "}
                          {selectedWithdrawal.paymentMethod?.details?.accountHolderName}
                        </p>
                        <p>
                          <span className="text-gray-500">Bank:</span>{" "}
                          {selectedWithdrawal.paymentMethod?.details?.bankName}
                        </p>
                        <p>
                          <span className="text-gray-500">Account:</span>{" "}
                          {selectedWithdrawal.paymentMethod?.details?.accountNumber}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm">
                        <span className="text-gray-500">PayPal:</span>{" "}
                        {selectedWithdrawal.paymentMethod?.details?.paypalEmail}
                      </p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Requested</p>
                      <p className="text-sm">
                        {format(new Date(selectedWithdrawal.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    {selectedWithdrawal.completedAt && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-sm">
                          {format(
                            new Date(selectedWithdrawal.completedAt),
                            "MMM d, yyyy"
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Transaction ID */}
                  {selectedWithdrawal.transactionId && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="text-sm font-mono">
                        {selectedWithdrawal.transactionId}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selectedWithdrawal.status === "pending" && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() =>
                          handleStatusUpdate(selectedWithdrawal._id, "processing")
                        }
                        disabled={processingId === selectedWithdrawal._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {processingId === selectedWithdrawal._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaSpinner />
                        )}
                        Process
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(selectedWithdrawal._id, "cancelled")
                        }
                        disabled={processingId === selectedWithdrawal._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <FaUndo />
                        Cancel
                      </button>
                    </div>
                  )}

                  {selectedWithdrawal.status === "processing" && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          const txId = prompt("Enter transaction ID:");
                          if (txId) {
                            handleStatusUpdate(
                              selectedWithdrawal._id,
                              "completed",
                              txId
                            );
                          }
                        }}
                        disabled={processingId === selectedWithdrawal._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingId === selectedWithdrawal._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaCheck />
                        )}
                        Complete
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(selectedWithdrawal._id, "failed")
                        }
                        disabled={processingId === selectedWithdrawal._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <FaTimes />
                        Mark Failed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
