"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  FaWallet,
  FaMoneyBillWave,
  FaCreditCard,
  FaUniversity,
  FaPaypal,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaDownload,
  FaEye,
  FaHistory,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaFileInvoice,
  FaStar,
  FaShieldAlt,
  FaRocket,
  FaGift,
} from "react-icons/fa";
import {
  TbCurrencyEuro,
  TbArrowUpRight,
  TbArrowDownRight,
  TbReceipt,
  TbConfetti,
  TbSparkles,
} from "react-icons/tb";
import {
  BsBank2,
  BsGraphUpArrow,
  BsCashCoin,
  BsLightningChargeFill,
} from "react-icons/bs";
import { HiOutlineCash, HiOutlineTrendingUp, HiSparkles } from "react-icons/hi";
import {
  RiSecurePaymentLine,
  RiBankLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import {
  IoWalletOutline,
  IoCheckmarkDoneCircle,
  IoRocketSharp,
} from "react-icons/io5";
import { LuPartyPopper } from "react-icons/lu";
import {
  TbZoomIn,
  TbDownload,
  TbX,
  TbMaximize,
  TbPrinter,
  TbFileDownload,
} from "react-icons/tb";
import { MdOutlineEmail, MdLocationOn, MdPhone, MdPrint } from "react-icons/md";
import Confetti from "react-confetti";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

// Animated Success Modal Component
const SuccessModal = ({ isOpen, onClose, payoutData }) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.3}
          />
        )}

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          {/* Animated Header */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-8 text-center overflow-hidden">
            {/* Animated Circles */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mt-16"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mb-20"
            />

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2, damping: 10 }}
              className="relative z-10"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <IoCheckmarkDoneCircle className="text-emerald-500 text-6xl" />
                </motion.div>
              </div>
            </motion.div>

            {/* Floating Sparkles */}
            <motion.div
              animate={{ y: [-5, 5, -5], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-4 right-8"
            >
              <TbSparkles className="text-yellow-300 text-2xl" />
            </motion.div>
            <motion.div
              animate={{ y: [5, -5, 5], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute bottom-4 left-8"
            >
              <HiSparkles className="text-yellow-300 text-xl" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Payout Request Submitted!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-sm mb-6"
            >
              Your request has been successfully submitted and is being
              processed
            </motion.p>

            {/* Amount Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Payout Amount
              </p>
              <div className="flex items-center justify-center gap-1">
                <TbCurrencyEuro className="text-emerald-600 text-3xl" />
                <span className="text-4xl font-bold text-gray-900">
                  {payoutData?.amount?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  }) || "0.00"}
                </span>
              </div>
              {payoutData?.requestNumber && (
                <p className="text-xs text-gray-400 mt-3 font-mono">
                  Request #{payoutData.requestNumber}
                </p>
              )}
            </motion.div>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              <div className="bg-amber-50 rounded-xl p-3 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <FaClock className="text-amber-500 text-xs" />
                  <span className="text-xs font-semibold text-amber-700">
                    Status
                  </span>
                </div>
                <p className="text-sm text-amber-600">Pending Review</p>
              </div>
              <div className="bg-sky-50 rounded-xl p-3 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <FaRocket className="text-sky-500 text-xs" />
                  <span className="text-xs font-semibold text-sky-700">
                    Processing
                  </span>
                </div>
                <p className="text-sm text-sky-600">1-3 business days</p>
              </div>
            </motion.div>

            {/* What's Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-left mb-6"
            >
              <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                <BsLightningChargeFill className="text-emerald-500" />
                What happens next?
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-emerald-600">
                  <span className="w-4 h-4 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[8px] font-bold text-emerald-700">
                      1
                    </span>
                  </span>
                  Our team will review your request within 24 hours
                </li>
                <li className="flex items-start gap-2 text-xs text-emerald-600">
                  <span className="w-4 h-4 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[8px] font-bold text-emerald-700">
                      2
                    </span>
                  </span>
                  Once approved, funds will be transferred to your account
                </li>
                <li className="flex items-start gap-2 text-xs text-emerald-600">
                  <span className="w-4 h-4 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[8px] font-bold text-emerald-700">
                      3
                    </span>
                  </span>
                  You'll receive a confirmation email when completed
                </li>
              </ul>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all flex items-center justify-center gap-2"
            >
              <LuPartyPopper className="text-lg" />
              Got it, thanks!
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const PayoutsTab = ({ seller, token, onUpdate }) => {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [statusSummary, setStatusSummary] = useState(null);

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [showPayoutDetailsModal, setShowPayoutDetailsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingMethod, setEditingMethod] = useState(null);
  const [successPayoutData, setSuccessPayoutData] = useState(null);

  // Fullscreen image viewer
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerCurrentIndex, setViewerCurrentIndex] = useState(0);

  // PDF generation
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const invoiceRef = React.useRef(null);

  // Form states
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment method form
  const [methodType, setMethodType] = useState("bank_transfer");
  const [methodNickname, setMethodNickname] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    iban: "",
    swiftCode: "",
    country: "",
  });
  const [paypalEmail, setPaypalEmail] = useState("");

  const fetchEarnings = useCallback(async () => {
    if (!seller?._id) return;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/earnings/${seller._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setEarnings(data.data);
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
    }
  }, [seller?._id, token]);

  const fetchPayouts = useCallback(
    async (page = 1) => {
      if (!seller?._id) return;
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/history/${seller._id}?page=${page}&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          setPayouts(data.payouts);
          setPagination(data.pagination);
          setStatusSummary(data.statusSummary);
        }
      } catch (error) {
        console.error("Error fetching payouts:", error);
      }
    },
    [seller?._id, token]
  );

  const fetchPaymentMethods = useCallback(async () => {
    if (!seller?._id) return;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/payment-methods/${seller._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  }, [seller?._id, token]);

  const fetchInvoices = useCallback(async () => {
    if (!seller?._id) return;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/invoices/${seller._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, [seller?._id, token]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchEarnings(),
        fetchPayouts(),
        fetchPaymentMethods(),
        fetchInvoices(),
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchEarnings, fetchPayouts, fetchPaymentMethods, fetchInvoices]);

  const handleRequestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (parseFloat(payoutAmount) > (earnings?.withdrawableBalance || 0)) {
      toast.error("Amount exceeds available balance");
      return;
    }

    if (parseFloat(payoutAmount) < 50) {
      toast.error("Minimum payout amount is €50");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/request/${seller._id}`,
        {
          amount: parseFloat(payoutAmount),
          paymentMethodId: selectedPaymentMethod,
          sellerNotes: payoutNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // Show beautiful success modal
        setSuccessPayoutData({
          amount: parseFloat(payoutAmount),
          requestNumber: data.payoutRequest?.requestNumber,
        });
        setShowRequestModal(false);
        setShowSuccessModal(true);
        setPayoutAmount("");
        setSelectedPaymentMethod("");
        setPayoutNotes("");
        fetchEarnings();
        fetchPayouts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    // Validate payment type
    if (!methodType) {
      toast.error("Please select a payment type");
      return;
    }

    // Validate bank transfer fields
    if (methodType === "bank_transfer") {
      if (!bankDetails.accountHolderName?.trim()) {
        toast.error("Account holder name is required");
        return;
      }
      if (!bankDetails.bankName?.trim()) {
        toast.error("Bank name is required");
        return;
      }
      if (!bankDetails.accountNumber?.trim()) {
        toast.error("Account number is required");
        return;
      }
      // Validate account number format (minimum 6 digits)
      if (bankDetails.accountNumber.replace(/\D/g, "").length < 6) {
        toast.error("Please enter a valid account number");
        return;
      }
      // Validate IBAN format if provided
      if (bankDetails.iban && bankDetails.iban.length < 15) {
        toast.error("Please enter a valid IBAN");
        return;
      }
      // Validate SWIFT code format if provided (8-11 characters)
      if (
        bankDetails.swiftCode &&
        (bankDetails.swiftCode.length < 8 || bankDetails.swiftCode.length > 11)
      ) {
        toast.error("SWIFT/BIC code must be 8-11 characters");
        return;
      }
    }

    // Validate PayPal fields
    if (methodType === "paypal") {
      if (!paypalEmail?.trim()) {
        toast.error("PayPal email is required");
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(paypalEmail)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type: methodType,
        nickname: methodNickname?.trim() || null,
        isPrimary: paymentMethods.length === 0,
      };

      if (methodType === "bank_transfer") {
        payload.bankDetails = {
          accountHolderName: bankDetails.accountHolderName?.trim(),
          bankName: bankDetails.bankName?.trim(),
          accountNumber: bankDetails.accountNumber?.trim(),
          iban: bankDetails.iban?.trim() || null,
          swiftCode: bankDetails.swiftCode?.trim() || null,
          routingNumber: bankDetails.routingNumber?.trim() || null,
          country: bankDetails.country?.trim() || null,
        };
      } else if (methodType === "paypal") {
        payload.paypal = { email: paypalEmail?.trim().toLowerCase() };
      }

      const url = editingMethod
        ? `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/payment-methods/${editingMethod._id}`
        : `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/payment-methods/${seller._id}`;

      const { data } = editingMethod
        ? await axios.put(url, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post(url, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

      if (data.success) {
        toast.success(
          editingMethod ? "Payment method updated!" : "Payment method added!"
        );
        setShowPaymentMethodModal(false);
        resetPaymentMethodForm();
        fetchPaymentMethods();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save payment method"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId) => {
    if (!confirm("Delete this payment method?")) return;

    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/payment-methods/${methodId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Deleted!");
        fetchPaymentMethods();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const handleCancelPayout = async (payoutId) => {
    if (!confirm("Cancel this payout request?")) return;

    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/payouts/cancel/${payoutId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Cancelled!");
        fetchPayouts();
        fetchEarnings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    }
  };

  const resetPaymentMethodForm = () => {
    setMethodType("bank_transfer");
    setMethodNickname("");
    setBankDetails({
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      iban: "",
      swiftCode: "",
      routingNumber: "",
      country: "",
    });
    setPaypalEmail("");
    setEditingMethod(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200",
      under_review:
        "bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border-sky-200",
      approved:
        "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200",
      processing:
        "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border-violet-200",
      completed:
        "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200",
      rejected:
        "bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border-rose-200",
      cancelled:
        "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200",
    };
    return colors[status] || "bg-slate-50 text-slate-700";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="text-amber-500" />,
      under_review: <FaEye className="text-sky-500" />,
      approved: <FaCheckCircle className="text-emerald-500" />,
      processing: <FaSpinner className="text-violet-500 animate-spin" />,
      completed: <FaCheckCircle className="text-green-500" />,
      rejected: <FaTimesCircle className="text-rose-500" />,
      cancelled: <FaTimesCircle className="text-slate-500" />,
    };
    return icons[status] || <FaClock />;
  };

  const getMethodIcon = (type) => {
    const icons = {
      bank_transfer: <RiBankLine className="text-sky-600" />,
      paypal: <FaPaypal className="text-blue-600" />,
      stripe: <FaCreditCard className="text-violet-600" />,
      wise: <FaMoneyBillWave className="text-emerald-600" />,
      payoneer: <FaCreditCard className="text-orange-600" />,
    };
    return icons[type] || <FaWallet />;
  };

  // Image viewer functions
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

  // Generate invoice HTML for PDF/Print
  const generateInvoiceHtml = (invoice) => {
    if (!invoice) return "";

    const formatDate = (date) => {
      try {
        return new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
      } catch {
        return "N/A";
      }
    };

    return `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; min-width: 600px; max-width: 800px; margin: 0 auto;">
        <!-- Invoice Header -->
        <div style="padding: 32px; background: linear-gradient(to right, #c6080a, #e63946, #f43f5e); color: white;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1 style="font-size: 30px; font-weight: bold; margin: 0; letter-spacing: -0.5px;">INVOICE</h1>
              <p style="color: rgba(255,255,255,0.8); margin-top: 4px; font-family: monospace; font-size: 18px;">${
                invoice.invoiceNumber
              }</p>
            </div>
            <div style="text-align: right;">
              <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-left: auto; margin-bottom: 8px;">
                <span style="font-size: 24px; font-weight: bold;">AS</span>
              </div>
              <p style="color: rgba(255,255,255,0.9); font-weight: 600; margin: 0;">Darloo Marketplace</p>
            </div>
          </div>
        </div>

        <!-- Status Badge -->
        <div style="padding: 0 32px; margin-top: -16px;">
          <span style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 9999px; font-size: 14px; font-weight: bold; background: ${
            invoice.status === "paid"
              ? "linear-gradient(to right, #10b981, #22c55e)"
              : "linear-gradient(to right, #fbbf24, #eab308)"
          }; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${
              invoice.status === "paid"
                ? "✓ PAID"
                : invoice.status?.toUpperCase() || "PENDING"
            }
          </span>
        </div>

        <!-- From / To Section -->
        <div style="padding: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
          <div>
            <p style="font-size: 10px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">From</p>
            <div style="padding: 20px; background: linear-gradient(to bottom right, #f9fafb, #f3f4f6); border-radius: 16px; border: 1px solid #f3f4f6;">
              <p style="font-weight: bold; color: #111827; font-size: 18px; margin: 0;">${
                invoice.details?.from?.companyName || "Darloo Marketplace"
              }</p>
              ${
                invoice.details?.from?.address
                  ? `<p style="color: #4b5563; font-size: 14px; margin: 8px 0 0 0;">📍 ${invoice.details.from.address}</p>`
                  : ""
              }
              ${
                invoice.details?.from?.email
                  ? `<p style="color: #4b5563; font-size: 14px; margin: 4px 0 0 0;">✉️ ${invoice.details.from.email}</p>`
                  : ""
              }
            </div>
          </div>
          <div>
            <p style="font-size: 10px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Bill To</p>
            <div style="padding: 20px; background: linear-gradient(to bottom right, #f9fafb, #f3f4f6); border-radius: 16px; border: 1px solid #f3f4f6;">
              <p style="font-weight: bold; color: #111827; font-size: 18px; margin: 0;">${
                invoice.details?.to?.storeName || seller?.storeName || "Seller"
              }</p>
              ${
                invoice.details?.to?.address
                  ? `<p style="color: #4b5563; font-size: 14px; margin: 8px 0 0 0;">📍 ${invoice.details.to.address}</p>`
                  : ""
              }
              ${
                invoice.details?.to?.email
                  ? `<p style="color: #4b5563; font-size: 14px; margin: 4px 0 0 0;">✉️ ${invoice.details.to.email}</p>`
                  : ""
              }
            </div>
          </div>
        </div>

        <!-- Invoice Details -->
        <div style="padding: 0 32px 24px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div style="padding: 16px; background: linear-gradient(to bottom right, #eff6ff, #eef2ff); border-radius: 12px; border: 1px solid #dbeafe;">
              <p style="font-size: 10px; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Issue Date</p>
              <p style="font-weight: bold; color: #111827; margin: 0;">${formatDate(
                invoice.issueDate
              )}</p>
            </div>
            <div style="padding: 16px; background: linear-gradient(to bottom right, #faf5ff, #f5f3ff); border-radius: 12px; border: 1px solid #e9d5ff;">
              <p style="font-size: 10px; font-weight: bold; color: #9333ea; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Due Date</p>
              <p style="font-weight: bold; color: #111827; margin: 0;">${formatDate(
                invoice.dueDate || invoice.issueDate
              )}</p>
            </div>
            <div style="padding: 16px; background: linear-gradient(to bottom right, #ecfdf5, #f0fdf4); border-radius: 12px; border: 1px solid #a7f3d0;">
              <p style="font-size: 10px; font-weight: bold; color: #059669; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Period</p>
              <p style="font-weight: bold; color: #111827; margin: 0; font-size: 14px;">${formatDate(
                invoice.periodStart
              )} - ${formatDate(invoice.periodEnd)}</p>
            </div>
          </div>
        </div>

        <!-- Line Items Table -->
        <div style="padding: 0 32px 24px;">
          <div style="background: linear-gradient(to bottom right, #f9fafb, #f3f4f6); border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: linear-gradient(to right, #f3f4f6, #e5e7eb);">
                  <th style="padding: 16px 24px; text-align: left; font-size: 12px; font-weight: bold; color: #4b5563; text-transform: uppercase; letter-spacing: 1px;">Description</th>
                  <th style="padding: 16px 24px; text-align: right; font-size: 12px; font-weight: bold; color: #4b5563; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style="background: white; border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 16px 24px;">
                    <p style="font-weight: 600; color: #111827; margin: 0;">Gross Earnings</p>
                    <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Total earnings from sales</p>
                  </td>
                  <td style="padding: 16px 24px; text-align: right; font-weight: bold; color: #111827;">€${(
                    invoice.summary?.subtotal || 0
                  ).toFixed(2)}</td>
                </tr>
                <tr style="background: white; border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 16px 24px;">
                    <p style="font-weight: 600; color: #111827; margin: 0;">Platform Fee (${
                      invoice.summary?.platformFeePercentage || 10
                    }%)</p>
                    <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">Service and transaction fees</p>
                  </td>
                  <td style="padding: 16px 24px; text-align: right; font-weight: bold; color: #dc2626;">-€${(
                    invoice.summary?.platformFee || 0
                  ).toFixed(2)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="background: linear-gradient(to right, #f3f4f6, #e5e7eb);">
                  <td style="padding: 20px 24px; font-size: 18px; font-weight: bold; color: #111827;">Withdrawal Amount</td>
                  <td style="padding: 20px 24px; text-align: right; font-size: 24px; font-weight: bold; color: #059669;">€${(
                    invoice.summary?.totalAmount || 0
                  ).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 14px; color: #6b7280; margin: 0;">Thank you for being a valued seller!</p>
          <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">Generated on ${new Date().toLocaleDateString(
            "en-US",
            { month: "long", day: "numeric", year: "numeric" }
          )}</p>
        </div>
      </div>
    `;
  };

  // Download invoice as PDF
  const downloadInvoicePdf = async () => {
    if (!selectedInvoice) {
      toast.error("Invoice not ready. Please try again.");
      return;
    }

    setIsGeneratingPdf(true);
    try {
      // Create a hidden container for rendering
      const container = document.createElement("div");
      container.style.cssText =
        "position: fixed; left: -9999px; top: 0; width: 800px; background: white; z-index: -1;";
      container.innerHTML = generateInvoiceHtml(selectedInvoice);
      document.body.appendChild(container);

      // Wait for DOM to render
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        windowWidth: 800,
        windowHeight: container.scrollHeight,
      });

      // Clean up the temporary container
      document.body.removeChild(container);

      // Verify canvas has content
      if (canvas.width === 0 || canvas.height === 0) {
        toast.error("Failed to capture invoice. Please try again.");
        setIsGeneratingPdf(false);
        return;
      }

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate ratio to fit the image properly with margins
      const margin = 10;
      const availableWidth = pdfWidth - margin * 2;
      const availableHeight = pdfHeight - margin * 2;
      const ratio = Math.min(
        availableWidth / imgWidth,
        availableHeight / imgHeight
      );

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = margin;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save(`${selectedInvoice.invoiceNumber}.pdf`);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print invoice
  const printInvoice = () => {
    if (!selectedInvoice) {
      toast.error("Invoice not ready. Please try again.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (!printWindow) {
      toast.error("Please allow popups to print the invoice");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${selectedInvoice?.invoiceNumber}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              padding: 20px;
              color: #1f2937;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              @page {
                margin: 0.5cm;
                size: A4;
              }
            }
          </style>
        </head>
        <body>
          ${generateInvoiceHtml(selectedInvoice)}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#c6080a] border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-sm text-gray-500 font-medium">
            Loading your earnings...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        payoutData={successPayoutData}
      />

      {/* Modern Sub Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl w-fit shadow-sm">
        {[
          { id: "overview", label: "Overview", icon: BsGraphUpArrow },
          { id: "payouts", label: "History", icon: FaHistory },
          { id: "methods", label: "Payment Methods", icon: RiBankLine },
          { id: "invoices", label: "Invoices", icon: TbReceipt },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
              activeSubTab === tab.id
                ? "bg-white text-gray-900 shadow-md shadow-gray-200/50"
                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
          >
            <tab.icon
              className={`text-sm ${
                activeSubTab === tab.id ? "text-[#c6080a]" : ""
              }`}
            />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Hero Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Earnings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-sky-200/50"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-sky-100 uppercase tracking-wider">
                    Total Earnings
                  </span>
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
                  >
                    <BsCashCoin className="text-white text-lg" />
                  </motion.div>
                </div>
                <p className="text-[28px] font-bold text-white leading-tight tracking-tight">
                  €
                  {(earnings?.totalEarnings || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-sky-200 bg-white/10 px-2 py-0.5 rounded-full">
                    {earnings?.totalOrders || 0} orders
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Platform Fee */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 rounded-2xl p-5 shadow-lg shadow-orange-200/50"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-orange-100 uppercase tracking-wider">
                    Platform Fee
                  </span>
                  <motion.div
                    whileHover={{ rotate: -15, scale: 1.1 }}
                    className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
                  >
                    <RiSecurePaymentLine className="text-white text-lg" />
                  </motion.div>
                </div>
                <p className="text-[28px] font-bold text-white leading-tight tracking-tight">
                  €
                  {(earnings?.platformFee || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-orange-200 bg-white/10 px-2 py-0.5 rounded-full">
                    {earnings?.platformFeePercentage || 10}% commission
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Available Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative overflow-hidden bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 rounded-2xl p-5 shadow-lg shadow-emerald-200/50"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-2 right-2"
              >
                <HiSparkles className="text-white/30 text-3xl" />
              </motion.div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
                    Available
                  </span>
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
                  >
                    <IoWalletOutline className="text-white text-lg" />
                  </motion.div>
                </div>
                <p className="text-[28px] font-bold text-white leading-tight tracking-tight">
                  €
                  {(earnings?.withdrawableBalance || 0).toLocaleString(
                    "en-US",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <BsLightningChargeFill className="text-[9px]" />
                    Ready to withdraw
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Total Paid Out */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 rounded-2xl p-5 shadow-lg shadow-violet-200/50"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-violet-100 uppercase tracking-wider">
                    Paid Out
                  </span>
                  <motion.div
                    whileHover={{ rotate: -15, scale: 1.1 }}
                    className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
                  >
                    <HiOutlineCash className="text-white text-lg" />
                  </motion.div>
                </div>
                <p className="text-[28px] font-bold text-white leading-tight tracking-tight">
                  €
                  {(earnings?.totalPaidOut || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-violet-200 bg-white/10 px-2 py-0.5 rounded-full">
                    Lifetime payouts
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Pending Payout Request Card */}
            {(earnings?.pendingAmount || 0) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl p-5 shadow-lg shadow-amber-200/50 col-span-2 lg:col-span-1"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-2 right-2"
                >
                  <FaClock className="text-white/20 text-3xl" />
                </motion.div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-amber-100 uppercase tracking-wider">
                      Pending Payout
                    </span>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
                    >
                      <FaClock className="text-white text-lg" />
                    </motion.div>
                  </div>
                  <p className="text-[28px] font-bold text-white leading-tight tracking-tight">
                    €
                    {(earnings?.pendingAmount || 0).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-amber-100 bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FaSpinner className="text-[8px] animate-spin" />
                      Under review
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Secondary Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly Performance Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  This Month
                </h3>
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    (earnings?.monthlyGrowth || 0) >= 0
                      ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600"
                      : "bg-gradient-to-r from-rose-50 to-red-50 text-rose-600"
                  }`}
                >
                  {(earnings?.monthlyGrowth || 0) >= 0 ? (
                    <TbArrowUpRight className="text-xs" />
                  ) : (
                    <TbArrowDownRight className="text-xs" />
                  )}
                  {Math.abs(earnings?.monthlyGrowth || 0).toFixed(1)}%
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                €
                {(earnings?.monthlyEarnings || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">Last month</span>
                <span className="text-sm font-semibold text-gray-700">
                  €
                  {(earnings?.lastMonthEarnings || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm lg:col-span-2 hover:shadow-md transition-shadow"
            >
              <h3 className="text-sm font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const availableMethods = paymentMethods.filter(
                      (m) => m.status !== "suspended" && m.status !== "inactive"
                    );
                    const primaryMethod = availableMethods.find(
                      (m) => m.isPrimary
                    );
                    const methodToSelect = primaryMethod || availableMethods[0];
                    if (methodToSelect) {
                      setSelectedPaymentMethod(methodToSelect._id);
                    }
                    setShowRequestModal(true);
                  }}
                  disabled={
                    !earnings?.withdrawableBalance ||
                    earnings.withdrawableBalance < 50
                  }
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-[#c6080a] via-[#d32f2f] to-[#e63946] text-white rounded-2xl hover:shadow-lg hover:shadow-red-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <FaMoneyBillWave className="text-lg" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold block">
                        Request Payout
                      </span>
                      <span className="text-[10px] text-red-200">
                        Min €50 required
                      </span>
                    </div>
                  </div>
                  <IoRocketSharp className="text-xl text-white/70 group-hover:text-white transition-colors" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPaymentMethodModal(true)}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-2xl hover:shadow-md border border-gray-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <RiBankLine className="text-lg text-gray-600" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold block">
                        Add Payment
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Bank or PayPal
                      </span>
                    </div>
                  </div>
                  <FaPlus className="text-sm text-gray-400 group-hover:text-gray-600 transition-colors" />
                </motion.button>
              </div>

              {/* Pending Amount Alert */}
              {(earnings?.pendingAmount || 0) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FaExclamationCircle className="text-amber-500 text-sm" />
                  </div>
                  <div>
                    <span className="text-xs text-amber-700 font-semibold">
                      €{earnings.pendingAmount.toLocaleString()} pending
                      approval
                    </span>
                    <p className="text-[10px] text-amber-600">
                      Your payout request is being reviewed
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">
                Recent Transactions
              </h3>
              <button
                onClick={() => setActiveSubTab("payouts")}
                className="text-xs text-[#c6080a] hover:text-[#a50709] font-semibold flex items-center gap-1"
              >
                View All
                <TbArrowUpRight className="text-sm" />
              </button>
            </div>

            {earnings?.recentTransactions?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {earnings.recentTransactions
                  .slice(0, 5)
                  .map((transaction, index) => {
                    const isEarning = transaction.type === "earning";
                    const isPayout = transaction.type === "payout";

                    return (
                      <motion.div
                        key={`${transaction.type}-${transaction.orderId}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isEarning
                                ? "bg-gradient-to-br from-emerald-100 to-green-100"
                                : "bg-gradient-to-br from-red-100 to-rose-100"
                            }`}
                          >
                            {isEarning ? (
                              <FaArrowDown className="text-emerald-600 text-sm" />
                            ) : (
                              <FaArrowUp className="text-red-500 text-sm" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {transaction.description ||
                                `Order #${transaction.orderNumber}`}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-[11px] text-gray-400">
                                {format(
                                  new Date(transaction.date),
                                  "MMM dd, yyyy • HH:mm"
                                )}
                              </p>
                              {isPayout && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                                    transaction.status === "completed"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {transaction.status}
                                </span>
                              )}
                              {isEarning && transaction.status && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                                  {transaction.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            isEarning ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {isEarning ? "+" : "-"}€
                          {transaction.amount.toFixed(2)}
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaHistory className="text-gray-400 text-2xl" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  No transactions yet
                </p>
                <p className="text-xs text-gray-400">
                  Your earnings will appear here
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Payout History Tab */}
      {activeSubTab === "payouts" && (
        <div className="space-y-5">
          {/* Status Pills */}
          {statusSummary && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusSummary).map(
                ([status, data]) =>
                  data.count > 0 && (
                    <motion.div
                      key={status}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border ${getStatusColor(
                        status
                      )} flex items-center gap-1.5`}
                    >
                      {getStatusIcon(status)}
                      <span className="capitalize">
                        {status.replace("_", " ")}
                      </span>
                      <span className="opacity-70 ml-1">{data.count}</span>
                    </motion.div>
                  )
              )}
            </div>
          )}

          {/* Payout List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Payout Requests
              </h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const availableMethods = paymentMethods.filter(
                    (m) => m.status !== "suspended" && m.status !== "inactive"
                  );
                  const primaryMethod = availableMethods.find(
                    (m) => m.isPrimary
                  );
                  const methodToSelect = primaryMethod || availableMethods[0];
                  if (methodToSelect) {
                    setSelectedPaymentMethod(methodToSelect._id);
                  }
                  setShowRequestModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-red-200/50 transition-all"
              >
                <FaPlus className="text-[10px]" />
                New Request
              </motion.button>
            </div>

            {payouts.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {payouts.map((payout, index) => (
                  <motion.div
                    key={payout._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center shadow-sm">
                          {getStatusIcon(payout.status)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {payout.requestNumber}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {format(
                              new Date(payout.createdAt),
                              "MMM dd, yyyy • HH:mm"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            €{payout.amount.toFixed(2)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${getStatusColor(
                              payout.status
                            )}`}
                          >
                            {payout.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedPayout(payout);
                              setShowPayoutDetailsModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                          >
                            <FaEye className="text-sm" />
                          </motion.button>
                          {["pending", "under_review"].includes(
                            payout.status
                          ) && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleCancelPayout(payout._id)}
                              className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <FaTimes className="text-sm" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaHistory className="text-gray-400 text-2xl" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  No payout requests
                </p>
                <p className="text-xs text-gray-400">
                  Request your first payout when ready
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-1.5">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fetchPayouts(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                      pagination.page === i + 1
                        ? "bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeSubTab === "methods" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                Payment Methods
              </h3>
              <p className="text-xs text-gray-500">
                Manage your payout destinations
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetPaymentMethodForm();
                setShowPaymentMethodModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-red-200/50 transition-all"
            >
              <FaPlus className="text-[10px]" />
              Add Method
            </motion.button>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={method._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl p-5 border-2 relative hover:shadow-lg transition-all ${
                    method.isPrimary
                      ? "border-[#c6080a] shadow-md shadow-red-100/50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {method.isPrimary && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white text-[9px] px-2 py-1 rounded-full flex items-center gap-1 font-semibold shadow-lg"
                    >
                      <FaStar className="text-[8px]" />
                      Primary
                    </motion.span>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                        {getMethodIcon(method.type)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 capitalize">
                          {method.nickname || method.type.replace("_", " ")}
                        </p>
                        <p className="text-[11px] text-gray-500 capitalize">
                          {method.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingMethod(method);
                          setMethodType(method.type);
                          setMethodNickname(method.nickname || "");
                          if (method.type === "bank_transfer")
                            setBankDetails(method.bankDetails || {});
                          if (method.type === "paypal")
                            setPaypalEmail(method.paypal?.email || "");
                          setShowPaymentMethodModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <FaEdit className="text-sm" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeletePaymentMethod(method._id)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <FaTrash className="text-sm" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Bank Transfer Details */}
                  {method.type === "bank_transfer" && method.bankDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                      {method.bankDetails.accountHolderName && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">
                            Account Holder
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            {method.bankDetails.accountHolderName}
                          </span>
                        </div>
                      )}
                      {method.bankDetails.bankName && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">
                            Bank
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            {method.bankDetails.bankName}
                          </span>
                        </div>
                      )}
                      {method.bankDetails.accountNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">
                            Account No.
                          </span>
                          <span className="text-xs font-medium text-gray-700 font-mono">
                            {method.bankDetails.accountNumber.length > 8
                              ? `${method.bankDetails.accountNumber.slice(
                                  0,
                                  4
                                )}****${method.bankDetails.accountNumber.slice(
                                  -4
                                )}`
                              : method.bankDetails.accountNumber}
                          </span>
                        </div>
                      )}
                      {method.bankDetails.iban && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">
                            IBAN
                          </span>
                          <span className="text-xs font-medium text-gray-700 font-mono">
                            {method.bankDetails.iban.length > 8
                              ? `${method.bankDetails.iban.slice(
                                  0,
                                  4
                                )}****${method.bankDetails.iban.slice(-4)}`
                              : method.bankDetails.iban}
                          </span>
                        </div>
                      )}
                      {method.bankDetails.swiftCode && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">
                            SWIFT/BIC
                          </span>
                          <span className="text-xs font-medium text-gray-700 font-mono">
                            {method.bankDetails.swiftCode}
                          </span>
                        </div>
                      )}
                      {method.bankDetails.country && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">
                            Country
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            {method.bankDetails.country}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PayPal Details */}
                  {method.type === "paypal" && method.paypal && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">
                          PayPal Email
                        </span>
                        <span className="text-xs font-medium text-gray-700">
                          {method.paypal.email}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                        method.status === "active"
                          ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600"
                          : method.status === "pending_verification"
                          ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {method.isVerified && (
                        <FaShieldAlt className="text-[9px]" />
                      )}
                      {method.status === "pending_verification"
                        ? "Pending Verification"
                        : method.status.replace("_", " ")}
                    </span>
                    {method.lastUsedAt && (
                      <span className="text-[9px] text-gray-400">
                        Last used:{" "}
                        {format(new Date(method.lastUsedAt), "MMM dd")}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <RiBankLine className="text-gray-400 text-2xl" />
              </div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">
                No Payment Methods
              </h4>
              <p className="text-xs text-gray-500 mb-5">
                Add a payment method to receive your earnings
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPaymentMethodModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-200/50 transition-all"
              >
                <FaPlus className="text-xs" />
                Add Payment Method
              </motion.button>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeSubTab === "invoices" && (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Invoices</h3>
            <p className="text-xs text-gray-500">
              Download your payout invoices
            </p>
          </div>

          {invoices.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoices.map((invoice, index) => (
                      <motion.tr
                        key={invoice._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center">
                              <TbReceipt className="text-sky-600 text-base" />
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                              {invoice.invoiceNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">
                          {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-gray-900">
                            €{invoice.summary?.totalAmount?.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                              invoice.status === "paid"
                                ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoiceModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                          >
                            <FaEye className="text-sm" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TbReceipt className="text-gray-400 text-2xl" />
              </div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">
                No Invoices Yet
              </h4>
              <p className="text-xs text-gray-500">
                Invoices will appear after completed payouts
              </p>
            </div>
          )}
        </div>
      )}

      {/* Request Payout Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-[#c6080a] via-[#d32f2f] to-[#e63946] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Request Payout
                    </h3>
                    <p className="text-sm text-red-200 mt-0.5">
                      Available: €
                      {(earnings?.withdrawableBalance || 0).toFixed(2)}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowRequestModal(false)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <FaTimes className="text-sm" />
                  </motion.button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Amount (€)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
                      €
                    </span>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="0.00"
                      min="50"
                      max={earnings?.withdrawableBalance || 0}
                      step="0.01"
                      className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-2xl font-bold text-gray-900 focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                    <FaExclamationCircle className="text-amber-500" />
                    Minimum payout: €50
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Payment Method
                  </label>
                  {paymentMethods.filter(
                    (m) => m.status !== "suspended" && m.status !== "inactive"
                  ).length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto shidden">
                      {paymentMethods
                        .filter(
                          (m) =>
                            m.status !== "suspended" && m.status !== "inactive"
                        )
                        .map((method) => (
                          <motion.label
                            key={method._id}
                            whileHover={{ scale: 1 }}
                            whileTap={{ scale: 0.99 }}
                            className={`flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                              selectedPaymentMethod === method._id
                                ? "border-[#c6080a] bg-red-50 shadow-md"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method._id}
                              checked={selectedPaymentMethod === method._id}
                              onChange={(e) =>
                                setSelectedPaymentMethod(e.target.value)
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
                                selectedPaymentMethod === method._id
                                  ? "bg-white"
                                  : "bg-gray-100"
                              }`}
                            >
                              {getMethodIcon(method.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {method.nickname ||
                                  method.type.replace("_", " ")}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {method.type === "bank_transfer" &&
                                  method.bankDetails?.bankName}
                                {method.type === "bank_transfer" &&
                                  method.bankDetails?.accountNumber &&
                                  ` • ****${method.bankDetails.accountNumber.slice(
                                    -4
                                  )}`}
                                {method.type === "paypal" &&
                                  method.paypal?.email}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {method.isPrimary && (
                                <span className="text-[8px] bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white px-2 py-0.5 rounded-full font-semibold">
                                  Primary
                                </span>
                              )}
                              {method.status === "pending_verification" && (
                                <span className="text-[8px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                                  Pending
                                </span>
                              )}
                              {method.status === "active" && (
                                <span className="text-[8px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                                  <FaCheckCircle className="text-[6px]" />
                                  Verified
                                </span>
                              )}
                            </div>
                          </motion.label>
                        ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                      <p className="text-xs text-amber-700 font-semibold mb-1">
                        No payment methods available
                      </p>
                      <button
                        onClick={() => {
                          setShowRequestModal(false);
                          setShowPaymentMethodModal(true);
                        }}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                      >
                        <FaPlus className="text-[8px]" />
                        Add Payment Method
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    placeholder="Add any notes for this request..."
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRequestModal(false)}
                  className="px-5 py-2.5 text-sm text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRequestPayout}
                  disabled={
                    isSubmitting || !payoutAmount || !selectedPaymentMethod
                  }
                  className="px-6 py-2.5 bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-red-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IoRocketSharp className="text-sm" />
                      Submit Request
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Method Modal */}
      <AnimatePresence>
        {showPaymentMethodModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowPaymentMethodModal(false);
              resetPaymentMethodForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto shidden"
            >
              <div className="p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {editingMethod
                        ? "Edit Payment Method"
                        : "Add Payment Method"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Securely add your payout details
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowPaymentMethodModal(false);
                      resetPaymentMethodForm();
                    }}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <FaTimes className="text-sm" />
                  </motion.button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Payment Type Selection */}
                {!editingMethod && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-3">
                      Payment Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          type: "bank_transfer",
                          label: "Bank Transfer",
                          icon: RiBankLine,
                          desc: "Direct bank deposit",
                          color: "sky",
                        },
                        {
                          type: "paypal",
                          label: "PayPal",
                          icon: FaPaypal,
                          desc: "Fast & secure",
                          color: "blue",
                        },
                      ].map((option) => (
                        <motion.button
                          key={option.type}
                          type="button"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setMethodType(option.type)}
                          className={`flex flex-col items-center gap-2 p-4 border-2 rounded-2xl transition-all ${
                            methodType === option.type
                              ? "border-[#c6080a] bg-red-50 shadow-md"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              methodType === option.type
                                ? "bg-white shadow-sm"
                                : "bg-gray-100"
                            }`}
                          >
                            <option.icon
                              className={`text-2xl ${
                                methodType === option.type
                                  ? "text-[#c6080a]"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-sm font-semibold ${
                              methodType === option.type
                                ? "text-[#c6080a]"
                                : "text-gray-700"
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {option.desc}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nickname */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={methodNickname}
                    onChange={(e) => setMethodNickname(e.target.value)}
                    placeholder="e.g., Main Account, Business Account"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Optional - helps identify this method
                  </p>
                </div>

                {/* Bank Transfer Fields */}
                {methodType === "bank_transfer" && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                      <div className="w-6 h-6 bg-sky-100 rounded-lg flex items-center justify-center">
                        <RiBankLine className="text-sky-600 text-sm" />
                      </div>
                      Bank Account Details
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        Account Holder Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankDetails.accountHolderName || ""}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            accountHolderName: e.target.value,
                          })
                        }
                        placeholder="Full name as on bank account"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankDetails.bankName || ""}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            bankName: e.target.value,
                          })
                        }
                        placeholder="e.g., Deutsche Bank, HSBC"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankDetails.accountNumber || ""}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            accountNumber: e.target.value.replace(/\s/g, ""),
                          })
                        }
                        placeholder="Enter account number"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-mono focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          IBAN
                        </label>
                        <input
                          type="text"
                          value={bankDetails.iban || ""}
                          onChange={(e) =>
                            setBankDetails({
                              ...bankDetails,
                              iban: e.target.value
                                .toUpperCase()
                                .replace(/\s/g, ""),
                            })
                          }
                          placeholder="e.g., DE89..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-mono focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          SWIFT/BIC
                        </label>
                        <input
                          type="text"
                          value={bankDetails.swiftCode || ""}
                          onChange={(e) =>
                            setBankDetails({
                              ...bankDetails,
                              swiftCode: e.target.value
                                .toUpperCase()
                                .replace(/\s/g, ""),
                            })
                          }
                          placeholder="e.g., DEUTDEFF"
                          maxLength={11}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-mono focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={bankDetails.country || ""}
                        onChange={(e) =>
                          setBankDetails({
                            ...bankDetails,
                            country: e.target.value,
                          })
                        }
                        placeholder="e.g., Germany, United States"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
                      />
                    </div>

                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaShieldAlt className="text-sky-500 text-sm" />
                      </div>
                      <p className="text-[11px] text-sky-700 leading-relaxed">
                        Your bank details are encrypted and securely stored.
                        We'll verify your account before processing payouts.
                      </p>
                    </div>
                  </div>
                )}

                {/* PayPal Fields */}
                {methodType === "paypal" && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaPaypal className="text-blue-600 text-sm" />
                      </div>
                      PayPal Account Details
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        PayPal Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) =>
                          setPaypalEmail(e.target.value.toLowerCase())
                        }
                        placeholder="your.paypal@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        Must match your PayPal account email
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaPaypal className="text-blue-500 text-sm" />
                      </div>
                      <p className="text-[11px] text-blue-700 leading-relaxed">
                        PayPal payouts are typically processed within 1-2
                        business days. Make sure your PayPal account is
                        verified.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between sticky bottom-0">
                <p className="text-[10px] text-gray-400">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowPaymentMethodModal(false);
                      resetPaymentMethodForm();
                    }}
                    className="px-5 py-2.5 text-sm text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddPaymentMethod}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-red-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck className="text-sm" />
                        {editingMethod ? "Update Method" : "Add Method"}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payout Details Modal */}
      <AnimatePresence>
        {showPayoutDetailsModal && selectedPayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowPayoutDetailsModal(false);
              setSelectedPayout(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-y-auto shidden"
            >
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Payout Details
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${getStatusColor(
                      selectedPayout.status
                    )}`}
                  >
                    {getStatusIcon(selectedPayout.status)}
                    {selectedPayout.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="text-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Amount
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    €{selectedPayout.amount.toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Request #</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {selectedPayout.requestNumber}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Date</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {format(
                        new Date(selectedPayout.createdAt),
                        "MMM dd, yyyy"
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Method</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {selectedPayout.paymentMethod?.type?.replace("_", " ")}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 mb-1">Priority</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {selectedPayout.priority}
                    </p>
                  </div>
                </div>

                {selectedPayout.earnings && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-700 mb-3">
                      Breakdown
                    </p>
                    <div className="space-y-2 bg-gray-50 rounded-xl p-4">
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
                        <span className="font-semibold text-rose-600">
                          -€{selectedPayout.earnings.platformFee?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                        <span>Net Payout</span>
                        <span className="text-emerald-600">
                          €{selectedPayout.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayout.status === "rejected" &&
                  selectedPayout.rejectionReason && (
                    <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-2xl">
                      <p className="text-xs font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                        <FaTimesCircle />
                        Rejection Reason
                      </p>
                      <p className="text-sm text-rose-600">
                        {selectedPayout.rejectionReason}
                      </p>
                    </div>
                  )}

                {/* Transaction Details (if completed) */}
                {selectedPayout.transaction &&
                  (selectedPayout.transaction.transactionId ||
                    selectedPayout.transaction.referenceNumber) && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-bold text-gray-700 mb-3">
                        Transaction Details
                      </p>
                      <div className="space-y-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                        {selectedPayout.transaction.transactionId && (
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-700">
                              Transaction ID
                            </span>
                            <span className="font-mono font-semibold text-emerald-800">
                              {selectedPayout.transaction.transactionId}
                            </span>
                          </div>
                        )}
                        {selectedPayout.transaction.referenceNumber && (
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-700">
                              Reference Number
                            </span>
                            <span className="font-mono font-semibold text-emerald-800">
                              {selectedPayout.transaction.referenceNumber}
                            </span>
                          </div>
                        )}
                        {selectedPayout.transaction.confirmedAt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-emerald-700">
                              Completed At
                            </span>
                            <span className="font-semibold text-emerald-800">
                              {format(
                                new Date(
                                  selectedPayout.transaction.confirmedAt
                                ),
                                "MMM dd, yyyy 'at' HH:mm"
                              )}
                            </span>
                          </div>
                        )}
                        {selectedPayout.transaction.receiptUrl && (
                          <div className="flex justify-between text-sm pt-2 border-t border-emerald-200">
                            <span className="text-emerald-700">Receipt</span>
                            <a
                              href={selectedPayout.transaction.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-semibold"
                            >
                              View Receipt{" "}
                              <TbArrowUpRight className="text-sm" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Payment Proof Screenshots */}
                {selectedPayout.transaction?.proofOfPayment &&
                  selectedPayout.transaction.proofOfPayment.length > 0 && (
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-bold text-gray-700 mb-3">
                        Payment Proof Screenshots
                      </p>
                      <div className="grid grid-cols-2 gap-3">
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
                      <p className="text-[10px] text-gray-400 mt-2 text-center">
                        Click to view full screen
                      </p>
                    </div>
                  )}

                {/* Admin Notes */}
                {selectedPayout.adminNotes && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-700 mb-2">
                      Admin Notes
                    </p>
                    <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedPayout.adminNotes}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowPayoutDetailsModal(false);
                    setSelectedPayout(null);
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Close
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

      {/* Invoice Modal - Modern Professional Design */}
      <AnimatePresence>
        {showInvoiceModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowInvoiceModal(false);
              setSelectedInvoice(null);
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
              {/* Modal Header with Actions */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-5 border-b border-gray-100 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#c6080a] to-[#e63946] rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                    <FaFileInvoice className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Invoice</h3>
                    <p className="text-sm text-gray-500 font-mono">
                      {selectedInvoice.invoiceNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={printInvoice}
                    className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Print Invoice"
                  >
                    <MdPrint className="text-xl" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadInvoicePdf}
                    disabled={isGeneratingPdf}
                    className="p-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Download PDF"
                  >
                    {isGeneratingPdf ? (
                      <FaSpinner className="text-xl animate-spin" />
                    ) : (
                      <TbFileDownload className="text-xl" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowInvoiceModal(false);
                      setSelectedInvoice(null);
                    }}
                    className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FaTimes className="text-lg" />
                  </motion.button>
                </div>
              </div>

              {/* Invoice Content - For PDF Generation */}
              <div
                ref={invoiceRef}
                data-invoice-content
                className="bg-white"
                style={{ minWidth: "600px" }}
              >
                {/* Invoice Header */}
                <div className="p-8 bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">
                        INVOICE
                      </h1>
                      <p className="text-white/80 mt-1 font-mono text-lg">
                        {selectedInvoice.invoiceNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-2">
                        <span className="text-2xl font-bold">DM</span>
                      </div>
                      <p className="text-white/90 font-semibold">
                        Darloo Marketplace
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="px-8 -mt-4">
                  <span
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold shadow-lg ${
                      selectedInvoice.status === "paid"
                        ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                        : "bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
                    }`}
                  >
                    {selectedInvoice.status === "paid" ? (
                      <>
                        <FaCheckCircle className="text-white" />
                        PAID
                      </>
                    ) : (
                      <>
                        <FaClock />
                        {selectedInvoice.status?.toUpperCase()}
                      </>
                    )}
                  </span>
                </div>

                {/* From / To Section */}
                <div className="p-8 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        From
                      </p>
                      <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-100">
                        <p className="font-bold text-gray-900 text-lg">
                          {selectedInvoice.details?.from?.companyName ||
                            "Darloo Marketplace"}
                        </p>
                        {selectedInvoice.details?.from?.address && (
                          <div className="flex items-start gap-2 mt-2 text-gray-600 text-sm">
                            <MdLocationOn className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <span>{selectedInvoice.details.from.address}</span>
                          </div>
                        )}
                        {selectedInvoice.details?.from?.email && (
                          <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                            <MdOutlineEmail className="text-gray-400" />
                            <span>{selectedInvoice.details.from.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Bill To
                      </p>
                      <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-100">
                        <p className="font-bold text-gray-900 text-lg">
                          {selectedInvoice.details?.to?.storeName ||
                            seller?.storeName}
                        </p>
                        {selectedInvoice.details?.to?.address && (
                          <div className="flex items-start gap-2 mt-2 text-gray-600 text-sm">
                            <MdLocationOn className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <span>{selectedInvoice.details.to.address}</span>
                          </div>
                        )}
                        {selectedInvoice.details?.to?.email && (
                          <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                            <MdOutlineEmail className="text-gray-400" />
                            <span>{selectedInvoice.details.to.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="px-8 pb-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                        Issue Date
                      </p>
                      <p className="font-bold text-gray-900">
                        {format(
                          new Date(selectedInvoice.issueDate),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                      <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mb-1">
                        Due Date
                      </p>
                      <p className="font-bold text-gray-900">
                        {selectedInvoice.dueDate
                          ? format(
                              new Date(selectedInvoice.dueDate),
                              "MMM dd, yyyy"
                            )
                          : format(
                              new Date(selectedInvoice.issueDate),
                              "MMM dd, yyyy"
                            )}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                        Period
                      </p>
                      <p className="font-bold text-gray-900 text-sm">
                        {format(
                          new Date(selectedInvoice.periodStart),
                          "MMM dd"
                        )}{" "}
                        -{" "}
                        {format(
                          new Date(selectedInvoice.periodEnd),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="px-8 pb-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-white">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">
                              Gross Earnings
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Total earnings from sales
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900">
                            €
                            {selectedInvoice.summary?.subtotal?.toFixed(2) ||
                              "0.00"}
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-700">
                              Platform Fee (
                              {selectedInvoice.summary?.platformFeePercentage ||
                                10}
                              %)
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Service & transaction fees
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-rose-600">
                            -€
                            {selectedInvoice.summary?.platformFee?.toFixed(2) ||
                              "0.00"}
                          </td>
                        </tr>
                        <tr className="bg-gradient-to-r from-emerald-50 to-green-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-emerald-800">
                              Withdrawal Amount
                            </p>
                            <p className="text-sm text-emerald-600 mt-0.5">
                              Amount transferred to your account
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600 text-lg">
                            €
                            {selectedInvoice.summary?.totalAmount?.toFixed(2) ||
                              "0.00"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total Section */}
                <div className="px-8 pb-8">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-3 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="flex justify-between text-sm text-gray-600 pb-2">
                        <span>Gross Earnings</span>
                        <span className="font-semibold">
                          €
                          {selectedInvoice.summary?.subtotal?.toFixed(2) ||
                            "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 pb-2">
                        <span>
                          Platform Fee (
                          {selectedInvoice.summary?.platformFeePercentage || 10}
                          %)
                        </span>
                        <span className="font-semibold text-rose-600">
                          -€
                          {selectedInvoice.summary?.platformFee?.toFixed(2) ||
                            "0.00"}
                        </span>
                      </div>
                      <div className="h-px bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200" />
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-gray-900">
                          Withdrawal:
                        </span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                          €
                          {selectedInvoice.summary?.totalAmount?.toFixed(2) ||
                            "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {selectedInvoice.payoutRequest?.paymentMethod && (
                  <div className="px-8 pb-8">
                    <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <RiBankLine className="text-lg" />
                        Payment Details
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-600">Payment Method</p>
                          <p className="font-bold text-gray-900 capitalize">
                            {selectedInvoice.payoutRequest.paymentMethod.type?.replace(
                              "_",
                              " "
                            )}
                          </p>
                        </div>
                        {selectedInvoice.payoutRequest.paymentMethod.bankDetails
                          ?.bankName && (
                          <div>
                            <p className="text-blue-600">Bank Name</p>
                            <p className="font-bold text-gray-900">
                              {
                                selectedInvoice.payoutRequest.paymentMethod
                                  .bankDetails.bankName
                              }
                            </p>
                          </div>
                        )}
                        {selectedInvoice.payoutRequest.paymentMethod.bankDetails
                          ?.iban && (
                          <div className="col-span-2">
                            <p className="text-blue-600">IBAN</p>
                            <p className="font-mono font-bold text-gray-900">
                              {
                                selectedInvoice.payoutRequest.paymentMethod
                                  .bankDetails.iban
                              }
                            </p>
                          </div>
                        )}
                        {selectedInvoice.payoutRequest.paymentMethod
                          .paypalEmail && (
                          <div className="col-span-2">
                            <p className="text-blue-600">PayPal Email</p>
                            <p className="font-bold text-gray-900">
                              {
                                selectedInvoice.payoutRequest.paymentMethod
                                  .paypalEmail
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Reference (if completed) */}
                {selectedInvoice.payoutRequest?.transaction?.transactionId && (
                  <div className="px-8 pb-8">
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                      <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <IoCheckmarkDoneCircle className="text-lg" />
                        Transaction Completed
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-emerald-600">Transaction ID</p>
                          <p className="font-mono font-bold text-gray-900">
                            {
                              selectedInvoice.payoutRequest.transaction
                                .transactionId
                            }
                          </p>
                        </div>
                        {selectedInvoice.payoutRequest.transaction
                          .referenceNumber && (
                          <div>
                            <p className="text-emerald-600">Reference Number</p>
                            <p className="font-mono font-bold text-gray-900">
                              {
                                selectedInvoice.payoutRequest.transaction
                                  .referenceNumber
                              }
                            </p>
                          </div>
                        )}
                        {selectedInvoice.payoutRequest.transaction
                          .confirmedAt && (
                          <div>
                            <p className="text-emerald-600">Payment Date</p>
                            <p className="font-bold text-gray-900">
                              {format(
                                new Date(
                                  selectedInvoice.payoutRequest.transaction.confirmedAt
                                ),
                                "MMM dd, yyyy 'at' HH:mm"
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Thank you for being a valued seller partner!
                    </p>
                    <p className="text-xs text-gray-400">
                      For questions about this invoice, please contact
                      support@darlooshop.com
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
                      <span>
                        Darloo Marketplace © {new Date().getFullYear()}
                      </span>
                      <span>•</span>
                      <span>All rights reserved</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 p-5 bg-white/95 backdrop-blur-sm border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaFileInvoice className="text-gray-400" />
                  <span>Generated on {format(new Date(), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={printInvoice}
                    className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <MdPrint />
                    Print
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadInvoicePdf}
                    disabled={isGeneratingPdf}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <TbFileDownload className="text-lg" />
                        Download PDF
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayoutsTab;
