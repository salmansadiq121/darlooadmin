"use client";
import { orders } from "@/app/components/DummyData/DummyData";
import MainLayout from "@/app/components/layout/MainLayout";
import Breadcrumb from "@/app/utils/Breadcrumb";
import Loader from "@/app/utils/Loader";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete, MdModeEditOutline, MdNotInterested } from "react-icons/md";
import { format } from "date-fns";
import { TiEye } from "react-icons/ti";
import { useRouter } from "next/navigation";

export default function Orders() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [orderData, setOrderData] = useState([...orders]);
  const [filterOrders, setFilterOrders] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [shippedorder, setShippedorder] = useState(0);
  const [completedOrder, setCompletedOrder] = useState(0);
  const [pendingOrder, setPendingOrder] = useState(0);
  const [cancelledOrder, setCancelledOrder] = useState(0);
  const [refundOrder, setRefundOrder] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();

  // Current URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathArray = window.location.pathname;
      setCurrentUrl(pathArray);
    }
    // exlint-disable-next-line
  }, []);

  useEffect(() => {
    setFilterOrders(orderData);
  }, [orderData]);

  // Get Product Length(Enable & Disable)
  useEffect(() => {
    const shippedCount = orderData.filter(
      (order) => order.status === "Shipped"
    ).length;
    const completedCount = orderData.filter(
      (order) => order.status === "Completed"
    ).length;
    const pendingCount = orderData.filter(
      (order) => order.status === "Pending"
    ).length;
    const cancelledCount = orderData.filter(
      (order) => order.status === "Cancelled"
    ).length;
    const refundCount = orderData.filter(
      (order) => order.status === "Refund"
    ).length;

    setShippedorder(shippedCount);
    setCompletedOrder(completedCount);
    setPendingOrder(pendingCount);
    setCancelledOrder(cancelledCount);
    setRefundOrder(refundCount);
  }, [orderData]);

  //----------- Handle search--------->
  const handleSearch = (value) => {
    setSearchQuery(value);
    filterData(value, activeTab);
  };

  // -------------Handle filtering by tabs and search---------------
  const filterData = (search = searchQuery, statusFilter = activeTab) => {
    let filtered = orderData;

    if (statusFilter === "All" && !search) {
      setFilterOrders(orderData);
      return;
    }

    if (statusFilter === "Completed") {
      filtered = filtered.filter((order) => order.status === "Completed");
    } else if (statusFilter === "Shipped") {
      filtered = filtered.filter((order) => order.status === "Shipped");
    } else if (statusFilter === "Pending") {
      filtered = filtered.filter((order) => order.status === "Pending");
    } else if (statusFilter === "Cancelled") {
      filtered = filtered.filter((order) => order.status === "Cancelled");
    } else if (statusFilter === "Refund") {
      filtered = filtered.filter((order) => order.status === "Refund");
    }

    if (search) {
      const lowercasedSearch = search.toLowerCase();
      filtered = filtered.filter((order) => {
        const {
          name = "",
          price = "",
          estimatedPrice = "",
          quantity = "",
          profit = 0,
          status = "",
        } = order;

        return (
          name.toLowerCase().includes(lowercasedSearch) ||
          status.toLowerCase().includes(lowercasedSearch) ||
          price.toString().toLowerCase().includes(lowercasedSearch) ||
          estimatedPrice.toString().toLowerCase().includes(lowercasedSearch) ||
          quantity.toString().toLowerCase().includes(lowercasedSearch) ||
          profit.toString().toLowerCase().includes(lowercasedSearch)
        );
      });
    }

    setFilterOrders(filtered);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    filterData(searchQuery, tab);
  };

  // ----------------Pegination----------->
  const totalPages = Math.ceil(filterOrders.length / itemsPerPage);

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Get the current page data
  const paginatedData = filterOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        minSize: 100,
        maxSize: 320,
        size: 240,
        grow: true,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col w-full items-center justify-center gap-[2px]">
              <span className="ml-1 cursor-pointer">PRODUCT</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const name = row.original.name;
          const avatar = row.original.thumbnails;

          return (
            <div className="cursor-pointer text-[12px] text-black w-full h-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-[3.3rem] h-[2.1rem] relative rounded-md overflow-hidden flex items-center justify-center">
                    <Image
                      src={avatar}
                      layout="fill"
                      alt={"Avatar"}
                      className="w-[3.5rem] h-[2.3rem] "
                    />
                  </div>
                  <span className="text-[12px]">{name}</span>
                </div>
              </div>
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
          const quantity = row.original.quantity;

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
        accessorKey: "price",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">REVENUE</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const price = row.original.price;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              ${price}
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
        accessorKey: "profit",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">PROFIT</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const profit = row.original.profit;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              ${profit}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        minSize: 100,
        maxSize: 140,
        size: 130,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">STATUS</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const status = row.original.status;

          return (
            <div className="flex items-center justify-start cursor-pointer text-[12px] text-black w-full h-full">
              {status === "Completed" ? (
                <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-green-600 bg-green-200 hover:bg-green-300 text-green-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                  Completed
                </button>
              ) : status === "Shipped" ? (
                <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-yellow-600 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                  Shipped
                </button>
              ) : status === "Pending" ? (
                <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-orange-600 bg-orange-200 hover:bg-orange-300 text-orange-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                  Pending
                </button>
              ) : status === "Cancelled" ? (
                <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-pink-600 bg-pink-200 hover:bg-pink-300 text-pink-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                  Cancelled
                </button>
              ) : (
                <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-red-600 bg-red-200 hover:bg-red-300 text-red-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                  Refund
                </button>
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
            <div className="flex items-center justify-center gap-2 cursor-pointer text-[12px] text-black w-full h-full">
              <span
                onClick={() => router.push("/dashboard/orders/details")}
                className="p-1 bg-purple-200 hover:bg-purple-300 rounded-full transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              >
                <TiEye className="text-[16px] text-purple-500 hover:text-purple-600" />
              </span>
              <span className="p-1 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                <MdModeEditOutline className="text-[16px] text-white" />
              </span>
              <span className="p-1 bg-sky-200 hover:bg-sky-300 rounded-full transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                <MdNotInterested className="text-[16px] text-sky-500 hover:text-sky-600" />
              </span>
              <span className="p-1 bg-red-200 hover:bg-red-300   rounded-full transition-all duration-300 hover:scale-[1.03] cursor-pointer">
                <MdDelete className="text-[16px] text-red-500 hover:text-red-600" />
              </span>
            </div>
          );
        },
      },
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
    enableRowNumbers: true,
    enableColumnResizing: true,
    enableTopToolbar: true,
    enableBottomToolbar: false,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    // enableEditing: true,
    state: { isLoading: isLoading },

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
    <MainLayout>
      <div className="p-1 sm:p-2 h-[100%] w-full pb-4  scroll-smooth ">
        <div className="flex flex-col pb-2 ">
          <Breadcrumb path={currentUrl} />
          <div className="flex flex-col gap-5 mt-4">
            {/* Tabs */}
            <div className="w-full overflow-x-scroll scroll-smooth shidden px-4 rounded-md bg-white flex items-center gap-4">
              <button
                className={`border-b-[3px] flex items-center gap-1 py-3 text-[14px] px-2 font-medium cursor-pointer ${
                  activeTab === "All"
                    ? " border-red-600 text-red-600"
                    : "text-gray-700 hover:text-gray-800 border-white"
                }`}
                onClick={() => handleTabClick("All")}
              >
                All <span>({orderData.length})</span>
              </button>
              <button
                className={`border-b-[3px] flex items-center gap-1 py-3 text-[14px] px-2 font-medium cursor-pointer ${
                  activeTab === "Completed"
                    ? "border-b-[3px] border-red-600 text-red-600"
                    : "text-gray-700 hover:text-gray-800 border-white"
                }`}
                onClick={() => handleTabClick("Completed")}
              >
                Completed <span>({completedOrder})</span>
              </button>

              <button
                className={` border-b-[3px] flex items-center gap-1 py-3 text-[14px] px-2 font-medium cursor-pointer ${
                  activeTab === "Shipped"
                    ? "border-b-[3px] border-red-600 text-red-600"
                    : "text-gray-700 hover:text-gray-800 border-white"
                }`}
                onClick={() => handleTabClick("Shipped")}
              >
                Shipped <span>({shippedorder})</span>
              </button>
              <button
                className={` border-b-[3px] flex items-center gap-1 py-3 text-[14px] px-2 font-medium cursor-pointer ${
                  activeTab === "Pending"
                    ? "border-b-[3px] border-red-600 text-red-600"
                    : "text-gray-700 hover:text-gray-800 border-white"
                }`}
                onClick={() => handleTabClick("Pending")}
              >
                Pending <span>({pendingOrder})</span>
              </button>
              <button
                className={` border-b-[3px] flex items-center gap-1 py-3 text-[14px] px-2 font-medium cursor-pointer ${
                  activeTab === "Cancelled"
                    ? "border-b-[3px] border-red-600 text-red-600"
                    : "text-gray-700 hover:text-gray-800 border-white"
                }`}
                onClick={() => handleTabClick("Cancelled")}
              >
                Cancelled <span>({cancelledOrder})</span>
              </button>
              <button
                className={` border-b-[3px] flex items-center gap-1 py-3 text-[14px] px-2 font-medium cursor-pointer ${
                  activeTab === "Refund"
                    ? "border-b-[3px] border-red-600 text-red-600"
                    : "text-gray-700 hover:text-gray-800 border-white"
                }`}
                onClick={() => handleTabClick("Refund")}
              >
                Refund <span>({refundOrder})</span>
              </button>
            </div>
            {/* Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-sans font-semibold text-black">
                Latest Orders
              </h1>
              <div className="flex items-center gap-4">
                <button className="text-[14px] py-2 px-4 hover:border-2 hover:rounded-md hover:shadow-md hover:scale-[1.03] text-gray-600 hover:text-gray-800 border-b-2 border-gray-600 transition-all duration-300 ">
                  Delete All
                </button>
                <button
                  className={`flex text-[14px] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800   py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] px-4`}
                >
                  ADD NEW ORDER
                </button>
              </div>
            </div>
          </div>
          {/*  */}

          <div className=" relative overflow-hidden w-full h-[93%] py-3 sm:py-4 bg-white rounded-md shadow  px-2 sm:px-4 mt-4  ">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="relative">
                <span className="absolute top-2 left-[.4rem] z-10">
                  <IoSearch className="text-[18px] text-gray-500" />
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search"
                  className="w-[17rem] h-[2.2rem] rounded-md border border-gray-400 focus:border-red-600 outline-none px-2 pl-[1.8rem] text-[12px]"
                />
              </div>
              {/* Pegination */}
              <div className="flex items-center gap-3 justify-end sm:justify-normal w-full sm:w-fit">
                <span>
                  {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <CiCircleChevLeft
                    onClick={() => handlePageChange("prev")}
                    className={`text-[27px] text-green-500 hover:text-green-600 ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  />
                  <CiCircleChevRight
                    onClick={() => handlePageChange("next")}
                    className={`text-[27px] text-green-500 hover:text-green-600 ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
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
      </div>
    </MainLayout>
  );
}
