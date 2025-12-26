"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { uploadImage } from "@/app/utils/uploadFile";
import { useAuth } from "@/app/context/authContext";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
  FaExclamationCircle,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaSpinner,
  FaEnvelope,
  FaPhone,
  FaSyncAlt,
  FaEdit,
} from "react-icons/fa";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;

// InputField component - defined outside to prevent recreation on every render
const InputField = React.memo(
  ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
    rows,
    className = "",
    icon: Icon,
    value,
    error,
    isValid,
    onChange,
    onBlur,
  }) => {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          {Icon && <Icon className="text-sm text-gray-500" />}
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        {rows ? (
          <textarea
            name={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            rows={rows}
            placeholder={placeholder}
            className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 resize-none ${
              error
                ? "border-red-400 bg-red-50/50 focus:ring-red-400/20 focus:border-red-500"
                : isValid
                ? "border-green-400 bg-green-50/30 focus:ring-green-400/20 focus:border-green-500"
                : "border-gray-300 bg-white focus:ring-[#c6080a]/20 focus:border-[#c6080a]"
            }`}
          />
        ) : (
          <div className="relative">
            <input
              type={type}
              name={name}
              value={value || ""}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-400 bg-red-50/50 focus:ring-red-400/20 focus:border-red-500"
                  : isValid
                  ? "border-green-400 bg-green-50/30 focus:ring-green-400/20 focus:border-green-500"
                  : "border-gray-300 bg-white focus:ring-[#c6080a]/20 focus:border-[#c6080a]"
              }`}
            />
            {isValid && (
              <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm pointer-events-none" />
            )}
          </div>
        )}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key={`error-${name}`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-600 flex items-center gap-1.5"
            >
              <FaExclamationCircle className="text-xs" />
              <span>{error}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if value, error, or isValid actually changed
    return (
      prevProps.value === nextProps.value &&
      prevProps.error === nextProps.error &&
      prevProps.isValid === nextProps.isValid &&
      prevProps.name === nextProps.name
    );
  }
);

InputField.displayName = "InputField";

// Validation utility functions
const validators = {
  storeName: (value) => {
    if (!value?.trim()) return "Store name is required";
    if (value.trim().length < 3)
      return "Store name must be at least 3 characters";
    if (value.trim().length > 100)
      return "Store name must be less than 100 characters";
    return null;
  },
  storeSlug: (value) => {
    if (!value?.trim()) return null; // Optional field
    if (!/^[a-z0-9-]+$/.test(value))
      return "Slug can only contain lowercase letters, numbers, and hyphens";
    if (value.length < 3) return "Slug must be at least 3 characters";
    if (value.length > 50) return "Slug must be less than 50 characters";
    return null;
  },
  contactEmail: (value) => {
    if (!value?.trim()) return null; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return null;
  },
  contactPhone: (value) => {
    if (!value?.trim()) return null; // Optional field
    const phoneRegex =
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(value.replace(/\s/g, "")))
      return "Please enter a valid phone number";
    return null;
  },
  address: (value) => {
    if (!value?.trim()) return "Address is required";
    if (value.trim().length < 5) return "Address must be at least 5 characters";
    return null;
  },
  city: (value) => {
    if (!value?.trim()) return null; // Optional field
    if (value.trim().length < 2) return "City must be at least 2 characters";
    return null;
  },
  country: (value) => {
    if (!value?.trim()) return null; // Optional field
    if (value.trim().length < 2) return "Country must be at least 2 characters";
    return null;
  },
  postalCode: (value) => {
    if (!value?.trim()) return null; // Optional field
    if (value.trim().length < 3)
      return "Postal code must be at least 3 characters";
    return null;
  },
  website: (value) => {
    if (!value?.trim()) return null; // Optional field
    try {
      const url = new URL(
        value.startsWith("http") ? value : `https://${value}`
      );
      if (!["http:", "https:"].includes(url.protocol)) {
        return "URL must start with http:// or https://";
      }
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  },
  facebook: (value) => {
    if (!value?.trim()) return null;
    try {
      new URL(value.startsWith("http") ? value : `https://${value}`);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  },
  instagram: (value) => {
    if (!value?.trim()) return null;
    try {
      new URL(value.startsWith("http") ? value : `https://${value}`);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  },
  twitter: (value) => {
    if (!value?.trim()) return null;
    try {
      new URL(value.startsWith("http") ? value : `https://${value}`);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  },
  tiktok: (value) => {
    if (!value?.trim()) return null;
    try {
      new URL(value.startsWith("http") ? value : `https://${value}`);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  },
  storeDescription: (value) => {
    if (!value?.trim()) return null; // Optional field
    // Strip HTML tags to count actual text characters
    const textContent = value.replace(/<[^>]*>/g, "").trim();
    if (textContent.length > 1000)
      return "Description must be less than 1000 characters";
    return null;
  },
};

export default function ProfileModal({
  isOpen,
  onClose,
  mode = "create",
  seller,
  user,
  onSuccess,
}) {
  const { auth } = useAuth();
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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSlugAutoGenerated, setIsSlugAutoGenerated] = useState(true);

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
      setIsSlugAutoGenerated(true);
    }
    setCurrentStep(0);
    setErrors({});
    setTouched({});
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

  const validateField = (name, value) => {
    const validator = validators[name];
    if (!validator) return null;
    return validator(value);
  };

  const validateStep = (step) => {
    const stepErrors = {};

    if (step === 0) {
      const nameError = validateField("storeName", formData.storeName);
      if (nameError) stepErrors.storeName = nameError;
      const slugError = validateField("storeSlug", formData.storeSlug);
      if (slugError) stepErrors.storeSlug = slugError;
      const descError = validateField(
        "storeDescription",
        formData.storeDescription
      );
      if (descError) stepErrors.storeDescription = descError;
    } else if (step === 1) {
      const addressError = validateField("address", formData.address);
      if (addressError) stepErrors.address = addressError;
      const emailError = validateField("contactEmail", formData.contactEmail);
      if (emailError) stepErrors.contactEmail = emailError;
      const phoneError = validateField("contactPhone", formData.contactPhone);
      if (phoneError) stepErrors.contactPhone = phoneError;
      const cityError = validateField("city", formData.city);
      if (cityError) stepErrors.city = cityError;
      const countryError = validateField("country", formData.country);
      if (countryError) stepErrors.country = countryError;
      const postalError = validateField("postalCode", formData.postalCode);
      if (postalError) stepErrors.postalCode = postalError;
    } else if (step === 2) {
      const websiteError = validateField("website", formData.website);
      if (websiteError) stepErrors.website = websiteError;
      const facebookError = validateField("facebook", formData.facebook);
      if (facebookError) stepErrors.facebook = facebookError;
      const instagramError = validateField("instagram", formData.instagram);
      if (instagramError) stepErrors.instagram = instagramError;
      const twitterError = validateField("twitter", formData.twitter);
      if (twitterError) stepErrors.twitter = twitterError;
      const tiktokError = validateField("tiktok", formData.tiktok);
      if (tiktokError) stepErrors.tiktok = tiktokError;
    }

    return stepErrors;
  };

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (name === "storeName") {
        const newSlug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        setFormData((prev) => ({
          ...prev,
          storeName: value,
          storeSlug: isSlugAutoGenerated ? newSlug : prev.storeSlug,
        }));
      } else if (name === "storeSlug") {
        // User manually editing slug, mark as manual
        setIsSlugAutoGenerated(false);
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }

      // Clear error on change to allow user to correct it
      // Use functional update to avoid dependency on errors
      setErrors((prev) => {
        if (prev[name]) {
          return { ...prev, [name]: undefined };
        }
        return prev;
      });
    },
    [isSlugAutoGenerated]
  );

  // Function to regenerate slug from store name
  const regenerateSlug = useCallback(() => {
    if (formData.storeName) {
      const newSlug = formData.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({
        ...prev,
        storeSlug: newSlug,
      }));
      setIsSlugAutoGenerated(true);
      setErrors((prev) => {
        if (prev.storeSlug) {
          return { ...prev, storeSlug: undefined };
        }
        return prev;
      });
    }
  }, [formData.storeName]);

  // Handler for RichTextEditor (description field)
  const handleDescriptionChange = useCallback((htmlValue) => {
    setFormData((prev) => ({
      ...prev,
      storeDescription: htmlValue || "",
    }));

    // Clear error on change
    setErrors((prev) => {
      if (prev.storeDescription) {
        return { ...prev, storeDescription: undefined };
      }
      return prev;
    });
  }, []);

  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => {
        const newTouched = { ...prev, [name]: true };
        const currentValue = formData[name];
        const error = validateField(name, currentValue);
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: error || undefined,
        }));
        return newTouched;
      });
    },
    [formData]
  );

  const handleLogoUpload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo file size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    await uploadImage(file, setStoreLogo, setLogoLoading);
  };

  const handleBannerUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Banner file size must be less than 10MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    await uploadImage(file, setStoreBanner, setBannerLoading);
  };

  const isLastStep = currentStep === steps.length - 1;

  const canGoNext = () => {
    const stepErrors = validateStep(currentStep);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);

    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      setTouched((prev) => {
        const newTouched = { ...prev };
        Object.keys(stepErrors).forEach((key) => {
          newTouched[key] = true;
        });
        return newTouched;
      });
      toast.error("Please fix the errors before continuing");
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all steps before submitting
    const allErrors = {};
    steps.forEach((_, index) => {
      const stepErrors = validateStep(index);
      Object.assign(allErrors, stepErrors);
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched((prev) => {
        const newTouched = { ...prev };
        Object.keys(allErrors).forEach((key) => {
          newTouched[key] = true;
        });
        return newTouched;
      });
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("storeName", formData.storeName.trim());
      if (formData.storeSlug)
        payload.append("storeSlug", formData.storeSlug.trim());
      if (formData.storeDescription)
        payload.append("storeDescription", formData.storeDescription);
      if (storeLogo) payload.append("storeLogo", storeLogo);
      if (storeBanner) payload.append("storeBanner", storeBanner);

      if (formData.contactEmail)
        payload.append("contactEmail", formData.contactEmail.trim());
      if (formData.contactPhone)
        payload.append("contactPhone", formData.contactPhone.trim());

      if (formData.address) payload.append("address", formData.address.trim());
      if (formData.city) payload.append("city", formData.city.trim());
      if (formData.state) payload.append("state", formData.state.trim());
      if (formData.country) payload.append("country", formData.country.trim());
      if (formData.postalCode)
        payload.append("postalCode", formData.postalCode.trim());

      if (formData.website) payload.append("website", formData.website.trim());
      if (formData.facebook)
        payload.append("facebook", formData.facebook.trim());
      if (formData.instagram)
        payload.append("instagram", formData.instagram.trim());
      if (formData.twitter) payload.append("twitter", formData.twitter.trim());
      if (formData.tiktok) payload.append("tiktok", formData.tiktok.trim());

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
          Authorization: auth?.token || "",
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl max-h-[98vh] rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden flex flex-col bg-white backdrop-blur-xl"
        >
          {/* Header + Stepper */}
          <div className="relative px-6 sm:px-8 pt-4  pb-6 border-b border-gray-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#c6080a]/5 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#e63946]/5 to-transparent rounded-full blur-2xl -ml-24 -mb-24" />

            <div className="relative flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#c6080a] via-[#e63946] to-rose-500 flex items-center justify-center text-white shadow-xl shadow-red-500/40 ring-4 ring-red-500/10"
                >
                  <FaStore className="text-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
                    {mode === "edit"
                      ? "Edit Seller Profile"
                      : "Create Seller Profile"}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1.5 font-medium">
                    Step {currentStep + 1} of {steps.length} •{" "}
                    <span className="text-gray-500">
                      {steps[currentStep]?.description}
                    </span>
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group"
              >
                <FaTimes className="text-sm transition-transform duration-200" />
              </motion.button>
            </div>

            {/* Enhanced Stepper bar */}
            <div className="relative mt-2">
              <div className="flex items-center justify-between mb-7 gap-3">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  const isClickable = index <= currentStep && !isSubmitting;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex-1 flex items-center gap-2 sm:gap-3 cursor-pointer group"
                      onClick={() => {
                        if (isClickable) {
                          setCurrentStep(index);
                        }
                      }}
                    >
                      <motion.div
                        whileHover={isClickable ? { scale: 1.1 } : {}}
                        className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-br from-[#c6080a] to-[#e63946] text-white border-transparent shadow-xl shadow-red-500/50 scale-110 ring-4 ring-red-500/20"
                            : isCompleted
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-500 shadow-lg"
                            : "bg-white text-gray-400 border-gray-300 group-hover:border-gray-400 group-hover:bg-gray-50"
                        }`}
                      >
                        {isCompleted ? (
                          <FaCheckCircle className="text-sm" />
                        ) : (
                          <span className="relative z-10">{index + 1}</span>
                        )}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-xl" />
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`block text-xs sm:text-sm font-semibold transition-colors duration-200 truncate ${
                            isActive
                              ? "text-[#c6080a]"
                              : isCompleted
                              ? "text-gray-700"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                        >
                          {step.label}
                        </span>
                        {isActive && (
                          <span className="text-xs text-gray-500 mt-0.5 block">
                            {step.description}
                          </span>
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`hidden sm:block flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                            isCompleted ? "bg-emerald-500" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
              {/* Progress bar */}
              <div className="relative w-full h-2 rounded-full bg-gray-100 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 rounded-full shadow-lg"
                  initial={false}
                  animate={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 space-y-8 bg-gradient-to-b from-white to-gray-50/30"
          >
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* STEP 1: BRANDING */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1.8fr] gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-6 bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl border border-gray-200/60 shadow-lg px-6 py-4 relative overflow-hidden"
                    >
                      {/* Decorative element */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c6080a]/5 to-transparent rounded-full blur-2xl -mr-16 -mt-16" />
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                          Store Branding
                        </p>
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-[#c6080a] to-[#e63946] overflow-hidden shadow-xl border-4 border-white flex items-center justify-center group">
                            {storeLogo ? (
                              <img
                                src={storeLogo}
                                alt="Store logo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaStore className="text-4xl text-white/80" />
                            )}
                            <label
                              htmlFor="store-logo-upload"
                              className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                                logoLoading
                                  ? "opacity-100 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {logoLoading ? (
                                <FaSpinner className="text-white text-xl animate-spin" />
                              ) : (
                                <FaUpload className="text-white text-lg" />
                              )}
                            </label>
                          </div>
                          <input
                            id="store-logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleLogoUpload(e.target.files?.[0])
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              document
                                .getElementById("store-logo-upload")
                                ?.click()
                            }
                            disabled={logoLoading}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                              logoLoading
                                ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50"
                                : "border-[#c6080a] text-[#c6080a] hover:bg-[#c6080a] hover:text-white cursor-pointer hover:shadow-md"
                            }`}
                          >
                            <FaImage className="text-sm" />
                            <span>
                              {logoLoading ? "Uploading..." : "Upload Logo"}
                            </span>
                          </button>
                          <p className="text-xs text-gray-500 text-center">
                            Recommended: Square image, 512x512px, max 5MB
                          </p>
                        </div>
                      </div>

                      <InputField
                        label="Store Name"
                        name="storeName"
                        placeholder="e.g. Darloo Studio"
                        required
                        value={formData.storeName || ""}
                        error={
                          touched.storeName && errors.storeName
                            ? errors.storeName
                            : undefined
                        }
                        isValid={
                          touched.storeName &&
                          !errors.storeName &&
                          formData.storeName?.trim()
                        }
                        onChange={handleChange}
                        onBlur={() => handleBlur("storeName")}
                      />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <span>Store Slug</span>
                            <span className="text-xs text-gray-400 font-normal">
                              (URL-friendly identifier)
                            </span>
                          </label>
                          {formData.storeName && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={regenerateSlug}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c6080a] hover:text-[#e63946] hover:bg-[#c6080a]/5 rounded-lg transition-all duration-200 border border-transparent hover:border-[#c6080a]/20"
                              title="Auto-generate slug from store name"
                            >
                              <FaSyncAlt className="text-xs" />
                              <span>Regenerate</span>
                            </motion.button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-400 whitespace-nowrap px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-l-xl">
                            /store/
                          </span>
                          <div className="flex-1 relative">
                            <InputField
                              label=""
                              name="storeSlug"
                              placeholder="your-unique-store-slug"
                              className="flex-1"
                              value={formData.storeSlug || ""}
                              error={
                                touched.storeSlug && errors.storeSlug
                                  ? errors.storeSlug
                                  : undefined
                              }
                              isValid={
                                touched.storeSlug &&
                                !errors.storeSlug &&
                                formData.storeSlug?.trim()
                              }
                              onChange={handleChange}
                              onBlur={() => handleBlur("storeSlug")}
                            />
                            {isSlugAutoGenerated && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-md border border-gray-200">
                                <FaSyncAlt className="text-xs" />
                                <span>Auto</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <FaEdit className="text-xs" />
                          <span>
                            {isSlugAutoGenerated
                              ? "Slug is auto-generated. Click 'Regenerate' or edit manually to customize."
                              : "Slug is manually set. Use 'Regenerate' to auto-generate from store name."}
                          </span>
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-6 bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl border border-gray-200/60 shadow-lg px-6 py-7 relative overflow-hidden"
                    >
                      {/* Decorative element */}
                      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#e63946]/5 to-transparent rounded-full blur-2xl -ml-16 -mt-16" />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Store Banner
                      </p>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">
                          Store Banner
                        </label>
                        <div className="relative h-40 w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden group hover:border-[#c6080a] transition-colors duration-200">
                          {storeBanner ? (
                            <img
                              src={storeBanner}
                              alt="Store banner"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-gray-400 text-sm px-4">
                              <FaImage className="text-3xl mx-auto mb-2 opacity-50" />
                              <p>
                                Upload a wide hero image (1920x600px
                                recommended)
                              </p>
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                          <div className="absolute bottom-3 right-3 pointer-events-auto">
                            <button
                              type="button"
                              onClick={() =>
                                document
                                  .getElementById("store-banner-upload")
                                  ?.click()
                              }
                              disabled={bannerLoading}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/95 backdrop-blur-sm shadow-lg border transition-all ${
                                bannerLoading
                                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                  : "border-[#c6080a] text-[#c6080a] hover:bg-[#c6080a] hover:text-white cursor-pointer"
                              }`}
                            >
                              {bannerLoading ? (
                                <>
                                  <FaSpinner className="text-sm animate-spin" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <FaUpload className="text-sm" />
                                  <span>Upload Banner</span>
                                </>
                              )}
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
                        <p className="text-xs text-gray-500">
                          Recommended: 1920x600px, max 10MB
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Store Description - Full Width */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative w-full bg-gradient-to-br from-white via-purple-50/30 to-white rounded-2xl border border-gray-200/60 shadow-lg px-6 py-7 overflow-hidden"
                  >
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <FaImage className="text-xs text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Store Story
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Describe your store with rich formatting
                        </p>
                      </div>
                    </div>

                    <RichTextEditor
                      label="Store Description"
                      value={formData.storeDescription || ""}
                      onChange={handleDescriptionChange}
                      placeholder="Tell your customers what makes your store special, what you sell and why they should trust you..."
                      maxLength={1000}
                      error={
                        touched.storeDescription && errors.storeDescription
                          ? errors.storeDescription
                          : undefined
                      }
                    />
                  </motion.div>
                </div>
              )}

              {/* STEP 2: CONTACT & ADDRESS */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-5 bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl border border-gray-200/60 shadow-lg px-6 py-4 relative overflow-hidden"
                  >
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-2xl -mr-20 -mt-20" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Contact Details
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Contact Email"
                        name="contactEmail"
                        type="email"
                        placeholder="support@yourstore.com"
                        icon={FaEnvelope}
                        value={formData.contactEmail || ""}
                        error={
                          touched.contactEmail && errors.contactEmail
                            ? errors.contactEmail
                            : undefined
                        }
                        isValid={
                          touched.contactEmail &&
                          !errors.contactEmail &&
                          formData.contactEmail?.trim()
                        }
                        onChange={handleChange}
                        onBlur={() => handleBlur("contactEmail")}
                      />
                      <InputField
                        label="Contact Phone"
                        name="contactPhone"
                        type="tel"
                        placeholder="+49 123 456789"
                        icon={FaPhone}
                        value={formData.contactPhone || ""}
                        error={
                          touched.contactPhone && errors.contactPhone
                            ? errors.contactPhone
                            : undefined
                        }
                        isValid={
                          touched.contactPhone &&
                          !errors.contactPhone &&
                          formData.contactPhone?.trim()
                        }
                        onChange={handleChange}
                        onBlur={() => handleBlur("contactPhone")}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-4 bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 sm:p-8"
                  >
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <FaMapMarkerAlt className="text-white text-lg" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                          Store Address
                        </h2>
                        <p className="text-xs text-gray-600">
                          Your registered business location
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2 relative">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-xs text-gray-500" />
                          Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="address"
                          value={addressQuery}
                          onChange={(e) => {
                            const value = e.target.value;
                            setAddressQuery(value);
                            handleChange(e);
                          }}
                          onBlur={() => handleBlur("address")}
                          rows={3}
                          placeholder="Start typing your full store address..."
                          className={`w-full px-4 py-2.5 text-sm rounded-xl border-2 transition-all duration-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 resize-none ${
                            touched.address && errors.address
                              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                              : touched.address &&
                                !errors.address &&
                                formData.address?.trim()
                              ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                              : "border-gray-200 focus:border-[#c6080a] focus:ring-[#c6080a]/20"
                          }`}
                        />
                        {isAddressLoading && (
                          <div className="absolute right-3 top-9">
                            <FaSpinner className="text-sm text-[#c6080a] animate-spin" />
                          </div>
                        )}
                        {addressSuggestions?.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-20 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl"
                          >
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
                                  handleBlur("address");
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-[#c6080a]/5 flex gap-2 transition-colors border-b border-gray-100 last:border-0"
                              >
                                <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{s.description}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                        <AnimatePresence>
                          {touched.address && errors.address && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-xs text-red-600 flex items-center gap-1"
                            >
                              <FaExclamationCircle className="text-xs" />
                              <span>{errors.address}</span>
                            </motion.p>
                          )}
                        </AnimatePresence>
                        {touched.address &&
                          !errors.address &&
                          formData.address?.trim() && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-emerald-600 flex items-center gap-1"
                            >
                              <FaCheckCircle className="text-xs" />
                              Looks good!
                            </motion.p>
                          )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="City"
                          name="city"
                          placeholder="Enter city"
                          icon={FaMapMarkerAlt}
                          value={formData.city || ""}
                          error={
                            touched.city && errors.city
                              ? errors.city
                              : undefined
                          }
                          isValid={
                            touched.city &&
                            !errors.city &&
                            formData.city?.trim()
                          }
                          onChange={handleChange}
                          onBlur={() => handleBlur("city")}
                        />
                        <InputField
                          label="State / Province"
                          name="state"
                          placeholder="Enter state or province"
                          icon={FaMapMarkerAlt}
                          value={formData.state || ""}
                          error={
                            touched.state && errors.state
                              ? errors.state
                              : undefined
                          }
                          isValid={
                            touched.state &&
                            !errors.state &&
                            formData.state?.trim()
                          }
                          onChange={handleChange}
                          onBlur={() => handleBlur("state")}
                        />
                        <InputField
                          label="Postal Code"
                          name="postalCode"
                          placeholder="Enter postal code"
                          icon={FaMapMarkerAlt}
                          value={formData.postalCode || ""}
                          error={
                            touched.postalCode && errors.postalCode
                              ? errors.postalCode
                              : undefined
                          }
                          isValid={
                            touched.postalCode &&
                            !errors.postalCode &&
                            formData.postalCode?.trim()
                          }
                          onChange={handleChange}
                          onBlur={() => handleBlur("postalCode")}
                        />
                        <InputField
                          label="Country"
                          name="country"
                          placeholder="Enter country"
                          icon={FaMapMarkerAlt}
                          value={formData.country || ""}
                          error={
                            touched.country && errors.country
                              ? errors.country
                              : undefined
                          }
                          isValid={
                            touched.country &&
                            !errors.country &&
                            formData.country?.trim()
                          }
                          onChange={handleChange}
                          onBlur={() => handleBlur("country")}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* STEP 3: SOCIAL & REVIEW */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-white via-purple-50/30 to-white rounded-2xl border border-gray-200/60 shadow-lg px-6 py-4 relative overflow-hidden"
                  >
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl -mr-24 -mt-24" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">
                      Social & Web Presence
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField
                        label="Website"
                        name="website"
                        type="url"
                        placeholder="https://yourstore.com"
                        icon={FaGlobe}
                        value={formData.website || ""}
                        error={
                          touched.website && errors.website
                            ? errors.website
                            : undefined
                        }
                        isValid={
                          touched.website &&
                          !errors.website &&
                          formData.website?.trim()
                        }
                        onChange={handleChange}
                        onBlur={() => handleBlur("website")}
                      />
                      <InputField
                        label="Facebook"
                        name="facebook"
                        type="url"
                        placeholder="https://facebook.com/yourpage"
                        icon={FaFacebookF}
                        value={formData.facebook || ""}
                        error={
                          touched.facebook && errors.facebook
                            ? errors.facebook
                            : undefined
                        }
                        isValid={
                          touched.facebook &&
                          !errors.facebook &&
                          formData.facebook?.trim()
                        }
                        onChange={handleChange}
                        onBlur={() => handleBlur("facebook")}
                      />
                      <InputField
                        label="Instagram"
                        name="instagram"
                        type="url"
                        placeholder="https://instagram.com/yourhandle"
                        icon={FaInstagram}
                        value={formData.instagram || ""}
                        error={
                          touched.instagram && errors.instagram
                            ? errors.instagram
                            : undefined
                        }
                        isValid={
                          touched.instagram &&
                          !errors.instagram &&
                          formData.instagram?.trim()
                        }
                        onChange={handleChange}
                        onBlur={() => handleBlur("instagram")}
                      />
                      <InputField
                        label="Twitter / X"
                        name="twitter"
                        type="url"
                        placeholder="https://twitter.com/yourhandle"
                        icon={FaTwitter}
                        value={formData.twitter || ""}
                        error={
                          touched.twitter && errors.twitter
                            ? errors.twitter
                            : undefined
                        }
                        isValid={
                          touched.twitter &&
                          !errors.twitter &&
                          formData.twitter?.trim()
                        }
                        onChange={handleChange}
                        onBlur={() => handleBlur("twitter")}
                      />
                      <InputField
                        label="TikTok"
                        name="tiktok"
                        type="url"
                        placeholder="https://tiktok.com/@yourhandle"
                        icon={FaTiktok}
                        value={formData.tiktok || ""}
                        error={
                          touched.tiktok && errors.tiktok
                            ? errors.tiktok
                            : undefined
                        }
                        isValid={
                          touched.tiktok &&
                          !errors.tiktok &&
                          formData.tiktok?.trim()
                        }
                        onChange={handleChange}
                        onBlur={() => handleBlur("tiktok")}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative rounded-2xl border-2 border-dashed border-amber-300/60 bg-gradient-to-br from-amber-50/80 via-yellow-50/50 to-amber-50/80 px-6 py-5 shadow-md backdrop-blur-sm"
                  >
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_50%)]" />
                    <p className="text-sm text-gray-700 flex items-start gap-2">
                      <FaCheckCircle className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>
                        You're almost done! Review your branding, contact
                        information, address, and social links before saving.
                        You can always come back and edit this profile later.
                      </span>
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Footer actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200/80 bg-gradient-to-r from-white via-gray-50/50 to-white backdrop-blur-sm sticky -bottom-8 -mx-6 sm:-mx-8 px-6 sm:px-8 pb-5 shadow-lg shadow-black/5">
              <p className="text-xs text-gray-500 max-w-md text-center sm:text-left">
                Your seller profile powers your public storefront. Keep it
                accurate and up to date.
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Cancel
                </motion.button>
                {currentStep > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handlePrev}
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    ← Back
                  </motion.button>
                )}
                {!isLastStep && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="relative px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 shadow-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Next Step
                      <span className="text-lg">→</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#e63946] via-rose-500 to-[#c6080a] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </motion.button>
                )}
                {isLastStep && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="relative px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 shadow-xl hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 overflow-hidden group"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin relative z-10" />
                        <span className="relative z-10">Saving...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">
                          {mode === "edit" ? "Save Changes" : "Create Profile"}
                        </span>
                        <FaCheckCircle className="relative z-10" />
                      </>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#e63946] via-rose-500 to-[#c6080a] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </motion.button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
