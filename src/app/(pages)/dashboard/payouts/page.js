"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
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
  FaCloudUploadAlt,
  FaImage,
  FaExpand,
  FaTrash,
  FaFileImage,
  FaCopy,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  TbCurrencyEuro,
  TbRefresh,
  TbPhoto,
  TbX,
  TbZoomIn,
  TbDownload,
  TbMaximize,
} from "react-icons/tb";
import {
  BsBank2,
  BsThreeDotsVertical,
  BsImages,
  BsCloudUpload,
} from "react-icons/bs";
import { HiOutlineCash, HiSparkles } from "react-icons/hi";
import {
  IoClose,
  IoCheckmarkDoneCircle,
  IoCloudUploadOutline,
} from "react-icons/io5";
import { RiImageAddLine } from "react-icons/ri";

const MainLayout = dynamic(
  () => import("../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../utils/Breadcrumb"), {
  ssr: false,
});

// Fullscreen Image Viewer Component
const FullscreenImageViewer = ({
  images,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(-1);
      if (e.key === "ArrowRight") onNavigate(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigate]);

  const currentImage = images[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[100] flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-white/60 text-xs">
            {currentImage?.name || "Payment Proof"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setScale((s) => Math.min(s + 0.5, 3));
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <TbZoomIn className="text-xl" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(currentImage?.url, "_blank");
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <TbDownload className="text-xl" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <TbX className="text-xl" />
          </motion.button>
        </div>
      </div>

      {/* Main Image */}
      <div
        className="flex-1 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: scale }}
          transition={{ duration: 0.3 }}
          src={currentImage?.url}
          alt="Payment proof"
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl cursor-zoom-in"
          onClick={() => setScale((s) => (s === 1 ? 2 : 1))}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(-1);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(1);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-md rounded-xl">
          {images.map((img, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(idx - currentIndex);
              }}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? "border-white"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

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

  // Fullscreen image viewer
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerCurrentIndex, setViewerCurrentIndex] = useState(0);

  // Action form
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");

  // Payment proof images
  const [proofImages, setProofImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
  }, [
    auth?.token,
    currentPage,
    statusFilter,
    priorityFilter,
    searchQuery,
    dateRange,
  ]);

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

  // Upload payment proof image
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!auth?.token) {
      toast.error("Please login to upload files");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/upload/file`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${auth.token}`,
            },
            timeout: 60000, // 60 second timeout for uploads
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                ((i + progressEvent.loaded / progressEvent.total) /
                  files.length) *
                  100
              );
              setUploadProgress(progress);
            },
          }
        );

        if (data.files && data.files[0]) {
          uploadedImages.push({
            url: data.files[0],
            name: file.name,
            uploadedAt: new Date().toISOString(),
          });
        }
      }

      setProofImages((prev) => [...prev, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.message || "Failed to upload image(s)";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeProofImage = (index) => {
    setProofImages((prev) => prev.filter((_, i) => i !== index));
  };

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
          payload = {
            transactionId,
            referenceNumber,
            receiptUrl,
            proofOfPayment: proofImages.length > 0 ? proofImages : undefined,
            notes: adminNotes,
          };
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
    setProofImages([]);
    setSelectedPayout(null);
    setActionType("");
  };

  const openActionModal = (payout, type) => {
    setSelectedPayout(payout);
    setActionType(type);
    // Pre-fill existing values if completing
    if (type === "complete" && payout.transaction) {
      setTransactionId(payout.transaction.transactionId || "");
      setReferenceNumber(payout.transaction.referenceNumber || "");
    }
    setShowActionModal(true);
  };

  const openImageViewer = (images, startIndex = 0) => {
    setViewerImages(images);
    setViewerCurrentIndex(startIndex);
    setShowImageViewer(true);
  };

  const navigateImage = (direction) => {
    setViewerCurrentIndex((prev) => {
      const newIndex = prev + direction;
      if (newIndex < 0) return viewerImages.length - 1;
      if (newIndex >= viewerImages.length) return 0;
      return newIndex;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-200",
      under_review:
        "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200",
      approved:
        "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200",
      processing:
        "bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border-purple-200",
      completed:
        "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200",
      rejected:
        "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200",
      cancelled:
        "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="text-yellow-500" />,
      under_review: <FaEye className="text-blue-500" />,
      approved: <FaCheckCircle className="text-green-500" />,
      processing: <FaSpinner className="text-purple-500 animate-spin" />,
      completed: <IoCheckmarkDoneCircle className="text-emerald-500" />,
      rejected: <FaTimes className="text-red-500" />,
      cancelled: <FaTimes className="text-gray-500" />,
    };
    return icons[status] || <FaClock />;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      normal: "bg-gray-100 text-gray-700",
      high: "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700",
      urgent: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700",
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
      review:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      approve:
        "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      reject:
        "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      process:
        "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      complete:
        "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
    };
    return colors[action] || "bg-gray-600 hover:bg-gray-700";
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-[#c6080a] to-[#e63946] rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                  <FaWallet className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-600 bg-clip-text text-transparent">
                    Payout Management
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Review and process seller payout requests
                  </p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                fetchPayouts();
                fetchAnalytics();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <TbRefresh className={isLoading ? "animate-spin" : ""} />
              Refresh
            </motion.button>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg shadow-yellow-200/50"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">
                      Pending
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      €{(stats.totalPending || 0).toLocaleString()}
                    </p>
                    <p className="text-yellow-200 text-xs mt-1">
                      {(stats.pending?.count || 0) +
                        (stats.under_review?.count || 0) +
                        (stats.approved?.count || 0)}{" "}
                      requests
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <FaClock className="text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-200/50"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      Processing
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      €{(stats.totalProcessing || 0).toLocaleString()}
                    </p>
                    <p className="text-purple-200 text-xs mt-1">
                      {stats.processing?.count || 0} requests
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <FaSpinner className="animate-spin text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200/50"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-2 right-2"
                >
                  <HiSparkles className="text-white/20 text-3xl" />
                </motion.div>
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">
                      Completed
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      €{(stats.totalCompleted || 0).toLocaleString()}
                    </p>
                    <p className="text-emerald-200 text-xs mt-1">
                      {stats.completed?.count || 0} payouts
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <FaCheckCircle className="text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-rose-600 rounded-2xl p-5 text-white shadow-lg shadow-red-200/50"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Rejected</p>
                    <p className="text-3xl font-bold mt-1">
                      €{(stats.rejected?.amount || 0).toLocaleString()}
                    </p>
                    <p className="text-red-200 text-xs mt-1">
                      {stats.rejected?.count || 0} requests
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <FaTimes className="text-xl" />
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
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
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
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
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all cursor-pointer"
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
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all cursor-pointer"
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
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  className="px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Payouts Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FaSpinner className="animate-spin text-4xl text-red-500 mb-4" />
                <p className="text-gray-500">Loading payouts...</p>
              </div>
            ) : payouts.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
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
                      {payouts.map((payout, idx) => (
                        <motion.tr
                          key={payout._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#c6080a] to-[#e63946] rounded-xl flex items-center justify-center text-white shadow-sm">
                                <FaWallet />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {payout.requestNumber}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {payout.paymentMethod?.type?.replace(
                                    "_",
                                    " "
                                  )}
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
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
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
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${getStatusColor(
                                payout.status
                              )}`}
                            >
                              {getStatusIcon(payout.status)}
                              {payout.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${getPriorityBadge(
                                payout.priority
                              )}`}
                            >
                              {payout.priority}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-gray-600">
                              {format(
                                new Date(payout.createdAt),
                                "MMM dd, yyyy"
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(payout.createdAt), "HH:mm")}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setShowDetailsModal(true);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FaEye />
                              </motion.button>
                              {getAvailableActions(payout.status).map(
                                (action) => (
                                  <motion.button
                                    key={action}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      openActionModal(payout, action)
                                    }
                                    className={`p-2 rounded-lg text-white transition-all shadow-sm ${getActionColor(
                                      action
                                    )}`}
                                    title={getActionLabel(action)}
                                  >
                                    {action === "approve" && <FaCheck />}
                                    {action === "reject" && <FaTimes />}
                                    {action === "review" && <FaEye />}
                                    {action === "process" && <FaPlay />}
                                    {action === "complete" && <FaCheckCircle />}
                                  </motion.button>
                                )
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <p className="text-sm text-gray-500">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      of {pagination.total} results
                    </p>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                      >
                        Previous
                      </motion.button>
                      {Array.from(
                        { length: Math.min(5, pagination.pages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <motion.button
                              key={page}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setCurrentPage(page)}
                              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white shadow-sm"
                                  : "border border-gray-200 hover:bg-white"
                              }`}
                            >
                              {page}
                            </motion.button>
                          );
                        }
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(pagination.pages, p + 1)
                          )
                        }
                        disabled={currentPage === pagination.pages}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                      >
                        Next
                      </motion.button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaWallet className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Payout Requests
                </h3>
                <p className="text-gray-500">
                  No payout requests match your filters
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedPayout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedPayout(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto shidden"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-6 border-b border-gray-100 flex items-center justify-between z-10">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Payout Details
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      {selectedPayout.requestNumber}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold border ${getStatusColor(
                      selectedPayout.status
                    )}`}
                  >
                    {getStatusIcon(selectedPayout.status)}
                    {selectedPayout.status.replace("_", " ")}
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {/* Amount Card */}
                  <div className="text-center py-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-2xl border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Payout Amount</p>
                    <p className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      €{selectedPayout.amount.toFixed(2)}
                    </p>
                  </div>

                  {/* Seller Info */}
                  <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                    <p className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">
                      Seller Information
                    </p>
                    <div className="flex items-center gap-4">
                      {selectedPayout.seller?.storeLogo ? (
                        <img
                          src={selectedPayout.seller.storeLogo}
                          alt={selectedPayout.seller.storeName}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                          <FaStore className="text-2xl text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {selectedPayout.seller?.storeName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedPayout.seller?.user?.name}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          {selectedPayout.seller?.user?.email}
                          <button
                            onClick={() =>
                              copyToClipboard(
                                selectedPayout.seller?.user?.email
                              )
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaCopy className="text-xs" />
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                      Payment Method
                    </p>
                    <div className="p-5 border border-gray-200 rounded-2xl bg-white">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <BsBank2 className="text-xl text-white" />
                        </div>
                        <span className="font-bold capitalize text-lg">
                          {selectedPayout.paymentMethod?.type?.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </div>
                      {selectedPayout.paymentMethod?.bankDetails && (
                        <div className="space-y-3 text-sm">
                          {selectedPayout.paymentMethod.bankDetails
                            .accountHolderName && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">
                                Account Holder
                              </span>
                              <span className="font-semibold">
                                {
                                  selectedPayout.paymentMethod.bankDetails
                                    .accountHolderName
                                }
                              </span>
                            </div>
                          )}
                          {selectedPayout.paymentMethod.bankDetails
                            .bankName && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">Bank</span>
                              <span className="font-semibold">
                                {
                                  selectedPayout.paymentMethod.bankDetails
                                    .bankName
                                }
                              </span>
                            </div>
                          )}
                          {selectedPayout.paymentMethod.bankDetails.iban && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">IBAN</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold">
                                  {
                                    selectedPayout.paymentMethod.bankDetails
                                      .iban
                                  }
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      selectedPayout.paymentMethod.bankDetails
                                        .iban
                                    )
                                  }
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <FaCopy className="text-xs" />
                                </button>
                              </div>
                            </div>
                          )}
                          {selectedPayout.paymentMethod.bankDetails
                            .swiftCode && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">SWIFT</span>
                              <span className="font-mono font-semibold">
                                {
                                  selectedPayout.paymentMethod.bankDetails
                                    .swiftCode
                                }
                              </span>
                            </div>
                          )}
                          {selectedPayout.paymentMethod.bankDetails
                            .accountNumber && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500">
                                Account Number
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold">
                                  {
                                    selectedPayout.paymentMethod.bankDetails
                                      .accountNumber
                                  }
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      selectedPayout.paymentMethod.bankDetails
                                        .accountNumber
                                    )
                                  }
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <FaCopy className="text-xs" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {selectedPayout.paymentMethod?.paypalEmail && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">PayPal Email</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {selectedPayout.paymentMethod.paypalEmail}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  selectedPayout.paymentMethod.paypalEmail
                                )
                              }
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <FaCopy className="text-xs" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Earnings Breakdown */}
                  {selectedPayout.earnings && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                        Earnings Breakdown
                      </p>
                      <div className="space-y-3 p-5 border border-gray-200 rounded-2xl bg-white">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Gross Earnings</span>
                          <span className="font-semibold">
                            €{selectedPayout.earnings.totalEarnings?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Platform Fee (
                            {selectedPayout.earnings.platformFeePercentage}%)
                          </span>
                          <span className="font-semibold text-red-500">
                            -€{selectedPayout.earnings.platformFee?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Previous Payouts
                          </span>
                          <span className="font-semibold">
                            €
                            {selectedPayout.earnings.previousPayouts?.toFixed(
                              2
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold pt-3 border-t border-gray-200 text-base">
                          <span>Net Payout</span>
                          <span className="text-emerald-600">
                            €{selectedPayout.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transaction Details (if completed) */}
                  {selectedPayout.transaction &&
                    (selectedPayout.transaction.transactionId ||
                      selectedPayout.transaction.referenceNumber) && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                          Transaction Details
                        </p>
                        <div className="p-5 border border-emerald-200 bg-emerald-50 rounded-2xl space-y-3">
                          {selectedPayout.transaction.transactionId && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-emerald-700">
                                Transaction ID
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-emerald-800">
                                  {selectedPayout.transaction.transactionId}
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      selectedPayout.transaction.transactionId
                                    )
                                  }
                                  className="text-emerald-600 hover:text-emerald-800"
                                >
                                  <FaCopy className="text-xs" />
                                </button>
                              </div>
                            </div>
                          )}
                          {selectedPayout.transaction.referenceNumber && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-emerald-700">
                                Reference Number
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-emerald-800">
                                  {selectedPayout.transaction.referenceNumber}
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      selectedPayout.transaction.referenceNumber
                                    )
                                  }
                                  className="text-emerald-600 hover:text-emerald-800"
                                >
                                  <FaCopy className="text-xs" />
                                </button>
                              </div>
                            </div>
                          )}
                          {selectedPayout.transaction.receiptUrl && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-emerald-700">Receipt</span>
                              <a
                                href={selectedPayout.transaction.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold"
                              >
                                View Receipt{" "}
                                <FaExternalLinkAlt className="text-xs" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Payment Proof Images */}
                  {selectedPayout.transaction?.proofOfPayment &&
                    selectedPayout.transaction.proofOfPayment.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                          Payment Proof Screenshots
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedPayout.transaction.proofOfPayment.map(
                            (img, idx) => (
                              <motion.div
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100"
                                onClick={() =>
                                  openImageViewer(
                                    selectedPayout.transaction.proofOfPayment,
                                    idx
                                  )
                                }
                              >
                                <img
                                  src={img.url}
                                  alt={`Payment proof ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <TbMaximize className="text-white text-2xl" />
                                </div>
                              </motion.div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Timeline */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                      Timeline
                    </p>
                    <div className="space-y-4 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
                      <div className="flex items-start gap-4 text-sm relative">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center z-10 border-2 border-white">
                          <FaCalendarAlt className="text-gray-500 text-xs" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-semibold text-gray-900">
                            Requested
                          </p>
                          <p className="text-gray-500">
                            {format(
                              new Date(selectedPayout.createdAt),
                              "MMM dd, yyyy 'at' HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                      {selectedPayout.reviewedAt && (
                        <div className="flex items-start gap-4 text-sm relative">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center z-10 border-2 border-white">
                            <FaEye className="text-blue-600 text-xs" />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="font-semibold text-gray-900">
                              Reviewed
                            </p>
                            <p className="text-gray-500">
                              {format(
                                new Date(selectedPayout.reviewedAt),
                                "MMM dd, yyyy 'at' HH:mm"
                              )}
                              {selectedPayout.reviewedBy?.name && (
                                <span className="text-blue-600">
                                  {" "}
                                  by {selectedPayout.reviewedBy.name}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedPayout.approvedAt && (
                        <div className="flex items-start gap-4 text-sm relative">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center z-10 border-2 border-white">
                            <FaCheck className="text-green-600 text-xs" />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="font-semibold text-gray-900">
                              Approved
                            </p>
                            <p className="text-gray-500">
                              {format(
                                new Date(selectedPayout.approvedAt),
                                "MMM dd, yyyy 'at' HH:mm"
                              )}
                              {selectedPayout.approvedBy?.name && (
                                <span className="text-green-600">
                                  {" "}
                                  by {selectedPayout.approvedBy.name}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedPayout.transaction?.confirmedAt && (
                        <div className="flex items-start gap-4 text-sm relative">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center z-10 border-2 border-white">
                            <IoCheckmarkDoneCircle className="text-emerald-600 text-sm" />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="font-semibold text-gray-900">
                              Completed
                            </p>
                            <p className="text-gray-500">
                              {format(
                                new Date(
                                  selectedPayout.transaction.confirmedAt
                                ),
                                "MMM dd, yyyy 'at' HH:mm"
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {selectedPayout.adminNotes && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                        Admin Notes
                      </p>
                      <div className="p-4 bg-gray-50 rounded-xl whitespace-pre-wrap text-sm text-gray-700">
                        {selectedPayout.adminNotes}
                      </div>
                    </div>
                  )}

                  {/* Rejection Reason */}
                  {selectedPayout.status === "rejected" &&
                    selectedPayout.rejectionReason && (
                      <div className="p-5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl">
                        <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-2 uppercase tracking-wider">
                          <FaTimes />
                          Rejection Reason
                        </p>
                        <p className="text-sm text-red-600">
                          {selectedPayout.rejectionReason}
                        </p>
                      </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 p-6 border-t border-gray-100 bg-white/95 backdrop-blur-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAvailableActions(selectedPayout.status).map(
                      (action) => (
                        <motion.button
                          key={action}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowDetailsModal(false);
                            openActionModal(selectedPayout, action);
                          }}
                          className={`px-5 py-2.5 rounded-xl text-white font-semibold transition-all shadow-sm ${getActionColor(
                            action
                          )}`}
                        >
                          {getActionLabel(action)}
                        </motion.button>
                      )
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPayout(null);
                    }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </motion.button>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowActionModal(false);
                resetActionForm();
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900">
                    {getActionLabel(actionType)}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 font-mono">
                    {selectedPayout.requestNumber} - €
                    {selectedPayout.amount.toFixed(2)}
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  {/* Rejection Reason (for reject action) */}
                  {actionType === "reject" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rejection Reason <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this request is being rejected..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all"
                        required
                      />
                    </div>
                  )}

                  {/* Transaction Details (for process/complete actions) */}
                  {(actionType === "process" || actionType === "complete") && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Transaction ID
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Bank transaction ID"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Reference Number
                        </label>
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="Payment reference"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                      </div>
                    </>
                  )}

                  {/* Receipt URL (for complete action) */}
                  {actionType === "complete" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Receipt URL
                        </label>
                        <input
                          type="url"
                          value={receiptUrl}
                          onChange={(e) => setReceiptUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                      </div>

                      {/* Payment Proof Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Proof Screenshots
                        </label>
                        <div className="space-y-3">
                          {/* Upload Area */}
                          <label className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <div className="flex flex-col items-center">
                                <FaSpinner className="text-3xl text-gray-400 animate-spin mb-2" />
                                <p className="text-sm text-gray-500">
                                  Uploading... {uploadProgress}%
                                </p>
                                <div className="w-32 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mb-2 group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors">
                                  <IoCloudUploadOutline className="text-2xl text-gray-500 group-hover:text-emerald-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-600 group-hover:text-emerald-600">
                                  Click to upload payment screenshots
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  PNG, JPG up to 10MB (multiple files allowed)
                                </p>
                              </div>
                            )}
                          </label>

                          {/* Uploaded Images Preview */}
                          {proofImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                              {proofImages.map((img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={img.url}
                                    alt={img.name}
                                    className="w-full h-24 object-cover rounded-xl border border-gray-200 cursor-pointer"
                                    onClick={() =>
                                      openImageViewer(proofImages, idx)
                                    }
                                  />
                                  <button
                                    onClick={() => removeProofImage(idx)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                  >
                                    <FaTimes className="text-xs" />
                                  </button>
                                  <div
                                    className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    onClick={() =>
                                      openImageViewer(proofImages, idx)
                                    }
                                  >
                                    <FaExpand className="text-white text-lg" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any internal notes..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowActionModal(false);
                      resetActionForm();
                    }}
                    className="px-6 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAction}
                    disabled={
                      isSubmitting ||
                      (actionType === "reject" && !rejectionReason)
                    }
                    className={`px-6 py-2.5 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg ${getActionColor(
                      actionType
                    )}`}
                  >
                    {isSubmitting && <FaSpinner className="animate-spin" />}
                    {getActionLabel(actionType)}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen Image Viewer */}
        <AnimatePresence>
          {showImageViewer && (
            <FullscreenImageViewer
              images={viewerImages}
              currentIndex={viewerCurrentIndex}
              onClose={() => setShowImageViewer(false)}
              onNavigate={navigateImage}
            />
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
