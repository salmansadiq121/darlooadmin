"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  ImageIcon,
  Loader2,
  ArrowLeft,
  Upload,
} from "lucide-react";
import MainLayout from "@/app/components/layout/MainLayout";
import { IoCameraOutline } from "react-icons/io5";

export default function SubCategoryPage() {
  const [category, setCategory] = useState({});
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryImage, setSubCategoryImage] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const initialLoad = useRef(true);

  const categoryId = useParams().id;

  // Fetch Category
  useEffect(() => {
    fetchCategory();
  }, []);

  // Fetch Category
  const fetchCategory = async () => {
    if (initialLoad.current) {
      setLoading(true);
    }
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/categories/subcategory/${categoryId}`
      );
      if (data) {
        setCategory(data.category);
        setSubCategories(data.subCategories);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Failed to fetch category data");
    } finally {
      if (initialLoad.current) {
        setLoading(false);
        initialLoad.current = false;
      }
    }
  };

  // Handle Upload Image
  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsloading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/upload/file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data) {
        setSubCategoryImage(data.files[0]);
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsloading(false);
    }
  };

  // Add Sub Categories
  const handleAddSubCategory = async () => {
    if (!subCategoryName.trim() || !subCategoryImage) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/categories/add/subcategory/${categoryId}`,
        {
          name: subCategoryName,
          image: subCategoryImage,
        }
      );
      if (data) {
        setSubCategories([...subCategories, data.subCategory]);
        fetchCategory();
        toast.success("Sub category added successfully!");
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error adding sub category:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Sub Category
  const handleUpdateSubCategory = async () => {
    if (!subCategoryName.trim() || !subCategoryImage) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/categories/update/subcategory/${subCategoryId}`,
        {
          name: subCategoryName,
          image: subCategoryImage,
        }
      );
      if (data) {
        const subCategory = data.subCategory;
        const filterSubCategory = subCategories.filter(
          (sub) => sub._id !== subCategoryId
        );
        setSubCategories([...filterSubCategory, subCategory]);
        fetchCategory();
        toast.success("Sub category updated successfully!");
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating sub category:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Remove Sub Category
  const handleRemoveSubCategory = async (subCategory) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `"${subCategory.name}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const { data } = await axios.delete(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/categories/delete/subcategory/${subCategory._id}`
        );
        if (data) {
          setSubCategories((prev) =>
            prev.filter((sub) => sub._id !== subCategoryId)
          );
          fetchCategory();
          toast.success("Sub category removed successfully!");
        }
      } catch (error) {
        console.error("Error removing sub category:", error);
        toast.error(error?.response?.data?.message || "An error occurred.");
      }
    }
  };

  const handleEdit = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setSubCategoryName(subCategory.name);
    setSubCategoryImage(subCategory.image);
    setSubCategoryId(subCategory._id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSubCategoryName("");
    setSubCategoryImage("");
    setSubCategoryId("");
    setIsEditMode(false);
    setSelectedSubCategory(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (isEditMode) {
      handleUpdateSubCategory();
    } else {
      handleAddSubCategory();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="w-full h-48 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout title="Sub Categories Management - Darloo Admin">
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Categories
              </Button>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-5">
              <div>
                <h1 className=" text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Sub Categories Management
                </h1>
                <p className="text-gray-600 text-[15px]">
                  Manage sub-categories for {category?.name}
                </p>
              </div>

              {/* Add/Update Sub Category Dialog */}
              <div className="w-full sm:w-fit flex items-center justify-end sm:justify-normal">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={openAddDialog}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Sub Category
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-red-600">
                        {isEditMode
                          ? "Edit Sub Category"
                          : "Add New Sub Category"}
                      </DialogTitle>
                      <DialogDescription>
                        {isEditMode
                          ? "Update the sub-category information below."
                          : "Create a new sub-category by filling out the form below."}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Sub Category Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter sub-category name"
                          value={subCategoryName}
                          onChange={(e) => setSubCategoryName(e.target.value)}
                          className="focus:ring-red-500 focus:border-red-500"
                        />
                      </div>

                      <div className="border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center rounded-md">
                        <label className="cursor-pointer flex flex-col items-center ">
                          <span>
                            <IoCameraOutline className="text-[35px] text-red-700 hover:text-red-700" />
                          </span>
                          <span className="text-red-700 group flex items-center gap-1 px-4 py-[.3rem] text-[13px] font-normal rounded-sm text-sm border-2 border-red-700  hover:bg-red-700 hover:text-white transition-all duration-300 hover:shadow-md">
                            {isLoading && (
                              <Loader2 className="w-4 h-4 animate-spin text-red-600 group-hover:text-white" />
                            )}
                            Add Media
                          </span>
                          <input
                            type="file"
                            multiple={false}
                            accept="image/*"
                            className="hidden"
                            onChange={handleUploadImage}
                          />
                        </label>
                      </div>

                      <div className="space-y-2">
                        {/* <Label htmlFor="image">Sub Category Image</Label>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleUploadImage}
                            disabled={isLoading}
                            className="focus:ring-red-500 focus:border-red-500"
                          />
                          {isLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                            </div>
                          )}
                        </div>
                      </div> */}

                        {subCategoryImage && (
                          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-3">
                              <Image
                                src={subCategoryImage || "/placeholder.svg"}
                                alt="Preview"
                                width={60}
                                height={60}
                                className="rounded-lg object-cover border-2 border-red-200"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-red-700">
                                  Image uploaded successfully
                                </p>
                                <p className="text-xs text-red-600">
                                  Ready to save
                                </p>
                              </div>
                              <div className="text-red-600">
                                <Upload className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          resetForm();
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={
                          isSubmitting ||
                          isLoading ||
                          !subCategoryName.trim() ||
                          !subCategoryImage
                        }
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isEditMode ? "Updating..." : "Adding..."}
                          </>
                        ) : (
                          <>{isEditMode ? "Update" : "Add"} Sub Category</>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Category Info Card */}
          {category && category.name && (
            <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-center flex-col sm:flex-row  sm:justify-normal gap-4 sm:gap-8">
                  <div className="relative">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      width={120}
                      height={120}
                      className="rounded-2xl object-cover shadow-lg ring-4 ring-red-100"
                    />
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-2">
                      <Tag className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      {category.name}
                    </h2>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span>Created: {formatDate(category.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span>Updated: {formatDate(category.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        {category.sub_categories?.length || 0} Sub Categories
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sub Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subCategories &&
              subCategories?.map((subCategory) => (
                <Card
                  key={subCategory._id}
                  className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:scale-105"
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <div className="flex items-center justify-center  w-full py-2">
                        <div className="relative p-2 border-2 w-[5.1rem] h-[5.1rem] border-red-600  rounded-full ">
                          <Image
                            src={subCategory.image || "/placeholder.svg"}
                            alt={subCategory.name}
                            width={300}
                            height={200}
                            className="w-[5rem] h-[5rem] object-fill rounded-full  group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700 shadow-lg"
                            onClick={() => handleEdit(subCategory)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700 shadow-lg"
                            onClick={() => handleRemoveSubCategory(subCategory)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div> */}
                    </div>

                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-center text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-200">
                        {subCategory.name}
                      </h3>

                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="border-red-200 text-red-700"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Image Set
                        </Badge>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleEdit(subCategory)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveSubCategory(subCategory)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {/* Empty State */}
            {(!subCategories || subCategories.length === 0) && (
              <Card className="col-span-full border-2 border-dashed border-red-200 bg-red-50/50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Sub Categories Yet
                  </h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    Get started by creating your first sub-category. Click the
                    &quot;Add Sub Category&quot; button to begin.
                  </p>
                  <Button
                    onClick={openAddDialog}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Sub Category
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
