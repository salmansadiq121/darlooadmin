"use client";
import MainLayout from "@/app/components/layout/MainLayout";
import Breadcrumb from "@/app/utils/Breadcrumb";
import Loader from "@/app/utils/Loader";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CiCircleChevLeft, CiCircleChevRight } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete, MdModeEditOutline, MdNotInterested } from "react-icons/md";
import { products } from "@/app/components/DummyData/DummyData";
import Ratings from "@/app/utils/Rating";
import ProductModal from "@/app/components/Products/ProductModal";

export default function Products() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [productData, setProductData] = useState([...products]);
  const [filterProducts, setFilterProducts] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [enableProduct, setEnableProduct] = useState(0);
  const [disableProduct, setDisableProduct] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showaddProduct, setShowaddProduct] = useState(false);
  const [productId, setProductId] = useState("");
  const closeModal = useRef(null);

  // ------Current Page URL-----
  useEffect(() => {
    const pathArray = window.location.pathname;
    setCurrentUrl(pathArray);

    // exlint-disable-next-line
  }, []);

  useEffect(() => {
    setFilterProducts(productData);
  }, [productData]);

  // Get Product Length(Enable & Disable)
  useEffect(() => {
    const enableCount = productData.filter((product) => product.status).length;
    const disableCount = productData.filter(
      (product) => !product.status
    ).length;

    setEnableProduct(enableCount);
    setDisableProduct(disableCount);
  }, [productData]);

  //----------- Handle search--------->
  const handleSearch = (value) => {
    setSearchQuery(value);
    filterData(value, activeTab);
  };

  // -------------Handle filtering by tabs and search---------------
  const filterData = (search = searchQuery, statusFilter = activeTab) => {
    let filtered = productData;

    if (statusFilter === "All" && !search) {
      setFilterProducts(productData);
      return;
    }

    if (statusFilter === "Enabled") {
      filtered = filtered.filter((product) => product.status === true);
    } else if (statusFilter === "Disabled") {
      filtered = filtered.filter((product) => product.status === false);
    }

    if (search) {
      const lowercasedSearch = search.toLowerCase();
      filtered = filtered.filter((product) => {
        const {
          name = "",
          price = "",
          estimatedPrice = "",
          quantity = "",
          category = {
            name: "",
          },
          ratings = 0,
        } = product;

        return (
          name.toLowerCase().includes(lowercasedSearch) ||
          (category?.name?.toLowerCase() || "").includes(lowercasedSearch) ||
          price.toString().toLowerCase().includes(lowercasedSearch) ||
          estimatedPrice.toString().toLowerCase().includes(lowercasedSearch) ||
          quantity.toString().toLowerCase().includes(lowercasedSearch) ||
          ratings.toString().includes(lowercasedSearch)
        );
      });
    }

    setFilterProducts(filtered);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    filterData(searchQuery, tab);
  };

  // ----------------Pegination----------->
  const totalPages = Math.ceil(filterProducts.length / itemsPerPage);

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Get the current page data
  const paginatedData = filterProducts.slice(
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
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">PRODUCT</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const name = row.original.name;
          const rating = row.original.ratings;
          const avatar = row.original.thumbnails[0].url;

          return (
            <div className="cursor-pointer text-[12px] text-black w-full h-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-[3.4rem] h-[2.4rem] relative rounded-md overflow-hidden flex items-center justify-center">
                    <Image
                      src={avatar}
                      layout="fill"
                      alt={"Avatar"}
                      className="w-full h-full"
                    />
                  </div>
                  <span className="text-[12px]">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-[12px]">
                    Ratings:
                  </span>
                  <span>
                    <Ratings rating={rating} />
                  </span>
                  <span className="text-[12px]">{rating}</span>
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
        accessorKey: "category.name",
        minSize: 100,
        maxSize: 180,
        size: 120,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">CATEGORY</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const category = row.original.category.name;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              {category}
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
        accessorKey: "QTY",
        minSize: 100,
        maxSize: 180,
        size: 110,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">QTY AVAILABLE</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const quantity = row.original.quantity;
          const purchased = row.original.purchased;

          const qtyAvailable = quantity - purchased;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-center text-black w-full h-full">
              {qtyAvailable}
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
        accessorKey: "price",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">PRICE</span>
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
        accessorKey: "estimatedPrice",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">EST PRICE</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const estimatedPrice = row.original.estimatedPrice;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              ${estimatedPrice}
            </div>
          );
        },
      },
      {
        accessorKey: "orders",
        minSize: 70,
        maxSize: 140,
        size: 90,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">ORDERS</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const orders = row.original.orders;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              {orders}
            </div>
          );
        },
      },

      {
        accessorKey: "status",
        minSize: 100,
        maxSize: 140,
        size: 120,
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
              {status === true ? (
                <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-green-600 bg-green-200 hover:bg-green-300 text-green-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                  Enabled
                </button>
              ) : (
                <button className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-red-600 bg-red-200 hover:bg-red-300 text-red-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]">
                  Disabled
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
        size: 130,
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
                onClick={() => {
                  setProductId(row.original._id);
                  setShowaddProduct(true);
                }}
                className="p-1 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-all duration-300 hover:scale-[1.03]"
              >
                <MdModeEditOutline className="text-[16px] text-white" />
              </span>
              <span className="p-1 bg-sky-200 hover:bg-sky-300 rounded-full transition-all duration-300 hover:scale-[1.03]">
                <MdNotInterested className="text-[16px] text-sky-500 hover:text-sky-600" />
              </span>
              <span className="p-1 bg-red-200 hover:bg-red-300   rounded-full transition-all duration-300 hover:scale-[1.03]">
                <MdDelete className="text-[16px] text-red-500 hover:text-red-600" />
              </span>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line
    [productData, currentUrl, filterProducts, activeTab, paginatedData]
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

  // Close Modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (closeModal.current && !closeModal.current.contains(event.target)) {
        setProductId("");
        setShowaddProduct(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <MainLayout>
      <div className="p-1 sm:p-2 h-[100%] w-full pb-4  scroll-smooth">
        <div className="flex flex-col pb-2 ">
          <Breadcrumb path={currentUrl} />
          <div className="flex flex-col gap-5 mt-4">
            {/* Tabs */}
            <div className="w-full px-4 rounded-md bg-white flex items-center gap-4">
              <button
                className={`border-b-[3px] py-3 text-[14px] px-2 font-medium cursor-pointer ${
                  activeTab === "All"
                    ? " border-red-600 text-red-600"
                    : "text-gray-700 hover:text-gray-800 border-white"
                }`}
                onClick={() => handleTabClick("All")}
              >
                All ({productData.length})
              </button>
              <button
                className={`border-b-[3px] py-3 text-[14px] px-2 font-medium cursor-pointer ${
                  activeTab === "Enabled"
                    ? "border-b-[3px] border-red-600 text-red-600"
                    : "text-gray-700 hover:text-gray-800 border-white"
                }`}
                onClick={() => handleTabClick("Enabled")}
              >
                Enabled ({enableProduct})
              </button>
              <button
                className={` border-b-[3px] py-3 text-[14px] px-2 font-medium cursor-pointer ${
                  activeTab === "Disabled"
                    ? "border-b-[3px] border-red-600 text-red-600"
                    : "text-gray-700 hover:text-gray-800 border-white"
                }`}
                onClick={() => handleTabClick("Disabled")}
              >
                Disabled ({disableProduct})
              </button>
            </div>
            {/* Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-sans font-semibold text-black">
                Products
              </h1>
              <div className="flex items-center gap-4">
                <button className="text-[14px] py-2 px-4 hover:border-2 hover:rounded-md hover:shadow-md hover:scale-[1.03] text-gray-600 hover:text-gray-800 border-b-2 border-gray-600 transition-all duration-300 ">
                  Delete All
                </button>
                <button
                  onClick={() => setShowaddProduct(true)}
                  className={`flex text-[14px] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800  py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] px-4`}
                >
                  ADD NEW Product
                </button>
              </div>
            </div>
          </div>
          {/*  */}

          <div className="w-full h-[93%]  relative overflow-hidden overflow-x-auto  py-3 sm:py-4 bg-white rounded-md shadow  px-2 sm:px-4 mt-4  ">
            {/* ------Search & Pegination--------- */}
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
            {/* -----------Table Data------------- */}
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
        {/* -------------Handle Product Modal------------ */}
        {showaddProduct && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <ProductModal
              closeModal={closeModal}
              setShowaddProduct={setShowaddProduct}
              productId={productId}
              setProductId={setProductId}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
