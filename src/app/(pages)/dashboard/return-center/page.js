"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PackageIcon,
  UserIcon,
  CalendarIcon,
  ImageIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  RefreshCwIcon,
  Euro,
} from "lucide-react";
import MainLayout from "@/app/components/layout/MainLayout";
import Swal from "sweetalert2";

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <Card key={i} className="border-l-4 border-l-red-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-[80px]" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function ReturnCenter() {
  const [returnProducts, setReturnProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalReturn, setTotalReturn] = useState(0);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [updating, setUpdating] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const [updateData, setUpdateData] = useState({
    return_status: "",
    return_label: "",
    return_instructions: "",
    reject_reason: "",
  });

  const returnStatus = [
    "return requested",
    "Inprocess",
    "approved",
    "rejected",
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "return requested":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inprocess":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "return requested":
        return <ClockIcon className="h-4 w-4" />;
      case "inprocess":
        return <RefreshCwIcon className="h-4 w-4" />;
      case "approved":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "rejected":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  // Fetch Return Products
  useEffect(() => {
    const fetchReturnHistory = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/return/products?page=${page}&limit=${limit}`
        );
        setReturnProducts(data.returnProducts || []);
        setTotalReturn(data.total || 0);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch return products"
        );
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReturnHistory();
  }, [page, limit]);

  // Update Return Product
  const updateReturn = async (orderId) => {
    if (!updateData.return_status) {
      toast.error("Please select a status");
      return;
    }

    // Validation for required fields
    if (
      updateData.return_status === "approved" &&
      (!updateData.return_label || !updateData.return_instructions)
    ) {
      toast.error("Return label and instructions are required for approval");
      return;
    }

    if (updateData.return_status === "rejected" && !updateData.reject_reason) {
      toast.error("Reject reason is required for rejection");
      return;
    }

    setUpdating(orderId);
    try {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/return/update/${orderId}`,
        updateData
      );

      if (data.success) {
        toast.success("Return status updated successfully");
        // Refresh the data
        const updatedProducts = returnProducts.map((product) =>
          product._id === orderId ? { ...product, ...updateData } : product
        );
        setReturnProducts(updatedProducts);
        setIsUpdateDialogOpen(false);
        setUpdateData({
          return_status: "",
          return_label: "",
          return_instructions: "",
          reject_reason: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Internal server error");
    } finally {
      setUpdating(null);
    }
  };

  //   Handle Delete
  const handleDeleteConfirmation = (returnItemId) => {
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
        handleDelete(returnItemId);
        Swal.fire("Deleted!", "Return request has been deleted.", "success");
      }
    });
  };
  const handleDelete = async (returnItemId) => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/return/delete/${returnItemId}`
      );
      if (data) {
        setReturnProducts((prev) =>
          prev.filter((returnItem) => returnItem._id !== returnItemId)
        );
        toast.success("Return request deleted successfully!");
      }
    } catch (error) {
      console.log("Error deleting return request:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    }
  };

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const openUpdateDialog = (returnItem) => {
    setSelectedReturn(returnItem);
    setUpdateData({
      return_status: returnItem.return_status,
      return_label: returnItem.return_label,
      return_instructions: returnItem.return_instructions,
      reject_reason: returnItem.reject_reason,
    });
    setIsUpdateDialogOpen(true);
  };

  const totalPages = Math.ceil(totalReturn / limit);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <PackageIcon className="h-8 w-8 text-white" />
                  </div>
                  Return Center
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage product returns and process refund requests
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  Total Returns:{" "}
                  <span className="font-semibold text-red-600">
                    {totalReturn}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {returnStatus.map((status) => {
              const count = returnProducts.filter(
                (item) => item.return_status === status
              ).length;
              return (
                <Card key={status} className="border-l-4 border-l-red-600">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 capitalize">
                          {status}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {count}
                        </p>
                      </div>
                      <div
                        className={`p-2 rounded-full ${getStatusColor(status)}`}
                      >
                        {getStatusIcon(status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Return Products List */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-red-600 text-white">
              <CardTitle className="text-xl">Return Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6">
                  <LoadingSkeleton />
                </div>
              ) : returnProducts.length === 0 ? (
                <div className="p-12 text-center">
                  <PackageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No return requests
                  </h3>
                  <p className="text-gray-500">
                    There are no return requests to display at the moment.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {returnProducts.map((returnItem) => (
                    <div
                      key={returnItem._id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      {/* Main Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* User Avatar */}
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={
                                returnItem?.user?.avatar || "/placeholder.svg"
                              }
                              alt={returnItem?.user?.name}
                            />
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {returnItem?.user?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 w-full line-clamp-2">
                                {returnItem?.product?.name}
                              </h3>
                              <Badge
                                className={`${getStatusColor(
                                  returnItem?.return_status
                                )} flex items-center gap-1`}
                              >
                                {getStatusIcon(returnItem.return_status)}
                                {returnItem?.return_status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <UserIcon className="h-4 w-4" />
                                {returnItem?.user?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {new Date(
                                  returnItem?.createdAt
                                ).toLocaleDateString()}
                              </span>
                              <span className="font-medium text-red-600 flex items-center gap-1">
                                <Euro />
                                {returnItem?.product?.price} ×{" "}
                                {returnItem?.quantity}
                              </span>
                            </div>
                            <Button
                              onClick={() => openUpdateDialog(returnItem)}
                              className="bg-sky-600 hover:bg-blue-700 text-white mt-3"
                              disabled={updating === returnItem._id}
                            >
                              {updating === returnItem._id
                                ? "Updating..."
                                : "Update Status"}
                            </Button>
                            <Button
                              onClick={() =>
                                handleDeleteConfirmation(returnItem._id)
                              }
                              className="bg-red-600 hover:bg-red-700 ml-3 text-white mt-3"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(returnItem._id)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            {expandedItems.has(returnItem._id) ? (
                              <ChevronUpIcon className="h-5 w-5" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedItems.has(returnItem._id) && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  Return Details
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Order ID:
                                    </span>
                                    <span className="font-mono text-sm">
                                      {returnItem?.order?._id}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Reason:
                                    </span>
                                    <span className="font-medium">
                                      {returnItem?.reason}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Quantity:
                                    </span>
                                    <span className="font-medium">
                                      {returnItem?.quantity}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Order Total:
                                    </span>
                                    <span className="font-medium text-red-600">
                                      ${returnItem?.order?.totalAmount}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {returnItem?.comment && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Customer Comment
                                  </h4>
                                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                                    {returnItem?.comment}
                                  </p>
                                </div>
                              )}

                              {/* Status-specific information */}
                              {returnItem?.return_label && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Return Label
                                  </h4>
                                  <p className="text-gray-700 bg-green-50 p-4 rounded-lg border border-green-200">
                                    {returnItem?.return_label}
                                  </p>
                                </div>
                              )}

                              {returnItem.return_instructions && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Return Instructions
                                  </h4>
                                  <p className="text-gray-700 bg-green-50 p-4 rounded-lg border border-green-200">
                                    {returnItem?.return_instructions}
                                  </p>
                                </div>
                              )}

                              {returnItem?.reject_reason && (
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Rejection Reason
                                  </h4>
                                  <p className="text-gray-700 bg-red-50 p-4 rounded-lg border border-red-200">
                                    {returnItem?.reject_reason}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                              {/* Product Image */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  Product
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <img
                                    src={
                                      returnItem.product?.thumbnails ||
                                      "/placeholder.svg"
                                    }
                                    alt={returnItem?.product?.name}
                                    className="w-full h-48 object-cover rounded-lg mb-3"
                                  />
                                  <p className="font-medium text-gray-900">
                                    {returnItem?.product?.name}
                                  </p>
                                  <p className="text-red-600 font-semibold">
                                    ${returnItem?.product?.price}
                                  </p>
                                </div>
                              </div>

                              {/* Return Images */}
                              {returnItem?.images &&
                                returnItem?.images?.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                      <ImageIcon className="h-4 w-4" />
                                      Return Images (
                                      {returnItem?.images?.length})
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {returnItem?.images?.map(
                                        (image, index) => (
                                          <img
                                            key={index}
                                            src={image || "/placeholder.svg"}
                                            alt={`Return image ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                          />
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Customer Info */}
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  Customer Information
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={
                                          returnItem.user.avatar ||
                                          "/placeholder.svg"
                                        }
                                        alt={returnItem?.user?.name}
                                      />
                                      <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                                        {returnItem?.user?.name?.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {returnItem?.user?.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {returnItem?.user?.email}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, totalReturn)} of {totalReturn} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(
                      1,
                      Math.min(totalPages, page - 2 + i)
                    );
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        className={
                          page === pageNum ? "bg-red-600 hover:bg-red-700" : ""
                        }
                        onClick={() => setPage(pageNum)}
                        disabled={loading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Update Status Dialog */}
          <Dialog
            open={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-red-600">
                  Update Return Status
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Return Status *</Label>
                  <Select
                    value={updateData.return_status}
                    onValueChange={(value) =>
                      setUpdateData({ ...updateData, return_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {returnStatus.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span className="capitalize">{status}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {updateData.return_status === "approved" && (
                  <>
                    <div>
                      <Label htmlFor="return_label">Return Label *</Label>
                      <Input
                        id="return_label"
                        value={updateData.return_label}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            return_label: e.target.value,
                          })
                        }
                        placeholder="Enter return label/tracking number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="return_instructions">
                        Return Instructions *
                      </Label>
                      <Textarea
                        id="return_instructions"
                        value={updateData.return_instructions}
                        onChange={(e) =>
                          setUpdateData({
                            ...updateData,
                            return_instructions: e.target.value,
                          })
                        }
                        placeholder="Enter detailed return instructions"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {updateData.return_status === "rejected" && (
                  <div>
                    <Label htmlFor="reject_reason">Rejection Reason *</Label>
                    <Textarea
                      id="reject_reason"
                      value={updateData.reject_reason}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          reject_reason: e.target.value,
                        })
                      }
                      placeholder="Enter reason for rejection"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsUpdateDialogOpen(false)}
                    disabled={updating !== null}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      selectedReturn && updateReturn(selectedReturn._id)
                    }
                    disabled={updating !== null}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {updating ? "Updating..." : "Update Status"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </MainLayout>
  );
}
