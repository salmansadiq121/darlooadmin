"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAuth } from "@/app/context/authContext";
import Loader from "@/app/utils/Loader";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaEye,
  FaFileAlt,
  FaBuilding,
  FaIdCard,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaCreditCard,
  FaCalendarAlt,
  FaUser,
  FaInfoCircle,
  FaArrowRight,
  FaClock,
  FaHistory,
  FaFilter,
  FaStore,
} from "react-icons/fa";
import { IoSearch, IoClose } from "react-icons/io5";
import { TbShieldCheck, TbShieldX, TbRefresh } from "react-icons/tb";
import { MdPending, MdVerified, MdOutlineWarning } from "react-icons/md";
import { format } from "date-fns";

const MainLayout = dynamic(
  () => import("../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function VerificationsPage() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [allVerifications, setAllVerifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    requires_changes: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (auth?.token) {
      fetchVerifications();
    }
  }, [auth?.token]);

  const fetchVerifications = async (status = "all") => {
    setIsLoading(true);
    try {
      // Fetch all verifications for stats
      const endpoint = status === "all" || status === "pending"
        ? `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/verifications/pending`
        : `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/verifications/all?status=${status}`;

      const { data } = await axios.get(endpoint, {
        headers: {
          Authorization: auth?.token,
        },
      });

      if (data?.success) {
        const verificationList = data.verifications || [];
        setAllVerifications(verificationList);

        // Filter based on active tab
        const filtered = activeTab === "all"
          ? verificationList
          : verificationList.filter(v => v.status === activeTab);
        setVerifications(filtered);

        // Calculate stats
        setStats({
          total: verificationList.length,
          pending: verificationList.filter(v => v.status === "pending").length,
          approved: verificationList.filter(v => v.status === "approved").length,
          rejected: verificationList.filter(v => v.status === "rejected").length,
          requires_changes: verificationList.filter(v => v.status === "requires_changes").length,
        });
      }
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast.error("Failed to load verifications");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter verifications based on search and active tab
  useEffect(() => {
    let filtered = allVerifications;

    // Filter by status tab
    if (activeTab !== "all") {
      filtered = filtered.filter(v => v.status === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.businessName?.toLowerCase().includes(query) ||
        v.seller?.storeName?.toLowerCase().includes(query) ||
        v.email?.toLowerCase().includes(query) ||
        v.seller?.user?.name?.toLowerCase().includes(query)
      );
    }

    setVerifications(filtered);
  }, [activeTab, searchQuery, allVerifications]);

  const openReviewModal = (verification) => {
    setSelectedVerification(verification);
    setReviewStatus("");
    setRejectionReason("");
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedVerification(null);
    setReviewStatus("");
    setRejectionReason("");
  };

  const handleReview = async () => {
    if (!reviewStatus) {
      toast.error("Please select a review status");
      return;
    }

    if (
      (reviewStatus === "rejected" || reviewStatus === "requires_changes") &&
      !rejectionReason.trim()
    ) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/verification/review/${selectedVerification._id}`,
        {
          status: reviewStatus,
          rejectionReason:
            reviewStatus === "rejected" || reviewStatus === "requires_changes"
              ? rejectionReason.trim()
              : "",
        },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        toast.success(`Verification ${reviewStatus} successfully`);
        closeReviewModal();
        fetchVerifications();
      }
    } catch (error) {
      console.error("Error reviewing verification:", error);
      toast.error(
        error.response?.data?.message || "Failed to review verification"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: {
        label: "Pending",
        bg: "from-amber-500 to-amber-600",
        icon: FaInfoCircle,
      },
      approved: {
        label: "Approved",
        bg: "from-emerald-500 to-emerald-600",
        icon: FaCheckCircle,
      },
      rejected: {
        label: "Rejected",
        bg: "from-red-500 to-red-600",
        icon: FaTimes,
      },
      requires_changes: {
        label: "Changes Required",
        bg: "from-blue-500 to-blue-600",
        icon: FaInfoCircle,
      },
    };

    const statusConfig = config[status] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${statusConfig.bg} text-white shadow-sm`}
      >
        <Icon className="text-xs" />
        {statusConfig.label}
      </span>
    );
  };

  return (
    <MainLayout
      title="Seller Verifications - Admin Dashboard"
      description="Review and approve seller verification documents"
      keywords="seller verification, admin, review"
    >
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6">
        <Breadcrumb path={currentUrl} />

        <div className="mt-6 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c6080a] via-[#e63946] to-rose-500 flex items-center justify-center shadow-xl shadow-red-500/30">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-600 bg-clip-text text-transparent">
                  Seller Verifications
                </h1>
                <p className="text-gray-600 mt-1.5 text-sm sm:text-base">
                  Review and approve seller verification documents
                </p>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              {
                label: "Total",
                value: stats.total,
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100/50",
                icon: FaShieldAlt,
              },
              {
                label: "Pending",
                value: stats.pending,
                color: "from-amber-500 to-amber-600",
                bgColor: "from-amber-50 to-amber-100/50",
                icon: MdPending,
              },
              {
                label: "Approved",
                value: stats.approved,
                color: "from-emerald-500 to-emerald-600",
                bgColor: "from-emerald-50 to-emerald-100/50",
                icon: TbShieldCheck,
              },
              {
                label: "Changes Required",
                value: stats.requires_changes,
                color: "from-indigo-500 to-indigo-600",
                bgColor: "from-indigo-50 to-indigo-100/50",
                icon: MdOutlineWarning,
              },
              {
                label: "Rejected",
                value: stats.rejected,
                color: "from-red-500 to-red-600",
                bgColor: "from-red-50 to-red-100/50",
                icon: TbShieldX,
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="relative overflow-hidden group bg-white rounded-2xl p-4 shadow-lg border border-gray-200/60 hover:shadow-2xl transition-all duration-300"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white text-lg" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Filter Tabs and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Tabs */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-2 flex items-center gap-1 overflow-x-auto flex-1">
              {[
                { id: "pending", label: "Pending", icon: MdPending, color: "amber" },
                { id: "approved", label: "Approved", icon: TbShieldCheck, color: "emerald" },
                { id: "requires_changes", label: "Changes", icon: MdOutlineWarning, color: "indigo" },
                { id: "rejected", label: "Rejected", icon: TbShieldX, color: "red" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap text-sm ${
                      isActive ? "text-white" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeVerificationTab"
                        className="absolute inset-0 bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 rounded-xl shadow-lg"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <TabIcon className={`relative z-10 text-base ${isActive ? "text-white" : `text-${tab.color}-500`}`} />
                    <span className="relative z-10">{tab.label}</span>
                    <span className={`relative z-10 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? "bg-white/20 text-white" : `bg-${tab.color}-100 text-${tab.color}-700`
                    }`}>
                      {stats[tab.id] || 0}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative min-w-[280px]">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg z-10" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by business, store, or email..."
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6080a]/20 focus:border-[#c6080a] transition-all duration-200 bg-white shadow-lg text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <IoClose className="text-gray-400 text-lg" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95, rotate: 180 }}
              onClick={() => fetchVerifications()}
              className="p-3 bg-white rounded-xl shadow-lg border border-gray-200/60 hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <TbRefresh className={`text-xl text-gray-600 ${isLoading ? "animate-spin" : ""}`} />
            </motion.button>
          </div>

          {/* Verifications List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader />
            </div>
          ) : verifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-xl border-2 border-dashed border-gray-300 p-16 text-center"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(198,8,10,0.05),transparent_70%)]" />
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <FaShieldAlt className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  All Caught Up!
                </h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  All verification requests have been reviewed. New submissions
                  will appear here.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {verifications.map((verification, index) => (
                <motion.div
                  key={verification._id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative bg-white rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c6080a]/5 via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative p-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusBadge(verification.status)}
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 text-gray-600">
                            <FaCalendarAlt className="text-xs" />
                            <span className="text-xs font-medium">
                              {format(
                                new Date(verification.submittedAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#c6080a] transition-colors">
                          {verification.businessName}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                            <FaBuilding className="text-blue-600 text-xs" />
                            <span className="text-sm font-semibold text-blue-900">
                              {verification.seller?.storeName || "N/A"}
                            </span>
                          </div>
                          {verification.seller?.user?.name && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100">
                              <FaUser className="text-purple-600 text-xs" />
                              <span className="text-sm font-semibold text-purple-900">
                                {verification.seller.user.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <FaIdCard className="text-gray-500 text-sm" />
                          <p className="text-xs font-bold text-gray-500 uppercase">
                            Document
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {verification.identityDocument?.type
                            ?.replace("_", " ")
                            .toUpperCase()}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-1">
                          <FaEnvelope className="text-emerald-600 text-sm" />
                          <p className="text-xs font-bold text-emerald-700 uppercase">
                            Email
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-emerald-900 truncate">
                          {verification.email}
                        </p>
                      </div>
                    </div>

                    {/* Footer with Action Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span>
                          {verification.businessAddress?.city},{" "}
                          {verification.businessAddress?.country}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05, x: 4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openReviewModal(verification)}
                        className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group/btn"
                      >
                        <FaEye className="group-hover/btn:scale-110 transition-transform" />
                        <span>Review Details</span>
                        <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#c6080a]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        <AnimatePresence>
          {isReviewModalOpen && selectedVerification && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
              onClick={closeReviewModal}
            >
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden my-8"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 text-white">
                  <div>
                    <h3 className="text-lg font-bold">Review Verification</h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      {selectedVerification.businessName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
                  {/* Business Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <FaBuilding className="text-white text-lg" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          Business Information
                        </h4>
                        <p className="text-xs text-gray-600">
                          Company details and tax identification
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                          Business Name
                        </p>
                        <p className="text-base font-bold text-gray-900">
                          {selectedVerification.businessName}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                          Tax Identification Number
                        </p>
                        <p className="text-base font-bold text-gray-900 font-mono">
                          {selectedVerification.taxIdentificationNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Identity Documents */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <FaIdCard className="text-white text-lg" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">
                          Identity Documents
                        </h4>
                        <p className="text-xs text-gray-600">
                          Government-issued identification
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                            {selectedVerification.identityDocument?.type
                              ?.replace("_", " ")
                              .toUpperCase()}{" "}
                            - Front
                          </p>
                          <div className="px-2 py-1 rounded-lg bg-purple-200 text-purple-800 text-xs font-semibold">
                            Required
                          </div>
                        </div>
                        {selectedVerification.identityDocument?.frontImage && (
                          <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-purple-300 shadow-lg bg-white">
                            <Image
                              src={
                                selectedVerification.identityDocument.frontImage
                              }
                              alt="Front ID"
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div className="mt-3 p-3 bg-white rounded-lg border border-purple-100">
                          <p className="text-xs font-bold text-gray-500 mb-1">
                            Document Number
                          </p>
                          <p className="text-sm font-mono font-semibold text-gray-900">
                            {selectedVerification.identityDocument?.number}
                          </p>
                        </div>
                      </div>
                      {selectedVerification.identityDocument?.backImage && (
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 border border-indigo-200">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                              {selectedVerification.identityDocument?.type
                                ?.replace("_", " ")
                                .toUpperCase()}{" "}
                              - Back
                            </p>
                            <div className="px-2 py-1 rounded-lg bg-indigo-200 text-indigo-800 text-xs font-semibold">
                              Optional
                            </div>
                          </div>
                          <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-indigo-300 shadow-lg bg-white">
                            <Image
                              src={
                                selectedVerification.identityDocument.backImage
                              }
                              alt="Back ID"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Address - Now using seller's storeAddress */}
                  {selectedVerification.seller?.storeAddress && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                          <FaMapMarkerAlt className="text-white text-lg" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            Business Address
                          </h4>
                          <p className="text-xs text-gray-600">
                            Registered business location
                          </p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-200">
                        <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                          {selectedVerification.seller.storeAddress.address && (
                            <>
                              {selectedVerification.seller.storeAddress.address}
                              <br />
                            </>
                          )}
                          {selectedVerification.seller.storeAddress.city}
                          {selectedVerification.seller.storeAddress.state &&
                            `, ${selectedVerification.seller.storeAddress.state}`}
                          <br />
                          {
                            selectedVerification.seller.storeAddress.postalCode
                          }{" "}
                          {selectedVerification.seller.storeAddress.country}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contact & Bank Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg">
                          <FaPhone className="text-white text-lg" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            Contact Information
                          </h4>
                          <p className="text-xs text-gray-600">
                            Business contact details
                          </p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-4 space-y-3 border border-rose-200">
                        <div className="p-3 bg-white rounded-lg border border-rose-100">
                          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
                            Phone Number
                          </p>
                          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-xs font-mono">
                              {selectedVerification.phoneCode}
                            </span>
                            {selectedVerification.phone}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-rose-100">
                          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
                            Email Address
                          </p>
                          <p className="text-sm font-semibold text-gray-900 break-all">
                            {selectedVerification.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                          <FaCreditCard className="text-white text-lg" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            Bank Details
                          </h4>
                          <p className="text-xs text-gray-600">
                            Payment processing information
                          </p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 space-y-3 border border-emerald-200">
                        <div className="p-3 bg-white rounded-lg border border-emerald-100">
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                            Account Holder
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {
                              selectedVerification.bankDetails
                                ?.accountHolderName
                            }
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-emerald-100">
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                            Account Number
                          </p>
                          <p className="text-sm font-mono font-semibold text-gray-900">
                            {selectedVerification.bankDetails?.accountNumber}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-emerald-100">
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                            Bank Name
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedVerification.bankDetails?.bankName}
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-emerald-100">
                          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                            Account Type
                          </p>
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {selectedVerification.bankDetails?.accountType}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Actions */}
                  <div className="border-t-2 border-gray-200 pt-6 space-y-5">
                    <div>
                      <label className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FaShieldAlt className="text-[#c6080a]" />
                        Review Decision
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setReviewStatus("approved")}
                          className={`relative p-5 rounded-xl border-2 transition-all duration-200 shadow-md ${
                            reviewStatus === "approved"
                              ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-emerald-200"
                              : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                          }`}
                        >
                          <FaCheckCircle
                            className={`text-3xl mx-auto mb-3 transition-colors ${
                              reviewStatus === "approved"
                                ? "text-emerald-600"
                                : "text-gray-400"
                            }`}
                          />
                          <p className="text-sm font-bold text-gray-900 mb-1">
                            Approve
                          </p>
                          <p className="text-xs text-gray-500">
                            Accept verification
                          </p>
                          {reviewStatus === "approved" && (
                            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-emerald-500"></div>
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setReviewStatus("requires_changes")}
                          className={`relative p-5 rounded-xl border-2 transition-all duration-200 shadow-md ${
                            reviewStatus === "requires_changes"
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-blue-200"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <FaInfoCircle
                            className={`text-3xl mx-auto mb-3 transition-colors ${
                              reviewStatus === "requires_changes"
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          />
                          <p className="text-sm font-bold text-gray-900 mb-1">
                            Request Changes
                          </p>
                          <p className="text-xs text-gray-500">
                            Ask for updates
                          </p>
                          {reviewStatus === "requires_changes" && (
                            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-blue-500"></div>
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setReviewStatus("rejected")}
                          className={`relative p-5 rounded-xl border-2 transition-all duration-200 shadow-md ${
                            reviewStatus === "rejected"
                              ? "border-red-500 bg-gradient-to-br from-red-50 to-red-100 shadow-red-200"
                              : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                          }`}
                        >
                          <FaTimes
                            className={`text-3xl mx-auto mb-3 transition-colors ${
                              reviewStatus === "rejected"
                                ? "text-red-600"
                                : "text-gray-400"
                            }`}
                          />
                          <p className="text-sm font-bold text-gray-900 mb-1">
                            Reject
                          </p>
                          <p className="text-xs text-gray-500">
                            Decline verification
                          </p>
                          {reviewStatus === "rejected" && (
                            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-red-500"></div>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {(reviewStatus === "rejected" ||
                      reviewStatus === "requires_changes") && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <FaInfoCircle
                            className={`text-sm ${
                              reviewStatus === "rejected"
                                ? "text-red-500"
                                : "text-blue-500"
                            }`}
                          />
                          Reason{" "}
                          {reviewStatus === "rejected"
                            ? "for Rejection"
                            : "for Changes Required"}
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={4}
                          placeholder="Enter detailed reason for your decision..."
                          className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 resize-none transition-all ${
                            reviewStatus === "rejected"
                              ? "border-red-200 focus:border-red-400 focus:ring-red-500/20 bg-red-50/50"
                              : "border-blue-200 focus:border-blue-400 focus:ring-blue-500/20 bg-blue-50/50"
                          }`}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-white transition-colors font-semibold text-sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleReview}
                    disabled={!reviewStatus || isSubmitting}
                    className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        <span>Submit Review</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
