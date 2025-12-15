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
import { FaCheckDouble } from "react-icons/fa6";
import Ratings from "@/app/utils/Rating";
import axios from "axios";
import { ImSpinner4 } from "react-icons/im";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import CheckoutTest from "@/app/components/Products/CheckoutTest";
import PaypalCheckout from "@/app/components/Checkout/PaypalCheckout";
import { FcImport } from "react-icons/fc";
import { TbLoader } from "react-icons/tb";
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
const ProductModal = dynamic(
  () => import("./../../../components/Products/ProductModal"),
  {
    ssr: false,
  }
);

const carts = {
  user: "6751997892669289c3e2f4ad",
  products: [
    {
      product: "677788a8f14cad4ebe669947",
      quantity: 2,
      price: 1300,
      colors: ["#000000", "#FFFFFF"],
      sizes: ["M", "L"],
    },
    {
      product: "67780226425c66b0a52f9127",
      quantity: 1,
      price: 5999,
      colors: ["#FFFFFF", "#0000FF"],
      sizes: ["XL", "L"],
    },
  ],
  totalAmount: "12278",
  shippingFee: "500",
  shippingAddress: {
    address: "123 Street, ABC Avenue",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA",
  },
  paymentMethod: "Credit Card",
};

export default function Products() {
  const { auth } = useAuth();
  const [currentUrl, setCurrentUrl] = useState("");
  const [productData, setProductData] = useState([]);
  const [filterProducts, setFilterProducts] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [activeTab, setActiveTab] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [enableProduct, setEnableProduct] = useState(0);
  const [disableProduct, setDisableProduct] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  const [showaddProduct, setShowaddProduct] = useState(false);
  const [productId, setProductId] = useState("");
  const closeModal = useRef(null);
  const isInitialRender = useRef(true);
  const [isLoad, setIsLoad] = useState(false);
  const [fLoading, setFLoading] = useState(false);

  // <--------------Payment------------>
  const [payment, setpayment] = useState(false);

  console.log("productData:", productData);

  // <---------Fetch Products with backend pagination & filters--------->
  const fetchProducts = async (
    page = 1,
    tab = activeTab,
    search = searchQuery
  ) => {
    setIsloading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      if (tab === "Enabled") params.append("status", "true");
      else if (tab === "Disabled") params.append("status", "false");

      if (search) params.append("search", search);

      const { data } = await axios.get(
        `${
          process.env.NEXT_PUBLIC_SERVER_URI
        }/api/v1/products/all/admin/products?${params.toString()}`,
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data?.success) {
        setProductData(data.products || []);
        setFilterProducts(data.products || []);
        setEnableProduct(data.stats?.enabled || 0);
        setDisableProduct(data.stats?.disabled || 0);
        setCurrentPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch products list"
      );
    } finally {
      setIsloading(false);
    }
  };

  useEffect(() => {
    if (!auth?.token) return;
    fetchProducts(currentPage, activeTab, searchQuery);
    // eslint-disable-next-line
  }, [auth?.token, currentPage, activeTab, searchQuery]);

  // ------Current Page URL-----
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathArray = window.location.pathname;
      setCurrentUrl(pathArray);
    }
    // exlint-disable-next-line
  }, []);

  useEffect(() => {
    setFilterProducts(productData);
  }, [productData]);

  //----------- Handle search with debounce --------->
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const handleSearch = (value) => {
    setSearchInput(value);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Get the current page data
  const paginatedData = filterProducts;

  // -----------------handle Delete --------------->

  const handleDeleteConfirmation = (productId) => {
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
        handleDelete(productId);
        Swal.fire("Deleted!", "Product has been deleted.", "success");
      }
    });
  };
  const handleDelete = async (productId) => {
    setIsLoad(true);
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/delete/product/${productId}`
      );
      if (data) {
        setFilterProducts((prev) =>
          prev.filter((product) => product._id !== productId)
        );
        toast.success("Product deleted successfully!");
      }
    } catch (error) {
      console.log("Error deleting product:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoad(false);
    }
  };

  // -------------Handle Update Status----------->

  const handleStatusConfirmation = (productId, status) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this user!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${status === true ? "enabled" : "disabled"} it!`,
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatus(productId, status);
        Swal.fire("Update!", "Product status has been updated.", "success");
      }
    });
  };
  const handleStatus = async (productId, status) => {
    setIsLoad(true);
    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/update/status/${productId}`,
        { status },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );
      if (data) {
        fetchProducts(currentPage, activeTab, searchQuery);
        toast.success("Product status updated!");
      }
    } catch (error) {
      console.log("Error update product status:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoad(false);
    }
  };

  // -----------Delete All Products------------
  const handleDeleteConfirmationProducts = () => {
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
        deleteAllProducts();
        Swal.fire("Deleted!", "Products has been deleted.", "success");
      }
    });
  };

  const deleteAllProducts = async () => {
    if (!rowSelection) {
      return toast.error("Please select at least one product to delete.");
    }

    const productIdsArray = Object.keys(rowSelection);

    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/delete/multiple`,
        { productIds: productIdsArray },
        {
          headers: {
            Authorization: auth?.token,
          },
        }
      );

      if (data) {
        fetchProducts(currentPage, activeTab, searchQuery);
        toast.success("All selected products deleted successfully.");
        setRowSelection({});
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete products. Please try again later.");
    }
  };

  const colorNames = {
    "#FFFFFF": "White",
    "#000000": "Black",
    "#808080": "Gray",
    "#C0C0C0": "Silver",
    "#FF0000": "Red",
    "#0000FF": "Blue",
    "#FFFF00": "Yellow",
    "#FFA500": "Orange",
    "#800080": "Purple",
    "#008000": "Green",
    "#FFB6C1": "Light Pink",
    "#ADD8E6": "Light Blue",
    "#FFFFE0": "Light Yellow",
    "#E6E6FA": "Lavender",
    "#FFD700": "Gold",
    "#CD7F32": "Bronze",
    "#F5F5DC": "Beige",
    "#D2B48C": "Tan",
    "#8B4513": "Brown",
    "#FFF8DC": "Cornsilk",
    "#50C878": "Emerald",
    "#8A2BE2": "Amethyst",
    "#FF6347": "Ruby",
    "#FF69B4": "Hot Pink",
    "#00FFFF": "Cyan",
    "#7FFF00": "Chartreuse",
    "#2F4F4F": "Dark Slate Gray",
    "#556B2F": "Dark Olive Green",
    "#8B0000": "Dark Red",
    "#191970": "Midnight Blue",
    "#FF4500": "Coral",
    "#B0E0E6": "Powder Blue",
    "#FFE4C4": "Bisque",
    "#FAEBD7": "Antique White",
  };

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
          const thumbnail = row?.original?.thumbnails;

          let avatar = "";

          if (Array.isArray(thumbnail)) {
            avatar = thumbnail[0];
          } else if (typeof thumbnail === "string") {
            avatar = thumbnail;
          }

          // Ensure the avatar is a valid URL
          const isValidUrl = (url) => {
            try {
              return url?.startsWith("/") || new URL(url);
            } catch {
              return false;
            }
          };

          avatar = isValidUrl(avatar) ? avatar : "/placeholder.png";

          return (
            <div className="cursor-pointer text-[12px] text-black w-full h-full">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <div className="min-w-[3.4rem] min-h-[2.4rem] relative rounded-md overflow-hidden flex items-center justify-center">
                    <Image
                      src={avatar}
                      alt="Thumbnail"
                      width={70}
                      height={40}
                      className="w-[3.3rem] min-h-[2.4rem] rounded-md"
                    />
                  </div>
                  <span className="text-[12px] capitalize truncate block ">
                    {name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-[12px]">
                    Ratings:
                  </span>
                  <span>
                    <Ratings rating={rating} />
                  </span>
                  <span className="text-[12px]">
                    {rating ? rating.toFixed(1) : 0}
                  </span>
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
          const category = row?.original?.category?.name || "";

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
        accessorKey: "seller.storeName",
        minSize: 120,
        maxSize: 220,
        size: 150,
        grow: false,
        Header: () => {
          return (
            <div className="flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">SELLER / STORE</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const seller = row?.original?.seller;
          const isMarketplaceOwned = !seller;

          if (isMarketplaceOwned) {
            return (
              <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  Marketplace
                </span>
              </div>
            );
          }

          return (
            <div className="cursor-pointer text-[12px] flex flex-col justify-start text-black w-full h-full">
              <span className="font-medium text-gray-900 truncate">
                {seller?.storeName || "Unknown Store"}
              </span>
              {seller?.storeSlug && (
                <span className="text-[11px] text-gray-500 truncate">
                  @{seller.storeSlug}
                </span>
              )}
            </div>
          );
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
              €{estimatedPrice}
            </div>
          );
        },
      },
      {
        accessorKey: "isPC",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">Website</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const pc = row.original.isPC;

          return (
            <div
              className={`  cursor-pointer text-[12px] flex items-center  px-3 rounded-md h-[2rem] justify-center ${
                pc ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }  w-full`}
            >
              {pc ? "Display" : "Hidden"}
            </div>
          );
        },
      },
      {
        accessorKey: "isMobile",
        minSize: 70,
        maxSize: 140,
        size: 100,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">Mobile</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const mobile = row.original.isMobile;

          return (
            <div
              className={`  cursor-pointer text-[12px] flex items-center justify-center   px-3 rounded-md h-[2rem] ${
                mobile
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }  w-full`}
            >
              {mobile ? "Display" : "Hidden"}
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
          const orders = row.original.purchased;

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              {orders ? orders : 0}
            </div>
          );
        },
      },
      // Sizes
      {
        accessorKey: "sizes",
        minSize: 70,
        maxSize: 140,
        size: 90,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">SIZES</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const sizes = Array.isArray(row.original.sizes)
            ? row.original.sizes
            : [];
          const size = sizes[0] || "";

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              <select
                defaultValue={size}
                className="w-full h-[2rem] rounded-md outline-none border border-gray-700 cursor-pointer p-1"
              >
                <option value="">Sizes</option>
                {sizes.map((size, i) => (
                  <option value={size} key={i}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          );
        },
      },
      // Colors
      {
        accessorKey: "colors",
        minSize: 70,
        maxSize: 140,
        size: 90,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">COLORS</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const colors = Array.isArray(row?.original?.colors)
            ? row.original.colors
            : [];
          const color = colors[0] || {};

          return (
            <div className="cursor-pointer text-[12px] flex items-center justify-start text-black w-full h-full">
              <select
                defaultValue={color?.name || ""}
                className="w-full h-[2rem] rounded-md outline-none border border-gray-700 cursor-pointer p-1"
              >
                <option value="">Colors</option>
                {colors.length > 0 ? (
                  colors.map((color, i) => (
                    <option
                      value={color?.name}
                      key={i}
                      className="flex items-center gap-1"
                    >
                      <div
                        style={{ backgroundColor: color?.code || "#ccc" }}
                        className="w-3 h-3 rounded-full inline-block mr-1"
                      ></div>
                      {color?.name || "Unknown"}
                    </option>
                  ))
                ) : (
                  <option value="">No colors</option>
                )}
              </select>
            </div>
          );
        },
      },
      // Trending
      {
        accessorKey: "tranding",
        minSize: 70,
        maxSize: 140,
        size: 130,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">🔥 TRENDING</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const trending = row?.original?.trending || false;

          return (
            <div
              className={`cursor-pointer text-[12px] flex items-center justify-center  px-4 py-2 rounded-[2rem] ${
                trending
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {trending ? "Trending Now" : "Not Trending"}
            </div>
          );
        },
      },
      // Sale
      {
        accessorKey: "sale.isActive",
        minSize: 70,
        maxSize: 140,
        size: 130,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer"> 🛍️ SALE</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          const sale = row?.original?.sale?.isActive || false;

          return (
            <div
              className={`cursor-pointer text-[12px] flex items-center justify-center  px-4 py-2 rounded-[2rem] ${
                sale
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {sale ? "On Sale" : "No Sale"}
            </div>
          );
        },
      },
      //
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
                <button
                  onClick={() =>
                    handleStatusConfirmation(row.original._id, false)
                  }
                  className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-green-600 bg-green-200 hover:bg-green-300 text-green-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]"
                >
                  Enabled
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleStatusConfirmation(row.original._id, true)
                  }
                  className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-red-600 bg-red-200 hover:bg-red-300 text-red-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]"
                >
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
        accessorKey: "Checkout",
        minSize: 100,
        maxSize: 140,
        size: 120,
        grow: false,
        Header: ({ column }) => {
          return (
            <div className=" flex flex-col gap-[2px]">
              <span className="ml-1 cursor-pointer">Checkout</span>
            </div>
          );
        },
        Cell: ({ cell, row }) => {
          return (
            <div className="flex items-center justify-start cursor-pointer text-[12px] text-black w-full h-full">
              <button
                onClick={() => setpayment(true)}
                className=" py-[.35rem] px-4 rounded-[2rem] border-2 border-green-600 bg-green-200 hover:bg-green-300 text-green-900 hover:shadow-md cursor-pointer transition-all duration-300 hover:scale-[1.03]"
              >
                Checkout
              </button>
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
          const status = row.original.status;
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
              <span
                onClick={() =>
                  handleStatusConfirmation(row.original._id, !status)
                }
                className={`p-1  ${
                  status
                    ? "bg-sky-200 hover:bg-sky-300"
                    : "bg-green-200 hover:bg-green-300"
                }  rounded-full transition-all duration-300 hover:scale-[1.03] cursor-pointer`}
              >
                {status ? (
                  <MdNotInterested className="text-[16px] text-sky-500 hover:text-sky-600" />
                ) : (
                  <FaCheckDouble className="text-[16px] text-green-700 hover:text-green-800" />
                )}
              </span>
              <span
                onClick={() => {
                  handleDeleteConfirmation(row.original._id);
                  setProductId(row.original._id);
                }}
                className="p-1 bg-red-200 hover:bg-red-300   rounded-full transition-all duration-300 hover:scale-[1.03]"
              >
                {isLoad && productId === row.original._id ? (
                  <ImSpinner4 className="text-[16px] text-white animate-spin" />
                ) : (
                  <MdDelete className="text-[16px] text-red-500 hover:text-red-600" />
                )}
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
    // state: { isLoading: isLoading },

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
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (closeModal.current && !closeModal.current.contains(event.target)) {
  //       setProductId("");
  //       setShowaddProduct(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  // Import Data
  const importProductData = async (file) => {
    setFLoading(true);
    if (!file) {
      toast.error("File is required!");
      setFLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (data) {
        fetchProducts();
        toast.success("Product data imported successfully");
      }
    } catch (error) {
      console.error("Error importing data:", error);
      toast.error(
        error?.response?.data?.message || "Failed to import product data"
      );
    } finally {
      setFLoading(false);
    }
  };
  return (
    <MainLayout
      title="Products - Manage  products"
      description="View and update your account , address & banner information, track orders, and manage account settings from your user profile page."
      keywords="add setting, banner setting, order history, update profile, track orders, e-commerce user page, account settings, user dashboard"
    >
      <div className="p-1 sm:p-2 h-[100%] w-full pb-4  scroll-smooth">
        <div className="flex flex-col pb-2 ">
          <Breadcrumb path={currentUrl} />
          <div className="flex flex-col gap-5 mt-4">
            {/* Tabs */}
            <div className="w-full px-4 rounded-xl bg-white flex items-center gap-4 shadow-sm border border-gray-100">
              <button
                className={`relative py-3 text-[14px] px-3 font-medium cursor-pointer transition-all duration-200 ${
                  activeTab === "All"
                    ? "text-[#c6080a]"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => handleTabClick("All")}
              >
                All ({enableProduct + disableProduct})
                {activeTab === "All" && (
                  <span className="absolute inset-x-0 -bottom-[2px] h-[3px] rounded-full bg-gradient-to-r from-[#c6080a] to-[#e63946]" />
                )}
              </button>
              <button
                className={`relative py-3 text-[14px] px-3 font-medium cursor-pointer transition-all duration-200 ${
                  activeTab === "Enabled"
                    ? "text-[#22c55e]"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => handleTabClick("Enabled")}
              >
                Enabled ({enableProduct})
                {activeTab === "Enabled" && (
                  <span className="absolute inset-x-0 -bottom-[2px] h-[3px] rounded-full bg-gradient-to-r from-emerald-400 to-green-600" />
                )}
              </button>
              <button
                className={`relative py-3 text-[14px] px-3 font-medium cursor-pointer transition-all duration-200 ${
                  activeTab === "Disabled"
                    ? "text-[#ef4444]"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => handleTabClick("Disabled")}
              >
                Disabled ({disableProduct})
                {activeTab === "Disabled" && (
                  <span className="absolute inset-x-0 -bottom-[2px] h-[3px] rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
                )}
              </button>
            </div>
            {/* Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-sans font-semibold text-black">
                Products
              </h1>
              <div className="flex items-center gap-4">
                {Object.keys(rowSelection).length > 0 && (
                  <button
                    onClick={() => handleDeleteConfirmationProducts()}
                    className="text-[14px] py-2 px-4 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:shadow-md hover:scale-[1.03] transition-all duration-300 flex items-center gap-2"
                  >
                    <MdDelete className="text-[16px]" />
                    Delete Selected ({Object.keys(rowSelection).length})
                  </button>
                )}

                <form>
                  <input
                    type="file"
                    name="file"
                    onChange={(e) => importProductData(e.target.files[0])}
                    accept=".csv, .xlsx"
                    id="importProducts"
                    className="hidden"
                  />
                  <label
                    htmlFor="importProducts"
                    disabled={fLoading}
                    className={`flex text-[14px] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800  py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] px-4`}
                    title={"Import csv or excel file!"}
                    onClick={(e) => fLoading && e.preventDefault()}
                  >
                    {fLoading ? (
                      <TbLoader className="h-6 w-6 animate-spin text-white" />
                    ) : (
                      "Import"
                    )}
                  </label>
                </form>

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
                <div className="w-full min-h-[20vh] space-y-3">
                  {[...Array(8)].map((_, idx) => (
                    <div
                      key={idx}
                      className="animate-pulse rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-4"
                    >
                      <div className="h-10 w-10 rounded-md bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded bg-gray-200" />
                        <div className="h-3 w-1/4 rounded bg-gray-100" />
                      </div>
                      <div className="hidden sm:flex gap-2 ml-auto">
                        <div className="h-3 w-12 rounded-full bg-gray-200" />
                        <div className="h-3 w-16 rounded-full bg-gray-200" />
                        <div className="h-3 w-10 rounded-full bg-gray-200" />
                      </div>
                    </div>
                  ))}
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
              fetchProducts={fetchProducts}
            />
          </div>
        )}
        {/* -----------------Handle Checkout----------- */}
        {payment && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <CheckoutTest setpayment={setpayment} carts={carts} />
            {/* paypal */}
            {/* <PaypalCheckout setpayment={setpayment} /> */}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
