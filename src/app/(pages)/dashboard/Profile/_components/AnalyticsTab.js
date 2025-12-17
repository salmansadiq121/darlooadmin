"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
  FaCheckCircle,
  FaArrowUp,
} from "react-icons/fa";

export default function AnalyticsTab({ seller, stats }) {
  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-gradient-to-br from-[#c6080a]/10 via-[#e63946]/8 to-rose-100/50 rounded-3xl border-2 border-[#e63946]/20 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#c6080a] to-[#e63946] text-white shadow-lg">
                <FaChartLine className="text-xs" />
              </div>
              Store Analytics
            </h2>
            <p className="text-xs text-gray-600 mt-2">
              Comprehensive insights into your store performance
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 relative overflow-hidden group"
            >
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${
                  stat.color || "from-gray-400 to-gray-500"
                } opacity-10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300`}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <FaArrowUp className="text-emerald-500 text-sm" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-base sm:text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                {stat.sub && (
                  <p className="text-xs text-gray-500">{stat.sub}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-xl font-bold text-gray-900 flex items-center gap-2">
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
                  <p className="text-base sm:text-2xl font-bold text-emerald-700 mt-1">
                    €{((seller.totalRevenue || 0) / 1000).toFixed(1)}K
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  €
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-gray-600">Avg Order</p>
                  <p className="text-xs sm:text-xl font-bold text-blue-700">
                    €
                    {seller.totalSales > 0
                      ? (seller.totalRevenue / seller.totalSales).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-xs text-gray-600">Products</p>
                  <p className="text-xs sm:text-xl font-bold text-purple-700">
                    {seller.totalProducts || 0}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rating & Reviews */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaChartPie className="text-amber-500" />
                Rating & Reviews
              </h3>
              <span className="text-base">⭐</span>
            </div>
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                <div className="text-base sm:text-2xl font-bold text-amber-600 mb-2">
                  {seller.rating?.average?.toFixed(1) || "0.0"}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaCheckCircle
                      key={i}
                      className={`text-sm ${
                        i < Math.floor(seller.rating?.average || 0)
                          ? "text-amber-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  {seller.rating?.totalReviews || 0} Total Reviews
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">Average Rating</p>
                  <p className="text-xs sm:text-xl font-bold text-amber-700">
                    {seller.rating?.average?.toFixed(1) || "0.0"} / 5.0
                  </p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Reviews</p>
                  <p className="text-xs sm:text-xl font-bold text-rose-700">
                    {seller.rating?.totalReviews || 0}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

