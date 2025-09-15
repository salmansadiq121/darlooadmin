"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  Grid,
  List,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  Package,
  ImageIcon,
  Star,
  Loader2,
  CheckSquare,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import MainLayout from "@/app/components/layout/MainLayout";
import toast from "react-hot-toast";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [category, setCategory] = useState("shoes");
  const [viewMode, setViewMode] = useState("table");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("shoes");
  const isInitialRender = useRef(true);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addingProduct, setAddingProduct] = useState(null);
  const [selectedProductsIds, setSelectedProductsIds] = useState([]);
  const [jumpToPage, setJumpToPage] = useState("");
  const [showJumpInput, setShowJumpInput] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const searchParam = debouncedSearch || category;
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/1688/products?page=${page}&perPage=${perPage}&q=${debouncedSearch}`
      );

      if (data) {
        setProducts(data.products);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
      isInitialRender.current = false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, page, perPage, debouncedSearch]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page when searching
  };

  const handleAddToDb = async (product) => {
    setAddingProduct(product);
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/1688/product/${product.id}`
      );
      if (data) {
        toast.success("Product added successfully!");
      }
    } catch (error) {
      console.error("Error adding product to DB:", error);
      toast.error(
        error?.response?.data?.message || "Product detail not found in 1688."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId, isSelected) => {
    if (isSelected) {
      setSelectedProductsIds((prev) => [...prev, productId]);
    } else {
      setSelectedProductsIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleSelectAll = () => {
    if (selectedProductsIds.length === products.length) {
      setSelectedProductsIds([]);
    } else {
      setSelectedProductsIds(products.map((product) => product.id));
    }
  };

  const handleAddMultipleProducts = async () => {
    if (selectedProductsIds.length === 0) {
      toast.error("Please select at least one product to add.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/products/add/1688`,
        {
          itemIds: selectedProductsIds,
        }
      );
      if (data) {
        toast.success("Products added successfully!");
        setSelectedProductsIds([]);
      }
    } catch (error) {
      console.error("Error adding products to DB:", error);
      toast.error(
        error?.response?.data?.message || "Products not found in 1688."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / perPage);

  const handleJumpToPage = () => {
    const pageNum = Number.parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      setJumpToPage("");
      setShowJumpInput(false);
    } else {
      toast.error(`Please enter a page number between 1 and ${totalPages}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleJumpToPage();
    } else if (e.key === "Escape") {
      setShowJumpInput(false);
      setJumpToPage("");
    }
  };

  // Generate page numbers with ellipsis logic
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show around current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const ProductCard = ({ product }) => (
    <Card className="group hover:shadow-lg ga transition-all duration-300 border-red-100 hover:border-red-300">
      <div className="absolute top-2 left-2 z-[999]">
        <Checkbox
          checked={selectedProductsIds.includes(product.id)}
          onCheckedChange={(checked) =>
            handleProductSelect(product.id, checked)
          }
          className="bg-white border-2 border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
        />
      </div>
      <CardHeader
        className="p-0 cursor-pointer"
        onClick={() => setSelectedProduct(product)}
      >
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product?.mainImage || "/placeholder.svg"}
            alt={product?.title}
            width={300}
            height={200}
            unoptimized
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-red-600 text-white">
              {product?.prices?.currency} {product?.prices?.promo}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-sm font-semibold mb-2 line-clamp-2 text-balance">
          {product.title}
        </CardTitle>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-600">
              ${product.prices.original}
            </span>
            {product.prices.original > product.prices.promo && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.prices.original}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground">4.5</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700"
            onClick={() => handleAddToDb(product)}
            disabled={loading}
          >
            {loading && product.id === addingProduct?.id ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin text-white" />
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            Add Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ProductTableRow = ({ product }) => (
    <TableRow className="hover:bg-red-50">
      <TableCell>
        <Checkbox
          checked={selectedProductsIds.includes(product.id)}
          onCheckedChange={(checked) =>
            handleProductSelect(product.id, checked)
          }
          className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <img
            src={product.mainImage || "/placeholder.svg"}
            alt={product.title}
            width={60}
            height={60}
            unoptimized
            className="rounded-lg object-cover"
          />
          <div>
            <p className="font-medium line-clamp-1">{product.title}</p>
            <p className="text-sm text-muted-foreground">ID: {product.id}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{product.categoryId}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-bold text-red-600">
            ${product.prices.promo}
          </span>
          {product.prices.original > product.prices.promo && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.prices.original}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{product.images.length}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                onClick={() => setSelectedProduct(product)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => handleAddToDb(product)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <MainLayout
      title="1688 Products Marketplace"
      description="Discover and manage premium products from 1688"
    >
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-balance">
                  1688 Products Marketplace
                </h1>
                <p className="text-muted-foreground">
                  Discover and manage premium products from 1688
                </p>
              </div>
            </div>
          </div>

          <Card className="mb-6 border-red-100">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search products by category..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 border-red-200 focus:border-red-400"
                    />
                  </div>
                  <Select
                    value={perPage.toString()}
                    onValueChange={(value) => setPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-32 border-red-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                      <SelectItem value="150">200 per page</SelectItem>
                      <SelectItem value="500">500 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid"
                        ? "bg-red-600 hover:bg-red-700"
                        : "border-red-200 text-red-600 hover:bg-red-50"
                    }
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className={
                      viewMode === "table"
                        ? "bg-red-600 hover:bg-red-700"
                        : "border-red-200 text-red-600 hover:bg-red-50"
                    }
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedProductsIds.length > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex sm:items-center sm:justify-between flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="bg-red-600 text-white"
                    >
                      {selectedProductsIds.length} selected
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProductsIds([])}
                      className="border-red-300 text-red-600 hover:bg-red-100"
                    >
                      Clear Selection
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddMultipleProducts}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add Selected Products
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {products.length > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {selectedProductsIds.length === products.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {products.length} products on this page
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <Tabs value={viewMode} className="w-full">
              <TabsContent value="grid">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {products.map((product, index) => (
                    <ProductCard key={product.id + index} product={product} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="table">
                <Card className="border-red-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-red-100">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedProductsIds.length === products.length &&
                              products.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                            className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Images</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product, index) => (
                        <ProductTableRow
                          key={product.id + index}
                          product={product}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {totalPages > 1 && (
            <Card className="mt-8 border-red-100">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  {/* Pagination Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Showing {(page - 1) * perPage + 1} to{" "}
                      {Math.min(page * perPage, totalCount)} of {totalCount}{" "}
                      products
                    </span>
                    <div className="hidden sm:flex items-center gap-2">
                      <span>
                        Page {page} of {totalPages}
                      </span>
                    </div>
                  </div>

                  {/* Main Pagination Controls */}
                  <div className="flex items-center gap-2">
                    {/* First Page Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="border-red-200 text-red-600 hover:bg-red-50 hidden sm:flex"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>

                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Previous</span>
                    </Button>

                    {/* Page Numbers with Ellipsis */}
                    <div className="hidden md:flex items-center gap-1">
                      {getPageNumbers().map((pageNum, index) => (
                        <div key={index}>
                          {pageNum === "..." ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowJumpInput(true)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                              className={
                                page === pageNum
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "border-red-200 text-red-600 hover:bg-red-50"
                              }
                            >
                              {pageNum}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Mobile Page Display */}
                    <div className="md:hidden flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowJumpInput(true)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        {page} / {totalPages}
                      </Button>
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>

                    {/* Last Page Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="border-red-200 text-red-600 hover:bg-red-50 hidden sm:flex"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Jump to Page Input */}
                  {showJumpInput && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Go to:
                      </span>
                      <Input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={jumpToPage}
                        onChange={(e) => setJumpToPage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Page"
                        className="w-20 h-8 border-red-200 focus:border-red-400"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleJumpToPage}
                        className="bg-red-600 hover:bg-red-700 h-8"
                      >
                        Go
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowJumpInput(false);
                          setJumpToPage("");
                        }}
                        className="border-red-200 text-red-600 hover:bg-red-50 h-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedProduct && (
            <Dialog
              open={!!selectedProduct}
              onOpenChange={() => setSelectedProduct(null)}
            >
              <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-balance">
                    {selectedProduct.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      <img
                        src={selectedProduct.mainImage || "/placeholder.svg"}
                        alt={selectedProduct.title}
                        width={400}
                        height={300}
                        className="w-full rounded-lg object-cover"
                      />
                      <div className="grid grid-cols-4 gap-2">
                        {selectedProduct.images
                          .slice(0, 4)
                          .map((image, index) => (
                            <img
                              key={index}
                              src={image || "/placeholder.svg"}
                              alt={`Product ${index + 1}`}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover aspect-square"
                            />
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Product Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Product ID:
                          </span>
                          <span className="font-mono text-sm">
                            {selectedProduct.id}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Category:
                          </span>
                          <Badge variant="outline">
                            {selectedProduct.categoryId}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Original Price:
                          </span>
                          <span className=" text-muted-foreground">
                            ${selectedProduct.prices.original}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Sale Price:
                          </span>
                          <span className="font-bold text-red-600 text-lg">
                            ${selectedProduct.prices.promo}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Images:
                          </span>
                          <span>{selectedProduct.images.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        onClick={() => handleAddToDb(selectedProduct)}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        Add Product
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="w-full ">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div
                    className="text-sm text-muted-foreground w-full "
                    dangerouslySetInnerHTML={{
                      __html: selectedProduct?.description,
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
