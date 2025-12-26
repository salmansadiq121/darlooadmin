"use client";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import dynamic from "next/dynamic";
import axios from "axios";
import Loader from "@/app/utils/Loader";
import Image from "next/image";
import toast from "react-hot-toast";
import HandleBannerModal from "@/app/components/Settings/HandleBannerModal";
import Shipping from "@/app/components/Settings/Shipping";
import HandleShippingModal from "@/app/components/Settings/HandleShippingModal";
import Swal from "sweetalert2";
import Ads from "@/app/components/Settings/Ads";
import { Loader2, Percent, DollarSign, Save, RefreshCw, Users, Tag, Info, Trash2, Plus, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/app/context/authContext";

const MainLayout = dynamic(
  () => import("./../../../components/layout/MainLayout"),
  {
    ssr: false,
  }
);
const Breadcrumb = dynamic(() => import("./../../../utils/Breadcrumb"), {
  ssr: false,
});
const SettingModal = dynamic(
  () => import("./../../../components/Settings/SettingModal"),
  {
    ssr: false,
  }
);
const BannerGallery = dynamic(
  () => import("./../../../components/Settings/BannerGallery"),
  {
    ssr: false,
  }
);

export default function Settings() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [settingId, setSettingId] = useState("");
  const [addSetting, setAddSetting] = useState(false);
  const [type, setType] = useState("");
  const [selectedTab, setSelectedtab] = useState("Account");
  const [isLoading, setIsLoading] = useState(false);
  const [bannerData, setBannerData] = useState([]);
  const isInitialRender = useRef(true);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerId, setBannerId] = useState("");
  const [accountDetail, setAccountDetail] = useState({});
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [show, setShow] = useState(false);
  const [shippingId, setShippingId] = useState("");
  const [shippingData, setShippingData] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState({});
  const [adsData, setAdsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Commission Settings State
  const [commissionSettings, setCommissionSettings] = useState({
    defaultRate: 5,
    minimumAmount: 0,
    maximumAmount: 0,
    type: "percentage",
    calculateAfterDiscount: true,
    includeShipping: false,
    sellerRates: [],
    categoryRates: [],
  });
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [savingCommission, setSavingCommission] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddSellerRate, setShowAddSellerRate] = useState(false);
  const [showAddCategoryRate, setShowAddCategoryRate] = useState(false);
  const [newSellerRate, setNewSellerRate] = useState({ sellerId: "", sellerName: "", rate: 5 });
  const [newCategoryRate, setNewCategoryRate] = useState({ categoryId: "", categoryName: "", rate: 5 });

  const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "superadmin";

  const toggleAccountVisibility = () => {
    setShowFullAccount((prev) => !prev);
  };

  // Page URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathArray = window.location.pathname;
      setCurrentUrl(pathArray);
    }
  }, []);

  const fetchAccountDetail = async () => {
    if (isInitialRender.current) {
      setIsLoading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/account/account-setting`
      );
      if (data) {
        setAccountDetail(data?.account[0]);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      if (isInitialRender.current) {
        setIsLoading(false);
        isInitialRender.current = false;
      }
    }
  };

  useEffect(() => {
    fetchAccountDetail();
  }, []);

  // ------------All Banners---------->
  const fetchBanners = async () => {
    if (isInitialRender.current) {
      setIsLoading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/banners/list`
      );
      if (data) {
        setBannerData(data?.banners);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      if (isInitialRender.current) {
        setIsLoading(false);
        isInitialRender.current = false;
      }
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // ------------All Shipping---------->
  const fetchShipping = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/shipping/getAll`
      );
      if (data) {
        setShippingData(data?.shippings);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchShipping();
  }, []);

  // Handle Delete Shipping
  const handleDeleteConfirmation = (shippingId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteShipping(shippingId);
        Swal.fire("Deleted!", "Shipping has been deleted.", "success");
      }
    });
  };

  const handleDeleteShipping = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/shipping/delete/${id}`
      );
      if (data) {
        fetchShipping();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  // ------------All Ads---------->
  const fetchAds = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/ads/admin`
      );
      if (data) {
        setAdsData(data?.video);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Update Ads
  const handleUpdateAds = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/ads/update/${adsData._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (data) {
        fetchAds();
        toast.success("Ads updated successfully.");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "File type not supported, please upload mp4 video."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------Commission Settings---------->
  const fetchCommissionSettings = async () => {
    try {
      setCommissionLoading(true);
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/platform-settings/commission`
      );
      if (data?.success) {
        setCommissionSettings({
          defaultRate: data.commission?.defaultRate || 5,
          minimumAmount: data.commission?.minimumAmount || 0,
          maximumAmount: data.commission?.maximumAmount || 0,
          type: data.commission?.type || "percentage",
          calculateAfterDiscount: data.commission?.calculateAfterDiscount ?? true,
          includeShipping: data.commission?.includeShipping ?? false,
          sellerRates: data.commission?.sellerRates || [],
          categoryRates: data.commission?.categoryRates || [],
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCommissionLoading(false);
    }
  };

  const fetchSellers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/all`
      );
      if (data?.sellers) {
        setSellers(data.sellers);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/categories/get-categories`
      );
      if (data?.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (selectedTab === "Commission" && isAdmin) {
      fetchCommissionSettings();
      fetchSellers();
      fetchCategories();
    }
  }, [selectedTab, isAdmin]);

  const handleSaveCommission = async () => {
    try {
      setSavingCommission(true);
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/platform-settings/commission`,
        {
          defaultRate: commissionSettings.defaultRate,
          minimumAmount: commissionSettings.minimumAmount,
          maximumAmount: commissionSettings.maximumAmount,
          type: commissionSettings.type,
          calculateAfterDiscount: commissionSettings.calculateAfterDiscount,
          includeShipping: commissionSettings.includeShipping,
        },
        {
          headers: { Authorization: auth?.token },
        }
      );
      if (data?.success) {
        toast.success("Commission settings saved successfully!");
        fetchCommissionSettings();
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to save commission settings");
    } finally {
      setSavingCommission(false);
    }
  };

  const handleAddSellerRate = async () => {
    if (!newSellerRate.sellerId || newSellerRate.rate === undefined) {
      toast.error("Please select a seller and enter a rate");
      return;
    }
    try {
      const selectedSeller = sellers.find(s => s._id === newSellerRate.sellerId);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/platform-settings/commission/seller`,
        {
          sellerId: newSellerRate.sellerId,
          sellerName: selectedSeller?.storeName || selectedSeller?.name || "Unknown",
          rate: newSellerRate.rate,
        },
        {
          headers: { Authorization: auth?.token },
        }
      );
      if (data?.success) {
        toast.success("Seller commission rate added!");
        fetchCommissionSettings();
        setShowAddSellerRate(false);
        setNewSellerRate({ sellerId: "", sellerName: "", rate: 5 });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add seller rate");
    }
  };

  const handleRemoveSellerRate = async (sellerId) => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/platform-settings/commission/seller/${sellerId}`,
        {
          headers: { Authorization: auth?.token },
        }
      );
      if (data?.success) {
        toast.success("Seller commission rate removed!");
        fetchCommissionSettings();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove seller rate");
    }
  };

  const handleAddCategoryRate = async () => {
    if (!newCategoryRate.categoryId || newCategoryRate.rate === undefined) {
      toast.error("Please select a category and enter a rate");
      return;
    }
    try {
      const selectedCategory = categories.find(c => c._id === newCategoryRate.categoryId);
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/platform-settings/commission/category`,
        {
          categoryId: newCategoryRate.categoryId,
          categoryName: selectedCategory?.name || "Unknown",
          rate: newCategoryRate.rate,
        },
        {
          headers: { Authorization: auth?.token },
        }
      );
      if (data?.success) {
        toast.success("Category commission rate added!");
        fetchCommissionSettings();
        setShowAddCategoryRate(false);
        setNewCategoryRate({ categoryId: "", categoryName: "", rate: 5 });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add category rate");
    }
  };

  const handleRemoveCategoryRate = async (categoryId) => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/platform-settings/commission/category/${categoryId}`,
        {
          headers: { Authorization: auth?.token },
        }
      );
      if (data?.success) {
        toast.success("Category commission rate removed!");
        fetchCommissionSettings();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove category rate");
    }
  };

  return (
    <MainLayout
      title="Setting - Manage Your Account and Banners"
      description="View and update your account , address & banner information, track orders, and manage account settings from your user profile page."
      keywords="add setting, banner setting, order history, update profile, track orders, e-commerce user page, account settings, user dashboard"
    >
      <div className="p-1 sm:p-2 px-1 sm:px-6 h-[100%] w-full pb-4 scroll-smooth">
        <div className="flex flex-col pb-2 h-full">
          <Breadcrumb path={currentUrl} />
          <div className="flex h-[2.5rem] items-center mt-4 w-fit border-2 border-red-600 rounded-sm overflow-x-auto">
            <button
              className={`w-[6.5rem] h-full py-[.3rem] text-[14px] font-normal whitespace-nowrap ${
                selectedTab === "Account"
                  ? "bg-red-600 text-white"
                  : "text-red-600 bg-white"
              }`}
              onClick={() => setSelectedtab("Account")}
            >
              Account
            </button>
            <button
              className={`w-[6.5rem] h-full py-[.3rem] text-[14px] font-normal border-l-2 border-red-600 whitespace-nowrap ${
                selectedTab === "Banner"
                  ? "bg-red-600 text-white"
                  : "text-red-600 bg-white"
              }`}
              onClick={() => setSelectedtab("Banner")}
            >
              Banner
            </button>
            <button
              className={`w-[6.5rem] h-full py-[.3rem] text-[14px] font-normal border-l-2 border-red-600 whitespace-nowrap ${
                selectedTab === "ads"
                  ? "bg-red-600 text-white"
                  : "text-red-600 bg-white"
              }`}
              onClick={() => setSelectedtab("ads")}
            >
              Ads
            </button>
            <button
              className={`w-[6.5rem] h-full py-[.3rem] text-[14px] font-normal border-l-2 border-red-600 whitespace-nowrap ${
                selectedTab === "Shipping"
                  ? "bg-red-600 text-white"
                  : "text-red-600 bg-white"
              }`}
              onClick={() => setSelectedtab("Shipping")}
            >
              Shipping
            </button>
            {isAdmin && (
              <button
                className={`w-[7rem] h-full py-[.3rem] text-[14px] font-normal border-l-2 border-red-600 whitespace-nowrap ${
                  selectedTab === "Commission"
                    ? "bg-red-600 text-white"
                    : "text-red-600 bg-white"
                }`}
                onClick={() => setSelectedtab("Commission")}
              >
                Commission
              </button>
            )}
          </div>
          <div className="flex flex-col gap-4 mt-4 w-full h-full">
            {selectedTab === "Account" ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h1 className="text-2xl font-sans font-semibold text-black">
                    Settings
                  </h1>
                </div>
                <div className="relative overflow-hidden w-full py-3 sm:py-4 bg-white rounded-md shadow px-3 sm:px-4 overflow-y-auto shidden">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-md font-semibold text-gray-900">
                      Setup / Edit Bank Account
                    </h3>
                    <div className="flex items-center flex-wrap gap-4 ">
                      <div className="flex flex-col gap-3 p-4 rounded-md bg-red-100">
                        <span className="text-[14px] text-gray-600 flex items-center gap-2">
                          Setup / Edit Bank Account{" "}
                          <AiOutlineExclamationCircle className="text-gray-500 hover:text-gray-700 cursor-pointer text-[17px]" />
                        </span>
                        <span
                          className="text-[14px] text-gray-600 cursor-pointer"
                          onClick={toggleAccountVisibility}
                        >
                          {accountDetail?.accountNumber
                            ? showFullAccount
                              ? accountDetail.accountNumber
                              : "**** **** **** " +
                                accountDetail.accountNumber.slice(-4)
                            : "Not Set"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setType("account");
                          setAddSetting("true");
                          setSettingId(accountDetail._id);
                        }}
                        className={`flex text-[15px] w-[9rem] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800 py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03]`}
                      >
                        EDIT ACCOUNT
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden w-full py-3 sm:py-4 bg-white rounded-md shadow px-3 sm:px-4 overflow-y-auto shidden">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-md font-semibold text-gray-900">
                      Setup / Edit Pick-Up Location
                    </h3>
                    <div className="flex items-center flex-wrap gap-4 ">
                      <div className="flex flex-col gap-3 p-4 rounded-md bg-red-100">
                        <span className="text-[14px] text-gray-600 flex items-center gap-2">
                          Setup / Edit Pick-Up Location{" "}
                          <AiOutlineExclamationCircle className="text-gray-500 hover:text-gray-700 cursor-pointer text-[17px]" />
                        </span>
                        <span className="text-[14px] text-gray-600">
                          {accountDetail?.pickUpLocation
                            ? accountDetail?.pickUpLocation
                            : "Not Set"}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setType("address");
                          setAddSetting("true");
                          setSettingId(accountDetail._id);
                        }}
                        className={`flex text-[15px] w-[9rem] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800 py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03]`}
                      >
                        EDIT ACCOUNT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedTab === "Banner" ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h1 className="text-2xl font-sans font-semibold text-black">
                    Banner Settings
                  </h1>
                  <div className="flex items-center gap-4 w-full sm:w-fit justify-end">
                    <button
                      onClick={() => setShowBanner(true)}
                      className={`flex text-[14px] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800 py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] px-4`}
                    >
                      ADD NEW BANNER
                    </button>
                  </div>
                </div>
                <div className="w-full h-full">
                  <div className="">
                    <BannerGallery
                      bannerData={bannerData}
                      fetchBanners={fetchBanners}
                    />
                  </div>
                </div>
              </div>
            ) : selectedTab === "ads" ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h1 className="text-2xl font-sans font-semibold text-black">
                    Ads Settings
                  </h1>
                  <div className="flex items-center gap-4 w-full sm:w-fit justify-end">
                    <label
                      id="update-ads"
                      className={`flex text-[14px] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800 py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] px-4`}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                      ) : (
                        <span>UPDATE ADS</span>
                      )}
                      <input
                        type="file"
                        accept="/video/*"
                        hidden
                        id="update-ads"
                        onChange={(e) => handleUpdateAds(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
                <div className="w-full h-full">
                  <div className="">
                    <Ads adsData={adsData} fetchAds={fetchAds} />
                  </div>
                </div>
              </div>
            ) : selectedTab === "Shipping" ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h1 className="text-2xl font-sans font-semibold text-black">
                    Shipping Fee Settings
                  </h1>
                  <div className="flex items-center gap-4 w-full sm:w-fit justify-end">
                    <button
                      onClick={() => setShow(true)}
                      className={`flex text-[14px] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800 py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] px-4`}
                    >
                      ADD SHIPPING
                    </button>
                  </div>
                </div>
                <div className="w-full h-full">
                  <Shipping
                    shippingData={shippingData}
                    setSelectedShipping={setSelectedShipping}
                    setShippingId={setShippingId}
                    setShow={setShow}
                    handleDeleteConfirmation={handleDeleteConfirmation}
                  />
                </div>
              </div>
            ) : selectedTab === "Commission" && isAdmin ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h1 className="text-2xl font-sans font-semibold text-black flex items-center gap-2">
                    <Percent className="w-6 h-6 text-red-600" />
                    Commission Settings
                  </h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchCommissionSettings}
                      disabled={commissionLoading}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
                    >
                      <RefreshCw className={`w-4 h-4 ${commissionLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    <button
                      onClick={handleSaveCommission}
                      disabled={savingCommission}
                      className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      {savingCommission ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </div>

                {commissionLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {/* Default Commission Rate Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <Percent className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Default Commission Rate</h3>
                          <p className="text-sm text-gray-500">Set the platform-wide commission rate for all sellers</p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Default Rate (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={commissionSettings.defaultRate}
                              onChange={(e) => setCommissionSettings(prev => ({
                                ...prev,
                                defaultRate: parseFloat(e.target.value) || 0
                              }))}
                              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commission Type
                          </label>
                          <select
                            value={commissionSettings.type}
                            onChange={(e) => setCommissionSettings(prev => ({
                              ...prev,
                              type: e.target.value
                            }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Amount
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={commissionSettings.minimumAmount}
                              onChange={(e) => setCommissionSettings(prev => ({
                                ...prev,
                                minimumAmount: parseFloat(e.target.value) || 0
                              }))}
                              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum Amount (0 = No Cap)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={commissionSettings.maximumAmount}
                              onChange={(e) => setCommissionSettings(prev => ({
                                ...prev,
                                maximumAmount: parseFloat(e.target.value) || 0
                              }))}
                              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Commission Options Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <SettingsIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Commission Options</h3>
                          <p className="text-sm text-gray-500">Configure how commission is calculated</p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* After Discount Toggle */}
                        <div
                          onClick={() => setCommissionSettings(prev => ({
                            ...prev,
                            calculateAfterDiscount: !prev.calculateAfterDiscount
                          }))}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            commissionSettings.calculateAfterDiscount
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              commissionSettings.calculateAfterDiscount ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">After Discount</p>
                              <p className="text-xs text-gray-500">Calculate on discounted price</p>
                            </div>
                          </div>
                          <div className={`w-14 h-8 rounded-full p-1 transition-colors ${
                            commissionSettings.calculateAfterDiscount ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                              commissionSettings.calculateAfterDiscount ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                          </div>
                        </div>

                        {/* Include Shipping Toggle */}
                        <div
                          onClick={() => setCommissionSettings(prev => ({
                            ...prev,
                            includeShipping: !prev.includeShipping
                          }))}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            commissionSettings.includeShipping
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              commissionSettings.includeShipping ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              <Tag className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Include Shipping</p>
                              <p className="text-xs text-gray-500">Add shipping to commission base</p>
                            </div>
                          </div>
                          <div className={`w-14 h-8 rounded-full p-1 transition-colors ${
                            commissionSettings.includeShipping ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
                              commissionSettings.includeShipping ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seller-Specific Rates Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Seller-Specific Rates</h3>
                            <p className="text-sm text-gray-500">Override default rate for specific sellers</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAddSellerRate(!showAddSellerRate)}
                          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            showAddSellerRate
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          <Plus className={`w-4 h-4 transition-transform duration-200 ${showAddSellerRate ? 'rotate-45' : ''}`} />
                          {showAddSellerRate ? 'Cancel' : 'Add Rate'}
                        </button>
                      </div>

                      {showAddSellerRate && (
                        <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
                          <div className="flex flex-wrap gap-3">
                            <select
                              value={newSellerRate.sellerId}
                              onChange={(e) => setNewSellerRate(prev => ({ ...prev, sellerId: e.target.value }))}
                              className="flex-1 min-w-[200px] h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-white"
                            >
                              <option value="">Select Seller</option>
                              {sellers.map(seller => (
                                <option key={seller._id} value={seller._id}>
                                  {seller.storeName || seller.name}
                                </option>
                              ))}
                            </select>
                            <div className="relative w-28">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder="Rate"
                                value={newSellerRate.rate}
                                onChange={(e) => setNewSellerRate(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                                className="w-full h-11 px-4 pr-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none bg-white"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                            </div>
                            <button
                              onClick={handleAddSellerRate}
                              className="h-11 px-6 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium transition-all"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}

                      {commissionSettings.sellerRates?.length > 0 ? (
                        <div className="space-y-2">
                          {commissionSettings.sellerRates.map((sr, index) => (
                            <div key={sr.seller || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-bold shadow-sm">
                                  {(sr.sellerName || "S").charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium text-gray-900">{sr.sellerName || "Unknown Seller"}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                  {sr.rate}%
                                </span>
                                <button
                                  onClick={() => handleRemoveSellerRate(sr.seller)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">No custom seller rates configured</p>
                        </div>
                      )}
                    </div>

                    {/* Commission Preview Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl p-6 text-white">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-gray-400" />
                        Commission Preview
                      </h3>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <p className="text-gray-400 text-sm mb-1">On €100 Order</p>
                          <p className="text-3xl font-bold text-emerald-400">€{(100 * commissionSettings.defaultRate / 100).toFixed(2)}</p>
                          <p className="text-gray-500 text-xs mt-1">Platform Earns</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <p className="text-gray-400 text-sm mb-1">Seller Gets</p>
                          <p className="text-3xl font-bold text-blue-400">€{(100 - (100 * commissionSettings.defaultRate / 100)).toFixed(2)}</p>
                          <p className="text-gray-500 text-xs mt-1">After Commission</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <p className="text-gray-400 text-sm mb-1">Current Rate</p>
                          <p className="text-3xl font-bold text-amber-400">{commissionSettings.defaultRate}%</p>
                          <p className="text-gray-500 text-xs mt-1">{commissionSettings.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        {/* -------------Handle Setting Modal------------ */}
        {addSetting && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <SettingModal
              setAddSetting={setAddSetting}
              settingId={settingId}
              setSettingId={setSettingId}
              type={type}
              accountDetail={accountDetail}
              fetchAccountDetail={fetchAccountDetail}
            />
          </div>
        )}
        {/* ----------------Handel Banner Modal---------------- */}
        {showBanner && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <HandleBannerModal
              setShowBanner={setShowBanner}
              bannerId={bannerId}
              setBannerId={setBannerId}
              setBannerData={setBannerData}
            />
          </div>
        )}
        {/* -------------Handle Shipping Modal------------ */}
        {show && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <HandleShippingModal
              setShow={setShow}
              shippingId={shippingId}
              setShippingId={setShippingId}
              fetchShipping={fetchShipping}
              selectedShipping={selectedShipping}
              setSelectedShipping={setSelectedShipping}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
