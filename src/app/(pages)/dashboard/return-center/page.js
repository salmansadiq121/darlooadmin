"use client";
import axios from "axios";
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PackageIcon,
  UserIcon,
  CalendarIcon,
  ImageIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  Euro,
  TrendingUpIcon,
  ArchiveIcon,
  AlertTriangleIcon,
  SearchIcon,
  FilterIcon,
  XIcon,
  StoreIcon,
  EyeIcon,
  MailIcon,
  PhoneIcon,
  HashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  DownloadIcon,
  TruckIcon,
} from "lucide-react";
import MainLayout from "@/app/components/layout/MainLayout";
import { useAuth } from "@/app/context/authContext";
import Swal from "sweetalert2";
import Image from "next/image";
import Link from "next/link";

// Enhanced Loading Skeleton with animation
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-[280px]" />
              <Skeleton className="h-4 w-[200px]" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// Enhanced Stats Card Component
const StatsCard = ({ title, count, status, icon: Icon, isActive, onClick, gradient, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 ${
        isActive
          ? `border-transparent bg-gradient-to-br ${gradient} text-white shadow-xl`
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
      }`}
    >
      {/* Decorative elements */}
      {isActive && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
        </>
      )}

      <div className="relative flex items-center justify-between">
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? "text-white/80" : "text-slate-500"}`}>
            {title}
          </p>
          <p className={`text-3xl font-extrabold mt-2 ${isActive ? "text-white" : "text-slate-900"}`}>
            {count}
          </p>
        </div>
        <div className={`p-3.5 rounded-2xl ${isActive ? "bg-white/20 backdrop-blur-sm" : "bg-slate-100"}`}>
          <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-slate-600"}`} />
        </div>
      </div>

      {/* Progress indicator */}
      <div className={`mt-4 h-1 rounded-full ${isActive ? "bg-white/30" : "bg-slate-200"}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isActive ? "100%" : "60%" }}
          transition={{ delay: delay + 0.3, duration: 0.8 }}
          className={`h-full rounded-full ${isActive ? "bg-white" : "bg-slate-400"}`}
        />
      </div>
    </motion.div>
  );
};

// Return Item Card Component
const ReturnItemCard = ({
  returnItem,
  index,
  isExpanded,
  isAdmin,
  isSeller,
  updating,
  onToggleExpand,
  onOpenDetail,
  onOpenUpdate,
  onDelete,
  getStatusConfig,
}) => {
  const config = getStatusConfig(returnItem?.return_status);
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 200 }}
      layout
      className={`group rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        isExpanded
          ? `${config.border} shadow-xl ring-4 ring-offset-2 ${config.border.replace("border", "ring")}/30`
          : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
      }`}
    >
      {/* Main Row */}
      <div className={`p-5 transition-colors duration-300 ${isExpanded ? config.bg : "bg-white group-hover:bg-slate-50/50"}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Product Info */}
          <div className="flex items-start gap-4 flex-1">
            {/* Product Image with overlay */}
            <div className="relative w-18 h-18 rounded-xl overflow-hidden border-2 border-slate-200 flex-shrink-0 group/image">
              <Image
                src={returnItem?.product?.thumbnails || "/placeholder.svg"}
                alt={returnItem?.product?.name || "Product"}
                fill
                className="object-cover transition-transform duration-300 group-hover/image:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity" />
              <div className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${config.dot} ring-2 ring-white`} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-bold text-slate-900 line-clamp-2 mb-1.5 leading-tight">
                {returnItem?.product?.name}
              </h3>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mb-3">
                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md">
                  <UserIcon className="w-3 h-3" />
                  {returnItem?.user?.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3 h-3" />
                  {new Date(returnItem?.createdAt).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <Euro className="w-3 h-3" />
                  {returnItem?.product?.price} × {returnItem?.quantity}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Badge */}
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${config.bg} ${config.text} ${config.border} border shadow-sm`}
                >
                  <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
                  <StatusIcon className="w-3.5 h-3.5" />
                  <span className="capitalize">{returnItem?.return_status}</span>
                </motion.span>

                {/* Order Number */}
                {returnItem?.order?.orderNumber && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    <HashIcon className="w-3 h-3" />
                    {returnItem?.order?.orderNumber}
                  </span>
                )}

                {/* Seller Info */}
                {(isAdmin || isSeller) && returnItem?.seller && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-[10px] font-semibold border border-violet-200">
                    <StoreIcon className="w-3 h-3" />
                    {returnItem?.seller?.storeName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenDetail(returnItem)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all"
              title="View Details"
            >
              <EyeIcon className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenUpdate(returnItem)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[11px] font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
              disabled={updating === returnItem._id}
            >
              {updating === returnItem._id ? (
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <TruckIcon className="w-3.5 h-3.5" />
                  Update
                </>
              )}
            </motion.button>

            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(returnItem._id)}
                className="p-2.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-all"
                title="Delete"
              >
                <XIcon className="w-4 h-4" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleExpand(returnItem._id)}
              className={`p-2.5 rounded-xl transition-all ${
                isExpanded
                  ? `${config.bg} ${config.text} shadow-sm`
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="border-t border-slate-200"
          >
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Return Details */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                  >
                    <h4 className="text-[12px] font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-red-100">
                        <PackageIcon className="w-4 h-4 text-red-600" />
                      </div>
                      Return Details
                    </h4>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">Reason:</span>
                        <span className="font-semibold text-slate-900 bg-amber-50 px-2 py-0.5 rounded">{returnItem?.reason}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-500">Quantity:</span>
                        <span className="font-bold text-slate-900">{returnItem?.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-500">Order Total:</span>
                        <span className="font-bold text-lg text-emerald-600">€{returnItem?.order?.totalAmount}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Customer Comment */}
                  {returnItem?.comment && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                    >
                      <h4 className="text-[12px] font-bold text-slate-900 mb-2">Customer Comment</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg italic">"{returnItem?.comment}"</p>
                    </motion.div>
                  )}

                  {/* Status Info Cards */}
                  {returnItem?.return_label && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200 shadow-sm"
                    >
                      <h4 className="text-[12px] font-bold text-emerald-800 mb-2 flex items-center gap-2">
                        <TruckIcon className="w-4 h-4" />
                        Return Label
                      </h4>
                      <p className="text-[12px] text-emerald-700 font-mono bg-white/50 px-3 py-2 rounded-lg">{returnItem?.return_label}</p>
                    </motion.div>
                  )}

                  {returnItem?.return_instructions && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 shadow-sm"
                    >
                      <h4 className="text-[12px] font-bold text-blue-800 mb-2">Return Instructions</h4>
                      <p className="text-[11px] text-blue-700 leading-relaxed">{returnItem?.return_instructions}</p>
                    </motion.div>
                  )}

                  {returnItem?.reject_reason && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-r from-rose-50 to-red-50 rounded-xl p-4 border border-rose-200 shadow-sm"
                    >
                      <h4 className="text-[12px] font-bold text-rose-800 mb-2 flex items-center gap-2">
                        <AlertTriangleIcon className="w-4 h-4" />
                        Rejection Reason
                      </h4>
                      <p className="text-[11px] text-rose-700 leading-relaxed">{returnItem?.reject_reason}</p>
                    </motion.div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Customer Info */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                  >
                    <h4 className="text-[12px] font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-100">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      Customer Information
                    </h4>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-slate-200 shadow-sm">
                        <AvatarImage src={returnItem?.user?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold text-lg">
                          {returnItem?.user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">{returnItem?.user?.name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                          <MailIcon className="w-3 h-3" />
                          {returnItem?.user?.email}
                        </p>
                        {returnItem?.user?.phone && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <PhoneIcon className="w-3 h-3" />
                            {returnItem?.user?.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Return Images */}
                  {returnItem?.images?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                    >
                      <h4 className="text-[12px] font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-violet-100">
                          <ImageIcon className="w-4 h-4 text-violet-600" />
                        </div>
                        Return Images ({returnItem?.images?.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {returnItem?.images?.map((image, idx) => (
                          <Link
                            key={idx}
                            href={image}
                            target="_blank"
                            className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-red-500 transition-all group/img hover:shadow-lg"
                          >
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Return image ${idx + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover/img:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                              <EyeIcon className="w-5 h-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Seller Info */}
                  {(isAdmin || isSeller) && returnItem?.seller && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200 shadow-sm"
                    >
                      <h4 className="text-[12px] font-bold text-violet-800 mb-3 flex items-center gap-2">
                        <StoreIcon className="w-4 h-4" />
                        Seller Information
                      </h4>
                      <div className="flex items-center gap-4">
                        {returnItem?.seller?.storeLogo ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-violet-200 shadow-sm">
                            <Image
                              src={returnItem?.seller?.storeLogo}
                              alt={returnItem?.seller?.storeName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-violet-200 flex items-center justify-center">
                            <StoreIcon className="w-6 h-6 text-violet-600" />
                          </div>
                        )}
                        <div>
                          <p className="text-[13px] font-bold text-violet-900">{returnItem?.seller?.storeName}</p>
                          <p className="text-[10px] text-violet-600">{returnItem?.seller?.businessEmail}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function ReturnCenter() {
  const { auth } = useAuth();
  const [returnProducts, setReturnProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalReturn, setTotalReturn] = useState(0);
  const [stats, setStats] = useState({
    "return requested": 0,
    Inprocess: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [updating, setUpdating] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Seller filter for admins
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState("all");
  const [loadingSellers, setLoadingSellers] = useState(false);

  // Role-based access
  const userRole = auth?.user?.role?.toLowerCase();
  const isSeller = userRole === "seller";
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const sellerId = auth?.user?.sellerId;

  const [updateData, setUpdateData] = useState({
    return_status: "",
    return_label: "",
    return_instructions: "",
    reject_reason: "",
  });

  const returnStatus = [
    "return requested",
    "Inprocess",
    "approved",
    "rejected",
  ];

  const statusConfig = {
    "return requested": {
      bg: "bg-gradient-to-r from-amber-50 to-orange-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: ClockIcon,
      gradient: "from-amber-500 to-orange-500",
      dot: "bg-amber-500",
    },
    Inprocess: {
      bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: RefreshCwIcon,
      gradient: "from-blue-500 to-indigo-500",
      dot: "bg-blue-500",
    },
    approved: {
      bg: "bg-gradient-to-r from-emerald-50 to-green-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircleIcon,
      gradient: "from-emerald-500 to-green-500",
      dot: "bg-emerald-500",
    },
    rejected: {
      bg: "bg-gradient-to-r from-rose-50 to-red-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: XCircleIcon,
      gradient: "from-rose-500 to-red-500",
      dot: "bg-rose-500",
    },
  };

  const getStatusConfig = useCallback((status) => {
    return statusConfig[status] || statusConfig["return requested"];
  }, []);

  // Fetch sellers for admin filter
  useEffect(() => {
    const fetchSellers = async () => {
      if (!isAdmin) return;

      setLoadingSellers(true);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/allSellers`
        );
        if (data?.sellers) {
          setSellers(data.sellers);
        }
      } catch (error) {
        console.error("Error fetching sellers:", error);
      } finally {
        setLoadingSellers(false);
      }
    };

    fetchSellers();
  }, [isAdmin]);

  // Fetch Return Products
  useEffect(() => {
    const fetchReturnHistory = async () => {
      setLoading(true);
      try {
        let url = `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/return/products?page=${page}&limit=${limit}`;

        // Add seller filter for sellers
        if (isSeller && sellerId) {
          url += `&seller=${sellerId}`;
        }

        // Add seller filter for admin when filtering by seller
        if (isAdmin && selectedSeller !== "all") {
          url += `&seller=${selectedSeller}`;
        }

        // Add status filter
        if (statusFilter !== "all") {
          url += `&status=${statusFilter}`;
        }

        const { data } = await axios.get(url);
        setReturnProducts(data.returnProducts || []);
        setTotalReturn(data.total || 0);
        setStats(data.stats || {
          "return requested": 0,
          Inprocess: 0,
          approved: 0,
          rejected: 0,
          total: 0,
        });
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch return products"
        );
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReturnHistory();
  }, [page, limit, isSeller, sellerId, statusFilter, isAdmin, selectedSeller]);

  // Filtered products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return returnProducts;

    const query = searchQuery.toLowerCase();
    return returnProducts.filter((item) => {
      return (
        item?.product?.name?.toLowerCase().includes(query) ||
        item?.user?.name?.toLowerCase().includes(query) ||
        item?.user?.email?.toLowerCase().includes(query) ||
        item?.order?.orderNumber?.toLowerCase().includes(query) ||
        item?.reason?.toLowerCase().includes(query) ||
        item?.seller?.storeName?.toLowerCase().includes(query)
      );
    });
  }, [returnProducts, searchQuery]);

  // Update Return Product
  const updateReturn = async (orderId) => {
    if (!updateData.return_status) {
      toast.error("Please select a status");
      return;
    }

    if (
      updateData.return_status === "approved" &&
      (!updateData.return_label || !updateData.return_instructions)
    ) {
      toast.error("Return label and instructions are required for approval");
      return;
    }

    if (updateData.return_status === "rejected" && !updateData.reject_reason) {
      toast.error("Reject reason is required for rejection");
      return;
    }

    setUpdating(orderId);
    try {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/return/update/${orderId}`,
        updateData,
        { headers: { Authorization: auth?.token } }
      );

      if (data.success) {
        toast.success("Return status updated successfully");
        const updatedProducts = returnProducts.map((product) =>
          product._id === orderId ? { ...product, ...updateData } : product
        );
        setReturnProducts(updatedProducts);
        setIsUpdateDialogOpen(false);
        setUpdateData({
          return_status: "",
          return_label: "",
          return_instructions: "",
          reject_reason: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Internal server error");
    } finally {
      setUpdating(null);
    }
  };

  // Handle Delete
  const handleDeleteConfirmation = (returnItemId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#c6080a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      background: "#fff",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "rounded-xl",
        cancelButton: "rounded-xl",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(returnItemId);
      }
    });
  };

  const handleDelete = async (returnItemId) => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/return/delete/${returnItemId}`,
        { headers: { Authorization: auth?.token } }
      );
      if (data) {
        setReturnProducts((prev) =>
          prev.filter((returnItem) => returnItem._id !== returnItemId)
        );
        toast.success("Return request deleted successfully!");
      }
    } catch (error) {
      console.log("Error deleting return request:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    }
  };

  const toggleExpanded = useCallback((id) => {
    setExpandedItems((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const openUpdateDialog = useCallback((returnItem) => {
    setSelectedReturn(returnItem);
    setUpdateData({
      return_status: returnItem.return_status || "return requested",
      return_label: returnItem.return_label || "",
      return_instructions: returnItem.return_instructions || "",
      reject_reason: returnItem.reject_reason || "",
    });
    setIsUpdateDialogOpen(true);
  }, []);

  const openDetailDialog = useCallback((returnItem) => {
    setSelectedReturn(returnItem);
    setIsDetailDialogOpen(true);
  }, []);

  const clearAllFilters = useCallback(() => {
    setStatusFilter("all");
    setSearchQuery("");
    setSelectedSeller("all");
    setPage(1);
  }, []);

  const hasActiveFilters = statusFilter !== "all" || searchQuery || selectedSeller !== "all";
  const totalPages = Math.ceil(totalReturn / limit);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="p-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-xl shadow-red-500/30"
              >
                <PackageIcon className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                  {isSeller ? "My Return Center" : "Return Center"}
                  <SparklesIcon className="w-6 h-6 text-amber-500" />
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {isSeller
                    ? "Manage return requests for your products"
                    : "Manage all product returns and refund requests"}
                </p>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search returns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-3 rounded-xl border-2 border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none text-sm w-full sm:w-72 bg-white transition-all"
                />
                {searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  >
                    <XIcon className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </motion.button>
                )}
              </div>

              {/* Seller Filter for Admins */}
              {isAdmin && (
                <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                  <SelectTrigger className="w-full sm:w-52 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 bg-white h-12">
                    <div className="flex items-center gap-2">
                      <StoreIcon className="w-4 h-4 text-violet-600" />
                      <SelectValue placeholder="All Sellers" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        All Sellers
                      </span>
                    </SelectItem>
                    {sellers.map((seller) => (
                      <SelectItem key={seller._id} value={seller._id}>
                        <span className="flex items-center gap-2">
                          {seller.storeLogo ? (
                            <Image
                              src={seller.storeLogo}
                              alt={seller.storeName}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600">
                              {seller.storeName?.charAt(0)}
                            </span>
                          )}
                          {seller.storeName}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllFilters}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-100 to-rose-100 text-red-700 text-sm font-bold hover:from-red-200 hover:to-rose-200 transition-all border border-red-200"
                >
                  <FilterIcon className="w-4 h-4" />
                  Clear All
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Requested"
              count={stats["return requested"] || 0}
              status="return requested"
              icon={ClockIcon}
              isActive={statusFilter === "return requested"}
              onClick={() => setStatusFilter(statusFilter === "return requested" ? "all" : "return requested")}
              gradient="from-amber-500 to-orange-500"
              delay={0}
            />
            <StatsCard
              title="In Process"
              count={stats["Inprocess"] || 0}
              status="Inprocess"
              icon={RefreshCwIcon}
              isActive={statusFilter === "Inprocess"}
              onClick={() => setStatusFilter(statusFilter === "Inprocess" ? "all" : "Inprocess")}
              gradient="from-blue-500 to-indigo-500"
              delay={0.1}
            />
            <StatsCard
              title="Approved"
              count={stats["approved"] || 0}
              status="approved"
              icon={CheckCircleIcon}
              isActive={statusFilter === "approved"}
              onClick={() => setStatusFilter(statusFilter === "approved" ? "all" : "approved")}
              gradient="from-emerald-500 to-green-500"
              delay={0.2}
            />
            <StatsCard
              title="Rejected"
              count={stats["rejected"] || 0}
              status="rejected"
              icon={XCircleIcon}
              isActive={statusFilter === "rejected"}
              onClick={() => setStatusFilter(statusFilter === "rejected" ? "all" : "rejected")}
              gradient="from-rose-500 to-red-500"
              delay={0.3}
            />
          </div>

          {/* Return Products List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
          >
            {/* List Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                    <ArchiveIcon className="w-5 h-5" />
                  </div>
                  Return Requests
                  {(statusFilter !== "all" || selectedSeller !== "all") && (
                    <div className="flex items-center gap-2">
                      {statusFilter !== "all" && (
                        <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] capitalize font-semibold">
                          {statusFilter}
                        </span>
                      )}
                      {selectedSeller !== "all" && (
                        <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-semibold flex items-center gap-1">
                          <StoreIcon className="w-3 h-3" />
                          {sellers.find(s => s._id === selectedSeller)?.storeName || "Seller"}
                        </span>
                      )}
                    </div>
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "request" : "requests"}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {loading ? (
                <LoadingSkeleton />
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner"
                  >
                    <PackageIcon className="w-12 h-12 text-slate-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {searchQuery || hasActiveFilters ? "No matching returns" : "No return requests"}
                  </h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    {searchQuery || hasActiveFilters
                      ? "Try adjusting your search or filters to find what you're looking for."
                      : "There are no return requests to display at the moment."}
                  </p>
                  {hasActiveFilters && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearAllFilters}
                      className="mt-4 px-6 py-2.5 rounded-xl bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-colors"
                    >
                      Clear All Filters
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((returnItem, index) => (
                      <ReturnItemCard
                        key={returnItem._id}
                        returnItem={returnItem}
                        index={index}
                        isExpanded={expandedItems.has(returnItem._id)}
                        isAdmin={isAdmin}
                        isSeller={isSeller}
                        updating={updating}
                        onToggleExpand={toggleExpanded}
                        onOpenDetail={openDetailDialog}
                        onOpenUpdate={openUpdateDialog}
                        onDelete={handleDeleteConfirmation}
                        getStatusConfig={getStatusConfig}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"
            >
              <p className="text-[13px] text-slate-500">
                Showing <span className="font-bold text-slate-900">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-bold text-slate-900">{Math.min(page * limit, totalReturn)}</span> of{" "}
                <span className="font-bold text-slate-900">{totalReturn}</span> results
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-[12px] font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Previous
                </motion.button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(pageNum)}
                        disabled={loading}
                        className={`w-10 h-10 rounded-xl text-[12px] font-bold transition-all ${
                          page === pageNum
                            ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30"
                            : "border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-[12px] font-semibold hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Update Status Dialog */}
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
              <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 p-5">
                <DialogTitle className="text-white font-bold text-lg flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                    <TruckIcon className="w-5 h-5" />
                  </div>
                  Update Return Status
                </DialogTitle>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <Label className="text-[12px] font-bold text-slate-700 mb-2.5 block">Return Status *</Label>
                  <Select
                    value={updateData.return_status}
                    onValueChange={(value) =>
                      setUpdateData({ ...updateData, return_status: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl border-2 border-slate-200 h-12 focus:border-red-500 focus:ring-4 focus:ring-red-500/20">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {returnStatus.map((status) => {
                        const config = getStatusConfig(status);
                        const StatusIcon = config.icon;
                        return (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg ${config.bg}`}>
                                <StatusIcon className={`w-4 h-4 ${config.text}`} />
                              </div>
                              <span className="capitalize font-medium">{status}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {updateData.return_status === "approved" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label className="text-[12px] font-bold text-slate-700 mb-2.5 block">Return Label *</Label>
                      <Input
                        value={updateData.return_label}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, return_label: e.target.value })
                        }
                        placeholder="Enter return label/tracking number"
                        className="rounded-xl border-2 border-slate-200 h-12 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div>
                      <Label className="text-[12px] font-bold text-slate-700 mb-2.5 block">Return Instructions *</Label>
                      <Textarea
                        value={updateData.return_instructions}
                        onChange={(e) =>
                          setUpdateData({ ...updateData, return_instructions: e.target.value })
                        }
                        placeholder="Enter detailed return instructions for the customer..."
                        rows={4}
                        className="rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {updateData.return_status === "rejected" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Label className="text-[12px] font-bold text-slate-700 mb-2.5 block">Rejection Reason *</Label>
                    <Textarea
                      value={updateData.reject_reason}
                      onChange={(e) =>
                        setUpdateData({ ...updateData, reject_reason: e.target.value })
                      }
                      placeholder="Enter the reason for rejecting this return request..."
                      rows={4}
                      className="rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 resize-none"
                    />
                  </motion.div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => setIsUpdateDialogOpen(false)}
                    disabled={updating !== null}
                    className="rounded-xl border-2 h-11 px-6 font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => selectedReturn && updateReturn(selectedReturn._id)}
                    disabled={updating !== null}
                    className="rounded-xl h-11 px-6 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/30 font-bold"
                  >
                    {updating ? (
                      <RefreshCwIcon className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                    )}
                    Update Status
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Detail View Dialog */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-0 shadow-2xl">
              {selectedReturn && (
                <>
                  <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 p-5 sticky top-0 z-10">
                    <DialogTitle className="text-white font-bold text-lg flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                        <PackageIcon className="w-5 h-5" />
                      </div>
                      Return Request Details
                    </DialogTitle>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Product Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-5 p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200"
                    >
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-slate-200 flex-shrink-0 shadow-lg">
                        <Image
                          src={selectedReturn?.product?.thumbnails || "/placeholder.svg"}
                          alt={selectedReturn?.product?.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[15px] font-bold text-slate-900 mb-2 leading-tight">
                          {selectedReturn?.product?.name}
                        </h3>
                        <div className="space-y-1.5 text-[11px]">
                          <p className="text-slate-500">
                            <span className="font-semibold text-slate-700">SKU:</span> {selectedReturn?.product?.sku || "N/A"}
                          </p>
                          <p className="text-emerald-600 font-bold text-lg">
                            €{selectedReturn?.product?.price} × {selectedReturn?.quantity}
                          </p>
                        </div>
                        <div className="mt-3">
                          {(() => {
                            const config = getStatusConfig(selectedReturn?.return_status);
                            const StatusIcon = config.icon;
                            return (
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold ${config.bg} ${config.text} ${config.border} border shadow-sm`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                <span className="capitalize">{selectedReturn?.return_status}</span>
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>

                    {/* Customer & Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200"
                      >
                        <h4 className="text-[12px] font-bold text-blue-800 mb-4 flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          Customer
                        </h4>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-blue-200 shadow-sm">
                            <AvatarImage src={selectedReturn?.user?.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                              {selectedReturn?.user?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-[12px]">
                            <p className="font-bold text-slate-900">{selectedReturn?.user?.name}</p>
                            <p className="text-slate-500">{selectedReturn?.user?.email}</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-200"
                      >
                        <h4 className="text-[12px] font-bold text-violet-800 mb-4 flex items-center gap-2">
                          <HashIcon className="w-4 h-4" />
                          Order Info
                        </h4>
                        <div className="text-[12px] space-y-2">
                          <p>
                            <span className="text-slate-500">Order #:</span>{" "}
                            <span className="font-bold">{selectedReturn?.order?.orderNumber || selectedReturn?.order?.uid}</span>
                          </p>
                          <p>
                            <span className="text-slate-500">Total:</span>{" "}
                            <span className="font-bold text-lg text-emerald-600">€{selectedReturn?.order?.totalAmount}</span>
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Return Reason & Comment */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200"
                    >
                      <h4 className="text-[12px] font-bold text-amber-800 mb-3">Return Reason</h4>
                      <p className="text-[13px] text-amber-900 font-semibold bg-white/50 px-3 py-2 rounded-lg">{selectedReturn?.reason}</p>
                      {selectedReturn?.comment && (
                        <div className="mt-4 pt-4 border-t border-amber-200">
                          <h4 className="text-[11px] font-bold text-amber-800 mb-2">Additional Comment</h4>
                          <p className="text-[12px] text-amber-700 italic">"{selectedReturn?.comment}"</p>
                        </div>
                      )}
                    </motion.div>

                    {/* Images */}
                    {selectedReturn?.images?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h4 className="text-[12px] font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-violet-600" />
                          Return Images
                        </h4>
                        <div className="grid grid-cols-4 gap-3">
                          {selectedReturn?.images?.map((img, idx) => (
                            <Link
                              key={idx}
                              href={img}
                              target="_blank"
                              className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-red-500 transition-all group shadow-sm hover:shadow-lg"
                            >
                              <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Seller Info */}
                    {(isAdmin || isSeller) && selectedReturn?.seller && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-200"
                      >
                        <h4 className="text-[12px] font-bold text-violet-800 mb-4 flex items-center gap-2">
                          <StoreIcon className="w-4 h-4" />
                          Seller Information
                        </h4>
                        <div className="flex items-center gap-4">
                          {selectedReturn?.seller?.storeLogo ? (
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-violet-200 shadow-sm">
                              <Image
                                src={selectedReturn?.seller?.storeLogo}
                                alt={selectedReturn?.seller?.storeName}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-violet-200 flex items-center justify-center">
                              <StoreIcon className="w-7 h-7 text-violet-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-[14px] font-bold text-violet-900">{selectedReturn?.seller?.storeName}</p>
                            <p className="text-[11px] text-violet-600">{selectedReturn?.seller?.businessEmail}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Status Details */}
                    {(selectedReturn?.return_label || selectedReturn?.return_instructions || selectedReturn?.reject_reason) && (
                      <div className="space-y-4">
                        {selectedReturn?.return_label && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-200"
                          >
                            <h4 className="text-[12px] font-bold text-emerald-800 mb-2 flex items-center gap-2">
                              <TruckIcon className="w-4 h-4" />
                              Return Label
                            </h4>
                            <p className="text-[13px] text-emerald-900 font-mono bg-white/50 px-3 py-2 rounded-lg">{selectedReturn?.return_label}</p>
                          </motion.div>
                        )}
                        {selectedReturn?.return_instructions && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200"
                          >
                            <h4 className="text-[12px] font-bold text-blue-800 mb-2">Return Instructions</h4>
                            <p className="text-[12px] text-blue-700 leading-relaxed">{selectedReturn?.return_instructions}</p>
                          </motion.div>
                        )}
                        {selectedReturn?.reject_reason && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl p-5 border border-rose-200"
                          >
                            <h4 className="text-[12px] font-bold text-rose-800 mb-2 flex items-center gap-2">
                              <AlertTriangleIcon className="w-4 h-4" />
                              Rejection Reason
                            </h4>
                            <p className="text-[12px] text-rose-700 leading-relaxed">{selectedReturn?.reject_reason}</p>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MainLayout>
  );
}
