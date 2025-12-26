"use client";
import CouponModal from "@/app/components/Coupon/CouponModal";
import MainLayout from "@/app/components/layout/MainLayout";
import Loader from "@/app/utils/Loader";
import { useAuth } from "@/app/context/authContext";
import axios from "axios";
import { format } from "date-fns";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import { FaCheckDouble, FaPercent, FaDollarSign, FaStore, FaUsers, FaChartLine } from "react-icons/fa";
import { ImSpinner4 } from "react-icons/im";
import { IoSearch, IoStatsChart } from "react-icons/io5";
import { MdDelete, MdModeEditOutline, MdNotInterested, MdStore, MdAccessTime, MdTrendingUp } from "react-icons/md";
import { RiCoupon4Line, RiCoupon2Fill, RiCouponLine } from "react-icons/ri";
import { BiSolidDiscount } from "react-icons/bi";
import { HiShoppingBag, HiUsers, HiTicket } from "react-icons/hi";
import { BsCalendarCheck, BsCalendarX, BsBarChartFill } from "react-icons/bs";
import Swal from "sweetalert2";
const Breadcrumb = dynamic(() => import("./../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function Coupon() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [couponData, setCouponData] = useState([]);
  const [filterCoupon, setFilterCoupon] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCoupon, setActiveCoupon] = useState(0);
  const [isactiveCoupon, setInactiveCoupon] = useState(0);
  const [expiredCoupon, setExpiredCoupon] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const isInitialRender = useRef(true);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponId, setCouponId] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [isLoad, setIsLoad] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    inactive: 0,
    totalUsage: 0,
  });
  const [selectedSeller, setSelectedSeller] = useState("all");
  const [sellers, setSellers] = useState([]);
  const [showStats, setShowStats] = useState(true);

  // Get user info from auth context
  const userRole = auth?.user?.role || "";
  const sellerId = auth?.user?.sellerProfile || "";
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  // ------Current Page URL-----
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathArray = window.location.pathname;
      setCurrentUrl(pathArray);
    }
  }, []);

  // Fetch Sellers (for admin filter)
  const fetchSellers = async () => {
    if (!isAdmin) return;
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/all-sellers`
      );
      if (data) {
        setSellers(data.sellers || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSellers();
    }
    // eslint-disable-next-line
  }, [auth?.user]);

  // <---------Fetch All Coupons-------->
  const fetchCoupons = async () => {
    if (isInitialRender.current) {
      setIsloading(true);
    }
    try {
      let url = `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/coupon/all`;

      // For sellers, filter by their seller ID
      if (userRole === "seller" && sellerId) {
        url += `?sellerId=${sellerId}`;
      } else if (isAdmin && selectedSeller !== "all") {
        url += `?sellerId=${selectedSeller}`;
      }

      const { data } = await axios.get(url);
      if (data) {
        setCouponData(data.coupons);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (isInitialRender.current) {
        setIsloading(false);
        isInitialRender.current = false;
      }
    }
  };

  useEffect(() => {
    // Fetch coupons when auth is loaded or for any logged in user
    // For admin/superadmin, fetch all coupons
    // For sellers, fetch only their coupons
    if (auth?.user) {
      fetchCoupons();
    }
    // eslint-disable-next-line
  }, [auth?.user, selectedSeller]);

  useEffect(() => {
    setFilterCoupon(couponData);
  }, [couponData]);

  useEffect(() => {
    const currentDate = new Date();
    const activeCount = couponData.filter(
      (coupon) => coupon.isActive && new Date(coupon.endDate) >= currentDate
    ).length;
    const inactiveCount = couponData.filter(
      (coupon) => !coupon.isActive
    ).length;
    const expiredCount = couponData.filter(
      (coupon) => new Date(coupon.endDate) < currentDate
    ).length;

    setActiveCoupon(activeCount);
    setInactiveCoupon(inactiveCount);
    setExpiredCoupon(expiredCount);
  }, [couponData]);

  // -------------Handle filtering by tabs and search---------------
  const filterData = (search = searchQuery, statusFilter = activeTab) => {
    let filtered = couponData;
    const currentDate = new Date();

    if (statusFilter === "All" && !search) {
      setFilterCoupon(couponData);
      return;
    }

    if (statusFilter === "Active") {
      filtered = filtered.filter(
        (coupon) => coupon.isActive === true && new Date(coupon.endDate) >= currentDate
      );
    } else if (statusFilter === "Inactive") {
      filtered = filtered.filter((coupon) => coupon.isActive === false);
    } else if (statusFilter === "Expired") {
      filtered = filtered.filter((coupon) => new Date(coupon.endDate) < currentDate);
    }

    if (search) {
      const lowercasedSearch = search.toLowerCase();
      filtered = filtered.filter((coupon) => {
        const {
          code = "",
          discountPercentage = "",
          maxDiscount = "",
          minPurchase = "",
          seller = {},
          description = "",
        } = coupon;

        return (
          code?.toString()?.toLowerCase().includes(lowercasedSearch) ||
          discountPercentage
            ?.toString()
            ?.toLowerCase()
            .includes(lowercasedSearch) ||
          maxDiscount?.toString()?.toLowerCase().includes(lowercasedSearch) ||
          minPurchase?.toString()?.toLowerCase().includes(lowercasedSearch) ||
          seller?.storeName?.toLowerCase().includes(lowercasedSearch) ||
          description?.toLowerCase().includes(lowercasedSearch)
        );
      });
    }

    setFilterCoupon(filtered);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    filterData(searchQuery, tab);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    filterData(value, activeTab);
  };

  // ----------------Pegination----------->
  const totalPages = Math.ceil(filterCoupon.length / itemsPerPage);

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Get the current page data
  const paginatedData = filterCoupon.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // -----------Delete All Products------------
  const handleDeleteConfirmation = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this coupon!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(id);
        Swal.fire("Deleted!", "Coupon has been deleted.", "success");
      }
    });
  };

  const handleDelete = async (couponId) => {
    setIsLoad(true);
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/coupon/delete/${couponId}`
      );
      if (data) {
        setFilterCoupon((prev) =>
          prev.filter((coupon) => coupon._id !== couponId)
        );
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
      }
    } catch (error) {
      console.log("Error deleting coupon:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoad(false);
    }
  };

  // -------------Handle Update Status----------->
  const handleStatusConfirmation = (id, status) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to update this coupon status!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${status === true ? "enable" : "disable"} it!`,
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatus(id, status);
        Swal.fire("Updated!", "Coupon status has been updated.", "success");
      }
    });
  };

  const handleStatus = async (id, status) => {
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/coupon/status/${id}`,
        { status }
      );
      if (data) {
        fetchCoupons();
        toast.success("Coupon status updated!");
      }
    } catch (error) {
      console.log("Error update coupon status:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "code",
        minSize: 100,
        maxSize: 180,
        size: 140,
        grow: false,
        Header: () => (
          <div className="flex flex-col gap-[2px]">
            <span className="ml-1 cursor-pointer font-semibold">COUPON CODE</span>
          </div>
        ),
        Cell: ({ row }) => {
          const code = row.original.code;
          const description = row.original.description;
          const discountType = row.original.discountType;

          return (
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${discountType === "percentage" ? "bg-red-100" : "bg-blue-100"}`}>
                <RiCoupon4Line className={`w-4 h-4 ${discountType === "percentage" ? "text-red-600" : "text-blue-600"}`} />
              </div>
              <div>
                <p className="font-mono font-bold text-gray-900 text-sm tracking-wide">
                  {code}
                </p>
                {description && (
                  <p className="text-xs text-gray-500 truncate max-w-[100px]">
                    {description}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      // Seller Store (only for admin)
      ...(isAdmin
        ? [
            {
              accessorKey: "seller",
              minSize: 120,
              maxSize: 200,
              size: 150,
              grow: true,
              Header: () => (
                <div className="flex flex-col gap-[2px]">
                  <span className="ml-1 cursor-pointer font-semibold">SELLER STORE</span>
                </div>
              ),
              Cell: ({ row }) => {
                const seller = row.original.seller;

                if (!seller) {
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Platform</p>
                        <p className="text-xs text-gray-500">Admin Created</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {seller.storeLogo ? (
                        <img
                          src={seller.storeLogo}
                          alt={seller.storeName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600">
                          <MdStore className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                        {seller.storeName || "Unknown Store"}
                      </p>
                      {seller.storeSlug && (
                        <p className="text-xs text-gray-500">@{seller.storeSlug}</p>
                      )}
                    </div>
                  </div>
                );
              },
            },
          ]
        : []),
      // Discount
      {
        accessorKey: "discountPercentage",
        minSize: 100,
        maxSize: 150,
        size: 120,
        grow: false,
        Header: () => (
          <div className="flex flex-col gap-[2px]">
            <span className="ml-1 cursor-pointer font-semibold">DISCOUNT</span>
          </div>
        ),
        Cell: ({ row }) => {
          const discountType = row.original.discountType || "percentage";
          const discountPercentage = row.original.discountPercentage;
          const fixedDiscount = row.original.fixedDiscount;

          return (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold ${
                discountType === "percentage"
                  ? "bg-gradient-to-r from-red-100 to-orange-100 text-red-700"
                  : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700"
              }`}>
                {discountType === "percentage" ? (
                  <>
                    <FaPercent className="w-3 h-3" />
                    <span>{discountPercentage}%</span>
                  </>
                ) : (
                  <>
                    <span>€{fixedDiscount}</span>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
      // Products
      {
        accessorKey: "productIds",
        minSize: 100,
        maxSize: 200,
        size: 130,
        grow: true,
        Header: () => (
          <div className="flex flex-col gap-[2px]">
            <span className="ml-1 cursor-pointer font-semibold">PRODUCTS</span>
          </div>
        ),
        Cell: ({ row }) => {
          const products = row.original?.productIds || [];
          const productCount = products.length;

          return (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {products.slice(0, 3).map((product, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-lg overflow-hidden border-2 border-white bg-gray-100"
                  >
                    {product.thumbnails?.[0]?.url ? (
                      <img
                        src={product.thumbnails[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiShoppingBag className="w-3 h-3 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {productCount} {productCount === 1 ? "product" : "products"}
              </span>
            </div>
          );
        },
      },
      // Min/Max
      {
        accessorKey: "minPurchase",
        minSize: 100,
        maxSize: 160,
        size: 130,
        grow: false,
        Header: () => (
          <div className="flex flex-col gap-[2px]">
            <span className="ml-1 cursor-pointer font-semibold">MIN / MAX</span>
          </div>
        ),
        Cell: ({ row }) => {
          const minPurchase = row.original.minPurchase;
          const maxDiscount = row.original.maxDiscount;

          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-500">Min:</span>
                <span className="font-semibold text-gray-900">€{minPurchase}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-500">Max:</span>
                <span className="font-semibold text-green-600">€{maxDiscount}</span>
              </div>
            </div>
          );
        },
      },
      // Usage
      {
        accessorKey: "usedCount",
        minSize: 80,
        maxSize: 120,
        size: 100,
        grow: false,
        Header: () => (
          <div className="flex flex-col gap-[2px]">
            <span className="ml-1 cursor-pointer font-semibold">USAGE</span>
          </div>
        ),
        Cell: ({ row }) => {
          const usedCount = row.original.usedCount || 0;
          const usageLimit = row.original.usageLimit || 0;

          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{usedCount}</span>
                {usageLimit > 0 && (
                  <span className="text-xs text-gray-500">/ {usageLimit}</span>
                )}
              </div>
              {usageLimit > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      usedCount >= usageLimit ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min((usedCount / usageLimit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        },
      },
      // Validity
      {
        accessorKey: "endDate",
        minSize: 120,
        maxSize: 180,
        size: 140,
        grow: false,
        Header: () => (
          <div className="flex flex-col gap-[2px]">
            <span className="ml-1 cursor-pointer font-semibold">VALIDITY</span>
          </div>
        ),
        Cell: ({ row }) => {
          const startDate = row.original.startDate;
          const endDate = row.original.endDate;
          const isExpired = new Date(endDate) < new Date();
          const daysLeft = Math.ceil(
            (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <BsCalendarCheck className="w-3 h-3" />
                {format(new Date(startDate), "dd MMM")}
                <span>-</span>
                {format(new Date(endDate), "dd MMM yy")}
              </div>
              {isExpired ? (
                <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                  <BsCalendarX className="w-3 h-3" />
                  Expired
                </span>
              ) : (
                <span className={`text-xs font-medium ${daysLeft <= 7 ? "text-orange-600" : "text-green-600"}`}>
                  {daysLeft} days left
                </span>
              )}
            </div>
          );
        },
      },
      // Public/Private
      {
        accessorKey: "isPublic",
        minSize: 80,
        maxSize: 120,
        size: 90,
        grow: false,
        Header: () => (
          <div className="flex flex-col gap-[2px]">
            <span className="ml-1 cursor-pointer font-semibold">ACCESS</span>
          </div>
        ),
        Cell: ({ row }) => {
          const isPublic = row?.original?.isPublic || false;

          return (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
              isPublic
                ? "bg-green-100 text-green-700"
                : "bg-purple-100 text-purple-700"
            }`}>
              {isPublic ? (
                <>
                  <FaUsers className="w-3 h-3" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <HiUsers className="w-3 h-3" />
                  <span>Private</span>
                </>
              )}
            </div>
          );
        },
      },
      // Status
      {
        accessorKey: "isActive",
        minSize: 100,
        maxSize: 140,
        size: 110,
        grow: false,
        Header: () => (
          <div className="flex flex-col gap-[2px]">
            <span className="ml-1 cursor-pointer font-semibold">STATUS</span>
          </div>
        ),
        Cell: ({ row }) => {
          const status = row.original.isActive;
          const isExpired = new Date(row.original.endDate) < new Date();

          if (isExpired) {
            return (
              <span className="py-1.5 px-3 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                Expired
              </span>
            );
          }

          return (
            <button
              onClick={() => handleStatusConfirmation(row.original._id, !status)}
              className={`py-1.5 px-3 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105 cursor-pointer ${
                status
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 hover:shadow-md"
                  : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200 hover:shadow-md"
              }`}
            >
              {status ? "Active" : "Inactive"}
            </button>
          );
        },
      },
      // Actions
      {
        accessorKey: "Actions",
        minSize: 100,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: () => (
          <div className="flex flex-col gap-[2px]">
            <span className="ml-1 cursor-pointer font-semibold">ACTIONS</span>
          </div>
        ),
        Cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCouponId(row.original._id);
                  setShowCoupon(true);
                }}
                className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md"
              >
                <MdModeEditOutline className="text-[14px] text-white" />
              </button>

              <button
                onClick={() => {
                  handleDeleteConfirmation(row.original._id);
                  setCouponId(row.original._id);
                }}
                className="p-2 bg-gradient-to-r from-red-400 to-rose-400 hover:from-red-500 hover:to-rose-500 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md"
              >
                {isLoad && couponId === row.original._id ? (
                  <ImSpinner4 className="text-[14px] text-white animate-spin" />
                ) : (
                  <MdDelete className="text-[14px] text-white" />
                )}
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line
    [couponData, currentUrl, filterCoupon, activeTab, paginatedData, isAdmin]
  );

  const table = useMaterialReactTable({
    columns,
    data: paginatedData,
    getRowId: (row) => row._id,
    enableStickyHeader: true,
    enableStickyFooter: false,
    columnFilterDisplayMode: "popover",
    muiTableContainerProps: {
      sx: (theme) => ({
        minHeight: {
          xs: "330px",
          sm: "350px",
          md: "330px",
          lg: "400px",
          xl: "500px",
        },
        maxHeight: {
          xs: "350px",
          sm: "380px",
          md: "400px",
          lg: "500px",
          xl: "800px",
        },
      }),
    },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableGlobalFilter: true,
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    enablePagination: false,
    initialState: {
      pagination: { pageSize: 20 },
      pageSize: 20,
      density: "compact",
    },
    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "11px",
        backgroundColor: "#c6080a",
        color: "#fff",
        padding: ".7rem 0.3rem",
      },
    },
  });

  const statCards = [
    {
      title: "Total Coupons",
      value: stats.total || couponData.length,
      icon: RiCoupon4Line,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Active Coupons",
      value: stats.active || activeCoupon,
      icon: FaCheckDouble,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Expired Coupons",
      value: stats.expired || expiredCoupon,
      icon: BsCalendarX,
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Total Usage",
      value: stats.totalUsage,
      icon: MdTrendingUp,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <MainLayout title="Coupons - Darloo Admin">
      <div className="p-1 sm:p-2 h-[100%] w-full pb-4 scroll-smooth">
        <div className="flex flex-col gap-3 pb-2">
          <Breadcrumb path={currentUrl} />

          {/* Stats Cards */}
          {showStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className={`${stat.bgColor} rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Header with Tabs */}
          <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                  <RiCoupon4Line className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Coupon Management</h1>
                  <p className="text-xs text-gray-500">
                    {userRole === "seller"
                      ? "Manage your store coupons"
                      : "Manage all platform coupons"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className={`p-2 rounded-lg transition-all ${
                    showStats ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <IoStatsChart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowCoupon(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <RiCoupon2Fill className="w-4 h-4" />
                  <span>Add Coupon</span>
                </button>
              </div>
            </div>

            {/* Tabs Row */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 overflow-x-auto">
              <div className="flex items-center gap-2">
                {[
                  { key: "All", count: couponData.length, icon: HiTicket },
                  { key: "Active", count: activeCoupon, icon: FaCheckDouble },
                  { key: "Inactive", count: isactiveCoupon, icon: MdNotInterested },
                  { key: "Expired", count: expiredCoupon, icon: BsCalendarX },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.key
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.key}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Admin Seller Filter */}
              {isAdmin && sellers.length > 0 && (
                <div className="flex items-center gap-2 ml-4">
                  <MdStore className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedSeller}
                    onChange={(e) => setSelectedSeller(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white"
                  >
                    <option value="all">All Stores</option>
                    {sellers.map((seller) => (
                      <option key={seller._id} value={seller._id}>
                        {seller.storeName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full h-[93%] relative overflow-hidden overflow-x-auto py-3 sm:py-4 bg-white rounded-xl shadow-sm border border-gray-100 px-2 sm:px-4 mt-4">
          {/* Search & Pagination */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="relative">
              <span className="absolute top-2.5 left-3 z-10">
                <IoSearch className="text-[18px] text-gray-400" />
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search coupons, stores..."
                className="w-[18rem] h-[2.4rem] rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none px-2 pl-10 text-[13px] transition-all"
              />
            </div>
            {/* Pagination */}
            <div className="flex items-center gap-3 justify-end sm:justify-normal w-full sm:w-fit">
              <span className="text-sm text-gray-600">
                Page <span className="font-semibold">{currentPage}</span> of{" "}
                <span className="font-semibold">{totalPages || 1}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage === 1}
                  className={`p-1.5 rounded-lg transition-all ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <CiCircleChevLeft className="text-[26px]" />
                </button>
                <button
                  onClick={() => handlePageChange("next")}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-1.5 rounded-lg transition-all ${
                    currentPage === totalPages || totalPages === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <CiCircleChevRight className="text-[26px]" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full scroll-smooth shidden h-[90%] overflow-y-auto pb-4">
            {isLoading ? (
              <div className="flex items-center justify-center w-full h-[400px]">
                <Loader />
              </div>
            ) : filterCoupon.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-[400px] text-center">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <RiCouponLine className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Coupons Found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "Create your first coupon to get started"}
                </p>
                <button
                  onClick={() => setShowCoupon(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all"
                >
                  <RiCoupon2Fill className="w-4 h-4" />
                  Create Coupon
                </button>
              </div>
            ) : (
              <div className="w-full min-h-[20vh] relative">
                <div className="h-full overflow-y-scroll shidden relative">
                  <MaterialReactTable table={table} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coupon Modal */}
        {showCoupon && (
          <div className="fixed inset-0 p-2 sm:p-4 flex items-center justify-center z-[9999999] bg-black/60 backdrop-blur-sm overflow-y-auto">
            <CouponModal
              setShowCoupon={setShowCoupon}
              couponId={couponId}
              setCouponId={setCouponId}
              fetchCoupons={fetchCoupons}
              sellerId={sellerId}
              userRole={userRole}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
