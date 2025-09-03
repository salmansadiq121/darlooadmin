"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DollarSign,
  ImageIcon,
  Star,
  Loader2,
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
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("shoes");
  const isInitialRender = useRef(true);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addingProduct, setAddingProduct] = useState(null);

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
        setTotalCount(data.totalCount || data.products.length);
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

  const totalPages = Math.ceil(totalCount / perPage);

  const ProductCard = ({ product }) => (
    <Card className="group hover:shadow-lg ga transition-all duration-300 border-red-100 hover:border-red-300">
      <CardHeader
        className="p-0 cursor-pointer"
        onClick={() => setSelectedProduct(product)}
      >
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={product?.mainImage || "/placeholder.svg"}
            alt={product?.title}
            width={300}
            height={200}
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
          {/* <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                onClick={() => setSelectedProduct(product)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </DialogTrigger>
          </Dialog> */}
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
            Add to DB
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ProductTableRow = ({ product }) => (
    <TableRow className="hover:bg-red-50">
      <TableCell>
        <div className="flex items-center gap-3">
          <Image
            src={product.mainImage || "/placeholder.svg"}
            alt={product.title}
            width={60}
            height={60}
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
          {/* Header */}
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

            {/* Stats */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-red-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Package className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Products
                      </p>
                      <p className="text-2xl font-bold">
                        {totalCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg. Price
                      </p>
                      <p className="text-2xl font-bold">$24.99</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg. Rating
                      </p>
                      <p className="text-2xl font-bold">4.5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div> */}
          </div>

          {/* Filters and Controls */}
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

          {/* Products Display */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <Tabs value={viewMode} className="w-full">
              <TabsContent value="grid">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="table">
                <Card className="border-red-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-red-100">
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Images</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <ProductTableRow key={product.id} product={product} />
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
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
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Product Detail Modal */}
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
                      <Image
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
                            <Image
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
                        Add to Database
                      </Button>
                      {/* <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                      >
                        Share Product
                      </Button> */}
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
