"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/app/context/authContext";
import Loader from "@/app/utils/Loader";
import toast from "react-hot-toast";
import {
  FaStore,
  FaEdit,
  FaPlusCircle,
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaCheckCircle,
  FaSpinner,
  FaArrowRight,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaCog,
  FaInfoCircle,
  FaShieldAlt,
  FaUserCheck,
  FaCalendarAlt,
  FaArrowUp,
} from "react-icons/fa";
import ProfileModal from "./_components/ProfileModal";
import OverviewTab from "./_components/OverviewTab";
import AnalyticsTab from "./_components/AnalyticsTab";
import SettingsTab from "./_components/SettingsTab";
import VerificationTab from "./_components/VerificationTab";

const MainLayout = dynamic(
  () => import("../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function SellerProfilePage() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [seller, setSeller] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.pathname);
    }
  }, []);

  const fetchSellerProfile = useCallback(async () => {
    if (!auth?.token) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/profile`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        setSeller(data.seller);
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 400 || status === 404) {
        setSeller(null);
      } else {
        console.error("Error fetching seller profile:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load seller profile"
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (auth?.token) {
      fetchSellerProfile();
    }
  }, [auth?.token, fetchSellerProfile]);

  const handleOpenCreate = () => {
    setMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProfileUpdated = () => {
    fetchSellerProfile();
  };

  const getStatusBadge = () => {
    if (!seller) return null;
    const { verificationStatus, isActive } = seller;

    if (!isActive) {
      return (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300 shadow-sm"
        >
          Inactive
        </motion.span>
      );
    }

    const map = {
      approved: {
        label: "Verified Seller",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-300",
        icon: FaCheckCircle,
      },
      pending: {
        label: "Pending Verification",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-300",
      },
      rejected: {
        label: "Verification Rejected",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-300",
      },
      suspended: {
        label: "Suspended",
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-300",
      },
    };

    const config = map[verificationStatus] || map.pending;
    const Icon = config.icon;

    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border} shadow-sm flex items-center gap-1.5`}
      >
        {Icon && <Icon className="text-xs" />}
        <span>{config.label}</span>
      </motion.span>
    );
  };

  const tabs = [
    { id: "overview", label: "Store Details", icon: FaStore },
    { id: "verification", label: "Verification", icon: FaShieldAlt },
    { id: "analytics", label: "Analytics", icon: FaChartLine },
    { id: "settings", label: "Settings", icon: FaCog },
  ];

  const stats = seller
    ? [
        {
          label: "Total Products",
          value: seller.totalProducts || 0,
          icon: "📦",
          color: "from-blue-500 to-blue-600",
        },
        {
          label: "Total Sales",
          value: seller.totalSales || 0,
          icon: "💰",
          color: "from-green-500 to-green-600",
        },
        {
          label: "Total Revenue",
          value: `€${(seller.totalRevenue || 0).toLocaleString()}`,
          icon: "💵",
          color: "from-emerald-500 to-emerald-600",
        },
        {
          label: "Rating",
          value: `${seller.rating?.average?.toFixed(1) || "0.0"} ★`,
          sub: `${seller.rating?.totalReviews || 0} reviews`,
          icon: "⭐",
          color: "from-amber-500 to-amber-600",
        },
      ]
    : [];

  return (
    <MainLayout
      title="Seller Profile - Manage Your Store Identity"
      description="Create and manage your seller profile, update store branding, address and social links."
      keywords="seller profile, store settings, marketplace, seller dashboard"
    >
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-0">
        <Breadcrumb path={currentUrl} />

        <div className="mt-6 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200"
          >
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-600 bg-clip-text text-transparent mb-2">
                Seller Profile
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm max-w-2xl">
                Design a beautiful store profile, manage your brand, and keep
                your store information up to date for better customer
                engagement.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {getStatusBadge()}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={seller ? handleOpenEdit : handleOpenCreate}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer text-xs sm:text-sm"
              >
                {seller ? (
                  <>
                    <FaEdit className="text-sm" />
                    <span>Edit Profile</span>
                  </>
                ) : (
                  <>
                    <FaPlusCircle className="text-sm" />
                    <span>Create Profile</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Suspension Reason Banner */}
          {seller?.verificationStatus === "suspended" &&
            seller?.suspensionReason && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3"
              >
                <FaInfoCircle className="mt-0.5 text-red-500 text-sm" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                    Account Suspended
                  </p>
                  <p className="text-xs text-red-600 leading-relaxed">
                    {seller.suspensionReason}
                  </p>
                </div>
              </motion.div>
            )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader />
            </div>
          ) : !seller ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full rounded-3xl bg-gradient-to-br from-[#c6080a]/10 via-[#e63946]/8 to-amber-50/60 border-2 border-dashed border-[#e63946]/30 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 shadow-lg"
            >
              <div className="flex-1 max-w-xl space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Bring your brand to life with a stunning seller profile
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    Add your store logo, banner, address, and social links so
                    customers can trust and discover your brand more easily.
                    Create a professional presence that builds credibility and
                    drives sales.
                  </p>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
                  {[
                    "Upload a high-quality logo and hero banner",
                    "Add a rich store description and contact details",
                    "Use smart Google Maps suggestions for your address",
                    "Connect your website and social channels",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <FaCheckCircle className="text-emerald-600 flex-shrink-0 text-lg" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
                >
                  <FaPlusCircle className="text-sm group-hover:rotate-90 transition-transform duration-300" />
                  <span>Create your seller profile</span>
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-200" />
                </motion.button>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative w-full max-w-md h-64 sm:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#c6080a] via-rose-500 to-amber-400 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="relative flex flex-col items-center text-center text-white px-6 z-10">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/30 shadow-xl">
                    <FaStore className="text-4xl sm:text-5xl" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold mb-2">
                    Your Storefront, Elevated
                  </p>
                  <p className="text-xs sm:text-sm text-white/90 max-w-xs">
                    Create an engaging, modern profile that tells your story and
                    builds trust with every visitor.
                  </p>
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              </motion.div>
            </motion.div>
          ) : (
            /* Profile Display with Tabs */
            <div className="space-y-6">
              {/* Tabs Navigation */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2"
              >
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                          isActive
                            ? "text-white"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
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
                        <Icon
                          className={`relative z-10 text-base ${
                            isActive ? "text-white" : "text-gray-500"
                          }`}
                        />
                        <span className="relative z-10">{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OverviewTab seller={seller} auth={auth} stats={stats} />
                  </motion.div>
                )}

                {activeTab === "verification" && (
                  <motion.div
                    key="verification"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <VerificationTab
                      seller={seller}
                      onUpdate={handleProfileUpdated}
                    />
                  </motion.div>
                )}

                {activeTab === "analytics" && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AnalyticsTab seller={seller} stats={stats} />
                  </motion.div>
                )}

                {activeTab === "settings" && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SettingsTab seller={seller} onEdit={handleOpenEdit} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <ProfileModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              mode={mode}
              seller={seller}
              user={auth?.user}
              onSuccess={handleProfileUpdated}
            />
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
