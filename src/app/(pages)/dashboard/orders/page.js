"use client";
import Loader from "@/app/utils/Loader";
import dynamic from "next/dynamic";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete, MdModeEditOutline, MdNotInterested } from "react-icons/md";
import { format } from "date-fns";
import { TiEye } from "react-icons/ti";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";
import toast from "react-hot-toast";
import { ImSpinner4 } from "react-icons/im";
import { useAuth } from "@/app/context/authContext";
import HandleOrderModal from "@/app/components/order/HandleOrderModal";
import { HiDownload } from "react-icons/hi";
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
  const [pendingOrder, setPendingOrder] = useState(0);
  const [processingOrder, setProcessingOrder] = useState(0);
  const [shippedorder, setShippedorder] = useState(0);
  const [deliveredorder, setDeliveredorder] = useState(0);
  const [cancelledOrder, setCancelledOrder] = useState(0);
  const [refundOrder, setRefundOrder] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();
  const isInitialRender = useRef(true);
  const [isLoad, setIsLoad] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isShow, setIsShow] = useState(false);
  // Export
  const [showExportModal, setShowExportModal] = useState(false);
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

  console.log("rowSelection:", Object.keys(rowSelection));

  // Current URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathArray = window.location.pathname;
      setCurrentUrl(pathArray);
    }
    // exlint-disable-next-line
  }, []);

  // <---------Fetch All Orders-------->
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
      });

      const { data } = await axios.get(
        `${
          process.env.NEXT_PUBLIC_SERVER_URI
        }/api/v1/order/all/orders?${params.toString()}`
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
          setPendingOrder(data.counts.Pending || 0);
          setProcessingOrder(data.counts.Processing || 0);
          setShippedorder(data.counts.Shipped || 0);
          setDeliveredorder(data.counts.Delivered || 0);
          setCancelledOrder(data.counts.Cancelled || 0);
          setRefundOrder(data.counts.Returned || 0);
        }
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
    fetchOrders(1, true);
    // eslint-disable-next-line
  }, [activeTab, sortBy, paymentStatusFilter, paymentMethodFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchOrders(1, true);
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line
  }, [searchQuery]);

  //----------- Handle search--------->
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  // -----------------handle Delete --------------->
  const handleDeleteConfirmation = (orderId) => {
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

  // <------------Handle Update Status (Payment/Order)--------------->
  const handleUpdateStatus = async (orderId, paymentStatus, orderStatus) => {
    console.log(orderId, paymentStatus, orderStatus);
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
      console.log("Error deleting order:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    }
  };
  // ----------------Pagination----------->
  const handlePageChange = (direction) => {
    if (direction === "next" && pagination.hasNextPage) {
      fetchOrders(currentPage + 1);
    } else if (direction === "prev" && pagination.hasPrevPage) {
      fetchOrders(currentPage - 1);
    }
  };

  // Get the current page data (already paginated from backend)
  const paginatedData = filterOrders;

  // -----------Delete All Order------------
  const handleDeleteConfirmationOrder = () => {
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
        deleteAllOrders();
        Swal.fire("Deleted!", "Orders has been deleted.", "success");
      }
    });
  };

  const deleteAllOrders = async () => {
    if (!rowSelection) {
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

  // Export Orders In CSV
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
      "color",
      "size",
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
      "Order Date",
    ];

    const rows = [];

    data.forEach((order) => {
      const fullName =
        `${order.user?.name || ""} ${order.user?.lastName || ""}`.trim() ||
        "N/A";

      const base = [
        `"${order.uid || ""}"`,
        `"${fullName}"`,
        `"${order.user?.email || "N/A"}"`,
        `"${order.user?.number || "N/A"}"`,
      ];

      const shippingAddress = order.shippingAddress
        ? `"${order.shippingAddress.address} "`
        : `"N/A"`;

      const country = order.shippingAddress?.country || "N/A";
      const city = order.shippingAddress?.city || "N/A";
      const state = order.shippingAddress?.state || "N/A";
      const postcode = order.shippingAddress?.postalCode || "N/A";

      const dateFormatted = order.createdAt
        ? `"${format(new Date(order.createdAt), "yyyy-MM-dd HH:mm:ss")}"`
        : `"N/A"`;

      // 🔹 CASE 1: Proper array of product objects
      if (Array.isArray(order.products) && order.products.length > 0) {
        order.products.forEach((p) => {
          rows.push(
            [
              ...base,
              `"${p.product?.name || "N/A"}" + ${
                p.colors?.join(",") || "N/A"
              } + ${p.sizes?.join(",") || "N/A"}`,
              `"${p.quantity || 0}"`,
              `"${p.price || 0}"`,
              `"${p.colors?.join(",") || "N/A"}"`,
              `"${p.sizes?.join(",") || "N/A"}"`,
              `"€${order.discount || "0"}"`,
              `"€${order.shippingFee || "0"}"`,
              `"€${order.totalAmount || "0"}"`,
              `"${order.paymentMethod || "N/A"}"`,
              `"${order.paymentStatus || "N/A"}"`,
              `"${order.orderStatus || "N/A"}"`,
              shippingAddress,
              `"${country}"`,
              `"${city}"`,
              `"${state}"`,
              `"${postcode}"`,
              `"${order.trackingId || "N/A"}"`,
              `"${order.shippingCarrier || "N/A"}"`,
              dateFormatted,
            ].join(",")
          );
        });
      }

      // 🔹 CASE 2: Combined product string like "A (Qty: 1, Price: $20); B (Qty: 1, Price: $25)"
      else if (
        typeof order.products === "string" &&
        order.products.includes(";")
      ) {
        const items = order.products
          .split(";")
          .map((p) => p.trim())
          .filter(Boolean);

        items.forEach((item) => {
          // Extract name, quantity, and price
          const match = item.match(
            /^(.*?) \(Qty:\s*(\d+), Price:\s*\$?([\d.]+)\)$/
          );
          const name = match ? match[1].trim() : item;
          const qty = match ? match[2] : "1";
          const price = match ? match[3] : "0";
          const color = "N/A";
          const size = "N/A";

          rows.push(
            [
              ...base,
              `"${name}"`,
              `"${qty}"`,
              `"${price}"`,
              `"${color}"`,
              `"${size}"`,
              `"€${order.discount || "0"}"`,
              `"€${order.shippingFee || "0"}"`,
              `"€${order.totalAmount || "0"}"`,
              `"${order.paymentMethod || "N/A"}"`,
              `"${order.paymentStatus || "N/A"}"`,
              `"${order.orderStatus || "N/A"}"`,
              shippingAddress,
              `"${country}"`,
              `"${city}"`,
              `"${state}"`,
              `"${postcode}"`,
              `"${order.trackingId || "N/A"}"`,
              `"${order.shippingCarrier || "N/A"}"`,
              dateFormatted,
            ].join(",")
          );
        });
      }

      // 🔹 CASE 3: No products at all
      else {
        rows.push(
          [
            ...base,
            `"No products"`,
            `"0"`,
            `"0"`,
            `"${"N/A"}"`,
            `"${"N/A"}"`,
            `"€${order.discount || "0"}"`,
            `"€${order.shippingFee || "0"}"`,
            `"€${order.totalAmount || "0"}"`,
            `"${order.paymentMethod || "N/A"}"`,
            `"${order.paymentStatus || "N/A"}"`,
            `"${order.orderStatus || "N/A"}"`,
            shippingAddress,
            `"${country}"`,
            `"${city}"`,
            `"${state}"`,
            `"${postcode}"`,
            `"${order.trackingId || "N/A"}"`,
            `"${order.shippingCarrier || "N/A"}"`,
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

  const columns = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "orderNumber",
        Cell: ({ row, table }) => {
          const totalRows = row.original.orderNumber;
          return totalRows;
        },
        size: 50,
      },
      {
        accessorKey: "products",
        minSize: 100,
        maxSize: 320,
        size: 240,
        grow: true,
        Header: ({ column }) => {
          return (
            <div className="flex flex-col w-full items-center justify-center gap-[2px]">
              <span className="ml-1 cursor-pointer">PRODUCTS</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const products = row.original?.products || [];
          const [isExpanded, setIsExpanded] = React.useState(false);

          const firstProduct = products[0];
          const remainingProducts = products.slice(1);

          const toggleExpanded = () => setIsExpanded(!isExpanded);

          return (
            <div
              onClick={() =>
                router.push(`/dashboard/orders/details/${row.original._id}`)
              }
              className="cursor-pointer text-[12px] text-black w-full h-full"
            >
              <div className="flex flex-col gap-2">
                {/* First Product */}
                {firstProduct && (
                  <div className="flex items-center gap-2">
                    <div className="min-w-[4rem] min-h-[4rem] relative rounded-md overflow-hidden flex items-center justify-center">
                      <Image
                        src={
                          firstProduct?.product?.thumbnails ||
                          "/default-thumbnail.jpg"
                        }
                        layout="fill"
                        alt={"Product Thumbnail"}
                        className="w-full h-full rounded-md"
                      />
                    </div>
                    <span className="text-[12px] h-[3rem] hover:text-sky-600 truncate">
                      {firstProduct?.product?.name || "Unnamed Product"}
                    </span>
                  </div>
                )}

                {/* Dropdown for Remaining Products */}
                {remainingProducts.length > 0 && (
                  <div>
                    <button
                      onClick={toggleExpanded}
                      className="text-blue-600 underline text-[12px] mt-1"
                    >
                      {isExpanded
                        ? "View Less"
                        : `View ${remainingProducts.length} More`}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 flex flex-col gap-2">
                        {remainingProducts.map((product, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-[3.3rem] h-[3rem] relative rounded-md overflow-hidden flex items-center justify-center">
                              <Image
                                src={
                                  product?.product?.thumbnails ||
                                  "/default-thumbnail.jpg"
                                }
                                layout="fill"
                                alt={"Product Thumbnail"}
                                className="w-[3.5rem] h-[3rem]"
                              />
                            </div>
                            <span className="text-[12px] truncate">
                              {product?.product?.name || "Unnamed Product"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const products = row.original.products || [];
          const productNames = products
            .map((product) => product?.product?.name?.toLowerCase() || "")
            .join(" ");
          return productNames.includes(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "quantity",
        minSize: 60,
        maxSize: 110,
        size: 70,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">QTY</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const quantity = row.original.products[0].quantity;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start pl-3 text-black w-full h-full">
              {quantity}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        minSize: 60,
        maxSize: 110,
        size: 100,
        grow: true,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">DATE</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const createdAt = row.original.createdAt;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              {format(new Date(createdAt), "MMM, dd, yyyy")}
            </div>
          );
        },
      },
      {
        accessorKey: "shippingFee",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">SHIPPING FEE</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const shippingFee = row.original.shippingFee;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              €{shippingFee}
            </div>
          );
        },
      },
      {
        accessorKey: "discount",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">DISCOUNT</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const discount = row.original.discount || 0;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              €{parseFloat(discount).toFixed(2)}
            </div>
          );
        },
      },
      {
        accessorKey: "totalAmount",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">TOTAL AMOUNT</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const price = row.original.totalAmount;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              €{price}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.includes(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "trackingId",
        minSize: 70,
        maxSize: 140,
        size: 120,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer uppercase truncate">
                TRACKING ID
              </span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const trackingId = row.original.trackingId;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              {trackingId}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.includes(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "shippingCarrier",
        minSize: 70,
        maxSize: 140,
        size: 120,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer uppercase truncate">
                SHIPPING CARRIER
              </span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const shippingCarrier = row.original.shippingCarrier;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              {shippingCarrier}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.includes(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "paymentMethod",
        minSize: 70,
        maxSize: 140,
        size: 120,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">PAYMENT METHOD</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const paymentMethod = row.original.paymentMethod;

          const getMethodStyles = (method) => {
            const methodStyles = {
              "Credit Card": " text-purple-600",
              PayPal: "text-sky-600",
              "Bank Transfer": "text-teal-600",
            };

            return (
              methodStyles[method] ||
              "border-gray-600 bg-gray-200 text-gray-900"
            );
          };

          return (
            <div className="flex items-center justify-start cursor-pointer text-[12px] text-black w-full h-full">
              <button
                className={`py-[.35rem] px-4 rounded-[2rem] cursor-pointer transition-all duration-300 hover:scale-[1.03] ${getMethodStyles(
                  paymentMethod
                )}`}
              >
                {paymentMethod}
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "orderStatus",
        minSize: 100,
        maxSize: 140,
        size: 130,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">ORDER STATUS</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const orderStatus = row.original.orderStatus || "Pending";
          const [orderStat, setOrderStat] = useState(orderStatus);
          const [showUpdate, setShowUpdate] = useState(false);
          const status = [
            "Pending",
            "Processing",
            "Packing",
            "Shipped",
            "Delivered",
            "Cancelled",
            "Returned",
          ];

          const getStatusStyles = (status) => {
            const statusStyles = {
              Pending:
                "border-orange-600 bg-orange-200 hover:bg-orange-300 text-orange-900",
              Processing:
                "border-blue-600 bg-blue-200 hover:bg-blue-300 text-blue-900",
              Packing:
                "border-purple-600 bg-purple-200 hover:bg-purple-300 text-purple-900",
              Shipped:
                "border-yellow-600 bg-yellow-200 hover:bg-yellow-300 text-yellow-900",
              Delivered:
                "border-green-600 bg-green-200 hover:bg-green-300 text-green-900",
              Cancelled:
                "border-pink-600 bg-pink-200 hover:bg-pink-300 text-pink-900",
              Returned:
                "border-red-600 bg-red-200 hover:bg-red-300 text-red-900",
            };

            return (
              statusStyles[status] ||
              "border-gray-600 bg-gray-200 text-gray-900"
            );
          };

          const updateStatus = (id, status) => {
            setOrderStat(status);
            handleUpdateStatus(id, "", status);
            setShowUpdate(false);
          };

          // Update local state when orderStatus changes
          React.useEffect(() => {
            setOrderStat(orderStatus);
          }, [orderStatus]);

          return (
            <div className="flex items-center justify-start cursor-pointer text-[12px] text-black w-full h-full">
              {!showUpdate ? (
                <button
                  className={`py-[.35rem] px-4 rounded-[2rem] border-2 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] ${getStatusStyles(
                    orderStatus
                  )}`}
                  onDoubleClick={() => setShowUpdate(true)}
                >
                  {orderStatus || "N/A"}
                </button>
              ) : (
                <select
                  value={orderStat || ""}
                  onChange={(e) =>
                    updateStatus(row.original._id, e.target.value)
                  }
                  onBlur={() => setShowUpdate(false)}
                  className="w-full h-[2.2rem] rounded-md border-2 border-gray-700 active:border-red-600 cursor-pointer p-1"
                >
                  <option value="">Select Status</option>
                  {status?.map((stat) => (
                    <option value={stat} key={stat}>
                      {stat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.includes(filterValue.toLowerCase());
        },
      },
      {
        accessorKey: "paymentStatus",
        minSize: 100,
        maxSize: 140,
        size: 130,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">PAYMENT STATUS</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const paymentStatus = row.original.paymentStatus || "Pending";
          const [paymentStat, setPaymentStat] = useState(paymentStatus);
          const [showUpdate, setShowUpdate] = useState(false);
          const status = ["Pending", "Completed", "Failed", "Refunded"];

          const updateStatus = (id, status) => {
            setPaymentStat(status);
            handleUpdateStatus(id, status, "");
            setShowUpdate(false);
          };

          const getStatusButton = (status) => {
            const statusStyles = {
              Pending:
                "border-orange-600 bg-orange-200 hover:bg-orange-300 text-orange-900",
              Completed:
                "border-green-600 bg-green-200 hover:bg-green-300 text-green-900",
              Failed: "border-red-600 bg-red-200 hover:bg-red-300 text-red-900",
              Refunded:
                "border-blue-600 bg-blue-200 hover:bg-blue-300 text-blue-900",
            };

            return (
              <button
                className={`py-[.35rem] px-4 rounded-[2rem] border-2 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03] ${
                  statusStyles[status] ||
                  "border-gray-600 bg-gray-200 text-gray-900"
                }`}
              >
                {status || "N/A"}
              </button>
            );
          };

          // Update local state when paymentStatus changes
          React.useEffect(() => {
            setPaymentStat(paymentStatus);
          }, [paymentStatus]);

          return (
            <div className="flex items-center justify-start cursor-pointer text-[12px] text-black w-full h-full">
              {!showUpdate ? (
                <div
                  onDoubleClick={() => setShowUpdate(true)}
                  className="w-full "
                >
                  {getStatusButton(paymentStatus)}
                </div>
              ) : (
                <select
                  value={paymentStat || ""}
                  onChange={(e) =>
                    updateStatus(row.original._id, e.target.value)
                  }
                  onBlur={() => setShowUpdate(false)}
                  className="w-full h-[2.2rem] rounded-md border-2 border-gray-700 active:border-red-600 cursor-pointer p-1"
                >
                  <option value="">Select Status</option>
                  {status?.map((stat) => (
                    <option value={stat} key={stat}>
                      {stat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        },
        filterFn: (row, columnId, filterValue) => {
          const cellValue =
            row.original[columnId]?.toString().toLowerCase() || "";

          return cellValue.includes(filterValue.toLowerCase());
        },
      },
      ...(auth?.user?.role === "admin" || auth?.user?.role === "superadmin"
        ? [
            {
              accessorKey: "Actions",
              minSize: 100,
              maxSize: 140,
              size: 140,
              grow: false,
              Header: ({ column }) => {
                return (
                  <div className=" flex flex-col gap-[2px]">
                    <span className="ml-1 cursor-pointer">ACTIONS</span>
                  </div>
                );
              },
              Cell: ({ cell, row }) => {
                return (
                  <div className="flex items-center gap-2 cursor-pointer text-[12px] text-black w-full h-full">
                    <span
                      onClick={() =>
                        router.push(
                          `/dashboard/orders/details/${row.original._id}`
                        )
                      }
                      className="p-1 bg-purple-200 hover:bg-purple-300 rounded-full transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                    >
                      <TiEye className="text-[16px] text-purple-500 hover:text-purple-600" />
                    </span>
                    {/* <span className="p-1 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                <MdModeEditOutline className="text-[16px] text-white" />
              </span> */}
                    {/* <span className="p-1 bg-sky-200 hover:bg-sky-300 rounded-full transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                <MdNotInterested className="text-[16px] text-sky-500 hover:text-sky-600" />
              </span> */}
                    <span
                      onClick={() => {
                        setOrderId(row.original._id);
                        handleDeleteConfirmation(row.original._id);
                      }}
                      className="p-1 bg-red-200 hover:bg-red-300   rounded-full transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                    >
                      {isLoad && orderId === row.original._id ? (
                        <ImSpinner4 className="text-[16px] text-white animate-spin" />
                      ) : (
                        <MdDelete className="text-[16px] text-red-500 hover:text-red-600" />
                      )}
                    </span>
                  </div>
                );
              },
            },
          ]
        : []),
    ],
    // eslint-disable-next-line
    [orderData, currentUrl, filterOrders, activeTab, paginatedData]
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
    enableRowNumbers: false,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    // enableEditing: true,

    enablePagination: false,
    initialState: {
      pagination: { pageSize: 20 },
      pageSize: 20,
      density: "compact",
    },

    muiTableHeadCellProps: {
      style: {
        fontWeight: "600",
        fontSize: "12px",
        backgroundColor: "#c6080a",
        color: "#fff",
        padding: ".7rem 0.3rem",
      },
    },
  });

  return (
    <MainLayout title="Orders - Darloo Admin">
      <div className="p-1 sm:p-2 h-[100%] w-full pb-4  scroll-smooth ">
        <div className="flex flex-col pb-2 ">
          <Breadcrumb path={currentUrl} />
          <div className="flex flex-col gap-5 mt-4">
            {/* Tabs */}
            <div className="w-full overflow-x-scroll scroll-smooth shidden px-4 py-2 rounded-lg bg-gradient-to-r from-white to-gray-50 shadow-sm border border-gray-100 flex items-center gap-2">
              <button
                className={`relative flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg cursor-pointer transition-all duration-300 ${
                  activeTab === "All"
                    ? "bg-red-600 text-white shadow-md shadow-red-200 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => handleTabClick("All")}
              >
                All
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === "All"
                      ? "bg-white text-red-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {counts.All || 0}
                </span>
              </button>
              <button
                className={`relative flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg cursor-pointer transition-all duration-300 ${
                  activeTab === "Pending"
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => handleTabClick("Pending")}
              >
                Pending
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === "Pending"
                      ? "bg-white text-orange-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {counts.Pending || 0}
                </span>
              </button>
              <button
                className={`relative flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg cursor-pointer transition-all duration-300 ${
                  activeTab === "Processing"
                    ? "bg-blue-500 text-white shadow-md shadow-blue-200 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => handleTabClick("Processing")}
              >
                Processing
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === "Processing"
                      ? "bg-white text-blue-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {counts.Processing || 0}
                </span>
              </button>
              <button
                className={`relative flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg cursor-pointer transition-all duration-300 ${
                  activeTab === "Shipped"
                    ? "bg-yellow-500 text-white shadow-md shadow-yellow-200 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => handleTabClick("Shipped")}
              >
                Shipped
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === "Shipped"
                      ? "bg-white text-yellow-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {counts.Shipped || 0}
                </span>
              </button>
              <button
                className={`relative flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg cursor-pointer transition-all duration-300 ${
                  activeTab === "Delivered"
                    ? "bg-green-500 text-white shadow-md shadow-green-200 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => handleTabClick("Delivered")}
              >
                Delivered
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === "Delivered"
                      ? "bg-white text-green-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {counts.Delivered || 0}
                </span>
              </button>
              <button
                className={`relative flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg cursor-pointer transition-all duration-300 ${
                  activeTab === "Cancelled"
                    ? "bg-pink-500 text-white shadow-md shadow-pink-200 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => handleTabClick("Cancelled")}
              >
                Cancelled
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === "Cancelled"
                      ? "bg-white text-pink-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {counts.Cancelled || 0}
                </span>
              </button>
              <button
                className={`relative flex items-center gap-2 py-2.5 px-4 text-[13px] font-semibold rounded-lg cursor-pointer transition-all duration-300 ${
                  activeTab === "Returned"
                    ? "bg-red-500 text-white shadow-md shadow-red-200 scale-105"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={() => handleTabClick("Returned")}
              >
                Returned
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    activeTab === "Returned"
                      ? "bg-white text-red-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {counts.Returned || 0}
                </span>
              </button>
            </div>
            {/* Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-sans font-semibold text-black">
                Latest Orders
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-[13px] px-3 py-2 rounded-lg border border-gray-300 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-200 bg-white"
                >
                  <option value="createdAt_desc">Newest First</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="totalAmount_desc">Amount: High to Low</option>
                  <option value="totalAmount_asc">Amount: Low to High</option>
                  <option value="orderNumber_desc">Order #: High to Low</option>
                  <option value="orderNumber_asc">Order #: Low to High</option>
                </select>
                {/* Payment Status Filter */}
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => {
                    setPaymentStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-[13px] px-3 py-2 rounded-lg border border-gray-300 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-200 bg-white"
                >
                  <option value="">All Payment Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
                {/* Payment Method Filter */}
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => {
                    setPaymentMethodFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-[13px] px-3 py-2 rounded-lg border border-gray-300 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-200 bg-white"
                >
                  <option value="">All Payment Methods</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 text-[14px] py-2 px-4 hover:border-2 hover:rounded-md hover:shadow-md hover:scale-[1.03] text-green-600 hover:text-green-800 border-b-2 border-green-600 transition-all duration-300"
                >
                  <HiDownload className="text-[16px]" />
                  Export Orders
                </button>
                {(auth?.user?.role === "admin" ||
                  auth?.user?.role === "superadmin") && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleDeleteConfirmationOrder()}
                      className="text-[14px] py-2 px-4 hover:border-2 hover:rounded-md hover:shadow-md hover:scale-[1.03] text-gray-600 hover:text-gray-800 border-b-2 border-gray-600 transition-all duration-300 "
                    >
                      Delete All
                    </button>
                    <button
                      onClick={() => setIsShow(true)}
                      className={`flex text-[14px] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800   py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] px-4`}
                    >
                      ADD NEW ORDER
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/*  */}

          <div className="relative overflow-hidden w-full h-[93%] py-4 sm:py-5 bg-white rounded-xl shadow-lg border border-gray-100 px-3 sm:px-5 mt-4 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="relative">
                <span className="absolute top-2 left-[.4rem] z-10">
                  <IoSearch className="text-[18px] text-gray-500" />
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search orders, customers, products..."
                  className="w-[17rem] h-[2.5rem] rounded-lg border-2 border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none px-4 pl-[2.5rem] text-[13px] transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </div>
              {/* Pagination */}
              <div className="flex items-center gap-3 justify-end sm:justify-normal w-full sm:w-fit">
                <span className="text-sm text-gray-600 font-medium">
                  Page {pagination.currentPage} of {pagination.totalPages} (
                  {pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <CiCircleChevLeft
                    onClick={() => handlePageChange("prev")}
                    className={`text-[27px] transition-all duration-200 ${
                      !pagination.hasPrevPage
                        ? "opacity-50 cursor-not-allowed text-gray-400"
                        : "text-green-500 hover:text-green-600 cursor-pointer hover:scale-110"
                    }`}
                  />
                  <CiCircleChevRight
                    onClick={() => handlePageChange("next")}
                    className={`text-[27px] transition-all duration-200 ${
                      !pagination.hasNextPage
                        ? "opacity-50 cursor-not-allowed text-gray-400"
                        : "text-green-500 hover:text-green-600 cursor-pointer hover:scale-110"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full scroll-smooth shidden h-[90%] overflow-y-auto mt-3 pb-4 ">
              {isLoading ? (
                <div className="flex items-center justify-center w-full h-screen px-4 py-4">
                  <Loader />
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
        </div>

        {/* --------------Modal--------------- */}
        {isShow && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <div className=" w-full sm:w-[80%]  rounded-md shadow-lg p-4 relative">
              <HandleOrderModal
                setIsShow={setIsShow}
                fetchOrders={fetchOrders}
              />
            </div>
          </div>
        )}
        {/* Export modal */}
        {showExportModal && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <div className="bg-white w-full sm:w-[500px] rounded-md shadow-lg p-6 relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Export Orders
                </h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <button
                    onClick={handleExportSelected}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <HiDownload className="text-blue-600 text-xl" />
                      <div>
                        <h3 className="font-medium text-gray-800">
                          Export Selected Orders
                        </h3>
                        <p className="text-sm text-gray-600">
                          Export {Object.keys(rowSelection).length} selected
                          orders to CSV
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <button
                    onClick={handleExportCurrentPage}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <HiDownload className="text-green-600 text-xl" />
                      <div>
                        <h3 className="font-medium text-gray-800">
                          Export Current Page
                        </h3>
                        <p className="text-sm text-gray-600">
                          Export {filterOrders.length} orders from current view
                          to CSV
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <button
                    onClick={handleExportAll}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <HiDownload className="text-red-600 text-xl" />
                      <div>
                        <h3 className="font-medium text-gray-800">
                          Export All Orders
                        </h3>
                        <p className="text-sm text-gray-600">
                          Export all {orderData.length} orders to CSV
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  CSV files will include order details, customer information,
                  products, and status information.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
