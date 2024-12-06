"use client";
import { Style } from "@/app/utils/CommonStyle";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoCameraOutline } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { categories } from "../DummyData/DummyData";
import toast from "react-hot-toast";
import axios from "axios";
import { colorOptions, sizeOptions } from "@/app/utils/CommonFunctions";
import { FaSpinner } from "react-icons/fa";

export default function ProductModal({
  closeModal,
  setShowaddProduct,
  productId,
  setProductId,
  fetchProducts,
}) {
  const [categoryData, setCategoryData] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [thumbnails, setThumbnails] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [trending, setTrending] = useState(false);
  const [sale, setSale] = useState({
    isActive: false,
    discountPercentage: 0,
    saleExpiry: null,
  });
  const [deletedImages, setDeletedImages] = useState([]);
  const [isloading, setIsloading] = useState(false);

  // Get Product Detail
  const getProductInfo = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/product/detail/${productId}`
      );
      if (data) {
        const product = data.product;
        setName(product.name || "");
        setDescription(product.description || "");
        setCategory(product.category || []);
        setCategory({
          value: product.category._id,
          label: (
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full relative overflow-hidden flex items-center justify-center">
                <Image
                  src={product.category.image}
                  layout="fill"
                  alt={product.category.name}
                  className="w-full h-full"
                />
              </div>
              {product.category.name}
            </div>
          ),
        });
        setPrice(product.price || "");
        setEstimatedPrice(product.estimatedPrice || "");
        setThumbnails(product.thumbnails || []);
        setQuantity(product.quantity || "");
        setColors(
          product.colors?.map((color) => {
            const matchedColor = colorOptions.find((c) => c.value === color);
            return matchedColor
              ? matchedColor
              : {
                  value: color,
                  label: (
                    <div className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      ></div>
                      {color}
                    </div>
                  ),
                };
          }) || []
        );

        // Map size values to options
        setSizes(
          product.sizes?.map((size) => {
            const matchedSize = sizeOptions.find((s) => s.value === size);
            return matchedSize
              ? { value: matchedSize.value, label: matchedSize.label }
              : { value: size, label: size };
          }) || []
        );
        setTrending(product.trending || false);
        setSale({
          isActive: product.sale?.isActive || false,
          discountPercentage: product.sale?.discountPercentage || 0,
          saleExpiry: product.sale?.saleExpiry
            ? new Date(product.sale.saleExpiry)
            : null,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProductInfo();
    // eslint-disable-next-line
  }, [productId]);

  // Get Categories
  const getCategories = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/categories/all/categories`
      );
      if (data) {
        setCategoryData(data.categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategories();
    // eslint-disable-next-line
  }, []);

  // Handle Media Upload
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setThumbnails((prevMedia) => [...prevMedia, ...files]);
  };

  // Handle Media Removal
  const removeMedia = (indexToRemove) => {
    setThumbnails((prevMedia) => {
      const removedItem = prevMedia[indexToRemove];
      if (typeof removedItem === "string") {
        setDeletedImages((prevDeleted) => [...prevDeleted, removedItem]);
      }
      return prevMedia.filter((_, index) => index !== indexToRemove);
    });
  };

  // Handle Sale Activation
  const toggleSale = () => {
    setSale((prevSale) => ({
      ...prevSale,
      isActive: !prevSale.isActive,
      discountPercentage: 0,
      saleExpiry: null,
    }));
  };

  //Category Options
  const categoryOptions =
    categoryData &&
    categoryData?.map((cat) => ({
      value: cat._id,
      label: (
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 rounded-full relative  overflow-hidden flex items-center justify-center">
            <Image
              src={cat.image}
              layout="fill"
              alt={cat.name}
              className="w-full h-full"
            />
          </div>
          {cat.name}
        </div>
      ),
    }));

  //   -----------Handle Submit--------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !category) {
      toast.error("Please fill out all required fields.");
      return;
    }
    setIsloading(true);
    const productData = new FormData();
    productData.append("name", name);
    productData.append("description", description);
    productData.append("category", category.value);
    productData.append("price", price);
    productData.append("estimatedPrice", estimatedPrice);
    thumbnails.forEach((file) => productData.append("file", file));
    productData.append("quantity", quantity);
    const colorIds = colors.map((color) => color.value);
    const sizeIds = sizes.map((size) => size.value);
    productData.append("colors", colorIds);
    productData.append("sizes", sizeIds);
    productData.append("trending", trending);
    productData.append("sale", JSON.stringify(sale));
    productData.append("deletedImages", JSON.stringify(deletedImages));

    try {
      if (productId) {
        const { data } = await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/update/product/${productId}`,
          productData
        );

        if (data) {
          toast.success(data?.message || "Product info updated successfully");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/create/product`,
          productData
        );
        if (data) {
          toast.success(data?.message || "Product added successfully");
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      fetchProducts();
      setShowaddProduct(false);
      setIsloading(false);
      setProductId("");
      setDeletedImages([]);
    }
  };
  return (
    <div
      ref={closeModal}
      className="w-[42rem] bg-white rounded-md overflow-hidden shadow min-h-[15rem] max-h-[99%] flex flex-col"
    >
      <div className="flex items-center justify-between bg-customRed px-4 py-2 sm:py-4 ">
        <h3 className="text-lg font-medium text-white">
          {productId ? "Edit Product" : "Add New Product"}
        </h3>
        <span
          onClick={() => {
            setProductId("");
            setShowaddProduct(false);
          }}
          className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white "
        >
          <CgClose className="text-[18px]" />
        </span>
      </div>
      <div className="w-full h-[98%] overflow-y-auto ">
        <form
          onSubmit={handleSubmit}
          className=" flex flex-col gap-4 px-4 py-2 mt-4 h-full w-full "
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            {/* Left */}
            <div className="flex flex-col gap-4">
              {/* --------------Add Media -------------------*/}
              <div className="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center rounded-md">
                <label className="cursor-pointer flex flex-col items-center">
                  <span>
                    <IoCameraOutline className="text-[35px] text-red-700 hover:text-red-700" />
                  </span>
                  <span className="text-red-700 px-4 py-[.3rem] text-[13px] font-normal rounded-sm text-sm border-2 border-red-700  hover:bg-red-700 hover:text-white transition-all duration-300 hover:shadow-md">
                    Add Media
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleMediaUpload}
                  />
                </label>
              </div>
              {thumbnails && (
                <div className="flex mt-4 gap-2 flex-wrap">
                  {thumbnails?.map((file, index) => (
                    <div
                      key={index}
                      className="relative w-[3.9rem] h-[3.2rem] bg-gray-200 flex items-center justify-center rounded-md "
                    >
                      <div className="w-[3.5rem] h-[2.8rem] relative rounded-md overflow-hidden flex items-center justify-center">
                        <Image
                          src={
                            file instanceof File
                              ? URL.createObjectURL(file)
                              : file
                          }
                          layout="fill"
                          alt={"Thumnail"}
                          className="w-full h-full"
                        />
                      </div>

                      <span
                        onClick={() => removeMedia(index)}
                        className="absolute top-[-.4rem] right-[-.4rem] z-10 bg-red-600 text-white text-xs rounded-full cursor-pointer"
                      >
                        <IoIosClose className="text-[20px]" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {/* --------Name---------- */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700">
                  Product Name<span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${Style.input} w-full`}
                  placeholder="Enter product name"
                  required
                />
              </div>
              {/* -----Category---- */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700">
                  Category<span className="text-red-700">*</span>
                </label>
                <Select
                  options={categoryOptions}
                  value={category}
                  onChange={setCategory}
                  placeholder="Select category"
                  required
                />
              </div>
              {/* Price */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700">
                  Price<span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`${Style.input} w-full`}
                  placeholder="Enter price"
                  required
                />
              </div>
              {/* Estimate Price */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700">
                  Estimate Price <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  className={`${Style.input} w-full`}
                  placeholder="Enter estimate price"
                />
              </div>

              {/*  */}
            </div>
            {/* Right */}
            <div className="flex flex-col gap-4">
              {/* Description */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700">
                  Description<span className="text-red-700">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${Style.input} w-full h-[5rem]`}
                  placeholder="Enter product description "
                  required
                ></textarea>
              </div>
              {/* Colors */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700">
                  Colors
                </label>
                <Select
                  options={colorOptions}
                  value={colors}
                  onChange={setColors}
                  isMulti
                  placeholder="Select colors"
                />
              </div>
              {/* Sizes */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700">
                  Sizes
                </label>
                <Select
                  options={sizeOptions}
                  value={sizes}
                  onChange={setSizes}
                  isMulti
                  placeholder="Select sizes"
                />
              </div>
              {/* Quantity  */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity <span className="text-red-700">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`${Style.input} w-full`}
                  placeholder="Enter quantity"
                  required
                />
              </div>
              {/* Trending */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trending
                </label>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trending}
                      onChange={(e) => setTrending(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-700 peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 dark:bg-gray-100 peer-checked:after:translate-x-8 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {trending ? "Enabled" : "Disabled"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Sale */}
              <div className="">
                <label className="block text-sm font-medium text-gray-700">
                  Sale
                </label>
                <div>
                  <input
                    type="checkbox"
                    checked={sale.isActive}
                    onChange={(e) =>
                      setSale({ ...sale, isActive: e.target.checked })
                    }
                    className="accent-red-600"
                  />
                  <span className="ml-2">Activate Sale</span>
                </div>
                {sale.isActive && (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Discount Percentage
                      </label>
                      <input
                        type="number"
                        value={sale.discountPercentage}
                        onChange={(e) =>
                          setSale({
                            ...sale,
                            discountPercentage: parseInt(e.target.value),
                          })
                        }
                        className={`${Style.input} w-full`}
                        placeholder="Enter discount percentage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sale Expiry
                      </label>
                      <input
                        type="date"
                        value={
                          new Date(sale.saleExpiry).toISOString().split("T")[0]
                        }
                        onChange={(e) =>
                          setSale({ ...sale, saleExpiry: e.target.value })
                        }
                        className={`${Style.input} w-full`}
                        placeholderText="Select expiry date"
                      />
                    </div>
                  </div>
                )}
              </div>
              {/*  */}
            </div>
            {/*  */}
          </div>
          <div className="flex items-center justify-end w-full pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setProductId("");
                  setShowaddProduct(false);
                }}
                className="w-[6rem] py-[.3rem] text-[14px] rounded-sm border-2 border-customRed text-red-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.03] transition-all duration-300 "
              >
                CANCEL
              </button>
              <button className="w-[6rem] py-[.4rem] text-[14px] flex items-center justify-center rounded-sm bg-customRed hover:bg-red-700 hover:shadow-md hover:scale-[1.03] transition-all duration-300 text-white">
                {isloading ? (
                  <span>
                    <FaSpinner className="h-5 w-5 text-white animate-spin" />
                  </span>
                ) : (
                  <span>{productId ? "Save" : "SUBMIT"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
