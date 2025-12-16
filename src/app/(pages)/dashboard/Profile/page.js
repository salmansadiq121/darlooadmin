"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/app/context/authContext";
import Loader from "@/app/utils/Loader";
import toast from "react-hot-toast";
import {
  FaStore,
  FaEdit,
  FaPlusCircle,
  FaMapMarkerAlt,
  FaGlobe,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaTiktok,
} from "react-icons/fa";
import { Style } from "@/app/utils/CommonStyle";
import ProfileModal from "./_conponents/ProfileModal";

const MainLayout = dynamic(
  () => import("../../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function SellerProfilePage() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [seller, setSeller] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.pathname);
    }
  }, []);

  const fetchSellerProfile = useCallback(async () => {
    if (!auth?.token) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/profile`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        setSeller(data.seller);
      }
    } catch (error) {
      const status = error?.response?.status;
      if (status === 400 || status === 404) {
        // No seller profile yet – allow creation
        setSeller(null);
      } else {
        console.error("Error fetching seller profile:", error);
        toast.error(
          error?.response?.data?.message || "Failed to load seller profile"
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (auth?.token) {
      fetchSellerProfile();
    }
  }, [auth?.token, fetchSellerProfile]);

  const handleOpenCreate = () => {
    setMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProfileUpdated = () => {
    fetchSellerProfile();
  };

  const getStatusBadge = () => {
    if (!seller) return null;
    const { verificationStatus, isActive } = seller;

    if (!isActive) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300">
          Inactive
        </span>
      );
    }

    const map = {
      approved: {
        label: "Verified Seller",
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-500",
      },
      pending: {
        label: "Pending Verification",
        bg: "bg-amber-100",
        text: "text-amber-800",
        border: "border-amber-500",
      },
      rejected: {
        label: "Verification Rejected",
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-500",
      },
      suspended: {
        label: "Suspended",
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-500",
      },
    };

    const config = map[verificationStatus] || map.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}
      >
        {config.label}
      </span>
    );
  };

  const stats = seller
    ? [
        {
          label: "Total Products",
          value: seller.totalProducts || 0,
        },
        {
          label: "Total Sales",
          value: seller.totalSales || 0,
        },
        {
          label: "Total Revenue",
          value: `€${(seller.totalRevenue || 0).toLocaleString()}`,
        },
        {
          label: "Rating",
          value: `${seller.rating?.average?.toFixed(1) || "0.0"} ★`,
          sub: `${seller.rating?.totalReviews || 0} reviews`,
        },
      ]
    : [];

  return (
    <MainLayout
      title="Seller Profile - Manage Your Store Identity"
      description="Create and manage your seller profile, update store branding, address and social links."
      keywords="seller profile, store settings, marketplace, seller dashboard"
    >
      <div className="relative p-4 sm:p-6 h-full w-full flex flex-col">
        <Breadcrumb path={currentUrl} />

        <div className="mt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#c6080a] to-[#e63946] bg-clip-text text-transparent">
                Seller Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Design a beautiful store profile, manage your brand, and keep
                your store information up to date.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <button
                onClick={seller ? handleOpenEdit : handleOpenCreate}
                className={`${Style.gradient_btn} !w-auto flex items-center gap-2 px-5 py-2 rounded-full`}
              >
                {seller ? (
                  <>
                    <FaEdit className="text-sm" />
                    <span>Edit Profile</span>
                  </>
                ) : (
                  <>
                    <FaPlusCircle className="text-sm" />
                    <span>Create Seller Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isLoading ? (
            <Loader />
          ) : !seller ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-2xl bg-gradient-to-r from-[#c6080a]/5 via-[#e63946]/5 to-amber-100/40 border border-dashed border-[#e63946]/40 p-8 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="max-w-xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Bring your brand to life with a stunning seller profile
                </h2>
                <p className="text-gray-600 mb-4">
                  Add your store logo, banner, address and social links so
                  customers can trust and discover your brand more easily.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Upload a high-quality logo and hero banner</li>
                  <li>✓ Add a rich store description and contact details</li>
                  <li>✓ Use smart Google Maps suggestions for your address</li>
                  <li>✓ Connect your website and social channels</li>
                </ul>
                <button
                  onClick={handleOpenCreate}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white text-sm font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <FaPlusCircle className="text-sm" />
                  <span>Create your seller profile</span>
                </button>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative w-full max-w-sm h-60 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-[#c6080a] via-rose-500 to-amber-400 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="relative flex flex-col items-center text-center text-white px-4">
                  <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mb-3">
                    <FaStore className="text-3xl" />
                  </div>
                  <p className="text-lg font-semibold mb-1">
                    Your Storefront, Elevated
                  </p>
                  <p className="text-xs text-white/80">
                    Create an engaging, modern profile that tells your story and
                    builds trust with every visitor.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.3fr] gap-6">
              {/* Left: Profile Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                <div className="relative h-44 w-full bg-gradient-to-r from-[#c6080a]/20 via-[#e63946]/20 to-amber-100">
                  {seller.storeBanner ? (
                    <Image
                      src={seller.storeBanner}
                      alt={seller.storeName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                      Add a beautiful banner to showcase your brand
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute -bottom-10 left-6 flex items-end gap-4">
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#c6080a] to-[#e63946] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                      {seller.storeLogo ? (
                        <Image
                          src={seller.storeLogo}
                          alt={seller.storeName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <FaStore className="text-3xl text-white" />
                      )}
                    </div>
                    <div className="pb-2">
                      <h2 className="text-2xl font-semibold text-white drop-shadow-sm">
                        {seller.storeName}
                      </h2>
                      <p className="text-sm text-gray-100">
                        /{seller.storeSlug}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-14 px-6 pb-6 space-y-4">
                  {seller.storeDescription && (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {seller.storeDescription}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500">
                        Contact Email
                      </p>
                      <p className="text-sm text-gray-800 break-all">
                        {seller.contactEmail || auth?.user?.email || "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500">
                        Contact Phone
                      </p>
                      <p className="text-sm text-gray-800">
                        {seller.contactPhone || auth?.user?.number || "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-red-500" />
                        Store Address
                      </p>
                      <p className="text-sm text-gray-800">
                        {seller.storeAddress?.address || "—"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {[seller.storeAddress?.city, seller.storeAddress?.state]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {[
                          seller.storeAddress?.postalCode,
                          seller.storeAddress?.country,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500">
                        Social & Links
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {seller.socialLinks?.website && (
                          <a
                            href={seller.socialLinks.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 text-xs text-gray-700 hover:border-[#c6080a] hover:text-[#c6080a] transition-colors"
                          >
                            <FaGlobe className="text-sm" />
                            Website
                          </a>
                        )}
                        {seller.socialLinks?.facebook && (
                          <a
                            href={seller.socialLinks.facebook}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors"
                          >
                            <FaFacebookF />
                          </a>
                        )}
                        {seller.socialLinks?.instagram && (
                          <a
                            href={seller.socialLinks.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white text-xs hover:opacity-90 transition-opacity"
                          >
                            <FaInstagram />
                          </a>
                        )}
                        {seller.socialLinks?.twitter && (
                          <a
                            href={seller.socialLinks.twitter}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sky-500 text-white text-xs hover:bg-sky-600 transition-colors"
                          >
                            <FaTwitter />
                          </a>
                        )}
                        {seller.socialLinks?.tiktok && (
                          <a
                            href={seller.socialLinks.tiktok}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-xs hover:bg-gray-900 transition-colors"
                          >
                            <FaTiktok />
                          </a>
                        )}
                        {!seller.socialLinks?.website &&
                          !seller.socialLinks?.facebook &&
                          !seller.socialLinks?.instagram &&
                          !seller.socialLinks?.twitter &&
                          !seller.socialLinks?.tiktok && (
                            <p className="text-xs text-gray-400">
                              No social links added yet.
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Metrics & Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Store Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {stats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-3 shadow-sm"
                      >
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">
                          {item.label}
                        </p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {item.value}
                        </p>
                        {item.sub && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {item.sub}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#c6080a]/8 via-[#e63946]/5 to-amber-50 rounded-2xl border border-[#e63946]/20 p-5 shadow-md">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Profile optimization tips
                  </h3>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    <li>• Use a clear, high-resolution logo and banner.</li>
                    <li>
                      • Write a concise, benefit-driven store description that
                      explains what makes you unique.
                    </li>
                    <li>
                      • Keep your contact details and address updated for
                      smoother deliveries.
                    </li>
                    <li>
                      • Add your website and social links to increase customer
                      trust.
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <ProfileModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              mode={mode}
              seller={seller}
              user={auth?.user}
              onSuccess={handleProfileUpdated}
            />
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
