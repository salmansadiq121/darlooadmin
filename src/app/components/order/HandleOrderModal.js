"use client";
import { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import Select from "react-select";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { MdAdd } from "react-icons/md";

export default function HandleOrderModal({ setIsShow, fetchOrders }) {
  const [productsData, setProductsData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [orderDetail, setOrderDetail] = useState({
    user: "",
    products: [],
    shippingFee: 10,
    shippingAddress: {
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    paymentMethod: "Credit Card",
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(false);

  console.log("Products Data:", productsData);
  console.log("Order Detail:", orderDetail);

  // Fetch All Products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/all/admin/products`
      );
      setProductsData(data.products || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch products");
    }
  };

  // Fetch All Users
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/allUsers`
      );
      setUsersData(data.users || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  // User Options for Select
  const userOptions = usersData.map((user) => ({
    value: user._id,
    label: (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full relative overflow-hidden">
          <Image
            src={
              user?.avatar &&
              user?.avatar !== "N/A" &&
              user?.avatar.startsWith("http")
                ? user?.avatar
                : "/profile.png"
            }
            width={30}
            height={30}
            alt={user.name}
            className="rounded-full w-6 h-6 object-cover"
          />
        </div>
        <span className="font-medium">{user.name}</span>
      </div>
    ),
  }));

  // Product Options for Select
  const productOptions = productsData.map((product) => ({
    value: product._id,
    label: (
      <div className="flex items-center gap-3">
        <div className="w-12 h-9 rounded-md relative overflow-hidden flex-shrink-0">
          <Image
            src={
              product.thumbnails &&
              product.thumbnails !== "N/A" &&
              product.thumbnails.startsWith("http")
                ? product.thumbnails
                : "/placeholder.svg?height=40&width=50&query=product"
            }
            width={50}
            height={40}
            alt={product.name}
            className="rounded-md w-12 h-9 object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium line-clamp-1">{product.name}</div>
          <div className="text-xs text-gray-500">
            ${product.price.toFixed(2)}
          </div>
        </div>
      </div>
    ),
  }));

  const handleAddProduct = (selectedProducts) => {
    const updatedProducts = selectedProducts.map((product) => {
      const productData = productsData.find((p) => p._id === product.value);
      return {
        product: product.value,
        quantity: 1,
        price: productData?.price || 0,
        variationPrice: productData?.price || 0,
        selectedVariation: "",
        colors: "",
        sizes: "",
      };
    });
    setOrderDetail((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  const updateProductDetail = (index, field, value) => {
    const updatedProducts = [...orderDetail.products];
    updatedProducts[index][field] = value;

    // If variation is selected, update price to variation price
    if (field === "selectedVariation" && value) {
      const product = productsData.find(
        (p) => p._id === updatedProducts[index].product
      );
      const variation = product?.variations?.find((v) => v._id === value);
      if (variation) {
        updatedProducts[index].variationPrice = variation.price;
        updatedProducts[index].colors = variation.color;
        updatedProducts[index].sizes = variation.sizes;
      }
    }

    calculateTotal(updatedProducts);
    setOrderDetail((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  const calculateTotal = (products) => {
    const total = products
      .reduce(
        (sum, prod) =>
          sum + prod.quantity * (prod.variationPrice || prod.price),
        0
      )
      .toFixed(2);

    setOrderDetail((prev) => ({
      ...prev,
      totalAmount: Number.parseFloat(total),
    }));
  };

  // Update Shipping Address based on selected user
  const updateShippingAddress = (userId) => {
    const selectedUser = usersData.find((user) => user._id === userId);
    if (selectedUser) {
      setOrderDetail((prev) => ({
        ...prev,
        shippingAddress: {
          address: selectedUser.addressDetails?.address || "",
          city: selectedUser.addressDetails?.city || "",
          state: selectedUser.addressDetails?.state || "",
          postalCode: selectedUser.addressDetails?.pincode || "",
          country: selectedUser.addressDetails?.country || "",
        },
      }));
    }
  };

  const removeProduct = (index) => {
    const updatedProducts = orderDetail.products.filter((_, i) => i !== index);
    calculateTotal(updatedProducts);
    setOrderDetail((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  // Handle Submit Order
  const handleSubmitOrder = async () => {
    if (!orderDetail.user) {
      toast.error("Please select a user");
      return;
    }
    if (orderDetail.products.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/admin/create-order`,
        orderDetail
      );
      if (response.data) {
        fetchOrders();
        toast.success("Order created successfully!");
        setIsShow(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = orderDetail.totalAmount;
  const shipping = orderDetail.shippingFee;
  const total = subtotal + shipping;

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden min-h-[70vh] max-h-[99vh] flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 shadow-lg">
        <div>
          <h3 className="text-xl font-bold text-white">Create Manual Order</h3>
          <p className="text-red-100 text-sm mt-1">
            Add products and customer details
          </p>
        </div>
        <button
          onClick={() => setIsShow(false)}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200"
        >
          <CgClose className="text-xl" />
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Selection */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select Customer <span className="text-red-500">*</span>
              </label>
              <Select
                options={userOptions}
                onChange={(selectedUser) => {
                  setOrderDetail((prev) => ({
                    ...prev,
                    user: selectedUser?.value || "",
                  }));
                  updateShippingAddress(selectedUser?.value);
                }}
                placeholder="Search and select customer..."
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#e2e8f0",
                    boxShadow: "none",
                    "&:hover": { borderColor: "#cbd5e1" },
                  }),
                }}
              />
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Add Products <span className="text-red-500">*</span>
              </label>
              <Select
                options={productOptions}
                isMulti
                onChange={handleAddProduct}
                placeholder="Search and select products..."
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#e2e8f0",
                    boxShadow: "none",
                    "&:hover": { borderColor: "#cbd5e1" },
                  }),
                }}
              />
            </div>

            {/* Products Details */}
            {orderDetail.products.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-700">
                  Order Items
                </h4>
                {orderDetail.products.map((product, index) => {
                  const productData = productsData.find(
                    (p) => p._id === product.product
                  );
                  const variations = productData?.variations || [];
                  const sizes = productData?.sizes || [];

                  return (
                    <div
                      key={`${product.product}-${index}`}
                      className="bg-white rounded-lg p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-16 h-16 rounded-lg relative overflow-hidden flex-shrink-0 bg-slate-100">
                            <Image
                              src={
                                productData?.thumbnails &&
                                productData?.thumbnails !== "N/A" &&
                                productData?.thumbnails.startsWith("http")
                                  ? productData?.thumbnails
                                  : "/placeholder.svg?height=64&width=64&query=product"
                              }
                              width={64}
                              height={64}
                              alt={productData?.name || "Product"}
                              className="w-16 h-16 object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-slate-900 line-clamp-2">
                              {productData?.name}
                            </h5>
                            <p className="text-sm text-slate-500 mt-1">
                              Base Price: ${productData?.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeProduct(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>

                      {/* Variations Selection */}
                      {variations.length > 0 && (
                        <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <label className="block text-sm font-medium text-slate-700 mb-3">
                            Select Variation
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {variations.slice(0, 6).map((variation) => (
                              <button
                                key={variation._id}
                                onClick={() =>
                                  updateProductDetail(
                                    index,
                                    "selectedVariation",
                                    variation._id
                                  )
                                }
                                className={`p-3 rounded-lg border-2 transition-all text-left ${
                                  product.selectedVariation === variation._id
                                    ? "border-red-600 bg-red-100"
                                    : "border-slate-200 bg-white hover:border-red-300"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                                    style={{
                                      backgroundColor: variation?.color,
                                      borderColor: variation?.color,
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-700 truncate">
                                      {variation?.title}
                                    </p>
                                    <p className="text-sm font-bold text-red-600">
                                      $
                                      {variation?.price?.toFixed(2) ??
                                        productData?.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* sizes */}
                      {sizes?.length > 0 && (
                        <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <label className="block text-sm font-medium text-slate-700 mb-3">
                            Select Size
                          </label>
                          <div className="flex items-center gap-4 flex-wrap ">
                            {sizes?.map((size, i) => (
                              <button
                                key={size + i}
                                onClick={() =>
                                  updateProductDetail(index, "sizes", size)
                                }
                                className={`p-3 rounded-lg border-2 transition-all text-left ${
                                  product.sizes === size
                                    ? "border-red-600 bg-red-100"
                                    : "border-slate-200 bg-white hover:border-red-300"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full border-2 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-700 truncate">
                                      {size}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quantity */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-slate-700 min-w-fit">
                          Quantity:
                        </label>
                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateProductDetail(
                                index,
                                "quantity",
                                Math.max(product.quantity - 1, 1)
                              )
                            }
                            className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={product.quantity}
                            readOnly
                            className="w-12 text-center bg-white border border-slate-300 rounded py-1 font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateProductDetail(
                                index,
                                "quantity",
                                product.quantity + 1
                              )
                            }
                            className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-xs text-slate-500">Item Total</p>
                          <p className="text-lg font-bold text-red-600">
                            $
                            {(
                              product.quantity *
                              (product.variationPrice || product.price)
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Shipping Address */}
            {orderDetail.user && (
              <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">
                  Shipping Address
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-600">Address:</span>{" "}
                    {orderDetail.shippingAddress.address || "N/A"}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-600">City:</span>{" "}
                    {orderDetail.shippingAddress.city || "N/A"}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-600">State:</span>{" "}
                    {orderDetail.shippingAddress.state || "N/A"}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-600">
                      Postal Code:
                    </span>{" "}
                    {orderDetail.shippingAddress.postalCode || "N/A"}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-600">Country:</span>{" "}
                    {orderDetail.shippingAddress.country || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 sticky top-6">
              <h4 className="text-lg font-bold text-slate-900 mb-6">
                Order Summary
              </h4>

              {/* Items List */}
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200 max-h-64 overflow-y-auto">
                {orderDetail.products.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No items added yet
                  </p>
                ) : (
                  orderDetail.products.map((product, index) => {
                    const productData = productsData.find(
                      (p) => p._id === product.product
                    );
                    return (
                      <div
                        key={`summary-${product.product}-${index}`}
                        className="flex items-start justify-between text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 line-clamp-1">
                            {productData?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.quantity}x $
                            {(product.variationPrice || product.price).toFixed(
                              2
                            )}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900 ml-2">
                          $
                          {(
                            product.quantity *
                            (product.variationPrice || product.price)
                          ).toFixed(2)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-semibold text-slate-900">
                    ${shipping.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-xl font-bold text-red-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsShow(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={
                    loading ||
                    orderDetail.products.length === 0 ||
                    !orderDetail.user
                  }
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <MdAdd className="text-lg" />
                      Create Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
