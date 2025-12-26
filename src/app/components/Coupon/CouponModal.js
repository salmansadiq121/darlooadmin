"use client";

import { Style } from "@/app/utils/CommonStyle";
import { useAuth } from "@/app/context/authContext";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CgClose } from "react-icons/cg";
import { FaSpinner, FaPercent, FaDollarSign, FaInfoCircle } from "react-icons/fa";
import { RiCoupon4Line, RiCoupon2Fill } from "react-icons/ri";
import { BiSolidDiscount } from "react-icons/bi";
import { HiUsers, HiShoppingBag } from "react-icons/hi";
import { MdAccessTime, MdStore } from "react-icons/md";
import { IoCheckmarkCircle } from "react-icons/io5";
import Select from "react-select";

export default function CouponModal({
  setShowCoupon,
  couponId,
  setCouponId,
  fetchCoupons,
  sellerId,
  userRole,
}) {
  const { auth } = useAuth();
  const [productData, setProductData] = useState([]);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [fixedDiscount, setFixedDiscount] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [minPurchase, setMinPurchase] = useState(0);
  const [productIds, setProductIds] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [selectAllProducts, setSelectAllProducts] = useState(false);
  const [usageLimit, setUsageLimit] = useState(0);
  const [usagePerUser, setUsagePerUser] = useState(1);
  const [description, setDescription] = useState("");
  const [activeSection, setActiveSection] = useState("basic");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const isSeller = userRole === "seller";

  const getUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/`
      );
      if (data?.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.log("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const getProducts = async () => {
    setIsLoadingProducts(true);
    try {
      // If seller, get only seller's products, otherwise get all
      const endpoint = sellerId
        ? `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/coupon/seller-products/${sellerId}`
        : `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/coupon`;

      const { data } = await axios.get(endpoint, {
        headers: { Authorization: auth?.token },
      });
      if (data?.success) {
        setProductData(data.products || []);
      }
    } catch (error) {
      console.log("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      getProducts();
      getUsers();
    }
    // eslint-disable-next-line
  }, [sellerId, auth?.token]);

  const getCouponInfo = async () => {
    if (!couponId) return;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/coupon/detail/${couponId}`
      );
      if (data) {
        const coupon = data.coupon;
        setCode(coupon.code);
        setDiscountType(coupon.discountType || "percentage");
        setDiscountPercentage(coupon.discountPercentage);
        setFixedDiscount(coupon.fixedDiscount || 0);
        setMaxDiscount(coupon.maxDiscount);
        setMinPurchase(coupon.minPurchase);
        setUsageLimit(coupon.usageLimit || 0);
        setUsagePerUser(coupon.usagePerUser || 1);
        setDescription(coupon.description || "");
        setProductIds(
          coupon.productIds.map((product) => ({
            value: product._id,
            label: product.name,
            image: product.thumbnails?.[0]?.url,
            price: product.price,
          }))
        );
        const formatDateForInput = (date) => {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = (d.getMonth() + 1).toString().padStart(2, "0");
          const day = d.getDate().toString().padStart(2, "0");
          return `${year}-${month}-${day}`;
        };
        setStartDate(formatDateForInput(coupon.startDate));
        setEndDate(formatDateForInput(coupon.endDate));
        setIsPublic(coupon.isPublic);
        setUserIds(
          coupon.users?.map((user) => ({
            value: user._id,
            label: user.name || user.email,
          })) || []
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCouponInfo();
    // eslint-disable-next-line
  }, [couponId]);

  useEffect(() => {
    if (selectAllProducts && productData.length > 0) {
      const allProducts = productData.map((product) => ({
        value: product._id,
        label: product.name,
        image: product.thumbnails?.[0]?.url,
        price: product.price,
      }));
      setProductIds(allProducts);
    }
  }, [selectAllProducts, productData]);

  const handleSelectAllProducts = (checked) => {
    setSelectAllProducts(checked);
    if (checked) {
      const allProducts = productData.map((product) => ({
        value: product._id,
        label: product.name,
        image: product.thumbnails?.[0]?.url,
        price: product.price,
      }));
      setProductIds(allProducts);
    } else {
      setProductIds([]);
    }
  };

  const handleProductChange = (selected) => {
    setProductIds(selected);
    setSelectAllProducts(selected?.length === productData.length);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !startDate || !endDate || productIds.length === 0) {
      toast.error("Please fill out all required fields.");
      return;
    }
    setIsloading(true);
    const couponData = {
      code,
      discountType,
      productIds: productIds.map((product) => product.value),
      discountPercentage,
      fixedDiscount,
      maxDiscount,
      minPurchase,
      startDate,
      endDate,
      isPublic,
      users: userIds.map((user) => user.value),
      usageLimit,
      usagePerUser,
      description,
      sellerId: sellerId || null,
    };
    try {
      const config = {
        headers: { Authorization: auth?.token },
      };

      if (couponId) {
        const { data } = await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/coupon/update/${couponId}`,
          { ...couponData },
          config
        );

        if (data) {
          toast.success(data?.message || "Coupon info updated successfully");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/coupon/create`,
          { ...couponData },
          config
        );
        if (data) {
          toast.success(data?.message || "Coupon added successfully");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      fetchCoupons();
      setShowCoupon(false);
      setIsloading(false);
      setCouponId("");
    }
  };

  const productOptions =
    productData &&
    productData?.map((product) => ({
      value: product._id,
      label: product.name,
      image: product.thumbnails?.[0]?.url,
      price: product.price,
      storeName: product.seller?.storeName,
    }));

  const userOptions =
    users &&
    users?.map((user) => ({
      value: user._id,
      label: user.name || user.email,
      email: user.email,
      avatar: user.avatar?.url,
    }));

  // Custom option component for users with avatar
  const CustomUserOption = ({ data, innerRef, innerProps, isSelected }) => (
    <div
      ref={innerRef}
      {...innerProps}
      className={`flex items-center gap-3 p-2 cursor-pointer transition-all ${
        isSelected ? "bg-red-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
        {data.avatar ? (
          <img
            src={data.avatar}
            alt={data.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-red-100 to-orange-100">
            <HiUsers className="w-4 h-4 text-red-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{data.label}</p>
        {data.email && data.label !== data.email && (
          <p className="text-xs text-gray-500 truncate">{data.email}</p>
        )}
      </div>
      {isSelected && (
        <IoCheckmarkCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
    </div>
  );

  // Custom option component for products with image
  const CustomProductOption = ({ data, innerRef, innerProps, isSelected }) => (
    <div
      ref={innerRef}
      {...innerProps}
      className={`flex items-center gap-3 p-2 cursor-pointer transition-all ${
        isSelected ? "bg-red-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {data.image ? (
          <img
            src={data.image}
            alt={data.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <HiShoppingBag className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{data.label}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-600 font-medium">€{data.price}</span>
          {data.storeName && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MdStore className="w-3 h-3" />
              {data.storeName}
            </span>
          )}
        </div>
      </div>
      {isSelected && (
        <IoCheckmarkCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
    </div>
  );

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#dc2626" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(220, 38, 38, 0.2)" : "none",
      "&:hover": { borderColor: "#dc2626" },
      minHeight: "42px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#fef2f2"
        : state.isFocused
        ? "#f9fafb"
        : "white",
      color: "#111827",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#fef2f2",
      borderRadius: "6px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#dc2626",
      fontWeight: "500",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#dc2626",
      "&:hover": { backgroundColor: "#dc2626", color: "white" },
    }),
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: RiCoupon2Fill },
    { id: "discount", label: "Discount", icon: BiSolidDiscount },
    { id: "products", label: "Products", icon: HiShoppingBag },
    { id: "validity", label: "Validity", icon: MdAccessTime },
    { id: "access", label: "User Access", icon: HiUsers },
  ];

  return (
    <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
            <RiCoupon4Line className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {couponId ? "Edit Coupon" : "Create New Coupon"}
            </h3>
            <p className="text-red-100 text-sm mt-0.5">
              {isSeller
                ? "Create a coupon for your store products"
                : "Create a coupon for the platform"}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setCouponId("");
            setShowCoupon(false);
          }}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:rotate-90 hover:scale-110"
        >
          <CgClose className="text-xl" />
        </button>
      </div>

      {/* Section Navigation */}
      <div className="flex items-center gap-1 px-4 py-3 bg-gray-50 border-b overflow-x-auto">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeSection === section.id
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-6">
          {/* Basic Information Section */}
          {activeSection === "basic" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-red-600 rounded-full" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Coupon Code<span className="text-red-600 ml-1">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={code}
                      minLength={6}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className={`${Style.input} w-full uppercase tracking-widest font-mono`}
                      placeholder="e.g., SAVE20"
                      required
                      maxLength={12}
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    6-12 characters, letters and numbers only
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`${Style.input} w-full`}
                    placeholder="e.g., Summer Sale Discount"
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Coupon Preview */}
              {code && (
                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-dashed border-red-200">
                  <p className="text-xs text-gray-500 mb-2">Coupon Preview</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <RiCoupon4Line className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="font-mono text-xl font-bold text-red-600 tracking-wider">
                          {code}
                        </p>
                        <p className="text-sm text-gray-600">
                          {description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        {discountType === "percentage"
                          ? `${discountPercentage}%`
                          : `€${fixedDiscount}`}
                      </p>
                      <p className="text-xs text-gray-500">OFF</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Discount Section */}
          {activeSection === "discount" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-red-600 rounded-full" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Discount Settings
                </h4>
              </div>

              {/* Discount Type Toggle */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Discount Type<span className="text-red-600 ml-1">*</span>
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setDiscountType("percentage")}
                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                      discountType === "percentage"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        discountType === "percentage"
                          ? "bg-red-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <FaPercent className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Percentage</p>
                      <p className="text-xs opacity-70">e.g., 20% off</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("fixed")}
                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                      discountType === "fixed"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        discountType === "fixed" ? "bg-red-100" : "bg-gray-100"
                      }`}
                    >
                      <FaDollarSign className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Fixed Amount</p>
                      <p className="text-xs opacity-70">e.g., €10 off</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {discountType === "percentage" ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Discount Percentage<span className="text-red-600 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        className={`${Style.input} w-full pr-10`}
                        placeholder="20"
                        min="1"
                        max="100"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        %
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Fixed Discount<span className="text-red-600 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        €
                      </span>
                      <input
                        type="number"
                        value={fixedDiscount}
                        onChange={(e) => setFixedDiscount(e.target.value)}
                        className={`${Style.input} w-full pl-8`}
                        placeholder="10"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Maximum Discount<span className="text-red-600 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      €
                    </span>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      className={`${Style.input} w-full pl-8`}
                      placeholder="100"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FaInfoCircle className="w-3 h-3" />
                    Maximum discount cap for this coupon
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Minimum Purchase<span className="text-red-600 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      €
                    </span>
                    <input
                      type="number"
                      value={minPurchase}
                      onChange={(e) => setMinPurchase(e.target.value)}
                      className={`${Style.input} w-full pl-8`}
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Usage Limit (Total)
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className={`${Style.input} w-full`}
                    placeholder="0 for unlimited"
                    min="0"
                  />
                  <p className="text-xs text-gray-500">
                    0 = unlimited usage
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Usage Per User
                  </label>
                  <input
                    type="number"
                    value={usagePerUser}
                    onChange={(e) => setUsagePerUser(e.target.value)}
                    className={`${Style.input} w-full`}
                    placeholder="1"
                    min="1"
                  />
                  <p className="text-xs text-gray-500">
                    How many times each user can use this coupon
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          {activeSection === "products" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-red-600 rounded-full" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    Applicable Products
                  </h4>
                </div>
                {isSeller && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <MdStore className="w-3 h-3" />
                    Your Store Products Only
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="selectAllProducts"
                    checked={selectAllProducts}
                    onChange={(e) => handleSelectAllProducts(e.target.checked)}
                    className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="selectAllProducts"
                    className="text-sm font-semibold text-gray-700 cursor-pointer flex-1"
                  >
                    Select All Products
                  </label>
                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg border">
                    {productIds.length} / {productData.length} selected
                  </span>
                </div>

                {/* Product Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Products<span className="text-red-600 ml-1">*</span>
                  </label>
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center py-8">
                      <FaSpinner className="w-6 h-6 text-red-500 animate-spin" />
                      <span className="ml-2 text-gray-500">Loading products...</span>
                    </div>
                  ) : (
                    <Select
                      options={productOptions}
                      value={productIds}
                      onChange={handleProductChange}
                      isMulti
                      placeholder="Search and select products..."
                      components={{ Option: CustomProductOption }}
                      styles={customSelectStyles}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      noOptionsMessage={() => "No products found"}
                    />
                  )}
                </div>

                {/* Selected Products Preview */}
                {productIds.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Selected Products ({productIds.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2">
                      {productIds.slice(0, 8).map((product) => (
                        <div
                          key={product.value}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border"
                        >
                          <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <HiShoppingBag className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-medium text-gray-700 truncate flex-1">
                            {product.label}
                          </p>
                        </div>
                      ))}
                      {productIds.length > 8 && (
                        <div className="flex items-center justify-center p-2 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm font-medium text-red-600">
                            +{productIds.length - 8} more
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Validity Section */}
          {activeSection === "validity" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-red-600 rounded-full" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Validity Period
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Start Date<span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`${Style.input} w-full`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    End Date<span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`${Style.input} w-full`}
                    required
                    min={startDate}
                  />
                </div>
              </div>

              {/* Quick Date Selection */}
              <div className="flex flex-wrap gap-2">
                <p className="text-sm text-gray-600 w-full mb-1">Quick select:</p>
                {[
                  { label: "7 days", days: 7 },
                  { label: "14 days", days: 14 },
                  { label: "30 days", days: 30 },
                  { label: "60 days", days: 60 },
                  { label: "90 days", days: 90 },
                ].map((option) => (
                  <button
                    key={option.days}
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      const end = new Date();
                      end.setDate(today.getDate() + option.days);
                      setStartDate(today.toISOString().split("T")[0]);
                      setEndDate(end.toISOString().split("T")[0]);
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-lg transition-all"
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Validity Preview */}
              {startDate && endDate && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm font-medium text-green-700">
                    Coupon will be valid for{" "}
                    <span className="font-bold">
                      {Math.ceil(
                        (new Date(endDate) - new Date(startDate)) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    From {new Date(startDate).toLocaleDateString()} to{" "}
                    {new Date(endDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* User Access Section */}
          {activeSection === "access" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-red-600 rounded-full" />
                <h4 className="text-lg font-semibold text-gray-900">
                  User Access Control
                </h4>
              </div>

              <div className="space-y-4">
                {/* Public Toggle */}
                <div
                  onClick={() => {
                    setIsPublic(!isPublic);
                    if (!isPublic) setUserIds([]);
                  }}
                  className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    isPublic
                      ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div
                    className={`w-12 h-7 rounded-full relative transition-all duration-300 ${
                      isPublic ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                        isPublic ? "left-6" : "left-1"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Public Coupon</p>
                    <p className="text-sm text-gray-600">
                      {isPublic
                        ? "This coupon is available to all users"
                        : "This coupon is restricted to selected users"}
                    </p>
                  </div>
                  {isPublic && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </div>

                {/* User Select */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Specific Users{" "}
                    {!isPublic && <span className="text-red-600 ml-1">*</span>}
                  </label>
                  {isPublic ? (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                      <FaInfoCircle className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        User selection is disabled because this is a public coupon
                      </p>
                    </div>
                  ) : isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <FaSpinner className="w-6 h-6 text-red-500 animate-spin" />
                      <span className="ml-2 text-gray-500">Loading users...</span>
                    </div>
                  ) : (
                    <Select
                      options={userOptions}
                      value={userIds}
                      onChange={setUserIds}
                      isMulti
                      placeholder="Search and select users..."
                      components={{ Option: CustomUserOption }}
                      styles={customSelectStyles}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      noOptionsMessage={() => "No users found"}
                    />
                  )}
                </div>

                {!isPublic && userIds.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">{userIds.length}</span> user
                      {userIds.length > 1 ? "s" : ""} will have access to this coupon
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaInfoCircle className="w-4 h-4" />
              <span>All fields marked with * are required</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCouponId("");
                  setShowCoupon(false);
                }}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200 text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{couponId ? "Save Changes" : "Create Coupon"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
