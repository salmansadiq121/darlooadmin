"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { uploadImage } from "@/app/utils/uploadFile";
import { useAuth } from "@/app/context/authContext";
import PhoneInput from "react-phone-number-input";
import { parsePhoneNumber } from "libphonenumber-js";
import "react-phone-number-input/style.css";
import {
  FaShieldAlt,
  FaUpload,
  FaImage,
  FaSpinner,
  FaCheckCircle,
  FaTimes,
  FaExclamationCircle,
  FaInfoCircle,
  FaFileAlt,
  FaBuilding,
  FaIdCard,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaCreditCard,
  FaEdit,
} from "react-icons/fa";

const InputField = React.memo(
  ({
    label,
    name,
    type = "text",
    placeholder,
    required = false,
    icon: Icon,
    value,
    error,
    isValid,
    onChange,
    onBlur,
    options,
    disabled = false,
  }) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          {Icon && <Icon className="text-xs text-gray-500" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        {type === "select" ? (
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={`w-full px-4 py-2.5 text-sm rounded-xl border-2 transition-all duration-200 ${
              disabled
                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white"
            } ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : isValid
                ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                : "border-gray-200 focus:border-[#c6080a] focus:ring-[#c6080a]/20"
            } focus:outline-none focus:ring-2`}
          >
            <option value="">Select {label}</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={`w-full px-4 py-2.5 text-sm rounded-xl border-2 transition-all duration-200 ${
              disabled
                ? "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white"
            } ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                : isValid
                ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                : "border-gray-200 focus:border-[#c6080a] focus:ring-[#c6080a]/20"
            } focus:outline-none focus:ring-2`}
          />
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-600 flex items-center gap-1"
          >
            <FaExclamationCircle className="text-xs" />
            {error}
          </motion.p>
        )}
        {isValid && !error && (
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
    );
  }
);

InputField.displayName = "InputField";

export default function VerificationTab({ seller, onUpdate }) {
  const { auth } = useAuth();
  const [verification, setVerification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    identityDocument: {
      type: "",
    },
    phone: "",
    phoneCode: "",
    email: "",
    bankDetails: {
      accountHolderName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
      accountType: "",
    },
  });
  const [frontImage, setFrontImage] = useState("");
  const [backImage, setBackImage] = useState("");
  const [frontImageLoading, setFrontImageLoading] = useState(false);
  const [backImageLoading, setBackImageLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const documentTypes = [
    { value: "passport", label: "Passport" },
    { value: "national_id", label: "National ID" },
  ];

  const accountTypes = [
    { value: "checking", label: "Checking" },
    { value: "savings", label: "Savings" },
    { value: "current", label: "Current" },
    { value: "business", label: "Business" },
  ];

  useEffect(() => {
    if (seller?._id) {
      fetchVerificationStatus();
    }
  }, [seller?._id]);

  const fetchVerificationStatus = async () => {
    if (!seller?._id || !auth?.token) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/verification/${seller._id}`,
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );

      if (data?.success && data.verification) {
        setVerification(data.verification);
        const phoneCode = data.verification.phoneCode || "+1";
        const phone = data.verification.phone || "";
        setFormData({
          businessName: data.verification.businessName || "",
          identityDocument: {
            type: data.verification.identityDocument?.type || "",
          },
          phone: phoneCode && phone ? `${phoneCode}${phone}` : "",
          phoneCode: phoneCode,
          email: data.verification.email || "",
          bankDetails: {
            accountHolderName:
              data.verification.bankDetails?.accountHolderName || "",
            accountNumber: data.verification.bankDetails?.accountNumber || "",
            bankName: data.verification.bankDetails?.bankName || "",
            ifscCode: data.verification.bankDetails?.ifscCode || "",
            accountType: data.verification.bankDetails?.accountType || "",
          },
        });
        setFrontImage(data.verification.identityDocument?.frontImage || "");
        setBackImage(data.verification.identityDocument?.backImage || "");
        setIsEditing(false); // Reset edit mode when loading data
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error fetching verification:", error);
        toast.error("Failed to load verification status");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error on change
    setErrors((prev) => {
      if (prev[name]) {
        return { ...prev, [name]: undefined };
      }
      return prev;
    });
  }, []);

  const handleBlur = useCallback(
    (name) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name);
    },
    [formData]
  );

  const validateField = (name) => {
    const value = name.includes(".")
      ? name.split(".").reduce((obj, key) => obj?.[key], formData)
      : formData[name];

    // Identity Document validations
    if (
      name.includes("identityDocument.type") &&
      !formData.identityDocument.type
    ) {
      setErrors((prev) => ({
        ...prev,
        "identityDocument.type": "Document type is required",
      }));
      return false;
    }
    if (
      name.includes("identityDocument.number") &&
      !formData.identityDocument.number
    ) {
      setErrors((prev) => ({
        ...prev,
        "identityDocument.number": "Document number is required",
      }));
      return false;
    }

    // Bank Details validations
    if (
      name.includes("bankDetails.accountHolderName") &&
      !formData.bankDetails.accountHolderName?.trim()
    ) {
      setErrors((prev) => ({
        ...prev,
        "bankDetails.accountHolderName": "Account holder name is required",
      }));
      return false;
    }
    if (name.includes("bankDetails.accountNumber")) {
      const rawAccount = formData.bankDetails.accountNumber || "";
      const normalizedAccount = rawAccount.replace(/[\s-]/g, "");

      if (!normalizedAccount.trim()) {
        setErrors((prev) => ({
          ...prev,
          "bankDetails.accountNumber": "Account number is required",
        }));
        return false;
      }

      // Advanced-style validation similar to Stripe heuristics
      // 1. Allow only letters, numbers, spaces and dashes
      if (!/^[0-9A-Za-z]+$/.test(normalizedAccount)) {
        setErrors((prev) => ({
          ...prev,
          "bankDetails.accountNumber":
            "Account number can only contain letters and numbers",
        }));
        return false;
      }

      // 2. Basic length checks (IBAN-like vs local account)
      // IBAN style: starts with 2 letters followed by alphanumerics, length 15–34
      if (/^[A-Za-z]{2}[0-9A-Za-z]+$/.test(normalizedAccount)) {
        if (normalizedAccount.length < 15 || normalizedAccount.length > 34) {
          setErrors((prev) => ({
            ...prev,
            "bankDetails.accountNumber":
              "IBAN numbers must be between 15 and 34 characters",
          }));
          return false;
        }
      } else {
        // Local-style account number: numeric or alphanumeric, 6–34 chars
        if (normalizedAccount.length < 6 || normalizedAccount.length > 34) {
          setErrors((prev) => ({
            ...prev,
            "bankDetails.accountNumber":
              "Account number length looks invalid. Please double‑check it.",
          }));
          return false;
        }
      }
    }
    if (
      name.includes("bankDetails.bankName") &&
      !formData.bankDetails.bankName?.trim()
    ) {
      setErrors((prev) => ({
        ...prev,
        "bankDetails.bankName": "Bank name is required",
      }));
      return false;
    }
    if (
      name.includes("bankDetails.accountType") &&
      !formData.bankDetails.accountType
    ) {
      setErrors((prev) => ({
        ...prev,
        "bankDetails.accountType": "Account type is required",
      }));
      return false;
    }

    // General required fields
    if (!value && ["businessName", "phone", "email"].includes(name)) {
      setErrors((prev) => ({ ...prev, [name]: "This field is required" }));
      return false;
    }
    if (
      name === "email" &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      setErrors((prev) => ({ ...prev, [name]: "Please enter a valid email" }));
      return false;
    }

    return true;
  };

  const handleImageUpload = async (file, setImage, setLoading) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    await uploadImage(file, setImage, setLoading);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields (matching backend requirements)
    const requiredFields = [
      "businessName",
      "identityDocument.type",
      "phone",
      "email",
      "bankDetails.accountHolderName",
      "bankDetails.accountNumber",
      "bankDetails.bankName",
      "bankDetails.accountType",
    ];

    const newErrors = {};
    requiredFields.forEach((field) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        if (!formData[parent]?.[child]) {
          newErrors[field] = "This field is required";
        }
      } else if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    // Advanced account number validation (same rules as blur-time validation)
    if (formData.bankDetails?.accountNumber) {
      const rawAccount = formData.bankDetails.accountNumber;
      const normalizedAccount = rawAccount.replace(/[\s-]/g, "");

      if (!/^[0-9A-Za-z]+$/.test(normalizedAccount)) {
        newErrors["bankDetails.accountNumber"] =
          "Account number can only contain letters and numbers";
      } else if (/^[A-Za-z]{2}[0-9A-Za-z]+$/.test(normalizedAccount)) {
        if (normalizedAccount.length < 15 || normalizedAccount.length > 34) {
          newErrors["bankDetails.accountNumber"] =
            "IBAN numbers must be between 15 and 34 characters";
        }
      } else if (
        normalizedAccount.length < 6 ||
        normalizedAccount.length > 34
      ) {
        newErrors["bankDetails.accountNumber"] =
          "Account number length looks invalid. Please double‑check it.";
      }
    }

    if (!frontImage) {
      newErrors.frontImage = "Front image of identity document is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched((prev) => {
        const newTouched = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          newTouched[key] = true;
        });
        return newTouched;
      });
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Extract phone code and number from PhoneInput format
      let phoneCode = formData.phoneCode || "+1";
      let phoneNumber = formData.phone || "";

      if (formData.phone) {
        try {
          const parsed = parsePhoneNumber(formData.phone);
          if (parsed && parsed.isValid()) {
            phoneCode = `+${parsed.countryCallingCode}`;
            phoneNumber = parsed.nationalNumber;
          }
        } catch (error) {
          // If parsing fails, try to extract manually
          const match = formData.phone.match(/^\+(\d+)(.+)$/);
          if (match) {
            phoneCode = `+${match[1]}`;
            phoneNumber = match[2];
          }
        }
      }

      const payload = {
        businessName: formData.businessName.trim(),

        identityDocument: {
          type: formData.identityDocument.type,
          frontImage,
          backImage: backImage || "",
        },
        phone: phoneNumber.trim(),
        phoneCode: phoneCode,
        email: formData.email.trim().toLowerCase(),
        bankDetails: {
          accountHolderName: formData.bankDetails.accountHolderName.trim(),
          accountNumber: formData.bankDetails.accountNumber.trim(),
          bankName: formData.bankDetails.bankName.trim(),
          ifscCode: formData.bankDetails.ifscCode?.trim().toUpperCase() || "",
          accountType: formData.bankDetails.accountType,
        },
        frontImage,
        backImage: backImage || "",
      };

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/verification/submit/${seller._id}`,
        payload,
        {
          headers: {
            Authorization: auth.token,
            "Content-Type": "application/json",
          },
        }
      );

      if (data?.success) {
        toast.success(
          isEditing
            ? "Verification documents updated successfully!"
            : "Verification documents submitted successfully!"
        );
        setIsEditing(false);
        fetchVerificationStatus();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit verification documents"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="text-4xl text-[#c6080a] animate-spin" />
          <p className="text-sm text-gray-600">
            Loading verification status...
          </p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      label: "Under Review",
      bg: "from-amber-500 to-amber-600",
      icon: FaInfoCircle,
      message:
        "Your verification documents are being reviewed. We'll notify you once the review is complete.",
    },
    approved: {
      label: "Verified",
      bg: "from-emerald-500 to-emerald-600",
      icon: FaCheckCircle,
      message: "Congratulations! Your seller account has been verified.",
    },
    rejected: {
      label: "Rejected",
      bg: "from-red-500 to-red-600",
      icon: FaTimes,
      message:
        verification?.rejectionReason ||
        "Your verification was rejected. Please review and resubmit.",
    },
    requires_changes: {
      label: "Changes Required",
      bg: "from-blue-500 to-blue-600",
      icon: FaInfoCircle,
      message:
        verification?.rejectionReason ||
        "Please update your verification documents as requested.",
    },
  };

  const status = verification?.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  // Determine if form should be disabled (approved status and not editing)
  const isFormDisabled =
    verification && verification.status === "approved" && !isEditing;

  return (
    <div className="space-y-6">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .phone-input-custom .PhoneInputInput {
          border: none;
          outline: none;
          background: transparent;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          width: 100%;
          color: #111827;
        }
        .phone-input-custom:disabled .PhoneInputInput {
          color: #6b7280;
          cursor: not-allowed;
        }
        .phone-input-custom .PhoneInputCountry {
          padding-left: 1rem;
          padding-right: 0.5rem;
        }
        .phone-input-custom .PhoneInputCountryIcon {
          width: 1.5rem;
          height: 1.5rem;
        }
        .phone-input-custom .PhoneInputCountrySelect {
          border: none;
          background: transparent;
          padding: 0.625rem 0.25rem;
          font-size: 0.875rem;
          color: #111827;
          cursor: pointer;
        }
        .phone-input-custom:disabled .PhoneInputCountrySelect {
          color: #6b7280;
          cursor: not-allowed;
        }
        .phone-input-custom:focus-within .PhoneInputInput {
          outline: none;
        }
      `,
        }}
      />
      {/* Status Banner */}
      {verification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${config.bg} text-white p-6 shadow-xl`}
        >
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <StatusIcon className="text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">{config.label}</h3>
              <p className="text-sm text-white/90">{config.message}</p>
              {verification.reviewedAt && (
                <p className="text-xs text-white/70 mt-2">
                  Reviewed on{" "}
                  {new Date(verification.reviewedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        </motion.div>
      )}

      {/* Edit Button - Show when verification exists and not in edit mode */}
      {verification && !isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <FaEdit className="text-sm" />
            <span>Edit Verification</span>
          </motion.button>
        </motion.div>
      )}

      {/* Verification Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 sm:p-8 space-y-8"
      >
        {/* Business Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <FaBuilding className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Business Information
              </h2>
              <p className="text-xs text-gray-600">
                Provide your business details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Business Name"
              name="businessName"
              placeholder="Enter your business name"
              required
              icon={FaBuilding}
              value={formData.businessName}
              error={touched.businessName && errors.businessName}
              isValid={
                touched.businessName &&
                !errors.businessName &&
                formData.businessName
              }
              onChange={handleChange}
              onBlur={() => handleBlur("businessName")}
              disabled={isFormDisabled}
            />
          </div>
        </div>

        {/* Identity Document */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <FaIdCard className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Identity Document
              </h2>
              <p className="text-xs text-gray-600">
                Upload your government-issued ID
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputField
                label="Document Type"
                name="identityDocument.type"
                type="select"
                required
                icon={FaFileAlt}
                value={formData.identityDocument.type}
                error={
                  touched["identityDocument.type"] &&
                  errors["identityDocument.type"]
                }
                isValid={
                  touched["identityDocument.type"] &&
                  !errors["identityDocument.type"] &&
                  formData.identityDocument.type
                }
                onChange={handleChange}
                onBlur={() => handleBlur("identityDocument.type")}
                options={documentTypes}
                disabled={isFormDisabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Front Image */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <FaImage className="text-xs text-gray-500" />
                Front Image <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload(
                      e.target.files[0],
                      setFrontImage,
                      setFrontImageLoading
                    )
                  }
                  className="hidden"
                  id="frontImage"
                  disabled={isFormDisabled}
                />
                <label
                  htmlFor="frontImage"
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-colors ${
                    isFormDisabled
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  {frontImage ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image
                        src={frontImage}
                        alt="Front ID"
                        fill
                        className="object-cover"
                      />
                      {!isFormDisabled && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFrontImage("");
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      {frontImageLoading ? (
                        <FaSpinner className="text-2xl animate-spin" />
                      ) : (
                        <>
                          <FaUpload className="text-3xl" />
                          <span className="text-xs">
                            Click to upload front image
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </label>
              </div>
              {touched.frontImage && errors.frontImage && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <FaExclamationCircle className="text-xs" />
                  {errors.frontImage}
                </p>
              )}
            </div>

            {/* Back Image */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <FaImage className="text-xs text-gray-500" />
                Back Image (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload(
                      e.target.files[0],
                      setBackImage,
                      setBackImageLoading
                    )
                  }
                  className="hidden"
                  id="backImage"
                  disabled={isFormDisabled}
                />
                <label
                  htmlFor="backImage"
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-colors ${
                    isFormDisabled
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  {backImage ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <Image
                        src={backImage}
                        alt="Back ID"
                        fill
                        className="object-cover"
                      />
                      {!isFormDisabled && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBackImage("");
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      {backImageLoading ? (
                        <FaSpinner className="text-2xl animate-spin" />
                      ) : (
                        <>
                          <FaUpload className="text-3xl" />
                          <span className="text-xs">
                            Click to upload back image
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
              <FaPhone className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Contact Information
              </h2>
              <p className="text-xs text-gray-600">Business contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                <FaPhone className="text-xs text-gray-500" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div
                className={`w-full rounded-xl border-2 transition-all duration-200 ${
                  isFormDisabled
                    ? "bg-gray-100 border-gray-200 opacity-60"
                    : "bg-white"
                } ${
                  touched.phone && errors.phone
                    ? "border-red-400 focus-within:border-red-500 focus-within:ring-red-500/20"
                    : touched.phone && formData.phone
                    ? "border-emerald-400 focus-within:border-emerald-500 focus-within:ring-emerald-500/20"
                    : "border-gray-200 focus-within:border-[#c6080a] focus-within:ring-[#c6080a]/20"
                } focus-within:outline-none focus-within:ring-2`}
              >
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={formData.phone}
                  onChange={(value) => {
                    if (!isFormDisabled) {
                      setFormData((prev) => ({ ...prev, phone: value || "" }));
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }
                  }}
                  onBlur={() => handleBlur("phone")}
                  className="phone-input-custom"
                  disabled={isFormDisabled}
                />
              </div>
              {touched.phone && errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-600 flex items-center gap-1 mt-1"
                >
                  <FaExclamationCircle className="text-xs" />
                  {errors.phone}
                </motion.p>
              )}
              {touched.phone && !errors.phone && formData.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-emerald-600 flex items-center gap-1 mt-1"
                >
                  <FaCheckCircle className="text-xs" />
                  Looks good!
                </motion.p>
              )}
            </div>

            <div className="">
              <InputField
                label="Business Email"
                name="email"
                type="email"
                placeholder="Enter business email"
                required
                icon={FaEnvelope}
                value={formData.email}
                error={touched.email && errors.email}
                isValid={
                  touched.email &&
                  !errors.email &&
                  formData.email &&
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                }
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                disabled={isFormDisabled}
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <FaCreditCard className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Bank Details
              </h2>
              <p className="text-xs text-gray-600">For payment processing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField
                label="Account Holder Name"
                name="bankDetails.accountHolderName"
                placeholder="Enter account holder name"
                required
                icon={FaCreditCard}
                value={formData.bankDetails.accountHolderName}
                error={
                  touched["bankDetails.accountHolderName"] &&
                  errors["bankDetails.accountHolderName"]
                }
                isValid={
                  touched["bankDetails.accountHolderName"] &&
                  !errors["bankDetails.accountHolderName"] &&
                  formData.bankDetails.accountHolderName
                }
                onChange={handleChange}
                onBlur={() => handleBlur("bankDetails.accountHolderName")}
                disabled={isFormDisabled}
              />
            </div>

            <InputField
              label="Account Number"
              name="bankDetails.accountNumber"
              placeholder="Enter account number"
              required
              icon={FaCreditCard}
              value={formData.bankDetails.accountNumber}
              error={
                touched["bankDetails.accountNumber"] &&
                errors["bankDetails.accountNumber"]
              }
              isValid={
                touched["bankDetails.accountNumber"] &&
                !errors["bankDetails.accountNumber"] &&
                formData.bankDetails.accountNumber
              }
              onChange={handleChange}
              onBlur={() => handleBlur("bankDetails.accountNumber")}
              disabled={isFormDisabled}
            />

            <InputField
              label="Bank Name"
              name="bankDetails.bankName"
              placeholder="Enter bank name"
              required
              icon={FaCreditCard}
              value={formData.bankDetails.bankName}
              error={
                touched["bankDetails.bankName"] &&
                errors["bankDetails.bankName"]
              }
              isValid={
                touched["bankDetails.bankName"] &&
                !errors["bankDetails.bankName"] &&
                formData.bankDetails.bankName
              }
              onChange={handleChange}
              onBlur={() => handleBlur("bankDetails.bankName")}
              disabled={isFormDisabled}
            />

            <InputField
              label="IFSC Code (Optional)"
              name="bankDetails.ifscCode"
              placeholder="Enter IFSC code"
              icon={FaCreditCard}
              value={formData.bankDetails.ifscCode}
              onChange={handleChange}
              disabled={isFormDisabled}
            />

            <div>
              <InputField
                label="Account Type"
                name="bankDetails.accountType"
                type="select"
                required
                icon={FaCreditCard}
                value={formData.bankDetails.accountType}
                error={
                  touched["bankDetails.accountType"] &&
                  errors["bankDetails.accountType"]
                }
                isValid={
                  touched["bankDetails.accountType"] &&
                  !errors["bankDetails.accountType"] &&
                  formData.bankDetails.accountType
                }
                onChange={handleChange}
                onBlur={() => handleBlur("bankDetails.accountType")}
                options={accountTypes}
                disabled={isFormDisabled}
              />
            </div>
          </div>
        </div>

        {/* Submit/Cancel Buttons */}
        {(!verification || isEditing) && (
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            {isEditing && (
              <motion.button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  // Reload original data
                  fetchVerificationStatus();
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <FaTimes className="text-sm" />
                <span>Cancel</span>
              </motion.button>
            )}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>{isEditing ? "Updating..." : "Submitting..."}</span>
                </>
              ) : (
                <>
                  <FaShieldAlt />
                  <span>
                    {isEditing ? "Update Verification" : "Submit Verification"}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.form>
    </div>
  );
}
