"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { uploadImage } from "@/app/utils/uploadFile";
import {
  FaStore,
  FaTimes,
  FaUpload,
  FaImage,
  FaGlobe,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaTiktok,
} from "react-icons/fa";
import { Style } from "@/app/utils/CommonStyle";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;

export default function ProfileModal({
  isOpen,
  onClose,
  mode = "create",
  seller,
  user,
  onSuccess,
}) {
  const steps = [
    { id: 0, label: "Branding", description: "Logo, banner & store basics" },
    {
      id: 1,
      label: "Contact & Address",
      description: "How customers reach you",
    },
    { id: 2, label: "Social & Review", description: "Links & final check" },
  ];

  const [formData, setFormData] = useState({
    storeName: "",
    storeSlug: "",
    storeDescription: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
  });

  const [storeLogo, setStoreLogo] = useState("");
  const [storeBanner, setStoreBanner] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    if (seller && mode === "edit") {
      setFormData({
        storeName: seller.storeName || "",
        storeSlug: seller.storeSlug || "",
        storeDescription: seller.storeDescription || "",
        contactEmail: seller.contactEmail || user?.email || "",
        contactPhone: seller.contactPhone || user?.number || "",
        address: seller.storeAddress?.address || "",
        city: seller.storeAddress?.city || "",
        state: seller.storeAddress?.state || "",
        country: seller.storeAddress?.country || "",
        postalCode: seller.storeAddress?.postalCode || "",
        website: seller.socialLinks?.website || "",
        facebook: seller.socialLinks?.facebook || "",
        instagram: seller.socialLinks?.instagram || "",
        twitter: seller.socialLinks?.twitter || "",
        tiktok: seller.socialLinks?.tiktok || "",
      });
      setStoreLogo(seller.storeLogo || "");
      setStoreBanner(seller.storeBanner || "");
      setAddressQuery(seller.storeAddress?.address || "");
    } else {
      const initialName = user?.storeName || "";
      setFormData((prev) => ({
        ...prev,
        storeName: initialName,
        storeSlug: initialName
          ? initialName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          : "",
        contactEmail: user?.email || "",
        contactPhone: user?.number || "",
      }));
      setStoreLogo("");
      setStoreBanner("");
      setAddressQuery("");
      setAddressSuggestions([]);
    }
    setCurrentStep(0);
  }, [isOpen, seller, mode, user]);

  // Google Places autocomplete for address
  useEffect(() => {
    if (!GOOGLE_API_KEY) return;
    if (!addressQuery || addressQuery.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    let isCancelled = false;
    const controller = new AbortController();

    const fetchSuggestions = async () => {
      try {
        setIsAddressLoading(true);
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            addressQuery
          )}&key=${GOOGLE_API_KEY}&types=geocode`,
          { signal: controller.signal }
        );

        const data = await res.json();
        if (!isCancelled) {
          setAddressSuggestions(data?.predictions || []);
        }
      } catch (err) {
        if (!isCancelled) {
          // In production we fail silently to avoid noisy console errors
          if (process.env.NODE_ENV === "development") {
            console.warn("Address suggestions error:", err);
          }
          setAddressSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsAddressLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 400);

    return () => {
      isCancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [addressQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "storeName") {
      setFormData((prev) => ({
        ...prev,
        storeName: value,
        storeSlug:
          prev.storeSlug || value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    await uploadImage(file, setStoreLogo, setLogoLoading);
  };

  const handleBannerUpload = async (file) => {
    if (!file) return;
    await uploadImage(file, setStoreBanner, setBannerLoading);
  };

  const isLastStep = currentStep === steps.length - 1;

  const canGoNext = () => {
    if (currentStep === 0) {
      return !!formData.storeName?.trim();
    }
    if (currentStep === 1) {
      return !!formData.address?.trim();
    }
    return true;
  };

  const handleNext = () => {
    if (!canGoNext()) {
      toast.error("Please complete the required fields before continuing.");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("storeName", formData.storeName);
      if (formData.storeSlug) payload.append("storeSlug", formData.storeSlug);
      if (formData.storeDescription)
        payload.append("storeDescription", formData.storeDescription);
      if (storeLogo) payload.append("storeLogo", storeLogo);
      if (storeBanner) payload.append("storeBanner", storeBanner);

      if (formData.contactEmail)
        payload.append("contactEmail", formData.contactEmail);
      if (formData.contactPhone)
        payload.append("contactPhone", formData.contactPhone);

      if (formData.address) payload.append("address", formData.address);
      if (formData.city) payload.append("city", formData.city);
      if (formData.state) payload.append("state", formData.state);
      if (formData.country) payload.append("country", formData.country);
      if (formData.postalCode)
        payload.append("postalCode", formData.postalCode);

      if (formData.website) payload.append("website", formData.website);
      if (formData.facebook) payload.append("facebook", formData.facebook);
      if (formData.instagram) payload.append("instagram", formData.instagram);
      if (formData.twitter) payload.append("twitter", formData.twitter);
      if (formData.tiktok) payload.append("tiktok", formData.tiktok);

      const url =
        mode === "edit" && seller?._id
          ? `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/profile/${seller._id}`
          : `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/register`;

      const method = mode === "edit" && seller?._id ? "put" : "post";

      const { data } = await axios({
        method,
        url,
        data: payload,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data?.success) {
        toast.success(
          mode === "edit"
            ? "Seller profile updated successfully"
            : "Seller profile created successfully"
        );
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error saving seller profile:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save seller profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-[0_24px_70px_rgba(15,23,42,0.55)] border border-red-100/70 overflow-hidden flex flex-col bg-gradient-to-br from-white/98 via-white/96 to-rose-50/95 backdrop-blur-xl"
      >
        {/* Header + Stepper */}
        <div className="px-6 pt-4 pb-4 border-b border-red-100/70 bg-gradient-to-r from-[#c6080a]/8 via-[#e63946]/8 to-amber-200/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#c6080a] via-[#e63946] to-amber-400 flex items-center justify-center text-white shadow-lg shadow-rose-500/40">
                <FaStore className="text-[18px]" />
              </div>
              <div>
                <h2 className="text-[17px] sm:text-lg font-semibold text-slate-900 tracking-tight">
                  {mode === "edit"
                    ? "Edit Seller Profile"
                    : "Create Seller Profile"}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <p className="text-[11px] text-gray-500">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                  <span className="hidden sm:inline-block text-[11px] text-gray-400">
                    • {steps[currentStep]?.description}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 text-gray-600 hover:text-black transition-all cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Stepper bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2 gap-1">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                return (
                  <div
                    key={step.id}
                    className="flex-1 flex items-center gap-2 cursor-pointer group"
                    onClick={() => {
                      if (index <= currentStep && !isSubmitting) {
                        setCurrentStep(index);
                      }
                    }}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-br from-[#c6080a] to-[#e63946] text-white border-transparent shadow-md scale-105"
                          : isCompleted
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-gray-500 border-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`hidden sm:inline-block text-[11px] font-medium transition-colors duration-200 ${
                        isActive
                          ? "text-[#c6080a]"
                          : isCompleted
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-full h-1 rounded-full bg-red-100 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#c6080a] via-[#e63946] to-amber-400"
                initial={false}
                animate={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar"
        >
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* STEP 1: BRANDING */}
            {currentStep === 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-[1.4fr,2.2fr] gap-6">
                  <div className="space-y-4 bg-white/80 rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Store Branding
                    </p>
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#c6080a] to-[#e63946] overflow-hidden shadow-xl border-4 border-white flex items-center justify-center">
                        {storeLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={storeLogo}
                            alt="Store logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaStore className="text-3xl text-white" />
                        )}
                        <label
                          htmlFor="store-logo-upload"
                          className={`absolute bottom-1.5 right-1.5 inline-flex items-center justify-center rounded-full bg-white text-[#c6080a] p-1.5 shadow-md border border-red-100 ${
                            logoLoading
                              ? "opacity-70 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <FaUpload className="text-xs" />
                        </label>
                      </div>
                      <input
                        id="store-logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("store-logo-upload")?.click()
                        }
                        disabled={logoLoading}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs ${
                          logoLoading
                            ? "border-gray-300 text-gray-400 cursor-not-allowed"
                            : "border-red-200 text-gray-700 hover:border-red-400 hover:text-red-600 cursor-pointer"
                        } transition-colors`}
                      >
                        <FaImage className="text-xs" />
                        <span>
                          {logoLoading ? "Uploading..." : "Upload Logo"}
                        </span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Store Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="storeName"
                        value={formData.storeName}
                        onChange={handleChange}
                        required
                        className={Style.input}
                        placeholder="e.g. Darloo Studio"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Store Slug
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">/store/</span>
                        <input
                          type="text"
                          name="storeSlug"
                          value={formData.storeSlug}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              storeSlug: e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]+/g, "-"),
                            }))
                          }
                          className={`${Style.input} flex-1`}
                          placeholder="your-unique-store"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white/80 rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Store Story
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Store Description
                      </label>
                      <textarea
                        name="storeDescription"
                        value={formData.storeDescription}
                        onChange={handleChange}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#c6080a] focus:border-[#c6080a] resize-none"
                        placeholder="Tell your customers what makes your store special, what you sell and why they should trust you..."
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">
                        Store Banner
                      </p>
                      <div className="relative h-32 w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                        {storeBanner ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={storeBanner}
                            alt="Store banner"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center text-gray-400 text-xs px-4">
                            Upload a wide hero image that represents your brand
                            (e.g. lifestyle or product collage).
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        <div className="absolute bottom-2 right-2 pointer-events-auto">
                          <button
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("store-banner-upload")
                                ?.click()
                            }
                            disabled={bannerLoading}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/90 shadow-sm border ${
                              bannerLoading
                                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                : "border-red-200 text-gray-700 hover:border-red-400 hover:text-red-600 cursor-pointer"
                            }`}
                          >
                            <FaUpload className="text-xs" />
                            <span>
                              {bannerLoading ? "Uploading..." : "Upload Banner"}
                            </span>
                          </button>
                        </div>
                        <input
                          id="store-banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleBannerUpload(e.target.files?.[0])
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: CONTACT & ADDRESS */}
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 bg-white/80 rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Contact Details
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className={Style.input}
                        placeholder="support@yourstore.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className={Style.input}
                        placeholder="+49 123 456789"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 bg-white/80 rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Store Address (Google Maps)
                    </p>
                    <div className="space-y-2 relative">
                      <label className="text-xs font-medium text-gray-700 flex items-center justify-between">
                        <span>Address</span>
                        <span className="text-[10px] text-gray-400">
                          Powered by Google Maps
                        </span>
                      </label>
                      <textarea
                        name="address"
                        value={addressQuery}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAddressQuery(value);
                          setFormData((prev) => ({
                            ...prev,
                            address: value,
                          }));
                        }}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#c6080a] focus:border-[#c6080a] resize-none pr-8"
                        placeholder="Start typing your full store address..."
                      />
                      <div className="absolute right-2 top-7 text-xs text-red-500">
                        {isAddressLoading ? "..." : "📍"}
                      </div>
                      {addressSuggestions?.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                          {addressSuggestions.map((s) => (
                            <button
                              key={s.place_id}
                              type="button"
                              onClick={() => {
                                setAddressQuery(s.description);
                                setFormData((prev) => ({
                                  ...prev,
                                  address: s.description,
                                }));
                                setAddressSuggestions([]);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-gray-800 hover:bg-red-50 flex gap-2"
                            >
                              <span className="text-red-500">📍</span>
                              <span>{s.description}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={Style.input}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">
                          State / Region
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className={Style.input}
                          placeholder="State"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className={Style.input}
                          placeholder="Country"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className={Style.input}
                          placeholder="Postal code"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: SOCIAL & REVIEW */}
            {currentStep === 2 && (
              <>
                <div className="space-y-3 bg-white/80 rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Social & Web Presence
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <FaGlobe className="text-sm text-gray-500" />
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className={Style.input}
                        placeholder="https://yourstore.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <FaFacebookF className="text-sm text-blue-600" />
                        Facebook
                      </label>
                      <input
                        type="url"
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleChange}
                        className={Style.input}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <FaInstagram className="text-sm text-pink-500" />
                        Instagram
                      </label>
                      <input
                        type="url"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        className={Style.input}
                        placeholder="https://instagram.com/yourhandle"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <FaTwitter className="text-sm text-sky-500" />
                        Twitter / X
                      </label>
                      <input
                        type="url"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleChange}
                        className={Style.input}
                        placeholder="https://twitter.com/yourhandle"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                        <FaTiktok className="text-sm text-black" />
                        TikTok
                      </label>
                      <input
                        type="url"
                        name="tiktok"
                        value={formData.tiktok}
                        onChange={handleChange}
                        className={Style.input}
                        placeholder="https://tiktok.com/@yourhandle"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-red-200 bg-red-50/80 px-4 py-3 text-[11px] text-gray-700">
                  You’re almost done. Review your branding, contact, address,
                  and social links before saving. You can always come back and
                  edit this profile later.
                </div>
              </>
            )}
          </motion.div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 bg-white/80">
            <p className="text-[11px] text-gray-500 max-w-md">
              Your seller profile powers your public storefront. Keep it
              accurate, attractive and up to date to build trust and increase
              conversions.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-full border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Back
                </button>
              )}
              {!isLastStep && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r from-[#c6080a] via-[#e63946] to-amber-400 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Next
                </button>
              )}
              {isLastStep && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-1.5 rounded-full text-xs font-medium text-white bg-gradient-to-r from-[#c6080a] via-[#e63946] to-amber-400 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer ${
                    isSubmitting ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting
                    ? "Saving..."
                    : mode === "edit"
                    ? "Save Changes"
                    : "Create Profile"}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
