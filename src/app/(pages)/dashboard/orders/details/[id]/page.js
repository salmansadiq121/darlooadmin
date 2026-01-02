"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { TbShoppingCartCopy } from "react-icons/tb";
import { AiOutlineSync, AiTwotoneDelete } from "react-icons/ai";
import { BiPackage } from "react-icons/bi";
import { FaSpinner, FaTruck } from "react-icons/fa";
import { MdOutlineDoneAll, MdStorefront, MdArrowBack } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { FaUndo } from "react-icons/fa";
import axios from "axios";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { redirect, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import OrderDetailLoader from "@/app/components/Loaders/OrderDetailLoader";
import OrderSlip from "@/app/components/Loaders/OrderSlip";
import { CgClose } from "react-icons/cg";
import { HiDownload, HiOutlineShoppingBag } from "react-icons/hi";
import { ImSpinner9 } from "react-icons/im";
import { uploadImage } from "@/app/utils/CommonFunction";
import OrderTimeline from "@/app/components/order/Timeline";
import { IoIosAdd } from "react-icons/io";
import { LuDelete } from "react-icons/lu";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiMessageCircle,
  FiEdit3,
  FiChevronDown,
  FiChevronUp,
  FiShoppingBag,
  FiDollarSign,
  FiPercent,
  FiLayers,
} from "react-icons/fi";
import { useAuth } from "@/app/context/authContext";

const MainLayout = dynamic(
  () => import("./../../../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("./../../../../../utils/Breadcrumb"), {
  ssr: false,
});

const statusMapping = [
  {
    status: "Pending",
    icon: TbShoppingCartCopy,
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  {
    status: "Processing",
    icon: AiOutlineSync,
    gradient: "from-blue-400 to-indigo-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  {
    status: "Packing",
    icon: BiPackage,
    gradient: "from-violet-400 to-purple-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  {
    status: "Shipped",
    icon: FaTruck,
    gradient: "from-cyan-400 to-teal-500",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
  },
  {
    status: "Delivered",
    icon: MdOutlineDoneAll,
    gradient: "from-emerald-400 to-green-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  {
    status: "Cancelled",
    icon: MdCancel,
    gradient: "from-rose-400 to-red-500",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  {
    status: "Returned",
    icon: FaUndo,
    gradient: "from-orange-400 to-amber-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
];

const orderStatuses = [
  "Pending",
  "Processing",
  "Packing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrderDetail({ params }) {
  const { auth } = useAuth();
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState("");
  const [orderDetail, setOrderDetail] = useState(null);
  const isOrderDetailLoad = useRef(true);
  const [isLoading, setIsloading] = useState(false);
  const slipRef = useRef();
  const [showSlipDetail, setShowSlipDetail] = useState(false);
  const [loadDownload, setLoadDownload] = useState(false);
  const [tracking, setTracking] = useState([
    { trackingId: "", shippingCarrier: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [delivery, setDelivery] = useState({
    prepare: "3-5 Days",
    deliver: "4-7 Days",
  });
  const [isDelivery, setIsDelivery] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [expandedSellerOrders, setExpandedSellerOrders] = useState({});
  const [sellerStatusUpdating, setSellerStatusUpdating] = useState({});

  const isSellerOrder = orderDetail?.isSellerOrder || false;
  const isAdmin =
    auth?.user?.role === "admin" || auth?.user?.role === "superadmin";
  const hasSellerOrders =
    !isSellerOrder && orderDetail?.sellerOrders?.length > 0;

  // Toggle expanded seller order
  const toggleSellerOrder = (orderId) => {
    setExpandedSellerOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Expand all seller orders
  const expandAllSellerOrders = () => {
    const allExpanded = {};
    orderDetail?.sellerOrders?.forEach((so) => {
      allExpanded[so._id] = true;
    });
    setExpandedSellerOrders(allExpanded);
  };

  // Collapse all seller orders
  const collapseAllSellerOrders = () => {
    setExpandedSellerOrders({});
  };

  // Update seller order status
  const handleUpdateSellerOrderStatus = async (sellerOrderId, newStatus) => {
    if (!newStatus) return;
    setSellerStatusUpdating((prev) => ({ ...prev, [sellerOrderId]: true }));
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/seller-order/status/${sellerOrderId}`,
        { orderStatus: newStatus },
        { headers: { Authorization: auth?.token } }
      );
      if (data?.success) {
        toast.success(`Seller order status updated to ${newStatus}!`);
        fetchOrderDetail();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update seller order status"
      );
    } finally {
      setSellerStatusUpdating((prev) => ({ ...prev, [sellerOrderId]: false }));
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.pathname);
    }
  }, []);

  const fetchOrderDetail = async () => {
    if (isOrderDetailLoad.current) setIsloading(true);
    const { id } = await params;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/detail/${id}`,
        { headers: { Authorization: auth?.token } }
      );
      if (data) {
        setOrderDetail(data.order);
        setSelectedStatus(data.order.orderStatus);
        setTracking(
          data.order.tracking?.length > 0
            ? data.order.tracking
            : [{ trackingId: "", shippingCarrier: "" }]
        );
        setDelivery(
          data.order.delivery || { prepare: "3-5 Days", deliver: "4-7 Days" }
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch order details"
      );
    } finally {
      if (isOrderDetailLoad.current) {
        setIsloading(false);
        isOrderDetailLoad.current = false;
      }
    }
  };

  useEffect(() => {
    if (auth?.token) fetchOrderDetail();
  }, [auth?.token]);

  const copyToClipboard = async (text) => {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.cssText = "position:fixed;left:-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    }
  };

  const generatePDF = () => {
    setLoadDownload(true);
    if (slipRef.current) {
      html2canvas(slipRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })
        .then((canvas) => {
          const pdf = new jsPDF("p", "mm", "a4");
          const pageWidth = pdf.internal.pageSize.getWidth();
          const imgHeight = (canvas.height * pageWidth) / canvas.width;
          pdf.addImage(
            canvas.toDataURL("image/png"),
            "PNG",
            0,
            0,
            pageWidth,
            Math.min(imgHeight, 297)
          );
          pdf.save(
            `Order_Slip_${
              orderDetail?.user?.name || orderDetail?.customerName || "Customer"
            }.pdf`
          );
          setLoadDownload(false);
        })
        .catch(() => setLoadDownload(false));
    } else setLoadDownload(false);
  };

  const handleDeleteConfirmation = (orderId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(orderId);
      }
    });
  };

  const handleDelete = async (orderId) => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/delete/order/${orderId}`,
        { headers: { Authorization: auth?.token } }
      );
      if (data) {
        toast.success("Order deleted!");
        redirect("/dashboard/orders");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred.");
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!newStatus || newStatus === orderDetail?.orderStatus) return;
    setStatusUpdating(true);
    try {
      const endpoint = isSellerOrder
        ? `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/seller-order/status/${orderDetail._id}`
        : `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/update/status/${orderDetail._id}`;
      const { data } = await axios.put(
        endpoint,
        { orderStatus: newStatus },
        { headers: { Authorization: auth?.token } }
      );
      if (data?.success) {
        toast.success("Status updated!");
        setSelectedStatus(newStatus);
        setShowStatusModal(false);
        fetchOrderDetail();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSellerOrder
        ? `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/seller-order/tracking/${orderDetail._id}`
        : `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/update/status/${orderDetail._id}`;
      const payload = isSellerOrder
        ? {
            trackingId: tracking[0]?.trackingId,
            shippingCarrier: tracking[0]?.shippingCarrier,
          }
        : { tracking };
      const { data } = await axios.put(endpoint, payload, {
        headers: { Authorization: auth?.token },
      });
      if (data) {
        toast.success("Tracking updated!");
        fetchOrderDetail();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = await uploadImage(file, setImage, setUploading);
      setImage(imageURL);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/comment/${orderDetail._id}`,
        { comment, image },
        { headers: { Authorization: auth?.token } }
      );
      if (data) {
        toast.success("Comment Added");
        setComment("");
        setImage("");
        fetchOrderDetail();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/comment/${orderDetail._id}?commentId=${commentId}`,
        { headers: { Authorization: auth?.token } }
      );
      if (data) {
        setOrderDetail((prev) => ({
          ...prev,
          comments: prev.comments.filter((c) => c._id !== commentId),
        }));
        toast.success("Comment Deleted");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred.");
    }
  };

  const addTracking = () =>
    setTracking([...tracking, { trackingId: "", shippingCarrier: "" }]);
  const handleTrackingChange = (index, field, value) => {
    const newTracking = [...tracking];
    newTracking[index][field] = value;
    setTracking(newTracking);
  };
  const removeTracking = (index) => {
    const newTracking = [...tracking];
    newTracking.splice(index, 1);
    setTracking(newTracking);
  };

  const currentStatusInfo =
    statusMapping.find((s) => s.status === orderDetail?.orderStatus) ||
    statusMapping[0];

  const customerInfo = {
    name:
      orderDetail?.parentOrder?.user?.name ||
      orderDetail?.user?.name ||
      orderDetail?.customerName ||
      orderDetail?.shippingAddress?.firstName ||
      "N/A",
    lastName:
      orderDetail?.parentOrder?.user?.lastName ||
      orderDetail?.user?.lastName ||
      orderDetail?.shippingAddress?.lastName ||
      "",
    email:
      orderDetail?.parentOrder?.user?.email ||
      orderDetail?.user?.email ||
      orderDetail?.customerEmail ||
      orderDetail?.shippingAddress?.email ||
      "N/A",
    phone:
      orderDetail?.parentOrder?.user?.number ||
      orderDetail?.user?.number ||
      orderDetail?.shippingAddress?.phone ||
      "N/A",
  };

  const shippingInfo =
    orderDetail?.shippingAddress ||
    orderDetail?.parentOrder?.shippingAddress ||
    orderDetail?.user?.addressDetails ||
    {};

  return (
    <MainLayout title="Order Detail">
      <div className="min-h-screen bg-slate-50/50 p-2 sm:p-3">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-2 max-w-[1920px] mx-auto"
        >
          <Breadcrumb path={currentUrl} />

          {/* Compact Header */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-2.5 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.back()}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 transition-colors"
                >
                  <MdArrowBack className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
                  <HiOutlineShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-[13px] font-bold text-slate-900">
                      #
                      {orderDetail?.orderNumber ||
                        orderDetail?.uid ||
                        orderDetail?.parentOrder?.orderNumber ||
                        "—"}
                    </h1>
                    {isSellerOrder && (
                      <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 text-[9px] font-semibold">
                        Seller Order
                      </span>
                    )}
                    {isAdmin && hasSellerOrders && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[9px] font-semibold shadow-sm">
                        {orderDetail?.sellerOrders?.length} Seller
                        {orderDetail?.sellerOrders?.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                    {orderDetail?.createdAt && (
                      <span className="flex items-center gap-0.5">
                        <FiClock className="w-2.5 h-2.5" />
                        {format(
                          new Date(orderDetail.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </span>
                    )}
                    {orderDetail?.sellerName && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-0.5 text-indigo-600">
                          <MdStorefront className="w-2.5 h-2.5" />
                          {orderDetail.sellerName}
                        </span>
                      </>
                    )}
                    {isAdmin && hasSellerOrders && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-indigo-600 font-medium">
                          Multi-Vendor Order
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${currentStatusInfo.gradient} text-white font-medium text-[10px] shadow-sm`}
                >
                  {currentStatusInfo.icon && (
                    <currentStatusInfo.icon className="w-3 h-3" />
                  )}
                  {orderDetail?.orderStatus || "Pending"}
                  <FiEdit3 className="w-2.5 h-2.5 opacity-70" />
                </button>
                {/* Cancel Reason Display */}
                {(orderDetail?.orderStatus === "Cancelled" ||
                  orderDetail?.cancelReason) &&
                  orderDetail?.cancelReason && (
                    <div className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200">
                      <p className="text-[9px] font-semibold text-rose-900 mb-0.5">
                        Cancel Reason:
                      </p>
                      <p className="text-[9px] text-rose-700">
                        {orderDetail.cancelReason}
                      </p>
                    </div>
                  )}
                <button
                  onClick={() => setShowSlipDetail(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 text-white font-medium text-[10px]"
                >
                  <HiDownload className="w-3 h-3" />
                  Slip
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteConfirmation(orderDetail?._id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium text-[10px] hover:bg-red-50 hover:text-red-600"
                  >
                    <AiTwotoneDelete className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {!isLoading && orderDetail ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-2"
              >
                {/* Left Column */}
                <div className="lg:col-span-7 flex flex-col gap-2">
                  {/* Products */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white">
                          <FiPackage className="w-3 h-3" />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-bold text-slate-900">
                            Order Items
                          </h3>
                          <p className="text-[9px] text-slate-500">
                            {orderDetail?.products?.length || 0} items
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold border border-red-100">
                        €
                        {parseFloat(
                          orderDetail?.totalAmount ||
                            orderDetail?.sellerSubtotal ||
                            0
                        ).toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2 space-y-1.5 max-h-[280px] overflow-y-auto">
                      {orderDetail?.products?.map((product, index) => (
                        <div
                          key={product._id || index}
                          className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-red-200 transition-all"
                        >
                          <Link
                            href={
                              product?.image ||
                              product?.product?.thumbnails ||
                              "#"
                            }
                            target="_blank"
                            className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200"
                          >
                            <Image
                              src={
                                product?.image ||
                                product?.product?.thumbnails ||
                                "/placeholder.svg"
                              }
                              layout="fill"
                              alt="Product"
                              className="object-cover"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[10px] font-semibold text-slate-800 line-clamp-1 cursor-pointer hover:text-red-600"
                              onClick={async () => {
                                const success = await copyToClipboard(
                                  product?.product?.name || ""
                                );
                                if (success) toast.success("Copied!");
                              }}
                            >
                              {product?.product?.name || "Unnamed"}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[8px] font-medium">
                                x{product?.quantity || 1}
                              </span>
                              {product?.sizes?.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 text-[8px]">
                                  {product.sizes.join(", ")}
                                </span>
                              )}
                              {product?.colors?.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 text-[8px]">
                                  {product.colors.join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-bold text-emerald-600">
                              €
                              {parseFloat(
                                product?.price || product?.product?.price || 0
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="p-2.5 bg-slate-50 border-t border-slate-100">
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Subtotal</span>
                          <span className="text-slate-700">
                            €
                            {parseFloat(
                              isSellerOrder
                                ? orderDetail?.sellerSubtotal
                                : parseFloat(orderDetail?.totalAmount || 0) -
                                    parseFloat(orderDetail?.shippingFee || 0) +
                                    parseFloat(orderDetail?.discount || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                        {(orderDetail?.discount > 0 ||
                          orderDetail?.couponDiscount > 0) && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 flex items-center gap-1">
                              Discount
                              {orderDetail?.couponCode && (
                                <span className="text-[7px] bg-green-100 text-green-700 px-1 rounded">
                                  {orderDetail.couponCode}
                                </span>
                              )}
                            </span>
                            <span className="text-green-600">
                              -€
                              {parseFloat(
                                orderDetail?.discount ||
                                  orderDetail?.couponDiscount ||
                                  0
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Shipping</span>
                          <span className="text-slate-700">
                            €
                            {parseFloat(orderDetail?.shippingFee || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                        {isSellerOrder && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">
                              Commission ({orderDetail?.commission || 5}%)
                            </span>
                            <span className="text-orange-500">
                              -€
                              {parseFloat(
                                orderDetail?.commissionAmount || 0
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="pt-1.5 border-t border-slate-200 flex justify-between text-[11px] font-bold">
                          <span className="text-slate-900">
                            {isSellerOrder ? "Your Earnings" : "Total"}
                          </span>
                          <span className="text-emerald-600">
                            €
                            {parseFloat(
                              isSellerOrder
                                ? orderDetail?.sellerEarning
                                : orderDetail?.totalAmount || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer & Tracking */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <FiUser className="w-3 h-3" />
                      </div>
                      <h3 className="text-[11px] font-bold text-slate-900">
                        Customer & Shipping
                      </h3>
                    </div>

                    <div className="p-2.5 space-y-2.5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-[8px] text-slate-500 uppercase mb-0.5">
                            Name
                          </p>
                          <p className="text-[10px] font-semibold text-slate-900 truncate">
                            {customerInfo.name} {customerInfo.lastName}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-[8px] text-slate-500 uppercase mb-0.5">
                            Email
                          </p>
                          <p className="text-[10px] font-semibold text-slate-900 truncate">
                            {customerInfo.email}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-[8px] text-slate-500 uppercase mb-0.5">
                            Phone
                          </p>
                          <p className="text-[10px] font-semibold text-slate-900">
                            {customerInfo.phone}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <p className="text-[8px] text-slate-500 uppercase mb-0.5">
                            Payment
                          </p>
                          <p className="text-[10px] font-semibold text-slate-900">
                            {orderDetail?.paymentMethod ||
                              orderDetail?.parentOrder?.paymentMethod ||
                              "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                        <div className="flex items-center gap-1 mb-1">
                          <FiMapPin className="w-2.5 h-2.5 text-blue-600" />
                          <p className="text-[9px] font-bold text-blue-900">
                            Shipping Address
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-800">
                          {shippingInfo?.address || "N/A"}
                        </p>
                        <p className="text-[9px] text-slate-600">
                          {[
                            shippingInfo?.city,
                            shippingInfo?.state,
                            shippingInfo?.postalCode || shippingInfo?.pincode,
                            shippingInfo?.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "N/A"}
                        </p>
                      </div>

                      {/* Tracking */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1 mb-2">
                          <FiTruck className="w-3 h-3 text-cyan-600" />
                          <h4 className="text-[10px] font-semibold text-slate-900">
                            Tracking
                          </h4>
                        </div>
                        <form onSubmit={handleOrder} className="space-y-2">
                          {tracking.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1.5"
                            >
                              <input
                                type="text"
                                value={item.trackingId}
                                onChange={(e) =>
                                  handleTrackingChange(
                                    index,
                                    "trackingId",
                                    e.target.value
                                  )
                                }
                                placeholder="Tracking ID"
                                className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 focus:border-red-400 outline-none text-[10px]"
                              />
                              <input
                                type="text"
                                value={item.shippingCarrier}
                                onChange={(e) =>
                                  handleTrackingChange(
                                    index,
                                    "shippingCarrier",
                                    e.target.value
                                  )
                                }
                                placeholder="Carrier"
                                className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 focus:border-red-400 outline-none text-[10px]"
                              />
                              {tracking.length > 1 && !isSellerOrder && (
                                <button
                                  type="button"
                                  onClick={() => removeTracking(index)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-500"
                                >
                                  <LuDelete className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                          <div className="flex items-center justify-between">
                            {!isSellerOrder && (
                              <button
                                type="button"
                                onClick={addTracking}
                                className="flex items-center gap-0.5 text-[9px] text-slate-600 hover:text-red-600"
                              >
                                <IoIosAdd className="w-3 h-3" />
                                Add
                              </button>
                            )}
                            <button
                              type="submit"
                              disabled={loading}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium text-[10px] disabled:opacity-50"
                            >
                              {loading ? (
                                <FaSpinner className="w-3 h-3 animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Seller Sub-Orders Section - Admin Only */}
                  {isAdmin && hasSellerOrders && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                      {/* Header */}
                      <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                              <FiLayers className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-[13px] font-bold text-slate-900">
                                Seller Sub-Orders
                              </h3>
                              <p className="text-[10px] text-slate-500">
                                {orderDetail?.sellerOrders?.length || 0} sellers
                                • Manage each seller's fulfillment
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={expandAllSellerOrders}
                              className="px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-[9px] font-medium hover:bg-indigo-200 transition-colors"
                            >
                              Expand All
                            </button>
                            <button
                              onClick={collapseAllSellerOrders}
                              className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[9px] font-medium hover:bg-slate-200 transition-colors"
                            >
                              Collapse All
                            </button>
                          </div>
                        </div>

                        {/* Summary Stats */}
                        <div
                          className={`grid ${
                            isAdmin ? "grid-cols-4" : "grid-cols-3"
                          } gap-2 mt-3`}
                        >
                          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <FiShoppingBag className="w-3 h-3 text-indigo-500" />
                              <span className="text-[8px] text-slate-500 uppercase">
                                Total Items
                              </span>
                            </div>
                            <p className="text-[13px] font-bold text-slate-900 mt-0.5">
                              {orderDetail?.sellerOrders?.reduce(
                                (sum, so) => sum + (so?.products?.length || 0),
                                0
                              ) || 0}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <FiDollarSign className="w-3 h-3 text-emerald-500" />
                              <span className="text-[8px] text-slate-500 uppercase">
                                Seller Earnings
                              </span>
                            </div>
                            <p className="text-[13px] font-bold text-emerald-600 mt-0.5">
                              €
                              {orderDetail?.sellerOrders
                                ?.reduce(
                                  (sum, so) =>
                                    sum + (parseFloat(so?.sellerEarning) || 0),
                                  0
                                )
                                .toFixed(2) || "0.00"}
                            </p>
                          </div>
                          {/* Commission - Admin Only */}
                          {isAdmin && (
                            <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                              <div className="flex items-center gap-1.5">
                                <FiPercent className="w-3 h-3 text-orange-500" />
                                <span className="text-[8px] text-slate-500 uppercase">
                                  Commission
                                </span>
                              </div>
                              <p className="text-[13px] font-bold text-orange-600 mt-0.5">
                                €
                                {orderDetail?.sellerOrders
                                  ?.reduce(
                                    (sum, so) =>
                                      sum +
                                      (parseFloat(so?.commissionAmount) || 0),
                                    0
                                  )
                                  .toFixed(2) || "0.00"}
                              </p>
                            </div>
                          )}
                          <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-1.5">
                              <FiCheckCircle className="w-3 h-3 text-teal-500" />
                              <span className="text-[8px] text-slate-500 uppercase">
                                Delivered
                              </span>
                            </div>
                            <p className="text-[13px] font-bold text-teal-600 mt-0.5">
                              {orderDetail?.sellerOrders?.filter(
                                (so) => so?.orderStatus === "Delivered"
                              ).length || 0}
                              /{orderDetail?.sellerOrders?.length || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Seller Orders List */}
                      <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                        {orderDetail?.sellerOrders?.map((sellerOrder, idx) => {
                          const isExpanded =
                            expandedSellerOrders[sellerOrder._id];
                          const sellerStatusInfo =
                            statusMapping.find(
                              (s) => s.status === sellerOrder?.orderStatus
                            ) || statusMapping[0];
                          const products = sellerOrder?.products || [];
                          const totalProducts = products.reduce(
                            (sum, p) => sum + (p?.quantity || 1),
                            0
                          );

                          return (
                            <motion.div
                              key={sellerOrder._id || idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                                isExpanded
                                  ? `${sellerStatusInfo?.border} shadow-lg`
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              {/* Seller Order Header */}
                              <div
                                onClick={() =>
                                  toggleSellerOrder(sellerOrder._id)
                                }
                                className={`p-3 cursor-pointer transition-colors ${
                                  isExpanded
                                    ? `bg-gradient-to-r ${sellerStatusInfo?.gradient
                                        ?.replace("from-", "from-")
                                        .replace("to-", "to-")} bg-opacity-10 ${
                                        sellerStatusInfo?.bg
                                      }`
                                    : "bg-slate-50 hover:bg-slate-100"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {/* Seller Avatar/Logo */}
                                    <div className="relative">
                                      {sellerOrder?.storeLogo ||
                                      sellerOrder?.seller?.storeLogo ? (
                                        <Image
                                          src={
                                            sellerOrder?.storeLogo ||
                                            sellerOrder?.seller?.storeLogo
                                          }
                                          alt={
                                            sellerOrder?.sellerName ||
                                            sellerOrder?.seller?.storeName ||
                                            "Seller"
                                          }
                                          width={40}
                                          height={40}
                                          className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[13px] font-bold shadow-md">
                                          {(
                                            sellerOrder?.sellerName ||
                                            sellerOrder?.seller?.storeName ||
                                            "S"
                                          )
                                            .charAt(0)
                                            .toUpperCase()}
                                        </div>
                                      )}
                                      <div
                                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${sellerStatusInfo?.bg} border-2 border-white shadow`}
                                      >
                                        <sellerStatusInfo.icon
                                          className={`w-2 h-2 ${sellerStatusInfo?.text}`}
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-[12px] font-bold text-slate-900">
                                          {sellerOrder?.sellerName ||
                                            sellerOrder?.seller?.storeName ||
                                            "Unknown Seller"}
                                        </h4>
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[8px] font-semibold bg-gradient-to-r ${sellerStatusInfo?.gradient} text-white`}
                                        >
                                          {sellerOrder?.orderStatus ||
                                            "Pending"}
                                        </span>
                                      </div>
                                      {(sellerOrder?.orderStatus ===
                                        "Cancelled" ||
                                        sellerOrder?.cancelReason) &&
                                        sellerOrder?.cancelReason && (
                                          <div className="mt-1 px-2 py-1 rounded-lg bg-rose-50 border border-rose-200">
                                            <p className="text-[8px] font-semibold text-rose-900 mb-0.5">
                                              Cancel Reason:
                                            </p>
                                            <p className="text-[8px] text-rose-700">
                                              {sellerOrder.cancelReason}
                                            </p>
                                          </div>
                                        )}
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] text-slate-500">
                                          {products.length} product
                                          {products.length !== 1 ? "s" : ""} •{" "}
                                          {totalProducts} item
                                          {totalProducts !== 1 ? "s" : ""}
                                        </span>
                                        <span className="text-slate-300">
                                          •
                                        </span>
                                        <span className="text-[9px] font-semibold text-emerald-600">
                                          €
                                          {parseFloat(
                                            sellerOrder?.sellerEarning || 0
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Quick Status Badges */}
                                    {sellerOrder?.tracking?.[0]?.trackingId && (
                                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-[8px] font-medium">
                                        Tracking Added
                                      </span>
                                    )}
                                    <div
                                      className={`p-1.5 rounded-lg transition-colors ${
                                        isExpanded
                                          ? sellerStatusInfo?.bg
                                          : "bg-slate-200"
                                      }`}
                                    >
                                      {isExpanded ? (
                                        <FiChevronUp
                                          className={`w-4 h-4 ${
                                            isExpanded
                                              ? sellerStatusInfo?.text
                                              : "text-slate-500"
                                          }`}
                                        />
                                      ) : (
                                        <FiChevronDown className="w-4 h-4 text-slate-500" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Content */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-slate-200"
                                  >
                                    {/* Products */}
                                    <div className="p-3 bg-white">
                                      <div className="flex items-center gap-2 mb-2">
                                        <FiPackage className="w-3 h-3 text-indigo-500" />
                                        <h5 className="text-[10px] font-semibold text-slate-700">
                                          Products
                                        </h5>
                                      </div>
                                      <div className="space-y-1.5">
                                        {products.map((product, pIdx) => (
                                          <div
                                            key={product?._id || pIdx}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100"
                                          >
                                            <Link
                                              href={
                                                product?.image ||
                                                product?.product?.thumbnails ||
                                                "#"
                                              }
                                              target="_blank"
                                              className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200"
                                            >
                                              <Image
                                                src={
                                                  product?.image ||
                                                  product?.product
                                                    ?.thumbnails ||
                                                  "/placeholder.svg"
                                                }
                                                layout="fill"
                                                alt="Product"
                                                className="object-cover"
                                              />
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-[10px] font-semibold text-slate-800 line-clamp-1">
                                                {product?.name ||
                                                  product?.product?.name ||
                                                  "Unnamed Product"}
                                              </p>
                                              <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[8px] font-medium">
                                                  x{product?.quantity || 1}
                                                </span>
                                                {product?.sizes?.length > 0 && (
                                                  <span className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 text-[8px]">
                                                    {product.sizes.join(", ")}
                                                  </span>
                                                )}
                                                {product?.colors?.length >
                                                  0 && (
                                                  <span className="px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 text-[8px]">
                                                    {product.colors.join(", ")}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <p className="text-[10px] font-bold text-slate-900">
                                                €
                                                {parseFloat(
                                                  product?.price || 0
                                                ).toFixed(2)}
                                              </p>
                                              <p className="text-[8px] text-slate-500">
                                                €
                                                {(
                                                  parseFloat(
                                                    product?.price || 0
                                                  ) * (product?.quantity || 1)
                                                ).toFixed(2)}{" "}
                                                total
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Financial Details */}
                                    <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
                                      <div
                                        className={`grid gap-2 ${
                                          sellerOrder?.couponDiscount > 0
                                            ? "grid-cols-2 sm:grid-cols-5"
                                            : "grid-cols-2 sm:grid-cols-4"
                                        }`}
                                      >
                                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                                          <p className="text-[8px] text-slate-500 uppercase">
                                            Subtotal
                                          </p>
                                          <p className="text-[11px] font-bold text-slate-900">
                                            €
                                            {parseFloat(
                                              sellerOrder?.sellerSubtotal || 0
                                            ).toFixed(2)}
                                          </p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                                          <p className="text-[8px] text-slate-500 uppercase">
                                            Shipping
                                          </p>
                                          <p className="text-[11px] font-bold text-slate-900">
                                            €
                                            {parseFloat(
                                              sellerOrder?.shippingFee || 0
                                            ).toFixed(2)}
                                          </p>
                                        </div>
                                        {sellerOrder?.couponDiscount > 0 && (
                                          <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                                            <p className="text-[8px] text-green-600 uppercase flex items-center gap-1">
                                              Discount
                                              {sellerOrder?.couponCode && (
                                                <span className="text-[6px] bg-green-100 text-green-700 px-1 rounded">
                                                  {sellerOrder.couponCode}
                                                </span>
                                              )}
                                            </p>
                                            <p className="text-[11px] font-bold text-green-700">
                                              -€
                                              {parseFloat(
                                                sellerOrder?.couponDiscount || 0
                                              ).toFixed(2)}
                                            </p>
                                          </div>
                                        )}
                                        {/* Commission - Admin Only */}
                                        {isAdmin && (
                                          <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
                                            <p className="text-[8px] text-orange-600 uppercase">
                                              Commission (
                                              {sellerOrder?.commission || 5}%)
                                            </p>
                                            <p className="text-[11px] font-bold text-orange-700">
                                              -€
                                              {parseFloat(
                                                sellerOrder?.commissionAmount ||
                                                  0
                                              ).toFixed(2)}
                                            </p>
                                          </div>
                                        )}
                                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                                          <p className="text-[8px] text-emerald-600 uppercase">
                                            Seller Earning
                                          </p>
                                          <p className="text-[11px] font-bold text-emerald-700">
                                            €
                                            {parseFloat(
                                              sellerOrder?.sellerEarning || 0
                                            ).toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Status Update & Tracking */}
                                    <div className="p-3 bg-white border-t border-slate-200">
                                      <div className="flex items-center gap-2 mb-2">
                                        <FiRefreshCw className="w-3 h-3 text-violet-500" />
                                        <h5 className="text-[10px] font-semibold text-slate-700">
                                          Update Status
                                        </h5>
                                      </div>
                                      <div className="grid grid-cols-6 gap-1">
                                        {orderStatuses.map((status) => {
                                          const info = statusMapping.find(
                                            (s) => s.status === status
                                          );
                                          const isActive =
                                            sellerOrder?.orderStatus === status;
                                          const isUpdating =
                                            sellerStatusUpdating[
                                              sellerOrder._id
                                            ];
                                          return (
                                            <button
                                              key={status}
                                              onClick={() =>
                                                handleUpdateSellerOrderStatus(
                                                  sellerOrder._id,
                                                  status
                                                )
                                              }
                                              disabled={isUpdating || isActive}
                                              className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-[8px] font-medium transition-all ${
                                                isActive
                                                  ? `${info?.bg} ${info?.text} ${info?.border} ring-2 ring-offset-1 ${info?.border}`
                                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                              } ${
                                                isUpdating ? "opacity-50" : ""
                                              }`}
                                            >
                                              {info?.icon && (
                                                <info.icon className="w-3 h-3 mb-0.5" />
                                              )}
                                              <span className="line-clamp-1">
                                                {status}
                                              </span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {/* Tracking Info */}
                                    {sellerOrder?.tracking?.[0]?.trackingId && (
                                      <div className="p-3 bg-cyan-50 border-t border-cyan-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <FiTruck className="w-3 h-3 text-cyan-600" />
                                          <h5 className="text-[10px] font-semibold text-cyan-800">
                                            Tracking Information
                                          </h5>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 rounded-lg bg-white border border-cyan-200 flex-1">
                                            <p className="text-[8px] text-cyan-600 uppercase">
                                              Tracking ID
                                            </p>
                                            <p className="text-[10px] font-semibold text-slate-900">
                                              {sellerOrder?.tracking?.[0]
                                                ?.trackingId || "N/A"}
                                            </p>
                                          </div>
                                          <div className="p-2 rounded-lg bg-white border border-cyan-200 flex-1">
                                            <p className="text-[8px] text-cyan-600 uppercase">
                                              Carrier
                                            </p>
                                            <p className="text-[10px] font-semibold text-slate-900">
                                              {sellerOrder?.tracking?.[0]
                                                ?.shippingCarrier || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Timeline */}
                                    {sellerOrder?.timeline?.length > 0 && (
                                      <div className="p-3 bg-violet-50 border-t border-violet-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <FiClock className="w-3 h-3 text-violet-600" />
                                          <h5 className="text-[10px] font-semibold text-violet-800">
                                            Timeline
                                          </h5>
                                        </div>
                                        <div className="space-y-1">
                                          {sellerOrder.timeline
                                            .slice(-5)
                                            .reverse()
                                            .map((event, eIdx) => {
                                              const eventInfo =
                                                statusMapping.find(
                                                  (s) =>
                                                    s.status === event?.status
                                                ) || statusMapping[0];
                                              return (
                                                <div
                                                  key={eIdx}
                                                  className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-violet-100"
                                                >
                                                  <div
                                                    className={`p-1 rounded-full ${eventInfo?.bg}`}
                                                  >
                                                    <eventInfo.icon
                                                      className={`w-2 h-2 ${eventInfo?.text}`}
                                                    />
                                                  </div>
                                                  <div className="flex-1">
                                                    <span className="text-[9px] font-medium text-slate-900">
                                                      {event?.status}
                                                    </span>
                                                    <span className="text-[8px] text-slate-500 ml-2">
                                                      by{" "}
                                                      {event?.updatedBy ||
                                                        "system"}
                                                    </span>
                                                  </div>
                                                  <span className="text-[8px] text-slate-400">
                                                    {event?.date
                                                      ? format(
                                                          new Date(event.date),
                                                          "MMM dd, HH:mm"
                                                        )
                                                      : ""}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 flex flex-col gap-2">
                  {/* Status Update */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <FiRefreshCw className="w-3 h-3" />
                      </div>
                      <h3 className="text-[11px] font-bold text-slate-900">
                        Update Status
                      </h3>
                    </div>
                    <div className="p-2 grid grid-cols-3 gap-1.5">
                      {orderStatuses.map((status) => {
                        const info = statusMapping.find(
                          (s) => s.status === status
                        );
                        const isActive = orderDetail?.orderStatus === status;
                        return (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(status)}
                            disabled={statusUpdating || isActive}
                            className={`flex items-center justify-center gap-1 p-2 rounded-lg border text-[9px] font-medium transition-all ${
                              isActive
                                ? `${info?.bg} ${info?.text} ${info?.border}`
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            } ${statusUpdating ? "opacity-50" : ""}`}
                          >
                            {info?.icon && <info.icon className="w-3 h-3" />}
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                        <FiCreditCard className="w-3 h-3" />
                      </div>
                      <h3 className="text-[11px] font-bold text-slate-900">
                        Order Info
                      </h3>
                    </div>
                    <div className="p-2 space-y-1.5">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[9px] text-slate-500 uppercase">
                          Date
                        </span>
                        <span className="text-[10px] font-semibold text-slate-900">
                          {orderDetail?.createdAt
                            ? format(
                                new Date(orderDetail.createdAt),
                                "MMM dd, yyyy HH:mm"
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[9px] text-slate-500 uppercase">
                          Payment
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-teal-50 text-teal-700">
                          {orderDetail?.paymentMethod ||
                            orderDetail?.parentOrder?.paymentMethod ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[9px] text-slate-500 uppercase">
                          Payment Status
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                            (orderDetail?.paymentStatus ||
                              orderDetail?.parentOrder?.paymentStatus) ===
                            "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {orderDetail?.paymentStatus ||
                            orderDetail?.parentOrder?.paymentStatus ||
                            "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[9px] text-slate-500 uppercase">
                          Status
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-medium bg-gradient-to-r ${currentStatusInfo.gradient} text-white`}
                        >
                          {orderDetail?.orderStatus || "Pending"}
                        </span>
                      </div>
                      {/* Cancel Reason Display */}
                      {(orderDetail?.orderStatus === "Cancelled" ||
                        orderDetail?.cancelReason) &&
                        orderDetail?.cancelReason && (
                          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
                            <p className="text-[9px] font-semibold text-rose-900 uppercase mb-1">
                              Cancel Reason
                            </p>
                            <p className="text-[10px] text-rose-700">
                              {orderDetail.cancelReason}
                            </p>
                          </div>
                        )}
                      {isSellerOrder && (
                        <>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-green-50 border border-green-100">
                            <span className="text-[9px] text-green-700">
                              Earnings
                            </span>
                            <span className="text-[11px] font-bold text-green-700">
                              €
                              {parseFloat(
                                orderDetail?.sellerEarning || 0
                              ).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-orange-50 border border-orange-100">
                            <span className="text-[9px] text-orange-700">
                              Commission ({orderDetail?.commission || 5}%)
                            </span>
                            <span className="text-[10px] font-semibold text-orange-700">
                              €
                              {parseFloat(
                                orderDetail?.commissionAmount || 0
                              ).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                        <FiClock className="w-3 h-3" />
                      </div>
                      <h3 className="text-[11px] font-bold text-slate-900">
                        Timeline
                      </h3>
                    </div>
                    <div className="p-2 max-h-[150px] overflow-y-auto">
                      <OrderTimeline timeline={orderDetail?.timeline || []} />
                    </div>
                  </div>

                  {/* Admin-Only Platform Earnings (for delivered/completed orders) */}
                  {isAdmin &&
                    !isSellerOrder &&
                    orderDetail?.orderStatus === "Delivered" &&
                    hasSellerOrders && (
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-200 shadow-sm overflow-hidden">
                        <div className="p-2.5 border-b border-emerald-200 bg-gradient-to-r from-emerald-500 to-green-500 flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white">
                            <FiDollarSign className="w-3 h-3" />
                          </div>
                          <h3 className="text-[11px] font-bold text-white">
                            Platform Earnings (Admin Only)
                          </h3>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-sm">
                              <p className="text-[8px] text-emerald-600 uppercase font-medium mb-1">
                                Total Commission
                              </p>
                              <p className="text-[14px] font-bold text-emerald-700">
                                €
                                {orderDetail?.sellerOrders
                                  ?.reduce(
                                    (sum, so) =>
                                      sum +
                                      (parseFloat(so?.commissionAmount) || 0),
                                    0
                                  )
                                  .toFixed(2) || "0.00"}
                              </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 shadow-sm">
                              <p className="text-[8px] text-slate-500 uppercase font-medium mb-1">
                                Seller Payouts
                              </p>
                              <p className="text-[14px] font-bold text-slate-700">
                                €
                                {orderDetail?.sellerOrders
                                  ?.reduce(
                                    (sum, so) =>
                                      sum +
                                      (parseFloat(so?.sellerEarning) || 0),
                                    0
                                  )
                                  .toFixed(2) || "0.00"}
                              </p>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-emerald-100/50 border border-emerald-200">
                            <p className="text-[9px] text-emerald-700 flex items-center gap-1">
                              <FiCheckCircle className="w-3 h-3" />
                              <span>
                                Commission collected from{" "}
                                {orderDetail?.sellerOrders?.length || 0}{" "}
                                seller(s) for this completed order
                              </span>
                            </p>
                          </div>
                          {/* Individual Seller Breakdown */}
                          <div className="space-y-1.5">
                            {orderDetail?.sellerOrders?.map((so, idx) => (
                              <div
                                key={so._id || idx}
                                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[8px] font-bold">
                                    {(so?.sellerName || "S")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <span className="text-[10px] font-medium text-slate-700">
                                    {so?.sellerName || "Unknown"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-[9px] text-emerald-600 font-semibold">
                                    +€
                                    {parseFloat(
                                      so?.commissionAmount || 0
                                    ).toFixed(2)}
                                  </span>
                                  <span className="text-[8px] text-slate-400">
                                    ({so?.commission || 5}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Comments - Admin only */}
                  {isAdmin && !isSellerOrder && (
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                          <FiMessageCircle className="w-3 h-3" />
                        </div>
                        <h3 className="text-[11px] font-bold text-slate-900">
                          Notes ({orderDetail?.comments?.length || 0})
                        </h3>
                      </div>
                      <div className="p-2">
                        <form
                          onSubmit={handleAddComment}
                          className="flex gap-1.5 mb-2"
                        >
                          <input
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 focus:border-red-400 outline-none text-[10px]"
                            placeholder="Add note..."
                          />
                          <button
                            type="submit"
                            disabled={!comment.trim()}
                            className="px-2 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-medium disabled:opacity-50"
                          >
                            Add
                          </button>
                        </form>
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                          {orderDetail?.comments?.length > 0 ? (
                            orderDetail.comments.map((item, i) => (
                              <div
                                key={item._id || i}
                                className="p-2 rounded-lg bg-slate-50 border border-slate-100"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] font-semibold text-slate-700">
                                    {item.user?.name || "Admin"}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[8px] text-slate-400">
                                      {item?.createdAt
                                        ? format(
                                            new Date(item.createdAt),
                                            "MMM dd, h:mm a"
                                          )
                                        : ""}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(item._id)
                                      }
                                      className="text-slate-400 hover:text-red-500"
                                    >
                                      <AiTwotoneDelete className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-[9px] text-slate-600">
                                  {item.question}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-[9px] text-slate-400 text-center py-2">
                              No notes
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : isLoading ? (
              <OrderDetailLoader />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FiPackage className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-slate-500 text-[11px]">Order not found</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Slip Modal */}
        <AnimatePresence>
          {showSlipDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
              >
                <div className="sticky top-0 z-10 flex items-center justify-between p-3 bg-gradient-to-r from-red-500 to-rose-600 text-white">
                  <h3 className="text-[12px] font-bold">Order Slip</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={generatePDF}
                      disabled={loadDownload}
                      className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg text-[10px] font-medium"
                    >
                      {loadDownload ? (
                        <ImSpinner9 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <HiDownload className="w-3 h-3" />
                          PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowSlipDetail(false)}
                      className="p-1 hover:bg-white/20 rounded-lg"
                    >
                      <CgClose className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div ref={slipRef} className="p-4">
                  <OrderSlip
                    orderDetail={orderDetail}
                    generatePDF={generatePDF}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Modal */}
        <AnimatePresence>
          {showStatusModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3"
              onClick={() => setShowStatusModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white w-full max-w-sm rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-[12px] font-bold text-slate-900">
                    Update Status
                  </h3>
                </div>
                <div className="p-3 space-y-1.5">
                  {orderStatuses.map((status) => {
                    const info = statusMapping.find((s) => s.status === status);
                    const isActive = orderDetail?.orderStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(status)}
                        disabled={statusUpdating || isActive}
                        className={`w-full flex items-center gap-2 p-2.5 rounded-lg border text-[11px] font-medium ${
                          isActive
                            ? `${info?.bg} ${info?.text} ${info?.border}`
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {info?.icon && <info.icon className="w-3.5 h-3.5" />}
                        <span className="flex-1 text-left">{status}</span>
                        {isActive && <FiCheckCircle className="w-3.5 h-3.5" />}
                        {statusUpdating && (
                          <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="w-full py-2 rounded-lg bg-slate-200 text-slate-700 font-medium text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
