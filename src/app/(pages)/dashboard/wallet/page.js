"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuth } from "@/app/context/authContext";
import {
  FaWallet,
  FaMoneyBillWave,
  FaSpinner,
  FaSearch,
  FaEye,
  FaDownload,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaUser,
} from "react-icons/fa";
import { TbCurrencyEuro, TbRefresh } from "react-icons/tb";

const MainLayout = dynamic(
  () => import("../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function WalletManagement() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalWallets: 0,
    totalTransactions: 0,
    totalWithdrawn: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const serverUri = process.env.NEXT_PUBLIC_SERVER_URI;

  // Fetch wallet statistics
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${serverUri}/api/v1/wallet/admin/stats`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching wallet stats:", error);
    }
  }, [auth.token, serverUri]);

  // Fetch all wallets
  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${serverUri}/api/v1/wallet/admin/wallets?page=${page}&limit=20`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setWallets(data.wallets || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast.error("Failed to fetch wallets");
    } finally {
      setLoading(false);
    }
  }, [auth.token, serverUri, page]);

  // Fetch all transactions
  const fetchTransactions = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${serverUri}/api/v1/wallet/admin/transactions?page=${page}&limit=50`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [auth.token, serverUri, page]);

  useEffect(() => {
    if (auth.token) {
      fetchStats();
      fetchWallets();
      fetchTransactions();
    }
  }, [auth.token, fetchStats, fetchWallets, fetchTransactions]);

  const handleRefresh = () => {
    fetchStats();
    fetchWallets();
    fetchTransactions();
    toast.success("Data refreshed");
  };

  const filteredWallets = wallets.filter(
    (wallet) =>
      wallet.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTransactionIcon = (type) => {
    switch (type) {
      case "credit":
      case "refund":
        return <FaArrowDown className="text-green-500" />;
      case "debit":
      case "purchase":
      case "withdrawal":
        return <FaArrowUp className="text-red-500" />;
      default:
        return <FaExchangeAlt className="text-blue-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "credit":
      case "refund":
        return "text-green-600";
      case "debit":
      case "purchase":
      case "withdrawal":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaWallet className="text-[#C6080A]" />
              Wallet Management
            </h1>
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Wallet Management" },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Balance</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  €{stats.totalBalance?.toFixed(2) || "0.00"}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TbCurrencyEuro className="text-2xl text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Wallets</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalWallets || 0}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaWallet className="text-2xl text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalTransactions || 0}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaExchangeAlt className="text-2xl text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Withdrawn</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  €{stats.totalWithdrawn?.toFixed(2) || "0.00"}
                </h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaMoneyBillWave className="text-2xl text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              {["overview", "wallets", "transactions"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "text-[#C6080A] border-b-2 border-[#C6080A]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                {transactions.slice(0, 10).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No recent transactions
                  </p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 10).map((tx) => (
                      <div
                        key={tx._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white rounded-full">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{tx.type}</p>
                            <p className="text-sm text-gray-500">
                              {tx.user?.name || "Unknown User"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getTransactionColor(tx.type)}`}>
                            {tx.type === "credit" || tx.type === "refund"
                              ? "+"
                              : "-"}
                            €{tx.amount?.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wallets Tab */}
            {activeTab === "wallets" && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6080A] focus:border-transparent"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <FaSpinner className="animate-spin text-3xl text-[#C6080A]" />
                  </div>
                ) : filteredWallets.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No wallets found
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
                            Balance
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Total Credited
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Total Debited
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredWallets.map((wallet) => (
                          <tr key={wallet._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <FaUser className="text-gray-500" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {wallet.user?.name || "Unknown"}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {wallet.user?.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-semibold">
                                €{wallet.balance?.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-green-600">
                              €{wallet.totalCredited?.toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-red-600">
                              €{wallet.totalDebited?.toFixed(2)}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  wallet.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {wallet.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => setSelectedWallet(wallet)}
                                className="p-2 text-gray-600 hover:text-[#C6080A] transition-colors"
                              >
                                <FaEye />
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
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <div>
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No transactions found
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            User
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Balance After
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactions.map((tx) => (
                          <tr key={tx._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(tx.type)}
                                <span className="capitalize">{tx.type}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {tx.user?.name || "Unknown"}
                            </td>
                            <td className={`px-4 py-4 font-medium ${getTransactionColor(tx.type)}`}>
                              {tx.type === "credit" || tx.type === "refund"
                                ? "+"
                                : "-"}
                              €{tx.amount?.toFixed(2)}
                            </td>
                            <td className="px-4 py-4">
                              €{tx.balanceAfter?.toFixed(2)}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  tx.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : tx.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
