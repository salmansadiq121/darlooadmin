"use client";
import React from "react";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Calendar,
  User,
  ArrowRight,
  FileText,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

export default function NotificationDetail({
  setShowNotification,
  selectedNotification,
  setSelectedNotification,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
    } catch {
      return dateString;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          setShowNotification(false);
          setSelectedNotification(null);
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modern Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-5 overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Notification Details
                  </h3>
                  <p className="text-sm text-white/90 mt-0.5">
                    View notification information
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowNotification(false);
                  setSelectedNotification(null);
                }}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
              >
                <IoClose className="h-5 w-5 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedNotification && (
              <div className="space-y-6">
                {/* Subject Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500 text-white">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                        Subject
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {selectedNotification.subject || "No Subject"}
                      </h2>
                    </div>
                  </div>
                </motion.div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Date
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatDate(selectedNotification.createdAt)}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Type
                        </div>
                        <div className="text-sm font-semibold text-gray-900 capitalize">
                          {selectedNotification.type || "General"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Content Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Message Content
                    </h3>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedNotification?.context ||
                        "<p class='text-gray-400 italic'>No content available</p>",
                    }}
                    className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </motion.div>

                {/* Redirect Link */}
                {selectedNotification.redirectLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <a
                      href={selectedNotification.redirectLink}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500 text-white group-hover:scale-110 transition-transform">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                            Related Link
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedNotification.redirectLink}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowNotification(false);
                setSelectedNotification(null);
              }}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
