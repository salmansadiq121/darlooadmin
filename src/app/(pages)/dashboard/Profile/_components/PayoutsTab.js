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
} from "react-icons/fa";
import { TbCurrencyEuro, TbArrowUpRight, TbArrowDownRight, TbReceipt } from "react-icons/tb";
import { BsBank2, BsGraphUpArrow, BsCashCoin } from "react-icons/bs";
import { HiOutlineCash, HiOutlineTrendingUp } from "react-icons/hi";
import { RiSecurePaymentLine, RiBankLine } from "react-icons/ri";
import { IoWalletOutline } from "react-icons/io5";

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
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingMethod, setEditingMethod] = useState(null);

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

  const fetchPayouts = useCallback(async (page = 1) => {
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
  }, [seller?._id, token]);

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
        toast.success("Payout request submitted!");
        setShowRequestModal(false);
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
      if (bankDetails.accountNumber.replace(/\D/g, '').length < 6) {
        toast.error("Please enter a valid account number");
        return;
      }
      // Validate IBAN format if provided
      if (bankDetails.iban && bankDetails.iban.length < 15) {
        toast.error("Please enter a valid IBAN");
        return;
      }
      // Validate SWIFT code format if provided (8-11 characters)
      if (bankDetails.swiftCode && (bankDetails.swiftCode.length < 8 || bankDetails.swiftCode.length > 11)) {
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
        ? await axios.put(url, payload, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });

      if (data.success) {
        toast.success(editingMethod ? "Payment method updated successfully!" : "Payment method added successfully!");
        setShowPaymentMethodModal(false);
        resetPaymentMethodForm();
        fetchPaymentMethods();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save payment method");
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
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      under_review: "bg-sky-50 text-sky-700 border-sky-200",
      approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      processing: "bg-violet-50 text-violet-700 border-violet-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-rose-50 text-rose-700 border-rose-200",
      cancelled: "bg-slate-50 text-slate-700 border-slate-200",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Sub Navigation */}
      <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-xl w-fit">
        {[
          { id: "overview", label: "Overview", icon: BsGraphUpArrow },
          { id: "payouts", label: "History", icon: FaHistory },
          { id: "methods", label: "Payment Methods", icon: RiBankLine },
          { id: "invoices", label: "Invoices", icon: TbReceipt },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeSubTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="text-sm" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeSubTab === "overview" && (
        <div className="space-y-5">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Total Earnings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 rounded-xl p-4"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-sky-100 uppercase tracking-wide">Total Earnings</span>
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <BsCashCoin className="text-white text-sm" />
                  </div>
                </div>
                <p className="text-[22px] font-bold text-white leading-tight">
                  €{(earnings?.totalEarnings || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-sky-200 mt-1">{earnings?.totalOrders || 0} orders</p>
              </div>
            </motion.div>

            {/* Platform Fee */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 rounded-xl p-4"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-orange-100 uppercase tracking-wide">Platform Fee</span>
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <RiSecurePaymentLine className="text-white text-sm" />
                  </div>
                </div>
                <p className="text-[22px] font-bold text-white leading-tight">
                  €{(earnings?.platformFee || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-orange-200 mt-1">{earnings?.platformFeePercentage || 10}% commission</p>
              </div>
            </motion.div>

            {/* Available Balance */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-500 to-green-500 rounded-xl p-4"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-emerald-100 uppercase tracking-wide">Available</span>
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <IoWalletOutline className="text-white text-sm" />
                  </div>
                </div>
                <p className="text-[22px] font-bold text-white leading-tight">
                  €{(earnings?.withdrawableBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-emerald-200 mt-1">Ready to withdraw</p>
              </div>
            </motion.div>

            {/* Total Paid Out */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-500 to-purple-500 rounded-xl p-4"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-violet-100 uppercase tracking-wide">Paid Out</span>
                  <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                    <HiOutlineCash className="text-white text-sm" />
                  </div>
                </div>
                <p className="text-[22px] font-bold text-white leading-tight">
                  €{(earnings?.totalPaidOut || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-violet-200 mt-1">Lifetime payouts</p>
              </div>
            </motion.div>
          </div>

          {/* Secondary Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly Performance Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-gray-800">This Month</h3>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  (earnings?.monthlyGrowth || 0) >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}>
                  {(earnings?.monthlyGrowth || 0) >= 0 ? <TbArrowUpRight className="text-xs" /> : <TbArrowDownRight className="text-xs" />}
                  {Math.abs(earnings?.monthlyGrowth || 0).toFixed(1)}%
                </div>
              </div>
              <p className="text-[24px] font-bold text-gray-900">
                €{(earnings?.monthlyEarnings || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-[12px] text-gray-500">Last month</span>
                <span className="text-[13px] font-medium text-gray-700">
                  €{(earnings?.lastMonthEarnings || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm lg:col-span-2"
            >
              <h3 className="text-[13px] font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    // Auto-select primary or first available payment method
                    const availableMethods = paymentMethods.filter(m => m.status !== "suspended" && m.status !== "inactive");
                    const primaryMethod = availableMethods.find(m => m.isPrimary);
                    const methodToSelect = primaryMethod || availableMethods[0];
                    if (methodToSelect) {
                      setSelectedPaymentMethod(methodToSelect._id);
                    }
                    setShowRequestModal(true);
                  }}
                  disabled={!earnings?.withdrawableBalance || earnings.withdrawableBalance < 50}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center gap-2">
                    <FaMoneyBillWave className="text-base" />
                    <span className="text-[13px] font-medium">Request Payout</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Min €50</span>
                </button>

                <button
                  onClick={() => setShowPaymentMethodModal(true)}
                  className="flex items-center justify-between p-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <RiBankLine className="text-base" />
                    <span className="text-[13px] font-medium">Add Payment</span>
                  </div>
                  <FaPlus className="text-xs text-gray-400" />
                </button>
              </div>

              {/* Pending Amount Alert */}
              {(earnings?.pendingAmount || 0) > 0 && (
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                  <FaExclamationCircle className="text-amber-500 text-sm" />
                  <span className="text-[12px] text-amber-700 font-medium">
                    €{earnings.pendingAmount.toLocaleString()} pending approval
                  </span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-[13px] font-semibold text-gray-800">Recent Transactions</h3>
              <button
                onClick={() => setActiveSubTab("payouts")}
                className="text-[12px] text-[#c6080a] hover:text-[#a50709] font-medium"
              >
                View All
              </button>
            </div>

            {earnings?.recentTransactions?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {earnings.recentTransactions.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FaArrowDown className="text-emerald-600 text-xs" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-800">Order #{transaction.orderNumber}</p>
                        <p className="text-[11px] text-gray-400">
                          {format(new Date(transaction.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <span className="text-[13px] font-semibold text-emerald-600">
                      +€{transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaHistory className="text-gray-400 text-lg" />
                </div>
                <p className="text-[13px] text-gray-500">No transactions yet</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Payout History Tab */}
      {activeSubTab === "payouts" && (
        <div className="space-y-4">
          {/* Status Pills */}
          {statusSummary && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusSummary).map(([status, data]) => (
                data.count > 0 && (
                  <div key={status} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border ${getStatusColor(status)}`}>
                    <span className="capitalize">{status.replace("_", " ")}</span>
                    <span className="ml-1.5 opacity-70">{data.count}</span>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Payout List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-gray-800">Payout Requests</h3>
              <button
                onClick={() => {
                  // Auto-select primary or first available payment method
                  const availableMethods = paymentMethods.filter(m => m.status !== "suspended" && m.status !== "inactive");
                  const primaryMethod = availableMethods.find(m => m.isPrimary);
                  const methodToSelect = primaryMethod || availableMethods[0];
                  if (methodToSelect) {
                    setSelectedPaymentMethod(methodToSelect._id);
                  }
                  setShowRequestModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c6080a] text-white rounded-lg text-[12px] font-medium hover:bg-[#a50709] transition-colors"
              >
                <FaPlus className="text-[10px]" />
                New Request
              </button>
            </div>

            {payouts.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {payouts.map((payout) => (
                  <div key={payout._id} className="p-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getStatusIcon(payout.status)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800">{payout.requestNumber}</p>
                          <p className="text-[11px] text-gray-400">
                            {format(new Date(payout.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[16px] font-bold text-gray-900">€{payout.amount.toFixed(2)}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(payout.status)}`}>
                            {payout.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setSelectedPayout(payout); setShowPayoutDetailsModal(true); }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <FaEye className="text-xs" />
                          </button>
                          {["pending", "under_review"].includes(payout.status) && (
                            <button
                              onClick={() => handleCancelPayout(payout._id)}
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaHistory className="text-gray-400 text-lg" />
                </div>
                <p className="text-[13px] font-medium text-gray-700 mb-1">No payout requests</p>
                <p className="text-[11px] text-gray-400">Request your first payout when ready</p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="p-3 border-t border-gray-100 flex items-center justify-center gap-1">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => fetchPayouts(i + 1)}
                    className={`w-7 h-7 rounded-lg text-[11px] font-medium ${
                      pagination.page === i + 1
                        ? "bg-[#c6080a] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeSubTab === "methods" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-800">Payment Methods</h3>
              <p className="text-[11px] text-gray-500">Manage payout destinations</p>
            </div>
            <button
              onClick={() => { resetPaymentMethodForm(); setShowPaymentMethodModal(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c6080a] text-white rounded-lg text-[12px] font-medium hover:bg-[#a50709] transition-colors"
            >
              <FaPlus className="text-[10px]" />
              Add Method
            </button>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-white rounded-xl p-4 border-2 relative ${
                    method.isPrimary ? "border-[#c6080a]" : "border-gray-100"
                  }`}
                >
                  {method.isPrimary && (
                    <span className="absolute -top-2 -right-2 bg-[#c6080a] text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-medium">
                      <FaStar className="text-[7px]" />
                      Primary
                    </span>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                        {getMethodIcon(method.type)}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800 capitalize">
                          {method.nickname || method.type.replace("_", " ")}
                        </p>
                        <p className="text-[11px] text-gray-500 capitalize">
                          {method.type.replace("_", " ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMethod(method);
                          setMethodType(method.type);
                          setMethodNickname(method.nickname || "");
                          if (method.type === "bank_transfer") setBankDetails(method.bankDetails || {});
                          if (method.type === "paypal") setPaypalEmail(method.paypal?.email || "");
                          setShowPaymentMethodModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDeletePaymentMethod(method._id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Bank Transfer Details */}
                  {method.type === "bank_transfer" && method.bankDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      {method.bankDetails.accountHolderName && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Account Holder</span>
                          <span className="text-[11px] font-medium text-gray-700">{method.bankDetails.accountHolderName}</span>
                        </div>
                      )}
                      {method.bankDetails.bankName && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Bank</span>
                          <span className="text-[11px] font-medium text-gray-700">{method.bankDetails.bankName}</span>
                        </div>
                      )}
                      {method.bankDetails.accountNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Account No.</span>
                          <span className="text-[11px] font-medium text-gray-700 font-mono">
                            {method.bankDetails.accountNumber.length > 8
                              ? `${method.bankDetails.accountNumber.slice(0, 4)}****${method.bankDetails.accountNumber.slice(-4)}`
                              : method.bankDetails.accountNumber}
                          </span>
                        </div>
                      )}
                      {method.bankDetails.iban && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">IBAN</span>
                          <span className="text-[11px] font-medium text-gray-700 font-mono">
                            {method.bankDetails.iban.length > 8
                              ? `${method.bankDetails.iban.slice(0, 4)}****${method.bankDetails.iban.slice(-4)}`
                              : method.bankDetails.iban}
                          </span>
                        </div>
                      )}
                      {method.bankDetails.swiftCode && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">SWIFT/BIC</span>
                          <span className="text-[11px] font-medium text-gray-700 font-mono">{method.bankDetails.swiftCode}</span>
                        </div>
                      )}
                      {method.bankDetails.country && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Country</span>
                          <span className="text-[11px] font-medium text-gray-700">{method.bankDetails.country}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PayPal Details */}
                  {method.type === "paypal" && method.paypal && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">PayPal Email</span>
                        <span className="text-[11px] font-medium text-gray-700">{method.paypal.email}</span>
                      </div>
                    </div>
                  )}

                  {/* Stripe Details */}
                  {method.type === "stripe" && method.stripe && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      {method.stripe.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Email</span>
                          <span className="text-[11px] font-medium text-gray-700">{method.stripe.email}</span>
                        </div>
                      )}
                      {method.stripe.accountId && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">Account ID</span>
                          <span className="text-[11px] font-medium text-gray-700 font-mono">{method.stripe.accountId}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wise Details */}
                  {method.type === "wise" && method.wise && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Wise Email</span>
                        <span className="text-[11px] font-medium text-gray-700">{method.wise.email}</span>
                      </div>
                    </div>
                  )}

                  {/* Payoneer Details */}
                  {method.type === "payoneer" && method.payoneer && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">Payoneer Email</span>
                        <span className="text-[11px] font-medium text-gray-700">{method.payoneer.email}</span>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                      method.status === "active"
                        ? "bg-emerald-50 text-emerald-600"
                        : method.status === "pending_verification"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {method.isVerified && <FaShieldAlt className="text-[8px]" />}
                      {method.status === "pending_verification" ? "Pending Verification" : method.status.replace("_", " ")}
                    </span>
                    {method.lastUsedAt && (
                      <span className="text-[9px] text-gray-400">
                        Last used: {format(new Date(method.lastUsedAt), "MMM dd")}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <RiBankLine className="text-gray-400 text-xl" />
              </div>
              <h4 className="text-[13px] font-semibold text-gray-800 mb-1">No Payment Methods</h4>
              <p className="text-[11px] text-gray-500 mb-4">Add a payment method to receive earnings</p>
              <button
                onClick={() => setShowPaymentMethodModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c6080a] text-white rounded-lg text-[12px] font-medium hover:bg-[#a50709] transition-colors"
              >
                <FaPlus className="text-[10px]" />
                Add Payment Method
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeSubTab === "invoices" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-gray-800">Invoices</h3>
            <p className="text-[11px] text-gray-500">Download payout invoices</p>
          </div>

          {invoices.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase">Invoice</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center">
                            <TbReceipt className="text-sky-600 text-sm" />
                          </div>
                          <span className="text-[12px] font-medium text-gray-800">{invoice.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[11px] text-gray-500">
                        {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-[13px] font-semibold text-gray-900">
                          €{invoice.summary?.totalAmount?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${
                          invoice.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => { setSelectedInvoice(invoice); setShowInvoiceModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <FaEye className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-10 text-center border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TbReceipt className="text-gray-400 text-xl" />
              </div>
              <h4 className="text-[13px] font-semibold text-gray-800 mb-1">No Invoices Yet</h4>
              <p className="text-[11px] text-gray-500">Invoices appear after completed payouts</p>
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
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl w-full max-w-sm shadow-xl"
            >
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-[14px] font-semibold text-gray-900">Request Payout</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Available: €{(earnings?.withdrawableBalance || 0).toFixed(2)}
                </p>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Amount (€)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-400">€</span>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="0.00"
                      min="50"
                      max={earnings?.withdrawableBalance || 0}
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg text-[13px] focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Minimum: €50</p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Payment Method</label>
                  {paymentMethods.filter(m => m.status !== "suspended" && m.status !== "inactive").length > 0 ? (
                    <div className="space-y-2">
                      {paymentMethods.filter(m => m.status !== "suspended" && m.status !== "inactive").map((method) => (
                        <label
                          key={method._id}
                          className={`flex items-center gap-2.5 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedPaymentMethod === method._id
                              ? "border-[#c6080a] bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method._id}
                            checked={selectedPaymentMethod === method._id}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="sr-only"
                          />
                          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getMethodIcon(method.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-gray-800 truncate">
                              {method.nickname || method.type.replace("_", " ")}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {method.type === "bank_transfer" && method.bankDetails?.bankName}
                              {method.type === "bank_transfer" && method.bankDetails?.accountNumber && ` • ****${method.bankDetails.accountNumber.slice(-4)}`}
                              {method.type === "paypal" && method.paypal?.email}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {method.isPrimary && (
                              <span className="text-[8px] bg-[#c6080a] text-white px-1.5 py-0.5 rounded-full font-medium">Primary</span>
                            )}
                            {method.status === "pending_verification" && (
                              <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Pending</span>
                            )}
                            {method.status === "active" && (
                              <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                <FaCheckCircle className="text-[6px]" />
                                Verified
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-[11px] text-amber-700 font-medium">No payment methods available</p>
                      <button
                        onClick={() => { setShowRequestModal(false); setShowPaymentMethodModal(true); }}
                        className="text-[11px] font-medium text-amber-800 hover:text-amber-900 mt-1 flex items-center gap-1"
                      >
                        <FaPlus className="text-[8px]" />
                        Add Payment Method →
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Notes (optional)</label>
                  <textarea
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-[12px] text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestPayout}
                  disabled={isSubmitting || !payoutAmount || !selectedPaymentMethod}
                  className="px-4 py-2 bg-[#c6080a] text-white text-[12px] font-medium rounded-lg hover:bg-[#a50709] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting && <FaSpinner className="animate-spin text-xs" />}
                  Submit
                </button>
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
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowPaymentMethodModal(false); resetPaymentMethodForm(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-gray-900">
                    {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
                  </h3>
                  <button
                    onClick={() => { setShowPaymentMethodModal(false); resetPaymentMethodForm(); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Add your payout destination details</p>
              </div>

              <div className="p-4 space-y-4">
                {/* Payment Type Selection */}
                {!editingMethod && (
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-2">
                      Payment Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: "bank_transfer", label: "Bank Transfer", icon: RiBankLine, desc: "Direct to bank" },
                        { type: "paypal", label: "PayPal", icon: FaPaypal, desc: "PayPal account" },
                      ].map((option) => (
                        <button
                          key={option.type}
                          type="button"
                          onClick={() => setMethodType(option.type)}
                          className={`flex flex-col items-center gap-1.5 p-3 border-2 rounded-xl transition-all ${
                            methodType === option.type
                              ? "border-[#c6080a] bg-red-50"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <option.icon className={`text-xl ${methodType === option.type ? "text-[#c6080a]" : "text-gray-400"}`} />
                          <span className={`text-[12px] font-medium ${methodType === option.type ? "text-[#c6080a]" : "text-gray-700"}`}>
                            {option.label}
                          </span>
                          <span className="text-[9px] text-gray-400">{option.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nickname */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Nickname</label>
                  <input
                    type="text"
                    value={methodNickname}
                    onChange={(e) => setMethodNickname(e.target.value)}
                    placeholder="e.g., Main Account, Business Account"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                  />
                  <p className="text-[9px] text-gray-400 mt-1">Optional - helps identify this method</p>
                </div>

                {/* Bank Transfer Fields */}
                {methodType === "bank_transfer" && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <RiBankLine className="text-sky-600" />
                      Bank Account Details
                    </p>

                    {/* Account Holder Name */}
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1.5">
                        Account Holder Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankDetails.accountHolderName || ""}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                        placeholder="Full name as on bank account"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      />
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1.5">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankDetails.bankName || ""}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                        placeholder="e.g., Deutsche Bank, HSBC"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      />
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1.5">
                        Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankDetails.accountNumber || ""}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\s/g, '') })}
                        placeholder="Enter account number"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] font-mono focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      />
                    </div>

                    {/* IBAN & SWIFT */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 mb-1.5">IBAN</label>
                        <input
                          type="text"
                          value={bankDetails.iban || ""}
                          onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value.toUpperCase().replace(/\s/g, '') })}
                          placeholder="e.g., DE89..."
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] font-mono focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 mb-1.5">SWIFT/BIC</label>
                        <input
                          type="text"
                          value={bankDetails.swiftCode || ""}
                          onChange={(e) => setBankDetails({ ...bankDetails, swiftCode: e.target.value.toUpperCase().replace(/\s/g, '') })}
                          placeholder="e.g., DEUTDEFF"
                          maxLength={11}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] font-mono focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Routing Number */}
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Routing Number</label>
                      <input
                        type="text"
                        value={bankDetails.routingNumber || ""}
                        onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value.replace(/\s/g, '') })}
                        placeholder="For US banks (optional)"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] font-mono focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Country</label>
                      <input
                        type="text"
                        value={bankDetails.country || ""}
                        onChange={(e) => setBankDetails({ ...bankDetails, country: e.target.value })}
                        placeholder="e.g., Germany, United States"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      />
                    </div>

                    {/* Info Box */}
                    <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 flex items-start gap-2">
                      <FaShieldAlt className="text-sky-500 text-xs mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-sky-700">
                        Your bank details are encrypted and securely stored. We'll verify your account before processing payouts.
                      </p>
                    </div>
                  </div>
                )}

                {/* PayPal Fields */}
                {methodType === "paypal" && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
                      <FaPaypal className="text-blue-600" />
                      PayPal Account Details
                    </p>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1.5">
                        PayPal Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value.toLowerCase())}
                        placeholder="your.paypal@email.com"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      />
                      <p className="text-[9px] text-gray-400 mt-1">Must match your PayPal account email</p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                      <FaPaypal className="text-blue-500 text-xs mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-blue-700">
                        Payouts to PayPal are typically processed within 1-2 business days. Make sure your PayPal account is verified.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-between sticky bottom-0 bg-white z-10">
                <p className="text-[9px] text-gray-400">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowPaymentMethodModal(false); resetPaymentMethodForm(); }}
                    className="px-4 py-2 text-[12px] text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPaymentMethod}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#c6080a] text-white text-[12px] font-medium rounded-lg hover:bg-[#a50709] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isSubmitting && <FaSpinner className="animate-spin text-xs" />}
                    {editingMethod ? "Update Method" : "Add Method"}
                  </button>
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
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowPayoutDetailsModal(false); setSelectedPayout(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-gray-900">Payout Details</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(selectedPayout.status)}`}>
                    {getStatusIcon(selectedPayout.status)}
                    {selectedPayout.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="text-center py-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Amount</p>
                  <p className="text-[28px] font-bold text-gray-900">€{selectedPayout.amount.toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Request #</p>
                    <p className="text-[12px] font-medium">{selectedPayout.requestNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Date</p>
                    <p className="text-[12px] font-medium">{format(new Date(selectedPayout.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Method</p>
                    <p className="text-[12px] font-medium capitalize">{selectedPayout.paymentMethod?.type?.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Priority</p>
                    <p className="text-[12px] font-medium capitalize">{selectedPayout.priority}</p>
                  </div>
                </div>

                {selectedPayout.earnings && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[11px] font-semibold text-gray-700 mb-2">Breakdown</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Gross</span>
                        <span>€{selectedPayout.earnings.totalEarnings?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">Fee ({selectedPayout.earnings.platformFeePercentage}%)</span>
                        <span className="text-rose-600">-€{selectedPayout.earnings.platformFee?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[12px] font-semibold pt-1.5 border-t">
                        <span>Net</span>
                        <span>€{selectedPayout.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayout.status === "rejected" && selectedPayout.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <p className="text-[10px] font-semibold text-rose-700 mb-0.5">Rejection Reason</p>
                    <p className="text-[11px] text-rose-600">{selectedPayout.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => { setShowPayoutDetailsModal(false); setSelectedPayout(null); }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-[12px] font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold text-gray-900">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-[10px] text-gray-500">{format(new Date(selectedInvoice.issueDate), "MMM dd, yyyy")}</p>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${
                  selectedInvoice.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"
                }`}>
                  {selectedInvoice.status}
                </span>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 mb-1">From</p>
                    <p className="text-[12px] font-medium text-gray-800">{selectedInvoice.details?.from?.companyName || "Darloo Shop"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 mb-1">To</p>
                    <p className="text-[12px] font-medium text-gray-800">{selectedInvoice.details?.to?.storeName || seller?.storeName}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] text-gray-500 mb-0.5">Period</p>
                  <p className="text-[11px] font-medium">
                    {format(new Date(selectedInvoice.periodStart), "MMM dd, yyyy")} - {format(new Date(selectedInvoice.periodEnd), "MMM dd, yyyy")}
                  </p>
                </div>

                <div className="space-y-1.5 border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Subtotal</span>
                    <span>€{selectedInvoice.summary?.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Platform Fee ({selectedInvoice.summary?.platformFeePercentage || 10}%)</span>
                    <span className="text-rose-600">-€{selectedInvoice.summary?.platformFee?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>€{selectedInvoice.summary?.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
                {selectedInvoice.pdfUrl && (
                  <a
                    href={selectedInvoice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sky-600 text-[12px] font-medium hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <FaDownload className="text-xs" />
                    Download
                  </a>
                )}
                <button
                  onClick={() => { setShowInvoiceModal(false); setSelectedInvoice(null); }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-[12px] font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayoutsTab;
