"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/authContext";
import {
  FaTruck,
  FaGlobe,
  FaClock,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaShippingFast,
  FaBox,
  FaDollarSign,
  FaToggleOn,
  FaToggleOff,
  FaInfoCircle,
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
    min,
    max,
    step,
    disabled = false,
  }) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          {Icon && <Icon className="text-xs text-gray-500" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
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
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
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
              exit={{ opacity: 0 }}
              className="text-xs text-emerald-600 flex items-center gap-1"
            >
              <FaCheckCircle className="text-xs" />
              Looks good!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default function ShippingSettingsTab({ seller, onUpdate }) {
  const { auth } = useAuth();
  const [shippingSettings, setShippingSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [editingMethodIndex, setEditingMethodIndex] = useState(null);
  const [newMethod, setNewMethod] = useState({
    name: "",
    type: "standard",
    deliveryTime: { min: 3, max: 7 },
    cost: 0,
    freeShippingThreshold: null,
    isActive: true,
  });

  const [formData, setFormData] = useState({
    shippingCountries: [],
    deliveryTimes: {
      domestic: { min: 3, max: 7 },
      international: { min: 7, max: 21 },
    },
    processingTime: 1,
    shippingMethods: [],
    freeShipping: {
      enabled: false,
      threshold: null,
      countries: [],
    },
  });

  const shippingTypes = [
    { value: "standard", label: "Standard", icon: "📦" },
    { value: "express", label: "Express", icon: "⚡" },
    { value: "overnight", label: "Overnight", icon: "🌙" },
    { value: "economy", label: "Economy", icon: "💰" },
  ];

  useEffect(() => {
    if (seller?._id) {
      fetchShippingSettings();
    }
  }, [seller?._id]);

  const fetchShippingSettings = async () => {
    if (!seller?._id || !auth?.token) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/shipping/${seller._id}`,
        {
          headers: {
            Authorization: auth.token,
          },
        }
      );

      if (data?.success && data.shippingSettings) {
        setShippingSettings(data.shippingSettings);
        setFormData({
          shippingCountries: data.shippingSettings.shippingCountries || [],
          deliveryTimes: data.shippingSettings.deliveryTimes || {
            domestic: { min: 3, max: 7 },
            international: { min: 7, max: 21 },
          },
          processingTime: data.shippingSettings.processingTime || 1,
          shippingMethods: data.shippingSettings.shippingMethods || [],
          freeShipping: data.shippingSettings.freeShipping || {
            enabled: false,
            threshold: null,
            countries: [],
          },
        });
      }
    } catch (error) {
      console.error("Error fetching shipping settings:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load shipping settings");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child, subChild] = name.split(".");
      setFormData((prev) => {
        const newData = { ...prev };
        if (subChild) {
          newData[parent] = {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: type === "number" ? parseFloat(value) || 0 : value,
            },
          };
        } else {
          newData[parent] = {
            ...prev[parent],
            [child]: type === "number" ? parseFloat(value) || 0 : value,
          };
        }
        return newData;
      });
    } else if (name === "freeShipping.enabled") {
      setFormData((prev) => ({
        ...prev,
        freeShipping: {
          ...prev.freeShipping,
          enabled: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseFloat(value) || 0 : value,
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

    if (name.includes("min") || name.includes("max")) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 1 || numValue > 365) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Must be between 1 and 365 days",
        }));
        return false;
      }
    }

    if (name === "processingTime") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 30) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Must be between 0 and 30 days",
        }));
        return false;
      }
    }

    return true;
  };

  const addShippingMethod = () => {
    if (!newMethod.name.trim()) {
      toast.error("Please enter a method name");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      shippingMethods: [...prev.shippingMethods, { ...newMethod }],
    }));
    setNewMethod({
      name: "",
      type: "standard",
      deliveryTime: { min: 3, max: 7 },
      cost: 0,
      freeShippingThreshold: null,
      isActive: true,
    });
    toast.success("Shipping method added");
  };

  const removeShippingMethod = (index) => {
    setFormData((prev) => ({
      ...prev,
      shippingMethods: prev.shippingMethods.filter((_, i) => i !== index),
    }));
    toast.success("Shipping method removed");
  };

  const updateShippingMethod = (index, field, value) => {
    setFormData((prev) => {
      const methods = [...prev.shippingMethods];
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        methods[index] = {
          ...methods[index],
          [parent]: {
            ...methods[index][parent],
            [child]: parseFloat(value) || 0,
          },
        };
      } else {
        methods[index] = {
          ...methods[index],
          [field]: typeof value === "boolean" ? value : parseFloat(value) || value,
        };
      }
      return { ...prev, shippingMethods: methods };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate delivery times
    if (
      formData.deliveryTimes.domestic.min >=
      formData.deliveryTimes.domestic.max
    ) {
      toast.error("Domestic min days must be less than max days");
      return;
    }
    if (
      formData.deliveryTimes.international.min >=
      formData.deliveryTimes.international.max
    ) {
      toast.error("International min days must be less than max days");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/shipping/${seller._id}`,
        formData,
        {
          headers: {
            Authorization: auth.token,
            "Content-Type": "application/json",
          },
        }
      );

      if (data?.success) {
        toast.success("Shipping settings updated successfully!");
        setIsEditing(false);
        fetchShippingSettings();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error("Error updating shipping settings:", error);
      toast.error(
        error.response?.data?.message || "Failed to update shipping settings"
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
          <p className="text-sm text-gray-600">Loading shipping settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 rounded-3xl border-2 border-blue-200/60 p-6 sm:p-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <FaTruck className="text-2xl text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Shipping Settings
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Configure your shipping methods, delivery times, and regions
              </p>
            </div>
          </div>
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#c6080a] via-[#e63946] to-rose-500 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <FaEdit className="text-sm" />
              <span>Edit Settings</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Processing Time & Delivery Times */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Processing Time */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <FaClock className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Processing Time
                </h3>
                <p className="text-xs text-gray-600">
                  Days to process order before shipping
                </p>
              </div>
            </div>
            <InputField
              label="Processing Days"
              name="processingTime"
              type="number"
              placeholder="1"
              required
              icon={FaClock}
              value={formData.processingTime}
              error={touched.processingTime && errors.processingTime}
              isValid={
                touched.processingTime &&
                !errors.processingTime &&
                formData.processingTime
              }
              onChange={handleChange}
              onBlur={() => handleBlur("processingTime")}
              min={0}
              max={30}
              disabled={!isEditing}
            />
          </motion.div>

          {/* Delivery Times Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <FaShippingFast className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Times
                </h3>
                <p className="text-xs text-gray-600">Default delivery ranges</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Domestic (days)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex-1">
                    <InputField
                      label="Min"
                      name="deliveryTimes.domestic.min"
                      type="number"
                      value={formData.deliveryTimes.domestic.min}
                      onChange={handleChange}
                      min={1}
                      max={365}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex-1">
                    <InputField
                      label="Max"
                      name="deliveryTimes.domestic.max"
                      type="number"
                      value={formData.deliveryTimes.domestic.max}
                      onChange={handleChange}
                      min={1}
                      max={365}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-2 block">
                  International (days)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex-1">
                    <InputField
                      label="Min"
                      name="deliveryTimes.international.min"
                      type="number"
                      value={formData.deliveryTimes.international.min}
                      onChange={handleChange}
                      min={1}
                      max={365}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="flex-1">
                    <InputField
                      label="Max"
                      name="deliveryTimes.international.max"
                      type="number"
                      value={formData.deliveryTimes.international.max}
                      onChange={handleChange}
                      min={1}
                      max={365}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Free Shipping Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50 rounded-2xl border-2 border-emerald-200/60 shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <FaDollarSign className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Free Shipping
                </h3>
                <p className="text-xs text-gray-600">
                  Enable free shipping for orders above a threshold
                </p>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  freeShipping: {
                    ...prev.freeShipping,
                    enabled: !prev.freeShipping.enabled,
                  },
                }))
              }
              disabled={!isEditing}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                formData.freeShipping.enabled
                  ? "bg-emerald-500"
                  : "bg-gray-300"
              } ${!isEditing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <motion.div
                className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                animate={{
                  x: formData.freeShipping.enabled ? 24 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
          {formData.freeShipping.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 space-y-4"
            >
              <InputField
                label="Free Shipping Threshold (€)"
                name="freeShipping.threshold"
                type="number"
                placeholder="50"
                icon={FaDollarSign}
                value={formData.freeShipping.threshold || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    freeShipping: {
                      ...prev.freeShipping,
                      threshold: parseFloat(e.target.value) || null,
                    },
                  }))
                }
                min={0}
                disabled={!isEditing}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Shipping Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <FaBox className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Shipping Methods
                </h3>
                <p className="text-xs text-gray-600">
                  Configure your shipping options
                </p>
              </div>
            </div>
            {isEditing && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addShippingMethod}
                className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-[#c6080a] to-[#e63946] shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <FaPlus className="text-sm" />
                <span>Add Method</span>
              </motion.button>
            )}
          </div>

          {/* Add New Method Form */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 space-y-4"
            >
              <h4 className="text-sm font-bold text-gray-700">
                Add New Shipping Method
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Method Name"
                  name="newMethodName"
                  placeholder="Standard Shipping"
                  value={newMethod.name}
                  onChange={(e) =>
                    setNewMethod((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">
                    Type
                  </label>
                  <select
                    value={newMethod.type}
                    onChange={(e) =>
                      setNewMethod((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-gray-200 focus:border-[#c6080a] focus:ring-2 focus:ring-[#c6080a]/20"
                  >
                    {shippingTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="Min Days"
                    name="newMethodMin"
                    type="number"
                    value={newMethod.deliveryTime.min}
                    onChange={(e) =>
                      setNewMethod((prev) => ({
                        ...prev,
                        deliveryTime: {
                          ...prev.deliveryTime,
                          min: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    min={1}
                    max={365}
                  />
                  <InputField
                    label="Max Days"
                    name="newMethodMax"
                    type="number"
                    value={newMethod.deliveryTime.max}
                    onChange={(e) =>
                      setNewMethod((prev) => ({
                        ...prev,
                        deliveryTime: {
                          ...prev.deliveryTime,
                          max: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    min={1}
                    max={365}
                  />
                </div>
                <InputField
                  label="Cost (€)"
                  name="newMethodCost"
                  type="number"
                  value={newMethod.cost}
                  onChange={(e) =>
                    setNewMethod((prev) => ({
                      ...prev,
                      cost: parseFloat(e.target.value) || 0,
                    }))
                  }
                  min={0}
                  step="0.01"
                />
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addShippingMethod}
                className="w-full px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FaPlus className="text-sm" />
                <span>Add Method</span>
              </motion.button>
            </motion.div>
          )}

          {/* Existing Methods */}
          <div className="space-y-4">
            {formData.shippingMethods.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <FaBox className="text-4xl text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  No shipping methods configured yet
                </p>
              </div>
            ) : (
              formData.shippingMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 bg-gradient-to-br from-white via-gray-50/50 to-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                        {shippingTypes.find((t) => t.value === method.type)
                          ?.icon || "📦"}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {method.name}
                        </h4>
                        <p className="text-xs text-gray-600 capitalize">
                          {method.type} • {method.deliveryTime.min}-
                          {method.deliveryTime.max} days
                        </p>
                      </div>
                    </div>
                    {isEditing && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeShippingMethod(index)}
                        className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                      >
                        <FaTrash className="text-xs" />
                      </motion.button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputField
                        label="Cost (€)"
                        name={`method-${index}-cost`}
                        type="number"
                        value={method.cost}
                        onChange={(e) =>
                          updateShippingMethod(index, "cost", e.target.value)
                        }
                        min={0}
                        step="0.01"
                      />
                      <InputField
                        label="Free Threshold (€)"
                        name={`method-${index}-threshold`}
                        type="number"
                        value={method.freeShippingThreshold || ""}
                        onChange={(e) =>
                          updateShippingMethod(
                            index,
                            "freeShippingThreshold",
                            e.target.value
                          )
                        }
                        min={0}
                        step="0.01"
                      />
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-gray-700">
                          Active
                        </label>
                        <motion.button
                          type="button"
                          onClick={() =>
                            updateShippingMethod(index, "isActive", !method.isActive)
                          }
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                            method.isActive ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                        >
                          <motion.div
                            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                            animate={{
                              x: method.isActive ? 24 : 0,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <FaDollarSign className="text-gray-500" />
                        <span className="font-semibold text-gray-900">
                          €{method.cost.toFixed(2)}
                        </span>
                      </div>
                      {method.freeShippingThreshold && (
                        <div className="flex items-center gap-2">
                          <FaInfoCircle className="text-gray-500" />
                          <span className="text-gray-600">
                            Free over €{method.freeShippingThreshold}
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          method.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {method.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Submit Buttons */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200"
          >
            <motion.button
              type="button"
              onClick={() => {
                setIsEditing(false);
                fetchShippingSettings();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <FaTimes className="text-sm" />
              <span>Cancel</span>
            </motion.button>
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </form>
    </div>
  );
}

