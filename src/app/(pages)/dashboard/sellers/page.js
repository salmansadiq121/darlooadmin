"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Loader from "@/app/utils/Loader";
import dynamic from "next/dynamic";
import {
  IoClose,
  IoSearch,
  IoGrid,
  IoList,
  IoEye,
  IoChatbubbleEllipses,
  IoStorefront,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoCloseCircle,
  IoEllipsisHorizontal,
  IoChevronForward,
  IoChevronBack,
  IoFilter,
  IoSparkles,
  IoMail,
  IoCall,
  IoLocation,
  IoGlobe,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTwitter,
  IoCalendar,
  IoStatsChart,
  IoPerson,
  IoSend,
  IoShieldCheckmark,
  IoWarning,
  IoBan,
  IoTrash,
  IoRefresh,
} from "react-icons/io5";
import { format } from "date-fns";
import Image from "next/image";
import { MdVerified, MdOutlineStorefront } from "react-icons/md";
import { HiSparkles, HiOutlineExternalLink } from "react-icons/hi2";
import { TbCurrencyEuro, TbShieldCheck, TbShieldX } from "react-icons/tb";
import { FaStar, FaStarHalf } from "react-icons/fa6";
import { BiMessageSquareDetail, BiPackage } from "react-icons/bi";
import { RiVipCrownFill, RiVerifiedBadgeFill } from "react-icons/ri";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const MainLayout = dynamic(
  () => import("./../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("./../../../utils/Breadcrumb"), {
  ssr: false,
});

// Animated Background Component
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-100" />
    <motion.div
      className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(198, 8, 10, 0.03) 0%, transparent 70%)",
      }}
      animate={{
        x: [0, 50, 0],
        y: [0, 30, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)",
      }}
      animate={{
        x: [0, -30, 0],
        y: [0, -50, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// Modern Stat Card Component
const StatCard = ({ label, value, icon: Icon, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="relative group"
  >
    <div
      className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl"
      style={{ background: gradient }}
    />
    <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-gray-200/50 shadow-lg shadow-gray-200/20 hover:shadow-xl hover:border-gray-300/50 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value}
          </p>
        </div>
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg`}
          style={{ background: gradient }}
        >
          <Icon className="text-white text-2xl" />
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: gradient }}
      />
    </div>
  </motion.div>
);

// Modern Seller Card Component
const SellerCard = ({
  seller,
  index,
  onView,
  onChat,
  onApprove,
  onReject,
  onSuspend,
  onToggleStatus,
  isAdmin,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusConfig = (status, isActive) => {
    if (!isActive) return { color: "gray", label: "Inactive", icon: IoBan };
    const configs = {
      approved: {
        color: "emerald",
        label: "Verified",
        icon: IoShieldCheckmark,
      },
      pending: { color: "amber", label: "Pending", icon: IoTimeOutline },
      rejected: { color: "red", label: "Rejected", icon: IoCloseCircle },
      suspended: { color: "gray", label: "Suspended", icon: IoWarning },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(
    seller.verificationStatus,
    seller.isActive
  );
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      {/* Card Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#c6080a] via-rose-500 to-orange-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />

      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200/60 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:border-gray-300/60 transition-all duration-500">
        {/* Banner Section */}
        <div className="relative h-32 overflow-hidden">
          {seller.storeBanner ? (
            <Image
              src={seller.storeBanner}
              alt={seller.storeName}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#c6080a] via-rose-500 to-orange-500">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Active Toggle */}
          <div className="absolute top-3 left-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(seller);
              }}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-lg ${
                seller.isActive
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                  : "bg-gray-400"
              }`}
            >
              <motion.div
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                animate={{
                  left: seller.isActive ? "calc(100% - 20px)" : "4px",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                statusConfig.color === "emerald"
                  ? "bg-emerald-500/90 text-white"
                  : statusConfig.color === "amber"
                  ? "bg-amber-500/90 text-white"
                  : statusConfig.color === "red"
                  ? "bg-red-500/90 text-white"
                  : "bg-gray-500/90 text-white"
              }`}
            >
              <StatusIcon className="text-sm" />
              {statusConfig.label}
            </motion.div>
          </div>

          {/* Store Logo */}
          <div className="absolute -bottom-10 left-5 z-20">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative w-20 h-20 rounded-2xl bg-white shadow-xl border-4 border-white overflow-hidden"
            >
              {seller.storeLogo ? (
                <Image
                  src={seller.storeLogo}
                  alt={seller.storeName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#c6080a] to-rose-500 flex items-center justify-center">
                  <IoStorefront className="text-white text-3xl" />
                </div>
              )}
              {seller.verificationStatus === "approved" && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <RiVerifiedBadgeFill className="text-white text-xs" />
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-12 px-5 pb-5">
          {/* Store Name & Slug */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#c6080a] transition-colors truncate">
                {seller.storeName}
              </h3>
              {seller.verificationStatus === "approved" && (
                <MdVerified className="text-blue-500 text-lg flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium">
              /{seller.storeSlug}
            </p>
          </div>

          {/* Owner Info */}
          {seller.user && (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl mb-4 border border-gray-100">
              <div className="relative">
                {seller.user.avatar ? (
                  <Image
                    src={seller.user.avatar}
                    alt={seller.user.name}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-md"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                    {seller.user.name?.charAt(0) || "U"}
                  </div>
                )}
                {seller.user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {seller.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {seller.user.email}
                </p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              {
                icon: BiPackage,
                value: seller.totalProducts || 0,
                label: "Products",
                color: "blue",
              },
              {
                icon: IoTrendingUp,
                value: seller.totalSales || 0,
                label: "Sales",
                color: "emerald",
              },
              {
                icon: FaStar,
                value: `${(seller.rating?.average || 0).toFixed(1)}`,
                label: `${seller.rating?.totalReviews || 0} reviews`,
                color: "amber",
                isStar: true,
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`text-center p-3 rounded-xl transition-all cursor-default ${
                  stat.color === "blue"
                    ? "bg-blue-50 hover:bg-blue-100"
                    : stat.color === "emerald"
                    ? "bg-emerald-50 hover:bg-emerald-100"
                    : "bg-amber-50 hover:bg-amber-100"
                }`}
              >
                <stat.icon
                  className={`mx-auto mb-1 text-lg ${
                    stat.color === "blue"
                      ? "text-blue-500"
                      : stat.color === "emerald"
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }`}
                />
                <p className="text-base font-bold text-gray-900 flex items-center justify-center gap-0.5">
                  {stat.value}
                  {stat.isStar && <FaStar className="text-amber-400 text-xs" />}
                </p>
                <p className="text-[10px] text-gray-500 uppercase font-medium tracking-wide">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Revenue Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-xl mb-4 border border-emerald-100"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <TbCurrencyEuro className="text-white text-xl" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Revenue
              </span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              €{(seller.totalRevenue || 0).toLocaleString()}
            </span>
          </motion.div>

          {/* Location */}
          {seller.storeAddress?.city && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <IoLocation className="text-gray-400" />
              <span>
                {seller.storeAddress.city}, {seller.storeAddress.country}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onView(seller)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all"
            >
              <IoEye className="text-base" />
              View
            </motion.button>

            {/* Chat Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChat(seller)}
              className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all"
              title="Chat with Seller"
            >
              <IoChatbubbleEllipses className="text-lg" />
            </motion.button>

            {isAdmin && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onApprove(seller)}
                  className="p-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-all"
                  title="Approve"
                >
                  <TbShieldCheck className="text-lg" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onReject(seller)}
                  className="p-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-all"
                  title="Reject"
                >
                  <TbShieldX className="text-lg" />
                </motion.button>

                {/* More Actions */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowActions(!showActions)}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                  >
                    <IoEllipsisHorizontal className="text-lg" />
                  </motion.button>

                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-full right-0 mb-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                      >
                        <button
                          onClick={() => {
                            onSuspend(seller);
                            setShowActions(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <IoWarning className="text-amber-500" />
                          Suspend
                        </button>
                        <button
                          onClick={() => {
                            // Handle delete
                            setShowActions(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <IoTrash />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Seller Detail Modal Component
const SellerDetailModal = ({ seller, isOpen, onClose, onChat }) => {
  if (!seller) return null;

  const statusConfig = {
    approved: {
      color: "emerald",
      label: "Verified Seller",
      icon: IoShieldCheckmark,
    },
    pending: { color: "amber", label: "Pending Review", icon: IoTimeOutline },
    rejected: { color: "red", label: "Rejected", icon: IoCloseCircle },
    suspended: { color: "gray", label: "Suspended", icon: IoWarning },
  };

  const config =
    statusConfig[seller.verificationStatus] || statusConfig.pending;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8"
          >
            {/* Modal Header with Banner */}
            <div className="relative h-44">
              {seller.storeBanner ? (
                <Image
                  src={seller.storeBanner}
                  alt={seller.storeName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#c6080a] via-rose-500 to-orange-500">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                    }}
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <IoClose className="text-xl" />
              </motion.button>

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md ${
                    config.color === "emerald"
                      ? "bg-emerald-500/90"
                      : config.color === "amber"
                      ? "bg-amber-500/90"
                      : config.color === "red"
                      ? "bg-red-500/90"
                      : "bg-gray-500/90"
                  } text-white text-sm font-semibold shadow-lg`}
                >
                  <config.icon />
                  {config.label}
                </div>
              </div>

              {/* Store Logo */}
              <div className="absolute -bottom-14 left-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-28 h-28 rounded-3xl bg-white shadow-2xl border-4 border-white overflow-hidden"
                >
                  {seller.storeLogo ? (
                    <Image
                      src={seller.storeLogo}
                      alt={seller.storeName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#c6080a] to-rose-500 flex items-center justify-center">
                      <IoStorefront className="text-white text-4xl" />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Chat Button - Prominent Position */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onChat(seller)}
                className="absolute bottom-4 right-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
              >
                <IoChatbubbleEllipses className="text-lg" />
                Message Seller
              </motion.button>
            </div>

            {/* Content */}
            <div className="pt-16 px-8 pb-8">
              {/* Store Info */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {seller.storeName}
                    </h2>
                    {seller.verificationStatus === "approved" && (
                      <MdVerified className="text-blue-500 text-2xl" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    /{seller.storeSlug}
                  </p>
                </div>
                {seller.storeAddress?.city && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <IoLocation />
                    {seller.storeAddress.city}, {seller.storeAddress.country}
                  </div>
                )}
              </div>

              {seller.storeDescription && (
                <p className="text-gray-600 leading-relaxed mb-6 p-4 bg-gray-50 rounded-xl">
                  {seller.storeDescription}
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  {
                    label: "Products",
                    value: seller.totalProducts || 0,
                    icon: BiPackage,
                    color: "blue",
                  },
                  {
                    label: "Total Sales",
                    value: seller.totalSales || 0,
                    icon: IoTrendingUp,
                    color: "emerald",
                  },
                  {
                    label: "Revenue",
                    value: `€${(seller.totalRevenue || 0).toLocaleString()}`,
                    icon: TbCurrencyEuro,
                    color: "green",
                  },
                  {
                    label: "Rating",
                    value: `${(seller.rating?.average || 0).toFixed(1)} ★`,
                    sub: `${seller.rating?.totalReviews || 0} reviews`,
                    icon: FaStar,
                    color: "amber",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className={`text-center p-4 rounded-2xl ${
                      stat.color === "blue"
                        ? "bg-blue-50"
                        : stat.color === "emerald"
                        ? "bg-emerald-50"
                        : stat.color === "green"
                        ? "bg-green-50"
                        : "bg-amber-50"
                    }`}
                  >
                    <stat.icon
                      className={`mx-auto mb-2 text-2xl ${
                        stat.color === "blue"
                          ? "text-blue-500"
                          : stat.color === "emerald"
                          ? "text-emerald-500"
                          : stat.color === "green"
                          ? "text-green-500"
                          : "text-amber-500"
                      }`}
                    />
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      {stat.sub || stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Owner & Contact */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Owner */}
                {seller.user && (
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <IoPerson className="text-gray-400" />
                      <p className="text-xs font-bold text-gray-500 uppercase">
                        Store Owner
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {seller.user.avatar ? (
                        <Image
                          src={seller.user.avatar}
                          alt={seller.user.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-xl object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {seller.user.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {seller.user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {seller.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <IoMail className="text-gray-400" />
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Contact Info
                    </p>
                  </div>
                  <div className="space-y-2">
                    {seller.contactEmail && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <IoMail className="text-gray-400" />
                        <span className="truncate">{seller.contactEmail}</span>
                      </div>
                    )}
                    {seller.contactPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <IoCall className="text-gray-400" />
                        <span>{seller.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {(seller.socialLinks?.website ||
                seller.socialLinks?.facebook ||
                seller.socialLinks?.instagram) && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                    Social Links
                  </p>
                  <div className="flex items-center gap-2">
                    {seller.socialLinks?.website && (
                      <a
                        href={seller.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        <IoGlobe className="text-gray-600 text-lg" />
                      </a>
                    )}
                    {seller.socialLinks?.facebook && (
                      <a
                        href={seller.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        <IoLogoFacebook className="text-blue-600 text-lg" />
                      </a>
                    )}
                    {seller.socialLinks?.instagram && (
                      <a
                        href={seller.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors"
                      >
                        <IoLogoInstagram className="text-pink-600 text-lg" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Joined Date */}
              <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-200">
                <IoCalendar />
                Joined: {format(new Date(seller.createdAt), "MMMM dd, yyyy")}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main Component
export default function Sellers() {
  const { auth } = useAuth();
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState("");
  const [sellerData, setSellerData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);
  const [suspensionSeller, setSuspensionSeller] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const itemsPerPage = 12;

  const isAdmin =
    auth?.user?.role === "superadmin" || auth?.user?.role === "admin";

  // Fetch Sellers
  const fetchSellers = useCallback(
    async (page = 1, filters = {}) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
          ...filters,
        });

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/all?${params}`,
          { headers: { Authorization: auth?.token } }
        );

        if (data?.success) {
          setSellerData(data.sellers || []);
          setTotalPages(data.pagination?.pages || 1);
          setStats({
            total: data.pagination?.total || 0,
            active: data.sellers?.filter((s) => s.isActive)?.length || 0,
            pending:
              data.sellers?.filter((s) => s.verificationStatus === "pending")
                ?.length || 0,
            approved:
              data.sellers?.filter((s) => s.verificationStatus === "approved")
                ?.length || 0,
            rejected:
              data.sellers?.filter((s) => s.verificationStatus === "rejected")
                ?.length || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching sellers:", error);
        toast.error(error.response?.data?.message || "Failed to fetch sellers");
      } finally {
        setIsLoading(false);
      }
    },
    [auth?.token]
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch on filters change
  useEffect(() => {
    if (auth?.token) {
      const filters = {};
      if (activeTab !== "All") {
        if (activeTab === "Active") filters.status = "true";
        if (activeTab === "Pending") filters.verificationStatus = "pending";
        if (activeTab === "Approved") filters.verificationStatus = "approved";
        if (activeTab === "Rejected") filters.verificationStatus = "rejected";
      }
      if (debouncedSearchQuery) filters.search = debouncedSearchQuery;
      fetchSellers(currentPage, filters);
    }
  }, [auth?.token, currentPage, activeTab, debouncedSearchQuery, fetchSellers]);

  useEffect(() => {
    if (typeof window !== "undefined") setCurrentUrl(window.location.pathname);
  }, []);

  // Handle Status Update
  const handleStatusUpdate = async (
    sellerId,
    verificationStatus,
    isActive,
    suspensionReason
  ) => {
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/status/${sellerId}`,
        { verificationStatus, isActive, suspensionReason },
        { headers: { Authorization: auth?.token } }
      );

      if (data?.success) {
        toast.success("Seller status updated successfully");
        fetchSellers(currentPage);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Handle Chat with Seller
  const handleChatWithSeller = async (seller) => {
    if (!seller?.user?._id) {
      toast.error("Unable to start chat. Seller information not available.");
      return;
    }

    setIsChatLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/chat/create`,
        { userId: seller.user._id },
        { headers: { Authorization: auth?.token } }
      );

      if (data?.success || data?._id || data?.fullChat) {
        toast.success("Chat created! Redirecting...");
        // Navigate to chat page with the chat/user ID
        const chatId = data?.fullChat?._id || data?._id;
        router.push(`/dashboard/chat?chatId=${chatId}`);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error(error.response?.data?.message || "Failed to create chat");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Tab configurations
  const tabs = [
    { id: "All", label: "All Sellers", icon: IoStorefront },
    { id: "Active", label: "Active", icon: IoCheckmarkCircle },
    { id: "Pending", label: "Pending", icon: IoTimeOutline },
    { id: "Approved", label: "Verified", icon: IoShieldCheckmark },
    { id: "Rejected", label: "Rejected", icon: IoCloseCircle },
  ];

  return (
    <MainLayout
      title="Sellers Management - Darloo Admin"
      description="Manage sellers, verifications, and store settings"
      keywords="sellers, marketplace, admin, management"
    >
      <AnimatedBackground />

      <div className="relative min-h-screen p-4 sm:p-6">
        <Breadcrumb path={currentUrl} />

        <div className="flex flex-col gap-6 mt-2">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c6080a] via-rose-500 to-orange-500 flex items-center justify-center shadow-xl shadow-red-500/25"
              >
                <MdOutlineStorefront className="text-white text-3xl" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Sellers Hub
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <HiSparkles className="text-amber-500" />
                  Manage and connect with your marketplace sellers
                </p>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                <span className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </span>
                <span className="text-sm text-gray-500 ml-2">Total</span>
              </div>
              <div className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                <span className="text-2xl font-bold text-emerald-600">
                  {stats.approved}
                </span>
                <span className="text-sm text-emerald-600 ml-2">Verified</span>
              </div>
              <div className="px-4 py-2 bg-amber-50 rounded-full border border-amber-200">
                <span className="text-2xl font-bold text-amber-600">
                  {stats.pending}
                </span>
                <span className="text-sm text-amber-600 ml-2">Pending</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              label="Total Sellers"
              value={stats.total}
              icon={IoStorefront}
              gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
              delay={0}
            />
            <StatCard
              label="Active"
              value={stats.active}
              icon={IoCheckmarkCircle}
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              delay={0.05}
            />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={IoTimeOutline}
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              delay={0.1}
            />
            <StatCard
              label="Verified"
              value={stats.approved}
              icon={IoShieldCheckmark}
              gradient="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
              delay={0.15}
            />
            <StatCard
              label="Rejected"
              value={stats.rejected}
              icon={IoCloseCircle}
              gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
              delay={0.2}
            />
          </div>

          {/* Tabs & Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-lg shadow-gray-200/20 p-4"
          >
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-shrink-0">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setCurrentPage(1);
                      }}
                      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
                        isActive
                          ? "text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSellerTab"
                          className="absolute inset-0 bg-gradient-to-r from-[#c6080a] to-rose-500 rounded-lg shadow-lg"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                      <tab.icon className="relative z-10 text-sm sm:text-base" />
                      <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Search & Controls */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 xl:flex-initial">
                <div className="relative flex-1 min-w-0 sm:min-w-[200px] xl:min-w-[280px]">
                  <IoSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search sellers..."
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c6080a]/20 focus:border-[#c6080a] transition-all text-sm"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === "card"
                        ? "bg-white shadow-md text-[#c6080a]"
                        : "text-gray-500"
                    }`}
                  >
                    <IoGrid className="text-lg" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === "table"
                        ? "bg-white shadow-md text-[#c6080a]"
                        : "text-gray-500"
                    }`}
                  >
                    <IoList className="text-lg" />
                  </button>
                </div>

                {/* Refresh */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, rotate: 180 }}
                  onClick={() => fetchSellers(currentPage)}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <IoRefresh className="text-lg text-gray-600" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-96 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg">
              <Loader />
            </div>
          ) : viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {sellerData.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60"
                >
                  <IoStorefront className="text-6xl text-gray-300 mb-4" />
                  <p className="text-xl font-semibold text-gray-500">
                    No sellers found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search or filters
                  </p>
                </motion.div>
              ) : (
                sellerData.map((seller, idx) => (
                  <SellerCard
                    key={seller._id}
                    seller={seller}
                    index={idx}
                    onView={(s) => {
                      setSelectedSeller(s);
                      setIsDetailModalOpen(true);
                    }}
                    onChat={handleChatWithSeller}
                    onApprove={(s) =>
                      handleStatusUpdate(s._id, "approved", s.isActive)
                    }
                    onReject={(s) =>
                      handleStatusUpdate(s._id, "rejected", s.isActive)
                    }
                    onSuspend={(s) => {
                      setSuspensionSeller(s);
                      setSuspensionModalOpen(true);
                    }}
                    onToggleStatus={(s) =>
                      handleStatusUpdate(
                        s._id,
                        s.verificationStatus,
                        !s.isActive
                      )
                    }
                    isAdmin={isAdmin}
                  />
                ))
              )}
            </div>
          ) : (
            /* Table View - Similar to cards but in table format */
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Store
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Owner
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Stats
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Revenue
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sellerData.map((seller, idx) => (
                      <motion.tr
                        key={seller._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                              {seller.storeLogo ? (
                                <Image
                                  src={seller.storeLogo}
                                  alt={seller.storeName}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#c6080a] to-rose-500 flex items-center justify-center">
                                  <IoStorefront className="text-white text-xl" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-900">
                                  {seller.storeName}
                                </span>
                                {seller.verificationStatus === "approved" && (
                                  <MdVerified className="text-blue-500" />
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                /{seller.storeSlug}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {seller.user && (
                            <div className="flex items-center gap-2">
                              {seller.user.avatar ? (
                                <Image
                                  src={seller.user.avatar}
                                  alt={seller.user.name}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                  {seller.user.name?.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {seller.user.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {seller.user.email}
                                </p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              seller.verificationStatus === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : seller.verificationStatus === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : seller.verificationStatus === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {seller.verificationStatus === "approved" ? (
                              <IoShieldCheckmark />
                            ) : seller.verificationStatus === "pending" ? (
                              <IoTimeOutline />
                            ) : (
                              <IoCloseCircle />
                            )}
                            {seller.verificationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              <strong>{seller.totalProducts || 0}</strong>{" "}
                              products
                            </span>
                            <span className="text-gray-600">
                              <strong>{seller.totalSales || 0}</strong> sales
                            </span>
                            <span className="text-amber-600 flex items-center gap-1">
                              <FaStar className="text-amber-400" />
                              {(seller.rating?.average || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-emerald-600">
                            €{(seller.totalRevenue || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedSeller(seller);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <IoEye className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleChatWithSeller(seller)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            >
                              <IoChatbubbleEllipses />
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      seller._id,
                                      "approved",
                                      seller.isActive
                                    )
                                  }
                                  className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors"
                                >
                                  <TbShieldCheck />
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      seller._id,
                                      "rejected",
                                      seller.isActive
                                    )
                                  }
                                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                >
                                  <TbShieldX />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2"
            >
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <IoChevronBack />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                        currentPage === page
                          ? "bg-gradient-to-r from-[#c6080a] to-rose-500 text-white shadow-lg"
                          : "bg-white border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="px-2 text-gray-400">...</span>
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <IoChevronForward />
              </button>
            </motion.div>
          )}
        </div>

        {/* Seller Detail Modal */}
        <SellerDetailModal
          seller={selectedSeller}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onChat={handleChatWithSeller}
        />

        {/* Suspension Modal */}
        <AnimatePresence>
          {suspensionModalOpen && suspensionSeller && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
              onClick={() => setSuspensionModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Suspend Seller
                    </h3>
                    <p className="text-sm text-white/80">
                      {suspensionSeller.storeName}
                    </p>
                  </div>
                  <button
                    onClick={() => setSuspensionModalOpen(false)}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <IoClose className="text-white text-lg" />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Please provide a reason for suspension. This will be visible
                    to the seller.
                  </p>
                  <textarea
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    rows={4}
                    placeholder="Enter suspension reason..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                  />
                </div>
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSuspensionModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!suspensionReason.trim()) {
                        toast.error("Please provide a suspension reason");
                        return;
                      }
                      await handleStatusUpdate(
                        suspensionSeller._id,
                        "suspended",
                        false,
                        suspensionReason
                      );
                      setSuspensionModalOpen(false);
                      setSuspensionReason("");
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Confirm Suspension
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Loading Overlay */}
        <AnimatePresence>
          {isChatLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 font-medium">Creating chat...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
