"use client";

import { Style } from "@/app/utils/CommonStyle";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CgClose } from "react-icons/cg";
import { FaSpinner } from "react-icons/fa";
import Select from "react-select";
import { RiCoupon4Line } from "react-icons/ri";

export default function CouponModal({
  setShowCoupon,
  couponId,
  setCouponId,
  fetchCoupons,
}) {
  const [productData, setProductData] = useState([]);
  const [code, setCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
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

  const getUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/`
      );
      if (data) {
        const users = data.users;
        setUsers(users);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/coupon`
      );
      if (data) {
        const products = data.products;
        setProductData(products);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProducts();
    getUsers();
    // eslint-disable-next-line
  }, []);

  const getCouponInfo = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/coupon/detail/${couponId}`
      );
      if (data) {
        const coupon = data.coupon;
        console.log("coupon:", coupon);
        setCode(coupon.code);
        setDiscountPercentage(coupon.discountPercentage);
        setMaxDiscount(coupon.maxDiscount);
        setMinPurchase(coupon.minPurchase);
        setProductIds(
          coupon.productIds.map((product) => ({
            value: product._id,
            label: product.name,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !startDate || !endDate || !productIds) {
      toast.error("Please fill out all required fields.");
      return;
    }
    setIsloading(true);
    const couponData = {
      code,
      productIds: productIds.map((product) => product.value),
      discountPercentage,
      maxDiscount,
      minPurchase,
      startDate,
      endDate,
      isPublic,
      users: userIds.map((user) => user.value),
    };
    try {
      if (couponId) {
        const { data } = await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/coupon/update/${couponId}`,
          {
            ...couponData,
          }
        );

        if (data) {
          toast.success(data?.message || "Coupon info updated successfully");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/coupon/create`,
          {
            ...couponData,
          }
        );
        if (data) {
          toast.success(data?.message || "Coupon added successfully");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
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
    }));

  const userOptions =
    users &&
    users?.map((user) => ({
      value: user._id,
      label: user.name || user.email,
    }));

  return (
    <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col">
      <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <RiCoupon4Line className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            {couponId ? "Edit Coupon" : "Create New Coupon"}
          </h3>
        </div>
        <button
          onClick={() => {
            setCouponId("");
            setShowCoupon(false);
          }}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:rotate-90"
        >
          <CgClose className="text-xl" />
        </button>
      </div>

      <div className="w-full max-h-[calc(100vh-12rem)] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Coupon Code<span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    minLength={6}
                    onChange={(e) => setCode(e.target.value)}
                    className={`${Style.input} w-full`}
                    placeholder="e.g., SAVE20"
                    required
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Percentage
                    <span className="text-red-600 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      className={`${Style.input} w-full pr-8`}
                      placeholder="20"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Max Discount<span className="text-red-600 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      $
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
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Min Purchase<span className="text-red-600 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      $
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
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                Applicable Products
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="selectAllProducts"
                    checked={selectAllProducts}
                    onChange={(e) => handleSelectAllProducts(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="selectAllProducts"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Select All Products
                  </label>
                  {selectAllProducts && (
                    <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {productData.length} products selected
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Products<span className="text-red-600 ml-1">*</span>
                  </label>
                  <Select
                    options={productOptions}
                    value={productIds}
                    onChange={handleProductChange}
                    isMulti
                    placeholder="Search and select products..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                Validity Period
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                  <label className="block text-sm font-medium text-gray-700">
                    End Date<span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`${Style.input} w-full`}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b pb-2">
                User Access
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => {
                      setIsPublic(e.target.checked);
                      if (e.target.checked) {
                        setUserIds([]);
                      }
                    }}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="isPublic"
                      className="text-sm font-semibold text-gray-900 cursor-pointer block"
                    >
                      Public Coupon
                    </label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Make this coupon available to all users
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Users{" "}
                    {!isPublic && <span className="text-red-600 ml-1">*</span>}
                  </label>
                  {isPublic && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                      User selection is disabled because this is a public coupon
                    </p>
                  )}
                  <Select
                    options={userOptions}
                    value={userIds}
                    onChange={setUserIds}
                    isMulti
                    isDisabled={isPublic}
                    placeholder={
                      isPublic
                        ? "Public coupon - all users"
                        : "Search and select users..."
                    }
                    className={`react-select-container ${
                      isPublic ? "opacity-50" : ""
                    }`}
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setCouponId("");
                setShowCoupon(false);
              }}
              className="px-6 py-2.5 text-sm font-medium rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200 text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
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
        </form>
      </div>
    </div>
  );
}
