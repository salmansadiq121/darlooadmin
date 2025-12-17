"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  FaStore,
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaLink,
} from "react-icons/fa";

export default function OverviewTab({ seller, auth, stats }) {
  return (
    <div className="space-y-6">
      {/* Hero Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(198,8,10,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(230,57,70,0.1),transparent_50%)]" />

        {/* Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          {seller.storeBanner ? (
            <>
              <Image
                src={seller.storeBanner}
                alt={seller.storeName}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <FaStore className="text-2xl text-white/60" />
                </div>
                <p className="text-xs sm:text-sm text-white/70 font-medium">
                  Add a stunning banner to showcase your brand
                </p>
              </div>
            </div>
          )}

          {/* Store Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#c6080a] to-[#e63946] border-4 border-white/20 backdrop-blur-sm shadow-2xl overflow-hidden flex items-center justify-center ring-4 ring-slate-900/20"
              >
                {seller.storeLogo ? (
                  <Image
                    src={seller.storeLogo}
                    alt={seller.storeName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <FaStore className="text-xl sm:text-2xl text-white" />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              </motion.div>

              {/* Store Name & Slug */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg truncate">
                  {seller.storeName}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm text-white/80 font-mono bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/20">
                    /{seller.storeSlug}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {seller.storeDescription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-6 sm:px-8 pb-6 sm:pb-8"
          >
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xl">
              <div
                className="text-xs sm:text-sm leading-relaxed text-white/90 prose prose-invert prose-sm max-w-none [&_*]:text-white/90 [&_strong]:text-white [&_em]:text-white/80 [&_a]:text-white underline [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_blockquote]:border-l-white/30 [&_pre]:bg-white/10 [&_pre]:p-3 [&_pre]:rounded"
                dangerouslySetInnerHTML={{ __html: seller.storeDescription }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contact & Address Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <FaEnvelope className="text-sm text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900">
                  Contact Information
                </h3>
                <p className="text-xs text-gray-500">Store contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                      <FaEnvelope className="text-xs text-white" />
                    </div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Email Address
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-900 font-semibold break-all">
                    {seller.contactEmail || auth?.user?.email || "—"}
                  </p>
                </div>
              </motion.div>

              {/* Phone Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                      <FaPhone className="text-xs text-white" />
                    </div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Phone Number
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-900 font-semibold">
                    {seller.contactPhone || auth?.user?.number || "—"}
                  </p>
                </div>
              </motion.div>

              {/* Address Card - Full Width */}
              <motion.div
                whileHover={{ scale: 1.01, y: -2 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 sm:col-span-2"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-xs text-white" />
                    </div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Store Address
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-gray-900 font-semibold">
                      {seller.storeAddress?.address || "—"}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                      {[seller.storeAddress?.city, seller.storeAddress?.state]
                        .filter(Boolean)
                        .join(", ") && (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-gray-400" />
                          {[
                            seller.storeAddress?.city,
                            seller.storeAddress?.state,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                      {[
                        seller.storeAddress?.postalCode,
                        seller.storeAddress?.country,
                      ]
                        .filter(Boolean)
                        .join(" ") && (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-gray-400" />
                          {[
                            seller.storeAddress?.postalCode,
                            seller.storeAddress?.country,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <FaLink className="text-sm text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900">
                  Social & Links
                </h3>
                <p className="text-xs text-gray-500">
                  Connect your social profiles
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {seller.socialLinks?.website && (
                <motion.a
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  href={seller.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:border-[#c6080a] hover:text-[#c6080a] hover:bg-[#c6080a]/5 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <FaGlobe className="text-sm group-hover:rotate-12 transition-transform duration-300" />
                  <span>Website</span>
                </motion.a>
              )}
              {seller.socialLinks?.facebook && (
                <motion.a
                  whileHover={{ scale: 1.1, y: -3, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  href={seller.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 shadow-md"
                >
                  <FaFacebookF />
                </motion.a>
              )}
              {seller.socialLinks?.instagram && (
                <motion.a
                  whileHover={{ scale: 1.1, y: -3, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                  href={seller.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white text-sm hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300 shadow-md"
                >
                  <FaInstagram />
                </motion.a>
              )}
              {seller.socialLinks?.twitter && (
                <motion.a
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  href={seller.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white text-sm hover:shadow-lg hover:shadow-sky-500/50 transition-all duration-300 shadow-md"
                >
                  <FaTwitter />
                </motion.a>
              )}
              {seller.socialLinks?.tiktok && (
                <motion.a
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  href={seller.socialLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-black text-white text-sm hover:shadow-lg hover:shadow-gray-900/50 transition-all duration-300 shadow-md"
                >
                  <FaTiktok />
                </motion.a>
              )}
              {!seller.socialLinks?.website &&
                !seller.socialLinks?.facebook &&
                !seller.socialLinks?.instagram &&
                !seller.socialLinks?.twitter &&
                !seller.socialLinks?.tiktok && (
                  <div className="w-full py-8 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                    <FaLink className="text-2xl text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 font-medium">
                      No social links added yet
                    </p>
                  </div>
                )}
            </div>
          </motion.div>
        </div>

        {/* Right: Performance Stats & Tips */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6080a] to-[#e63946] flex items-center justify-center shadow-lg">
                <FaStore className="text-sm text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900">
                  Performance
                </h3>
                <p className="text-xs text-gray-500">Store metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.2 + index * 0.08,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 p-4 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />
                  <div className="relative">
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">
                      {item.label}
                    </p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-lg">{item.icon}</span>
                      <p className="text-base sm:text-2xl font-bold text-gray-900">
                        {item.value}
                      </p>
                    </div>
                    {item.sub && (
                      <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#c6080a]/10 via-[#e63946]/8 to-amber-50/80 border-2 border-[#e63946]/20 p-6 shadow-lg"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e63946]/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/20 rounded-full -ml-12 -mb-12" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <FaCheckCircle className="text-sm text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900">
                    Optimization Tips
                  </h3>
                  <p className="text-xs text-gray-600">Best practices</p>
                </div>
              </div>
              <ul className="space-y-3.5">
                {[
                  "Use high-resolution logo and banner images",
                  "Write compelling store descriptions",
                  "Keep contact details up to date",
                  "Connect all social media profiles",
                ].map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <FaCheckCircle className="text-xs text-white" />
                    </div>
                    <span className="text-xs leading-relaxed text-gray-700 font-medium">
                      {tip}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
