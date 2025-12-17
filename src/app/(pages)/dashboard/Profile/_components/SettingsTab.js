"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaCog,
  FaInfoCircle,
  FaShieldAlt,
  FaUserCheck,
  FaEdit,
  FaCheckCircle,
} from "react-icons/fa";

export default function SettingsTab({ seller, onEdit }) {
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

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-lg">
            <FaCog className="text-lg" />
          </div>
          <div>
            <h2 className="text-base sm:text-2xl font-bold text-gray-900">
              Account Settings
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Manage your seller account and verification status
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <FaShieldAlt className="text-blue-600 text-base" />
              </div>
              <h3 className="text-xs sm:text-xl font-bold text-gray-900">
                Verification Status
              </h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                {getStatusBadge()}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Status</span>
                  <span
                    className={`font-semibold ${
                      seller.isActive
                        ? "text-emerald-600"
                        : "text-gray-500"
                    }`}
                  >
                    {seller.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verification</span>
                  <span className="font-semibold capitalize">
                    {seller.verificationStatus || "pending"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Store Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <FaInfoCircle className="text-purple-600 text-base" />
              </div>
              <h3 className="text-xs sm:text-xl font-bold text-gray-900">
                Store Information
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Store Name</span>
                <span className="font-semibold text-gray-900">
                  {seller.storeName || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Store Slug</span>
                <span className="font-semibold text-gray-900">
                  /{seller.storeSlug || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Created</span>
                <span className="font-semibold text-gray-900">
                  {seller.createdAt
                    ? new Date(seller.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#c6080a]/10 via-[#e63946]/8 to-rose-50 rounded-2xl p-6 border-2 border-[#e63946]/20 shadow-md lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#c6080a] text-white">
                <FaUserCheck className="text-base" />
              </div>
              <h3 className="text-xs sm:text-xl font-bold text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#c6080a] to-[#e63946] shadow-md hover:shadow-lg transition-all text-xs"
              >
                <FaEdit className="text-xs" />
                Edit Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 shadow-md hover:shadow-lg transition-all text-xs"
              >
                <FaInfoCircle className="text-xs" />
                View Public Store
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

