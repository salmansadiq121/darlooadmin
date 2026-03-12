"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/authContext";
import {
  FaGift,
  FaSpinner,
  FaSearch,
  FaStar,
  FaTrophy,
  FaCrown,
  FaAward,
  FaMedal,
  FaUsers,
  FaCoins,
  FaChartLine,
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { TbRefresh, TbCurrency } from "react-icons/tb";

const MainLayout = dynamic(
  () => import("../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function RewardsManagement() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPoints: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    avgPoints: 0,
  });
  const [tierStats, setTierStats] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const serverUri = process.env.NEXT_PUBLIC_SERVER_URI;

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${serverUri}/api/v1/rewards/admin/stats`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      if (data.success) {
        setStats(data.stats);
        setTierStats(data.tierStats || []);
      }
    } catch (error) {
      console.error("Error fetching rewards stats:", error);
      toast.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }, [auth.token, serverUri]);

  useEffect(() => {
    if (auth.token) {
      fetchStats();
    }
  }, [auth.token, fetchStats]);

  const handleRefresh = () => {
    fetchStats();
    toast.success("Data refreshed");
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case "bronze":
        return <FaAward className="text-amber-700" />;
      case "silver":
        return <FaMedal className="text-gray-400" />;
      case "gold":
        return <FaTrophy className="text-yellow-500" />;
      case "platinum":
        return <FaCrown className="text-blue-400" />;
      case "diamond":
        return <FaStar className="text-purple-500" />;
      default:
        return <FaAward className="text-amber-700" />;
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      bronze: "bg-amber-100 text-amber-800 border-amber-200",
      silver: "bg-gray-100 text-gray-800 border-gray-200",
      gold: "bg-yellow-100 text-yellow-800 border-yellow-200",
      platinum: "bg-blue-100 text-blue-800 border-blue-200",
      diamond: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[tier] || colors.bronze;
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaGift className="text-[#C6080A]" />
              Rewards Management
            </h1>
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Rewards Management" },
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaUsers className="text-xl text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Users</p>
                <h3 className="text-xl font-bold">{stats.totalUsers?.toLocaleString() || 0}</h3>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCoins className="text-xl text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Points</p>
                <h3 className="text-xl font-bold">{stats.totalPoints?.toLocaleString() || 0}</h3>
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaChartLine className="text-xl text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Earned</p>
                <h3 className="text-xl font-bold">{stats.totalEarned?.toLocaleString() || 0}</h3>
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
              <div className="p-2 bg-orange-100 rounded-lg">
                <TbCurrency className="text-xl text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Redeemed</p>
                <h3 className="text-xl font-bold">{stats.totalRedeemed?.toLocaleString() || 0}</h3>
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
              <div className="p-2 bg-pink-100 rounded-lg">
                <FaStar className="text-xl text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Points</p>
                <h3 className="text-xl font-bold">{Math.round(stats.avgPoints) || 0}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              {["overview", "tiers", "users"].map((tab) => (
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
                <h3 className="text-lg font-semibold mb-4">Tier Distribution</h3>
                {tierStats.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tier data available</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {tierStats.map((tier) => (
                      <div
                        key={tier._id}
                        className={`p-4 rounded-xl border-2 ${getTierColor(tier._id)}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getTierIcon(tier._id)}
                          <span className="font-semibold capitalize">{tier._id}</span>
                        </div>
                        <p className="text-2xl font-bold">{tier.count}</p>
                        <p className="text-xs opacity-75">
                          {((tier.count / stats.totalUsers) * 100).toFixed(1)}% of users
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => toast.info("Manage Events feature coming soon")}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#C6080A] hover:bg-red-50 transition-colors text-left"
                    >
                      <FaGift className="h-6 w-6 text-[#C6080A] mb-2" />
                      <p className="font-medium">Manage Events</p>
                      <p className="text-sm text-gray-500">Create and manage reward events</p>
                    </button>
                    <button
                      onClick={() => toast.info("Adjust Points feature coming soon")}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#C6080A] hover:bg-red-50 transition-colors text-left"
                    >
                      <FaCoins className="h-6 w-6 text-[#C6080A] mb-2" />
                      <p className="font-medium">Adjust Points</p>
                      <p className="text-sm text-gray-500">Manually adjust user points</p>
                    </button>
                    <button
                      onClick={() => toast.info("View Reports feature coming soon")}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#C6080A] hover:bg-red-50 transition-colors text-left"
                    >
                      <FaChartLine className="h-6 w-6 text-[#C6080A] mb-2" />
                      <p className="font-medium">View Reports</p>
                      <p className="text-sm text-gray-500">Detailed rewards analytics</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tiers Tab */}
            {activeTab === "tiers" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Tier System</h3>
                <div className="space-y-4">
                  {[
                    {
                      tier: "bronze",
                      threshold: 0,
                      multiplier: "1x",
                      benefits: ["Base points earning"],
                      color: "amber",
                    },
                    {
                      tier: "silver",
                      threshold: 100,
                      multiplier: "1.1x",
                      benefits: ["10% bonus on all points", "Early access to sales"],
                      color: "gray",
                    },
                    {
                      tier: "gold",
                      threshold: 500,
                      multiplier: "1.25x",
                      benefits: ["25% bonus on all points", "Free shipping on orders"],
                      color: "yellow",
                    },
                    {
                      tier: "platinum",
                      threshold: 2000,
                      multiplier: "1.5x",
                      benefits: ["50% bonus on all points", "Priority customer support"],
                      color: "blue",
                    },
                    {
                      tier: "diamond",
                      threshold: 10000,
                      multiplier: "2x",
                      benefits: ["100% bonus on all points", "Exclusive deals & offers"],
                      color: "purple",
                    },
                  ].map((t) => (
                    <div
                      key={t.tier}
                      className={`p-4 rounded-xl border-2 bg-${t.color}-50 border-${t.color}-200`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTierIcon(t.tier)}
                          <div>
                            <h4 className="font-semibold capitalize text-lg">{t.tier}</h4>
                            <p className="text-sm text-gray-600">
                              Threshold: {t.threshold.toLocaleString()} points
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{t.multiplier}</p>
                          <p className="text-xs text-gray-500">points multiplier</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {t.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs bg-${t.color}-100 text-${t.color}-800`}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">User management coming soon</p>
                <button
                  onClick={() => toast.info("Feature under development")}
                  className="px-4 py-2 bg-[#C6080A] text-white rounded-lg hover:bg-[#a50709]"
                >
                  View All Users
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
