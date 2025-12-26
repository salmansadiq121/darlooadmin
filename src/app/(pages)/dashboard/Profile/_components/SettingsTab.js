"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaCog,
  FaInfoCircle,
  FaShieldAlt,
  FaUserCheck,
  FaEdit,
  FaCheckCircle,
  FaStore,
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLink,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaExternalLinkAlt,
  FaCopy,
  FaSpinner,
  FaExclamationTriangle,
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaArrowRight,
} from "react-icons/fa";

// Info item component
const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="text-gray-400 text-sm" />}
      <span className="text-xs text-gray-600">{label}</span>
    </div>
    <span className="text-xs font-semibold text-gray-900 max-w-[150px] truncate">
      {value || "—"}
    </span>
  </div>
);

// Social link component
const SocialLink = ({ platform, url, icon: Icon, color }) => {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group border border-gray-200"
    >
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="text-white text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 capitalize">{platform}</p>
        <p className="text-xs text-gray-500 truncate">{url}</p>
      </div>
      <FaExternalLinkAlt className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};

// Action card component
const ActionCard = ({ title, description, icon: Icon, color, onClick, disabled = false, loading = false }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
      disabled
        ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
        : "bg-white border-gray-200 hover:border-[#c6080a]/50 hover:shadow-lg cursor-pointer"
    }`}
  >
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color} shadow-lg flex-shrink-0`}>
        {loading ? (
          <FaSpinner className="text-white text-lg animate-spin" />
        ) : (
          <Icon className="text-white text-lg" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      {!disabled && !loading && (
        <FaArrowRight className="text-gray-400 text-sm mt-1" />
      )}
    </div>
  </motion.button>
);

export default function SettingsTab({ seller, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

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
    const StatusIcon = config.icon;

    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border} shadow-sm flex items-center gap-1.5`}
      >
        {StatusIcon && <StatusIcon className="text-xs" />}
        <span>{config.label}</span>
      </motion.span>
    );
  };

  const handleCopyStoreLink = async () => {
    const storeUrl = `${window.location.origin}/store/${seller?.storeSlug}`;
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success("Store link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleViewStore = () => {
    window.open(`/store/${seller?.storeSlug}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#c6080a]/5 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#e63946]/5 to-transparent rounded-full blur-2xl -ml-24 -mb-24" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="p-3 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-lg"
            >
              <FaCog className="text-lg" />
            </motion.div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Account Settings
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Manage your seller account and store information
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Quick Stats Row */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Account Status</p>
            <p className={`text-sm font-bold ${seller?.isActive ? "text-emerald-600" : "text-gray-500"}`}>
              {seller?.isActive ? "Active" : "Inactive"}
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Verification</p>
            <p className="text-sm font-bold text-gray-900 capitalize">
              {seller?.verificationStatus || "Pending"}
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Member Since</p>
            <p className="text-sm font-bold text-gray-900">
              {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Store URL</p>
            <p className="text-sm font-bold text-[#c6080a] truncate">
              /{seller?.storeSlug || "—"}
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <FaStore className="text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Store Details</h3>
                <p className="text-xs text-gray-500">Basic store information</p>
              </div>
            </div>
            <div className="space-y-2">
              <InfoItem label="Store Name" value={seller?.storeName} icon={FaStore} />
              <InfoItem label="Store Slug" value={`/${seller?.storeSlug}`} icon={FaLink} />
              <InfoItem label="Email" value={seller?.contactEmail} icon={FaEnvelope} />
              <InfoItem label="Phone" value={seller?.contactPhone} icon={FaPhone} />
              <InfoItem
                label="Created"
                value={seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : null}
                icon={FaCalendarAlt}
              />
            </div>
          </motion.div>

          {/* Address & Location */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <FaMapMarkerAlt className="text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Location</h3>
                <p className="text-xs text-gray-500">Store address details</p>
              </div>
            </div>
            <div className="space-y-2">
              <InfoItem
                label="Address"
                value={seller?.storeAddress?.address}
                icon={FaMapMarkerAlt}
              />
              <InfoItem label="City" value={seller?.storeAddress?.city} icon={FaMapMarkerAlt} />
              <InfoItem label="State" value={seller?.storeAddress?.state} icon={FaMapMarkerAlt} />
              <InfoItem label="Country" value={seller?.storeAddress?.country} icon={FaGlobe} />
              <InfoItem
                label="Postal Code"
                value={seller?.storeAddress?.postalCode}
                icon={FaMapMarkerAlt}
              />
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <FaGlobe className="text-sm" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Social & Web Links</h3>
                <p className="text-xs text-gray-500">Connected social media profiles</p>
              </div>
            </div>

            {seller?.socialLinks &&
            Object.values(seller.socialLinks).some((v) => v) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SocialLink
                  platform="Website"
                  url={seller.socialLinks.website}
                  icon={FaGlobe}
                  color="bg-gradient-to-br from-blue-600 to-blue-700"
                />
                <SocialLink
                  platform="Facebook"
                  url={seller.socialLinks.facebook}
                  icon={FaFacebookF}
                  color="bg-gradient-to-br from-blue-600 to-blue-800"
                />
                <SocialLink
                  platform="Instagram"
                  url={seller.socialLinks.instagram}
                  icon={FaInstagram}
                  color="bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500"
                />
                <SocialLink
                  platform="Twitter"
                  url={seller.socialLinks.twitter}
                  icon={FaTwitter}
                  color="bg-gradient-to-br from-blue-400 to-blue-500"
                />
                <SocialLink
                  platform="TikTok"
                  url={seller.socialLinks.tiktok}
                  icon={FaTiktok}
                  color="bg-gradient-to-br from-gray-900 to-gray-800"
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FaGlobe className="text-3xl mx-auto mb-2" />
                <p className="text-sm">No social links added yet</p>
                <button
                  onClick={onEdit}
                  className="mt-3 text-xs text-[#c6080a] font-semibold hover:underline"
                >
                  Add social links
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-[#c6080a]/10 via-[#e63946]/8 to-rose-50/50 rounded-3xl border-2 border-[#e63946]/20 p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#c6080a]/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-rose-200/20 to-transparent rounded-full blur-2xl -ml-24 -mb-24" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#c6080a] to-[#e63946] text-white shadow-lg">
              <FaUserCheck className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              <p className="text-xs text-gray-600">Manage your store and profile settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Edit Profile"
              description="Update your store information, branding, and contact details"
              icon={FaEdit}
              color="bg-gradient-to-br from-[#c6080a] to-[#e63946]"
              onClick={onEdit}
            />

            <ActionCard
              title="View Public Store"
              description="Preview how your store appears to customers"
              icon={FaEye}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              onClick={handleViewStore}
            />

            <ActionCard
              title="Copy Store Link"
              description={copied ? "Link copied!" : "Share your store URL with customers"}
              icon={copied ? FaCheckCircle : FaCopy}
              color={copied ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : "bg-gradient-to-br from-purple-500 to-purple-600"}
              onClick={handleCopyStoreLink}
            />
          </div>
        </div>
      </motion.div>

      {/* Store Description */}
      {seller?.storeDescription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <FaInfoCircle className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Store Description</h3>
              <p className="text-xs text-gray-500">About your store</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {seller.storeDescription}
            </p>
          </div>
        </motion.div>
      )}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-red-50/50 rounded-2xl p-6 border-2 border-red-200/60"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
            <FaExclamationTriangle className="text-sm" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-900">Danger Zone</h3>
            <p className="text-xs text-red-700/70">
              Irreversible and destructive actions
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs text-red-800 font-medium">Delete Seller Account</p>
            <p className="text-xs text-red-700/70 mt-0.5">
              Permanently delete your seller account and all associated data. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-2.5 rounded-xl bg-white border-2 border-red-300 text-red-600 font-semibold text-xs hover:bg-red-50 hover:border-red-400 transition-all flex items-center gap-2"
          >
            <FaTrash className="text-xs" />
            Delete Account
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FaExclamationTriangle className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Account?</h3>
                    <p className="text-xs text-gray-600">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete your seller account? All your products, orders history, and store data will be permanently removed.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FaTrash />
                        Delete Permanently
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
