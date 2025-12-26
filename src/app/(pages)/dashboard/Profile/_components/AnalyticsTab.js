"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaBoxOpen,
  FaShoppingCart,
  FaDollarSign,
  FaStar,
  FaUsers,
  FaEye,
  FaFilter,
  FaSync,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "@/app/context/authContext";

// Date range options
const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

// Simple bar chart component
const MiniBarChart = ({ data, maxValue, color = "#c6080a" }) => {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((value, index) => {
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
        return (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex-1 rounded-t-sm"
            style={{ backgroundColor: color, minHeight: 4 }}
            title={`${value}`}
          />
        );
      })}
    </div>
  );
};

// Stat card component
const StatCard = ({ stat, index }) => {
  const isPositive = stat.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 relative overflow-hidden group cursor-pointer"
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${
          stat.color || "from-gray-400 to-gray-500"
        } opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 group-hover:opacity-20 transition-all duration-500`}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{stat.icon}</span>
          {stat.change !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                isPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isPositive ? (
                <FaArrowUp className="text-xs" />
              ) : (
                <FaArrowDown className="text-xs" />
              )}
              <span>{Math.abs(stat.change)}%</span>
            </div>
          )}
        </div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          {stat.label}
        </p>
        <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
          {stat.value}
        </p>
        {stat.sub && (
          <p className="text-xs text-gray-500">{stat.sub}</p>
        )}
      </div>
    </motion.div>
  );
};

// Order row component
const OrderRow = ({ order, index }) => {
  const statusColors = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Processing: "bg-blue-100 text-blue-700 border-blue-200",
    Shipped: "bg-purple-100 text-purple-700 border-purple-200",
    Delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6080a] to-[#e63946] flex items-center justify-center text-white font-bold text-xs">
          #{String(order.orderNumber || order._id || "0000").slice(-4)}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {order.user?.name || "Customer"}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-gray-900">
          €{Number(order.totalAmount || 0).toFixed(2)}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            statusColors[order.orderStatus] || statusColors.Pending
          }`}
        >
          {order.orderStatus || "Pending"}
        </span>
      </div>
    </motion.div>
  );
};

// Product stat card
const ProductStatCard = ({ stat }) => {
  const statusColors = {
    active: "from-emerald-500 to-green-600",
    inactive: "from-gray-500 to-gray-600",
    draft: "from-amber-500 to-orange-600",
    outOfStock: "from-red-500 to-rose-600",
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
          statusColors[stat._id] || "from-gray-500 to-gray-600"
        } flex items-center justify-center text-white font-bold text-sm`}
      >
        {stat.count}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 capitalize">
          {stat._id || "Unknown"}
        </p>
        <p className="text-xs text-gray-500">Products</p>
      </div>
    </div>
  );
};

export default function AnalyticsTab({ seller, stats: initialStats }) {
  const { auth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!seller?._id || !auth?.token) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/dashboard/${seller._id}`,
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );

      if (data?.success) {
        setDashboardData(data);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [seller?._id, auth?.token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  // Get current period stats based on dateRange
  const getCurrentPeriodStats = () => {
    if (!dashboardData?.stats) return null;

    const periodMap = {
      today: dashboardData.stats.today,
      week: dashboardData.stats.thisWeek,
      month: dashboardData.stats.thisMonth,
      year: dashboardData.stats.thisYear,
      all: dashboardData.stats.overview,
    };

    return periodMap[dateRange] || dashboardData.stats.thisMonth;
  };

  const periodStats = getCurrentPeriodStats();

  // Build stats cards
  const statsCards = [
    {
      label: "Total Products",
      value: dashboardData?.stats?.overview?.totalProducts || seller?.totalProducts || 0,
      icon: "📦",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Sales",
      value: periodStats?.orders || dashboardData?.stats?.overview?.totalSales || 0,
      icon: "💰",
      color: "from-green-500 to-green-600",
      sub: dateRange !== "all" ? `${DATE_RANGES.find(r => r.value === dateRange)?.label}` : undefined,
    },
    {
      label: "Revenue",
      value: `€${((periodStats?.revenue || dashboardData?.stats?.overview?.totalRevenue || 0) / 1).toLocaleString()}`,
      icon: "💵",
      color: "from-emerald-500 to-emerald-600",
      sub: dateRange !== "all" ? `${DATE_RANGES.find(r => r.value === dateRange)?.label}` : undefined,
    },
    {
      label: "Rating",
      value: `${(dashboardData?.stats?.overview?.rating?.average || seller?.rating?.average || 0).toFixed(1)} ★`,
      sub: `${dashboardData?.stats?.overview?.rating?.totalReviews || seller?.rating?.totalReviews || 0} reviews`,
      icon: "⭐",
      color: "from-amber-500 to-amber-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="text-4xl text-[#c6080a] animate-spin" />
          <p className="text-sm text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center"
      >
        <FaTimes className="text-4xl text-red-500 mx-auto mb-4" />
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-6 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-[#c6080a]/10 via-[#e63946]/8 to-rose-100/50 rounded-3xl border-2 border-[#e63946]/20 p-6 sm:p-8 overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#c6080a]/10 to-transparent rounded-full blur-3xl -mr-36 -mt-36" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-rose-200/20 to-transparent rounded-full blur-2xl -ml-28 -mb-28" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="p-3 rounded-xl bg-gradient-to-br from-[#c6080a] to-[#e63946] text-white shadow-lg"
            >
              <FaChartLine className="text-xl" />
            </motion.div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-[#c6080a] to-gray-900 bg-clip-text text-transparent">
                Store Analytics
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Comprehensive insights into your store performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Filter */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 focus:border-[#c6080a] focus:ring-2 focus:ring-[#c6080a]/20 focus:outline-none cursor-pointer"
              >
                {DATE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-[#c6080a] text-gray-600 hover:text-[#c6080a] transition-all disabled:opacity-50"
            >
              <FaSync className={`text-sm ${isRefreshing ? "animate-spin" : ""}`} />
            </motion.button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Performance Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaChartBar className="text-[#c6080a]" />
              Revenue Overview
            </h3>
            <FaCalendarAlt className="text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  €{(dashboardData?.stats?.overview?.totalRevenue || seller?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                €
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-gray-600">Avg Order</p>
                <p className="text-lg font-bold text-blue-700">
                  €
                  {(dashboardData?.stats?.overview?.totalSales || seller?.totalSales) > 0
                    ? ((dashboardData?.stats?.overview?.totalRevenue || seller?.totalRevenue || 0) /
                        (dashboardData?.stats?.overview?.totalSales || seller?.totalSales)).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-xs text-gray-600">Products</p>
                <p className="text-lg font-bold text-purple-700">
                  {dashboardData?.stats?.overview?.totalProducts || seller?.totalProducts || 0}
                </p>
              </div>
            </div>

            {/* Period Comparison */}
            {periodStats && dateRange !== "all" && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                  {DATE_RANGES.find((r) => r.value === dateRange)?.label} Performance
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{periodStats.orders || 0}</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">€{(periodStats.revenue || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{periodStats.units || 0}</p>
                    <p className="text-xs text-gray-500">Units Sold</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Rating & Reviews */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaChartPie className="text-amber-500" />
              Rating & Reviews
            </h3>
            <span className="text-2xl">⭐</span>
          </div>

          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {(dashboardData?.stats?.overview?.rating?.average || seller?.rating?.average || 0).toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-lg ${
                      i < Math.floor(dashboardData?.stats?.overview?.rating?.average || seller?.rating?.average || 0)
                        ? "text-amber-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                {dashboardData?.stats?.overview?.rating?.totalReviews || seller?.rating?.totalReviews || 0} Total Reviews
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <p className="text-xs text-gray-600 mb-1">Average Rating</p>
                <p className="text-lg font-bold text-amber-700">
                  {(dashboardData?.stats?.overview?.rating?.average || seller?.rating?.average || 0).toFixed(1)} / 5.0
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
                <p className="text-xs text-gray-600 mb-1">Total Reviews</p>
                <p className="text-lg font-bold text-rose-700">
                  {dashboardData?.stats?.overview?.rating?.totalReviews || seller?.rating?.totalReviews || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Status & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <FaBoxOpen className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Product Status</h3>
              <p className="text-xs text-gray-500">Inventory breakdown</p>
            </div>
          </div>

          <div className="space-y-3">
            {dashboardData?.productStats && dashboardData.productStats.length > 0 ? (
              dashboardData.productStats.map((stat, index) => (
                <ProductStatCard key={stat._id || index} stat={stat} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FaBoxOpen className="text-3xl mx-auto mb-2" />
                <p className="text-sm">No product data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FaShoppingCart className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                <p className="text-xs text-gray-500">Latest transactions</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
              dashboardData.recentOrders.slice(0, 5).map((order, index) => (
                <OrderRow key={order._id} order={order} index={index} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FaShoppingCart className="text-4xl mx-auto mb-3" />
                <p className="text-sm">No orders yet</p>
                <p className="text-xs mt-1">Orders will appear here once customers start buying</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(198,8,10,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(230,57,70,0.1),transparent_50%)]" />

        <div className="relative">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaChartLine className="text-[#e63946]" />
            Performance Summary
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-xs text-white/60 uppercase mb-1">Total Products</p>
              <p className="text-2xl font-bold">
                {dashboardData?.stats?.overview?.totalProducts || seller?.totalProducts || 0}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-xs text-white/60 uppercase mb-1">Total Sales</p>
              <p className="text-2xl font-bold">
                {dashboardData?.stats?.overview?.totalSales || seller?.totalSales || 0}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-xs text-white/60 uppercase mb-1">Revenue</p>
              <p className="text-2xl font-bold">
                €{((dashboardData?.stats?.overview?.totalRevenue || seller?.totalRevenue || 0) / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-xs text-white/60 uppercase mb-1">Avg Rating</p>
              <p className="text-2xl font-bold">
                {(dashboardData?.stats?.overview?.rating?.average || seller?.rating?.average || 0).toFixed(1)} ⭐
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
