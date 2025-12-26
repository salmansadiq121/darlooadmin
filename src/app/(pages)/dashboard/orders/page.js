"use client";
import dynamic from "next/dynamic";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import { IoSearch, IoFilterOutline } from "react-icons/io5";
import {
  MdDelete,
  MdStorefront,
  MdOutlineLocalShipping,
} from "react-icons/md";
import { format } from "date-fns";
import { TiEye } from "react-icons/ti";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";
import { ImSpinner4 } from "react-icons/im";
import { useAuth } from "@/app/context/authContext";
import HandleOrderModal from "@/app/components/order/HandleOrderModal";
import { HiDownload, HiOutlineShoppingBag } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiChevronDown,
} from "react-icons/fi";
import { BsShop, BsBoxSeam } from "react-icons/bs";
import { RiShoppingBag3Line } from "react-icons/ri";
import { HiOutlineCurrencyDollar } from "react-icons/hi2";

const MainLayout = dynamic(
  () => import("./../../../components/layout/MainLayout"),
  {
    ssr: false,
  }
);
const Breadcrumb = dynamic(() => import("./../../../utils/Breadcrumb"), {
  ssr: false,
});

export default function Orders() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [orderData, setOrderData] = useState([]);
  const [filterOrders, setFilterOrders] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();
  const isInitialRender = useRef(true);
  const [isLoad, setIsLoad] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Multi-vendor view tabs (admin only)
  const [viewMode, setViewMode] = useState("myOrders");

  // Pagination & Filters
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [counts, setCounts] = useState({
    All: 0,
    Pending: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
    Returned: 0,
  });
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [sellers, setSellers] = useState([]);

  // Stats for dashboard cards
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "superadmin";
  const isSeller = auth?.user?.role === "seller" || (auth?.user?.isSeller && !isAdmin);

  // Current URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathArray = window.location.pathname;
      setCurrentUrl(pathArray);
    }
  }, []);

  // Fetch sellers for filter (admin only)
  useEffect(() => {
    const fetchSellers = async () => {
      if (isAdmin && auth?.token) {
        try {
          const { data } = await axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/all?simple=true&status=true&verificationStatus=approved`,
            {
              headers: {
                Authorization: auth?.token,
              },
            }
          );
          if (data?.success) {
            setSellers(data.sellers || []);
          }
        } catch (error) {
          console.error("Error fetching sellers:", error);
        }
      }
    };
    fetchSellers();
  }, [auth, isAdmin]);

  // Fetch All Orders
  const fetchOrders = async (page = currentPage, reset = false) => {
    if (isInitialRender.current || reset) {
      setIsloading(true);
    }
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        ...(activeTab !== "All" && { orderStatus: activeTab }),
        ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
        ...(paymentMethodFilter && { paymentMethod: paymentMethodFilter }),
        ...(searchQuery && { search: searchQuery }),
        ...(sellerFilter && { sellerId: sellerFilter }),
      });

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/all/orders?${params.toString()}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      if (data) {
        setOrderData(data.orders);
        setFilterOrders(data.orders);
        if (data.pagination) {
          setPagination(data.pagination);
          setCurrentPage(data.pagination.currentPage);
        }
        if (data.counts) {
          setCounts(data.counts);
        }
        const totalRevenue = data.orders?.reduce((sum, order) => {
          return sum + parseFloat(order.totalAmount || order.sellerSubtotal || 0);
        }, 0) || 0;

        setStats({
          totalRevenue,
          totalOrders: data.pagination?.total || 0,
          pendingOrders: data.counts?.Pending || 0,
          completedOrders: data.counts?.Delivered || 0,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch orders");
    } finally {
      if (isInitialRender.current || reset) {
        setIsloading(false);
        isInitialRender.current = false;
      }
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchOrders(1, true);
    }
  }, [
    activeTab,
    sortBy,
    paymentStatusFilter,
    paymentMethodFilter,
    sellerFilter,
    viewMode,
    auth?.token,
  ]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== undefined && auth?.token) {
        fetchOrders(1, true);
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, auth?.token]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Delete handlers
  const handleDeleteConfirmation = (orderId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(orderId);
        Swal.fire("Deleted!", "Order has been deleted.", "success");
      }
    });
  };

  const handleDelete = async (orderId) => {
    setIsLoad(true);
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/delete/order/${orderId}`
      );
      if (data) {
        setFilterOrders((prev) =>
          prev.filter((order) => order._id !== orderId)
        );
        toast.success("Order deleted successfully!");
      }
    } catch (error) {
      console.log("Error deleting order:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoad(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (orderId, paymentStatus, orderStatus) => {
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/update/status/${orderId}`,
        {
          paymentStatus: paymentStatus,
          orderStatus: orderStatus,
        }
      );
      if (data) {
        const updateOrder = data.orders;
        setFilterOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, ...updateOrder } : order
          )
        );
        fetchOrders();
        toast.success(
          `${
            paymentStatus ? "Payment status updated" : "Order status updated"
          } successfully!`
        );
      }
    } catch (error) {
      console.log("Error updating order:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    }
  };

  // Pagination
  const handlePageChange = (direction) => {
    if (direction === "next" && pagination.hasNextPage) {
      fetchOrders(currentPage + 1);
    } else if (direction === "prev" && pagination.hasPrevPage) {
      fetchOrders(currentPage - 1);
    }
  };

  const paginatedData = filterOrders;

  // Delete All Orders
  const handleDeleteConfirmationOrder = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAllOrders();
        Swal.fire("Deleted!", "Orders have been deleted.", "success");
      }
    });
  };

  const deleteAllOrders = async () => {
    if (!rowSelection || Object.keys(rowSelection).length === 0) {
      return toast.error("Please select at least one order to delete.");
    }

    const productIdsArray = Object.keys(rowSelection);

    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/delete/multiple`,
        { orderIds: productIdsArray }
      );

      if (data) {
        fetchOrders();
        toast.success("All selected orders deleted successfully.");
        setRowSelection({});
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete orders. Please try again later.");
    }
  };

  // Export Functions
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";

    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Product Name",
      "Quantity",
      "Price",
      "Color",
      "Size",
      "Discount",
      "Shipping Fee",
      "Total Amount",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Shipping Address",
      "Country",
      "City",
      "State",
      "Postcode",
      "Tracking ID",
      "Shipping Carrier",
      "Seller",
      "Order Date",
    ];

    const rows = [];

    data.forEach((order) => {
      const fullName =
        `${order.user?.name || ""} ${order.user?.lastName || ""}`.trim() ||
        order.customerName ||
        "N/A";

      const base = [
        `"${order.uid || order.parentOrder?.uid || ""}"`,
        `"${fullName}"`,
        `"${order.user?.email || order.customerEmail || "N/A"}"`,
        `"${order.user?.number || "N/A"}"`,
      ];

      const shippingAddress = order.shippingAddress || order.parentOrder?.shippingAddress;
      const shippingAddressStr = shippingAddress
        ? `"${shippingAddress.address || ""}"`
        : `"N/A"`;

      const country = shippingAddress?.country || "N/A";
      const city = shippingAddress?.city || "N/A";
      const state = shippingAddress?.state || "N/A";
      const postcode = shippingAddress?.postalCode || "N/A";

      const dateFormatted = order.createdAt
        ? `"${format(new Date(order.createdAt), "yyyy-MM-dd HH:mm:ss")}"`
        : `"N/A"`;

      const sellerName = order.sellerName || "Marketplace";

      if (Array.isArray(order.products) && order.products.length > 0) {
        order.products.forEach((p) => {
          rows.push(
            [
              ...base,
              `"${p.product?.name || "N/A"}"`,
              `"${p.quantity || 0}"`,
              `"${p.price || 0}"`,
              `"${p.colors?.join(",") || "N/A"}"`,
              `"${p.sizes?.join(",") || "N/A"}"`,
              `"${order.discount || "0"}"`,
              `"${order.shippingFee || "0"}"`,
              `"${order.totalAmount || order.sellerSubtotal || "0"}"`,
              `"${order.paymentMethod || order.parentOrder?.paymentMethod || "N/A"}"`,
              `"${order.paymentStatus || order.parentOrder?.paymentStatus || "N/A"}"`,
              `"${order.orderStatus || "N/A"}"`,
              shippingAddressStr,
              `"${country}"`,
              `"${city}"`,
              `"${state}"`,
              `"${postcode}"`,
              `"${order.tracking?.[0]?.trackingId || "N/A"}"`,
              `"${order.tracking?.[0]?.shippingCarrier || "N/A"}"`,
              `"${sellerName}"`,
              dateFormatted,
            ].join(",")
          );
        });
      } else {
        rows.push(
          [
            ...base,
            `"No products"`,
            `"0"`,
            `"0"`,
            `"N/A"`,
            `"N/A"`,
            `"${order.discount || "0"}"`,
            `"${order.shippingFee || "0"}"`,
            `"${order.totalAmount || order.sellerSubtotal || "0"}"`,
            `"${order.paymentMethod || order.parentOrder?.paymentMethod || "N/A"}"`,
            `"${order.paymentStatus || order.parentOrder?.paymentStatus || "N/A"}"`,
            `"${order.orderStatus || "N/A"}"`,
            shippingAddressStr,
            `"${country}"`,
            `"${city}"`,
            `"${state}"`,
            `"${postcode}"`,
            `"${order.tracking?.[0]?.trackingId || "N/A"}"`,
            `"${order.tracking?.[0]?.shippingCarrier || "N/A"}"`,
            `"${sellerName}"`,
            dateFormatted,
          ].join(",")
        );
      }
    });

    return [headers.join(","), ...rows].join("\n");
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSelected = () => {
    const selectedRows = Object.keys(rowSelection);
    if (selectedRows.length === 0) {
      toast.error("Please select orders to export");
      return;
    }

    const selectedOrders = filterOrders.filter((order) =>
      Object.keys(rowSelection).includes(order._id.toString())
    );
    const csvContent = convertToCSV(selectedOrders);
    const filename = `selected_orders_${format(
      new Date(),
      "yyyy-MM-dd_HH-mm-ss"
    )}.csv`;
    downloadCSV(csvContent, filename);
    setShowExportModal(false);
    toast.success(`Exported ${selectedRows.length} selected orders`);
  };

  const handleExportAll = () => {
    const csvContent = convertToCSV(orderData);
    const filename = `all_orders_${format(
      new Date(),
      "yyyy-MM-dd_HH-mm-ss"
    )}.csv`;
    downloadCSV(csvContent, filename);
    setShowExportModal(false);
    toast.success(`Exported ${orderData.length} orders`);
  };

  const handleExportCurrentPage = () => {
    const csvContent = convertToCSV(filterOrders);
    const filename = `current_page_orders_${format(
      new Date(),
      "yyyy-MM-dd_HH-mm-ss"
    )}.csv`;
    downloadCSV(csvContent, filename);
    setShowExportModal(false);
    toast.success(`Exported ${filterOrders.length} orders from current page`);
  };

  // Table Columns
  const columns = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "orderNumber",
        size: 90,
        Cell: ({ row }) => {
          const orderNumber =
            row.original.orderNumber ||
            row.original.parentOrder?.orderNumber ||
            row.original._id.slice(0, 6);
          const isSellerOrder = row.original.parentOrder !== undefined;
          return (
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                #{orderNumber || "—"}
              </span>
              {isSellerOrder && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-violet-100 text-violet-700 font-medium">
                  S
                </span>
              )}
            </div>
          );
        },
      },
      // Seller column (visible for admin)
      ...(isAdmin
        ? [
            {
              accessorKey: "sellerName",
              header: "Seller",
              size: 140,
              Cell: ({ row }) => {
                const order = row.original;
                const products = order.products || [];

                let sellerName = order.sellerName;
                if (!sellerName && products.length > 0) {
                  const sellerNames = [
                    ...new Set(
                      products
                        .map((p) => p.sellerName)
                        .filter((name) => name && name !== "Marketplace")
                    ),
                  ];
                  sellerName = sellerNames.length > 0 ? sellerNames[0] : null;
                }

                if (!sellerName) {
                  return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-600 font-medium text-[11px] border border-rose-200">
                      <BsShop className="w-3 h-3" />
                      Marketplace
                    </span>
                  );
                }

                const uniqueSellers = products.length > 0
                  ? [...new Set(products.map((p) => p.sellerName).filter(Boolean))]
                  : [sellerName];

                if (uniqueSellers.length > 1) {
                  return (
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 text-violet-700 font-medium text-[11px] border border-violet-200">
                        <FiUsers className="w-3 h-3" />
                        {uniqueSellers.length} Sellers
                      </span>
                    </div>
                  );
                }

                return (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium text-[11px] border border-indigo-200 truncate max-w-[120px]">
                    <MdStorefront className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{sellerName}</span>
                  </span>
                );
              },
            },
          ]
        : []),
      {
        accessorKey: "products",
        minSize: 180,
        maxSize: 280,
        size: 240,
        grow: true,
        Header: () => (
          <div className="flex items-center gap-1.5 text-[11px]">
            <FiPackage className="w-3.5 h-3.5" />
            <span>PRODUCTS</span>
          </div>
        ),
        Cell: ({ row }) => {
          const products = row.original?.products || [];
          const [isExpanded, setIsExpanded] = React.useState(false);

          const firstProduct = products[0];
          const remainingProducts = products.slice(1);

          const toggleExpanded = (e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          };

          return (
            <div
              onClick={() =>
                router.push(`/dashboard/orders/details/${row.original._id}`)
              }
              className="cursor-pointer py-1.5 group"
            >
              <div className="flex flex-col gap-1.5">
                {firstProduct && (
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100 group-hover:border-red-200 group-hover:shadow-md transition-all duration-200">
                    <div className="w-11 h-11 relative rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-slate-200">
                      <Image
                        src={
                          firstProduct?.image ||
                          firstProduct?.product?.thumbnails ||
                          "/default-thumbnail.jpg"
                        }
                        layout="fill"
                        alt="Product"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 truncate group-hover:text-red-600 transition-colors leading-tight">
                        {firstProduct?.product?.name || "Unnamed Product"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">
                          Qty: {firstProduct?.quantity || 1}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-semibold">
                          €{firstProduct?.price || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {remainingProducts.length > 0 && (
                  <div>
                    <button
                      onClick={toggleExpanded}
                      className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
                    >
                      <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-[9px]">
                        {isExpanded ? "−" : "+"}
                      </span>
                      {isExpanded
                        ? "Show less"
                        : `${remainingProducts.length} more`}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1.5 flex flex-col gap-1.5 overflow-hidden"
                        >
                          {remainingProducts.map((product, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100"
                            >
                              <div className="w-8 h-8 relative rounded overflow-hidden flex-shrink-0 border border-slate-200">
                                <Image
                                  src={
                                    product?.image ||
                                    product?.product?.thumbnails ||
                                    "/default-thumbnail.jpg"
                                  }
                                  layout="fill"
                                  alt="Product"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-slate-700 truncate font-medium">
                                  {product?.product?.name || "Unnamed"}
                                </p>
                                <span className="text-[9px] text-slate-500">
                                  Qty: {product?.quantity || 1} • €{product?.price || 0}
                                </span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {products.length === 0 && (
                  <span className="text-slate-400 text-[11px] italic">
                    No products
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "quantity",
        minSize: 55,
        maxSize: 75,
        size: 65,
        grow: false,
        Header: () => (
          <span className="text-[11px]">QTY</span>
        ),
        Cell: ({ row }) => {
          const products = row.original.products || [];
          const totalQty = products.reduce(
            (sum, p) => sum + (p.quantity || 0),
            0
          );

          return (
            <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-100">
              {totalQty || "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        minSize: 85,
        maxSize: 110,
        size: 95,
        grow: true,
        Header: () => (
          <div className="flex items-center gap-1 text-[11px]">
            <FiClock className="w-3 h-3" />
            <span>DATE</span>
          </div>
        ),
        Cell: ({ row }) => {
          const createdAt = row.original.createdAt;
          return (
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-800">
                {format(new Date(createdAt), "MMM dd, yyyy")}
              </span>
              <span className="text-[9px] text-slate-400 font-medium">
                {format(new Date(createdAt), "HH:mm")}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "totalAmount",
        minSize: 85,
        maxSize: 115,
        size: 100,
        grow: false,
        Header: () => (
          <div className="flex items-center gap-1 text-[11px]">
            <HiOutlineCurrencyDollar className="w-3.5 h-3.5" />
            <span>AMOUNT</span>
          </div>
        ),
        Cell: ({ row }) => {
          const price = row.original.totalAmount || row.original.sellerSubtotal || 0;
          const shippingFee = row.original.shippingFee || 0;

          return (
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-emerald-600">
                €{parseFloat(price).toFixed(2)}
              </span>
              {shippingFee > 0 && (
                <span className="text-[9px] text-slate-400 font-medium">
                  +€{shippingFee} ship
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "trackingId",
        minSize: 80,
        maxSize: 130,
        size: 105,
        grow: false,
        Header: () => (
          <div className="flex items-center gap-1 text-[11px]">
            <MdOutlineLocalShipping className="w-3.5 h-3.5" />
            <span>TRACKING</span>
          </div>
        ),
        Cell: ({ row }) => {
          const tracking = row.original.tracking;
          const trackingId =
            Array.isArray(tracking) && tracking[0]?.trackingId
              ? tracking[0].trackingId
              : row.original.trackingId;
          const shippingCarrier =
            Array.isArray(tracking) && tracking[0]?.shippingCarrier
              ? tracking[0].shippingCarrier
              : row.original.shippingCarrier;

          if (!trackingId) {
            return (
              <span className="text-[10px] text-slate-400 italic">
                No tracking
              </span>
            );
          }

          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-mono font-semibold text-slate-700 truncate max-w-[95px]">
                {trackingId}
              </span>
              {shippingCarrier && (
                <span className="text-[8px] text-slate-400 uppercase tracking-wide font-semibold">
                  {shippingCarrier}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "paymentMethod",
        minSize: 80,
        maxSize: 115,
        size: 95,
        grow: false,
        Header: () => (
          <span className="text-[11px]">PAYMENT</span>
        ),
        Cell: ({ row }) => {
          const paymentMethod = row.original.paymentMethod || row.original.parentOrder?.paymentMethod;

          const methodConfig = {
            "Credit Card": {
              bg: "bg-violet-50",
              text: "text-violet-700",
              border: "border-violet-200",
              icon: "💳",
            },
            PayPal: {
              bg: "bg-blue-50",
              text: "text-blue-700",
              border: "border-blue-200",
              icon: "🅿️",
            },
            "Bank Transfer": {
              bg: "bg-teal-50",
              text: "text-teal-700",
              border: "border-teal-200",
              icon: "🏦",
            },
          };

          const config = methodConfig[paymentMethod] || {
            bg: "bg-slate-50",
            text: "text-slate-700",
            border: "border-slate-200",
            icon: "💰",
          };

          return (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${config.bg} ${config.text} ${config.border} border text-[10px] font-medium`}
            >
              <span className="text-[10px]">{config.icon}</span>
              <span className="truncate max-w-[60px]">
                {paymentMethod || "N/A"}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: "orderStatus",
        minSize: 140,
        maxSize: 200,
        size: 170,
        grow: true,
        Header: () => (
          <span className="text-[11px]">ORDER STATUS</span>
        ),
        Cell: ({ row }) => {
          const order = row.original;
          // For seller orders, show seller order status
          const isSellerOrder = order.parentOrder !== undefined;

          const statusConfig = {
            Pending: {
              bg: "bg-gradient-to-r from-amber-50 to-orange-50",
              text: "text-amber-700",
              border: "border-amber-300",
              icon: <FiClock className="w-3.5 h-3.5" />,
              dot: "bg-amber-500",
            },
            Processing: {
              bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
              text: "text-blue-700",
              border: "border-blue-300",
              icon: <FiRefreshCw className="w-3.5 h-3.5 animate-spin-slow" />,
              dot: "bg-blue-500",
            },
            Packing: {
              bg: "bg-gradient-to-r from-violet-50 to-purple-50",
              text: "text-violet-700",
              border: "border-violet-300",
              icon: <FiBox className="w-3.5 h-3.5" />,
              dot: "bg-violet-500",
            },
            Shipped: {
              bg: "bg-gradient-to-r from-cyan-50 to-teal-50",
              text: "text-cyan-700",
              border: "border-cyan-300",
              icon: <FiTruck className="w-3.5 h-3.5" />,
              dot: "bg-cyan-500",
            },
            Delivered: {
              bg: "bg-gradient-to-r from-emerald-50 to-green-50",
              text: "text-emerald-700",
              border: "border-emerald-300",
              icon: <FiCheckCircle className="w-3.5 h-3.5" />,
              dot: "bg-emerald-500",
            },
            Cancelled: {
              bg: "bg-gradient-to-r from-rose-50 to-red-50",
              text: "text-rose-700",
              border: "border-rose-300",
              icon: <FiXCircle className="w-3.5 h-3.5" />,
              dot: "bg-rose-500",
            },
            Returned: {
              bg: "bg-gradient-to-r from-orange-50 to-amber-50",
              text: "text-orange-700",
              border: "border-orange-300",
              icon: <FiPackage className="w-3.5 h-3.5" />,
              dot: "bg-orange-500",
            },
          };

          // For seller order - show single status with full text
          if (isSellerOrder) {
            const status = order.orderStatus || "Pending";
            const config = statusConfig[status] || statusConfig.Pending;
            return (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${config.bg} ${config.text} ${config.border} border shadow-sm`}
              >
                <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
                {config.icon}
                <span className="text-[11px] font-bold whitespace-nowrap">{status}</span>
              </div>
            );
          }

          // For parent order - show status summary of seller orders with full text
          const sellerOrders = order.sellerOrders || [];
          if (sellerOrders.length === 0) {
            return (
              <span className="text-[10px] text-slate-400 italic px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
                No items
              </span>
            );
          }

          // Count statuses
          const statusCounts = sellerOrders.reduce((acc, so) => {
            const s = so.orderStatus || "Pending";
            acc[s] = (acc[s] || 0) + 1;
            return acc;
          }, {});

          return (
            <div className="flex flex-col gap-1">
              {Object.entries(statusCounts).map(([status, count]) => {
                const config = statusConfig[status] || statusConfig.Pending;
                return (
                  <div
                    key={status}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg} ${config.text} ${config.border} border shadow-sm w-fit`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    <span className="text-[10px] font-bold">{count}</span>
                    <span className="text-[10px] font-semibold whitespace-nowrap">{status}</span>
                  </div>
                );
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "paymentStatus",
        minSize: 110,
        maxSize: 140,
        size: 125,
        grow: false,
        Header: () => (
          <span className="text-[11px]">PAYMENT STATUS</span>
        ),
        Cell: ({ row }) => {
          const paymentStatus = row.original.paymentStatus || row.original.parentOrder?.paymentStatus || "Pending";
          const [paymentStat, setPaymentStat] = useState(paymentStatus);
          const [showUpdate, setShowUpdate] = useState(false);
          const statuses = ["Pending", "Completed", "Failed", "Refunded"];

          const statusConfig = {
            Pending: {
              bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
              text: "text-amber-700",
              border: "border-amber-300",
              dot: "bg-amber-500",
              icon: <FiClock className="w-3 h-3" />,
            },
            Completed: {
              bg: "bg-gradient-to-r from-emerald-50 to-green-50",
              text: "text-emerald-700",
              border: "border-emerald-300",
              dot: "bg-emerald-500",
              icon: <FiCheckCircle className="w-3 h-3" />,
            },
            Failed: {
              bg: "bg-gradient-to-r from-red-50 to-rose-50",
              text: "text-red-700",
              border: "border-red-300",
              dot: "bg-red-500",
              icon: <FiXCircle className="w-3 h-3" />,
            },
            Refunded: {
              bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
              text: "text-blue-700",
              border: "border-blue-300",
              dot: "bg-blue-500",
              icon: <FiRefreshCw className="w-3 h-3" />,
            },
          };

          const config = statusConfig[paymentStatus] || statusConfig.Pending;

          const updateStatus = (id, status) => {
            setPaymentStat(status);
            handleUpdateStatus(id, status, "");
            setShowUpdate(false);
          };

          React.useEffect(() => {
            setPaymentStat(paymentStatus);
          }, [paymentStatus]);

          return (
            <div className="flex items-center">
              {!showUpdate ? (
                <button
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${config.bg} ${config.text} ${config.border} border text-[10px] font-bold transition-all shadow-sm hover:shadow-md`}
                  onDoubleClick={() => isAdmin && setShowUpdate(true)}
                  title={isAdmin ? "Double-click to change" : ""}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}
                  />
                  {config.icon}
                  <span className="whitespace-nowrap">{paymentStatus}</span>
                </button>
              ) : (
                <select
                  value={paymentStat || ""}
                  onChange={(e) =>
                    updateStatus(row.original._id, e.target.value)
                  }
                  onBlur={() => setShowUpdate(false)}
                  autoFocus
                  className="w-full h-8 rounded-lg border-2 border-red-300 focus:border-red-500 bg-white cursor-pointer px-2 text-[11px] font-semibold outline-none shadow-sm"
                >
                  <option value="">Select</option>
                  {statuses.map((stat) => (
                    <option value={stat} key={stat}>
                      {stat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "Actions",
        minSize: 70,
        maxSize: 100,
        size: 85,
        grow: false,
        Header: () => (
          <span className="text-[11px]">ACTIONS</span>
        ),
        Cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() =>
                  router.push(`/dashboard/orders/details/${row.original._id}`)
                }
                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all border border-indigo-200"
                title="View Details"
              >
                <TiEye className="w-3.5 h-3.5" />
              </motion.button>

              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    setOrderId(row.original._id);
                    handleDeleteConfirmation(row.original._id);
                  }}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-200"
                  title="Delete Order"
                >
                  {isLoad && orderId === row.original._id ? (
                    <ImSpinner4 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MdDelete className="w-3.5 h-3.5" />
                  )}
                </motion.button>
              )}
            </div>
          );
        },
      },
    ],
    [orderData, filterOrders, activeTab, paginatedData, auth?.user?.role, isAdmin]
  );

  const table = useMaterialReactTable({
    columns,
    data: paginatedData,
    getRowId: (row) => row._id,
    enableStickyHeader: true,
    enableStickyFooter: false,
    columnFilterDisplayMode: "popover",
    muiTableContainerProps: {
      sx: {
        minHeight: "400px",
        maxHeight: "calc(100vh - 420px)",
        borderRadius: "0 0 16px 16px",
        "&::-webkit-scrollbar": {
          width: "6px",
          height: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f5f9",
          borderRadius: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "linear-gradient(180deg, #dc2626 0%, #f87171 100%)",
          borderRadius: "8px",
        },
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "0",
        border: "none",
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        "&:hover": {
          backgroundColor: "rgba(239, 68, 68, 0.03) !important",
        },
        transition: "all 0.15s ease",
        cursor: "pointer",
      },
    }),
    muiTableBodyCellProps: {
      sx: {
        borderBottom: "1px solid #f1f5f9",
        padding: "10px 12px",
        fontSize: "13px",
      },
    },
    enableColumnActions: false,
    enableColumnFilters: false,
    enableSorting: false,
    enableGlobalFilter: false,
    enableRowNumbers: false,
    enableColumnResizing: true,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enableRowSelection: isAdmin,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    enablePagination: false,
    initialState: {
      pagination: { pageSize: 20 },
      pageSize: 20,
      density: "compact",
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: "600",
        fontSize: "11px",
        letterSpacing: "0.3px",
        textTransform: "uppercase",
        background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        color: "#fff",
        padding: "12px",
        borderBottom: "none",
        "&:first-of-type": {
          borderTopLeftRadius: "0",
        },
        "&:last-child": {
          borderTopRightRadius: "0",
        },
      },
    },
  });

  // Tab configuration
  const tabConfig = [
    { id: "All", label: "All", icon: HiOutlineShoppingBag, color: "red" },
    { id: "Pending", label: "Pending", icon: FiClock, color: "amber" },
    { id: "Processing", label: "Processing", icon: FiRefreshCw, color: "blue" },
    { id: "Packing", label: "Packing", icon: FiBox, color: "violet" },
    { id: "Shipped", label: "Shipped", icon: FiTruck, color: "cyan" },
    { id: "Delivered", label: "Delivered", icon: FiCheckCircle, color: "emerald" },
    { id: "Cancelled", label: "Cancelled", icon: FiXCircle, color: "rose" },
    { id: "Returned", label: "Returned", icon: FiPackage, color: "orange" },
  ];

  return (
    <MainLayout title="Orders - Multi-Vendor Admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3 sm:p-4 lg:p-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 max-w-[1920px] mx-auto"
        >
          <Breadcrumb path={currentUrl} />

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-lg p-4 sm:p-5"
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 via-transparent to-rose-50/50 pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-200/50">
                  <RiShoppingBag3Line className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-[15px] font-bold text-slate-900">
                    {isSeller ? "My Store Orders" : "Order Management"}
                  </h1>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isSeller
                      ? "Manage orders for your products"
                      : "Multi-vendor order dashboard"}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <FiDollarSign className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[9px] text-emerald-600 font-semibold uppercase block">Revenue</span>
                    <p className="text-[13px] font-bold text-emerald-700">€{stats.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                  <FiClock className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="text-[9px] text-amber-600 font-semibold uppercase block">Pending</span>
                    <p className="text-[13px] font-bold text-amber-700">{counts.Pending || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 hidden sm:flex">
                  <FiShoppingCart className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-[9px] text-blue-600 font-semibold uppercase block">Total</span>
                    <p className="text-[13px] font-bold text-blue-700">{pagination.total || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Toggle (Admin only) */}
            {isAdmin && (
              <div className="relative mt-4 flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 w-fit">
                <button
                  onClick={() => setViewMode("myOrders")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    viewMode === "myOrders"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BsBoxSeam className="w-3.5 h-3.5" />
                  Marketplace Orders
                </button>
                <button
                  onClick={() => setViewMode("allSellers")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    viewMode === "allSellers"
                      ? "bg-white text-violet-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FiUsers className="w-3.5 h-3.5" />
                  All Sellers Orders
                </button>
              </div>
            )}
          </motion.div>

          {/* Status Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full overflow-x-auto pb-1 scrollbar-hide"
          >
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-white shadow-md border border-slate-200 min-w-max">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const colorClasses = {
                  red: isActive ? "bg-red-500 text-white" : "text-slate-600 hover:bg-red-50",
                  amber: isActive ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-amber-50",
                  blue: isActive ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-blue-50",
                  violet: isActive ? "bg-violet-500 text-white" : "text-slate-600 hover:bg-violet-50",
                  cyan: isActive ? "bg-cyan-500 text-white" : "text-slate-600 hover:bg-cyan-50",
                  emerald: isActive ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-emerald-50",
                  rose: isActive ? "bg-rose-500 text-white" : "text-slate-600 hover:bg-rose-50",
                  orange: isActive ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-orange-50",
                };

                return (
                  <button
                    key={tab.id}
                    className={`flex items-center gap-1.5 py-2 px-3 text-[11px] font-semibold rounded-lg cursor-pointer transition-all duration-200 ${colorClasses[tab.color]}`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {counts[tab.id] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Filters & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none text-[11px] pl-3 pr-7 py-2 rounded-lg border border-slate-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 bg-white hover:border-slate-300 cursor-pointer font-medium text-slate-700"
                >
                  <option value="createdAt_desc">Newest First</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="totalAmount_desc">Amount: High to Low</option>
                  <option value="totalAmount_asc">Amount: Low to High</option>
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Payment Status */}
              <div className="relative">
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => {
                    setPaymentStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none text-[11px] pl-3 pr-7 py-2 rounded-lg border border-slate-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 bg-white hover:border-slate-300 cursor-pointer font-medium text-slate-700"
                >
                  <option value="">All Payment Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
                <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Seller Filter (Admin) */}
              {isAdmin && sellers.length > 0 && (
                <div className="relative">
                  <select
                    value={sellerFilter}
                    onChange={(e) => {
                      setSellerFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none text-[11px] pl-3 pr-7 py-2 rounded-lg border border-violet-200 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 bg-violet-50 hover:border-violet-300 cursor-pointer font-medium text-violet-700"
                  >
                    <option value="">All Sellers</option>
                    {sellers.map((seller) => (
                      <option key={seller._id} value={seller._id}>
                        {seller.storeName}
                      </option>
                    ))}
                  </select>
                  <MdStorefront className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-400 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1.5 text-[11px] py-2 px-3 rounded-lg bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-200/50 hover:bg-emerald-600 transition-colors"
              >
                <HiDownload className="w-3.5 h-3.5" />
                Export
              </motion.button>

              {isAdmin && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteConfirmationOrder()}
                    className="flex items-center gap-1.5 text-[11px] py-2 px-3 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-colors"
                  >
                    <MdDelete className="w-3.5 h-3.5" />
                    Delete
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsShow(true)}
                    className="flex items-center gap-1.5 text-[11px] py-2 px-3 rounded-lg bg-red-500 text-white font-semibold shadow-md shadow-red-200/50 hover:bg-red-600 transition-colors"
                  >
                    <span className="text-[13px] font-bold">+</span>
                    New Order
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>

          {/* Main Table */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-200"
          >
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <IoSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 w-4 h-4" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search orders, customers..."
                  className="w-full h-10 rounded-xl border border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none px-3 pl-10 text-[13px] transition-all bg-white placeholder:text-slate-400"
                />
              </div>

              {/* Pagination */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[11px] text-slate-500">Page</span>
                  <span className="text-[12px] font-bold text-slate-800 px-1.5 py-0.5 rounded bg-white">
                    {pagination.currentPage}
                  </span>
                  <span className="text-[11px] text-slate-500">of</span>
                  <span className="text-[12px] font-bold text-slate-800 px-1.5 py-0.5 rounded bg-white">
                    {pagination.totalPages}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">
                    ({pagination.total})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange("prev")}
                    disabled={!pagination.hasPrevPage}
                    className={`p-2 rounded-lg transition-all ${
                      !pagination.hasPrevPage
                        ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400"
                        : "bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200"
                    }`}
                  >
                    <CiCircleChevLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handlePageChange("next")}
                    disabled={!pagination.hasNextPage}
                    className={`p-2 rounded-lg transition-all ${
                      !pagination.hasNextPage
                        ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400"
                        : "bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200"
                    }`}
                  >
                    <CiCircleChevRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto w-full h-[calc(100vh-480px)] min-h-[400px]">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    {/* Advanced Table Skeleton */}
                    <div className="w-full">
                      {/* Table Header Skeleton */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600">
                        <div className="w-5 h-5 rounded bg-white/20 animate-pulse" />
                        <div className="w-20 h-4 rounded bg-white/20 animate-pulse" />
                        <div className="w-24 h-4 rounded bg-white/20 animate-pulse" />
                        <div className="flex-1" />
                        <div className="w-16 h-4 rounded bg-white/20 animate-pulse" />
                        <div className="w-20 h-4 rounded bg-white/20 animate-pulse" />
                        <div className="w-24 h-4 rounded bg-white/20 animate-pulse" />
                        <div className="w-28 h-4 rounded bg-white/20 animate-pulse" />
                        <div className="w-24 h-4 rounded bg-white/20 animate-pulse" />
                        <div className="w-20 h-4 rounded bg-white/20 animate-pulse" />
                      </div>

                      {/* Table Rows Skeleton */}
                      {[...Array(8)].map((_, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center gap-3 px-4 py-4 border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                        >
                          {/* Checkbox */}
                          <div className="w-5 h-5 rounded border-2 border-slate-200 animate-pulse" />

                          {/* Order Number */}
                          <div className="w-20">
                            <div className="h-7 rounded-lg bg-slate-200 animate-pulse" />
                          </div>

                          {/* Seller Badge */}
                          <div className="w-24">
                            <div className="h-7 rounded-lg bg-indigo-100 animate-pulse" />
                          </div>

                          {/* Product */}
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100">
                              <div className="w-12 h-12 rounded-lg bg-slate-200 animate-pulse flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 rounded bg-slate-200 animate-pulse w-3/4" />
                                <div className="flex gap-2">
                                  <div className="h-5 w-12 rounded bg-blue-100 animate-pulse" />
                                  <div className="h-5 w-14 rounded bg-emerald-100 animate-pulse" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="w-14">
                            <div className="h-7 rounded-lg bg-blue-100 animate-pulse" />
                          </div>

                          {/* Date */}
                          <div className="w-24 space-y-1">
                            <div className="h-4 rounded bg-slate-200 animate-pulse" />
                            <div className="h-3 rounded bg-slate-100 animate-pulse w-14" />
                          </div>

                          {/* Amount */}
                          <div className="w-24 space-y-1">
                            <div className="h-5 rounded bg-emerald-100 animate-pulse w-16" />
                            <div className="h-3 rounded bg-slate-100 animate-pulse w-12" />
                          </div>

                          {/* Tracking */}
                          <div className="w-28 space-y-1">
                            <div className="h-4 rounded bg-slate-200 animate-pulse" />
                            <div className="h-3 rounded bg-slate-100 animate-pulse w-16" />
                          </div>

                          {/* Payment */}
                          <div className="w-24">
                            <div className="h-7 rounded-lg bg-violet-100 animate-pulse" />
                          </div>

                          {/* Order Status */}
                          <div className="w-32 space-y-1">
                            <div className="h-8 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 animate-pulse" />
                          </div>

                          {/* Payment Status */}
                          <div className="w-24">
                            <div className="h-7 rounded-full bg-emerald-100 animate-pulse" />
                          </div>

                          {/* Actions */}
                          <div className="w-20 flex gap-1.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 animate-pulse" />
                            <div className="w-8 h-8 rounded-lg bg-red-100 animate-pulse" />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Loading Indicator Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white shadow-xl border border-slate-200">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-4 border-slate-200 border-t-red-500 animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RiShoppingBag3Line className="w-6 h-6 text-red-500" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-800 font-bold text-[14px]">Loading Orders</p>
                          <p className="text-slate-500 text-[12px] mt-1">Fetching latest data...</p>
                        </div>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full bg-red-500"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : paginatedData.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center w-full h-full py-16"
                  >
                    <div className="p-4 rounded-full bg-slate-100 mb-3">
                      <FiPackage className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-700 mb-1">No Orders Found</h3>
                    <p className="text-slate-500 text-[13px] text-center max-w-md">
                      {searchQuery
                        ? `No orders matching "${searchQuery}"`
                        : "No orders yet. New orders will appear here."}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    <MaterialReactTable table={table} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* New Order Modal */}
        <AnimatePresence>
          {isShow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 p-4 flex items-center justify-center z-[9999999] bg-black/50 backdrop-blur-sm overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full sm:w-[85%] max-w-6xl bg-white rounded-2xl shadow-2xl relative"
              >
                <HandleOrderModal
                  setIsShow={setIsShow}
                  fetchOrders={fetchOrders}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Modal */}
        <AnimatePresence>
          {showExportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 p-4 flex items-center justify-center z-[9999999] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowExportModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-200/50">
                      <HiDownload className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-bold text-slate-900">Export Orders</h2>
                      <p className="text-[11px] text-slate-500">Choose export option</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={handleExportSelected}
                    className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50 hover:border-blue-300 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500 text-white group-hover:scale-105 transition-transform">
                        <HiDownload className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 text-[13px]">Export Selected</h3>
                        <p className="text-[11px] text-slate-500">{Object.keys(rowSelection).length} orders selected</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-[11px] font-bold">
                        {Object.keys(rowSelection).length}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportCurrentPage}
                    className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:border-emerald-300 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500 text-white group-hover:scale-105 transition-transform">
                        <HiDownload className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 text-[13px]">Export Current Page</h3>
                        <p className="text-[11px] text-slate-500">Orders on this page</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                        {filterOrders.length}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={handleExportAll}
                    className="w-full p-3 rounded-xl border border-red-200 bg-red-50 hover:border-red-300 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500 text-white group-hover:scale-105 transition-transform">
                        <HiDownload className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 text-[13px]">Export All Orders</h3>
                        <p className="text-[11px] text-slate-500">Complete database export</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-[11px] font-bold">
                        {pagination.total}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 text-center">
                    CSV format • Includes order details, customer info & seller data
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
