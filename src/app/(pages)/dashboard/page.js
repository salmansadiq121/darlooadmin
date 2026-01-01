"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import dynamic from "next/dynamic";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";
import {
  MdTrendingUp,
  MdShoppingCart,
  MdPerson,
  MdBarChart,
  MdStore,
  MdInventory,
  MdAccountBalance,
  MdRefresh,
} from "react-icons/md";
import {
  TbCurrencyEuro,
  TbPackage,
  TbChartPie,
  TbCalendar,
  TbFilter,
  TbDownload,
  TbArrowUpRight,
  TbArrowDownRight,
} from "react-icons/tb";
import { BiTime } from "react-icons/bi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const MainLayout = dynamic(
  () => import("./../../components/layout/MainLayout"),
  { ssr: false }
);
const Breadcrumb = dynamic(() => import("./../../utils/Breadcrumb"), {
  ssr: false,
});
const EarthGlobe = dynamic(
  () => import("./../../components/dashboard/EarthGlobe"),
  { ssr: false, loading: () => <div className="h-[400px] bg-gray-900 rounded-2xl animate-pulse flex items-center justify-center"><p className="text-gray-500">Loading Globe...</p></div> }
);

// Register Chart.js components
ChartJS.register(
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

// Period options for filters
const periodOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

// Tab configuration
const adminTabs = [
  { id: "overview", label: "Overview", icon: MdBarChart },
  { id: "revenue", label: "Revenue", icon: TbCurrencyEuro },
  { id: "sellers", label: "Sellers", icon: MdStore },
  { id: "products", label: "Products", icon: MdInventory },
  { id: "users", label: "Users", icon: HiOutlineUserGroup },
  { id: "commission", label: "Commission", icon: MdAccountBalance },
];

const sellerTabs = [
  { id: "overview", label: "Overview", icon: MdBarChart },
  { id: "orders", label: "Orders", icon: TbPackage },
  { id: "products", label: "Products", icon: MdInventory },
  { id: "earnings", label: "Earnings", icon: TbCurrencyEuro },
];

export default function Dashboard() {
  const { auth } = useAuth();
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Analytics data states
  const [platformOverview, setPlatformOverview] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [topSellers, setTopSellers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [commissionAnalytics, setCommissionAnalytics] = useState(null);
  const [sellerDashboard, setSellerDashboard] = useState(null);
  const [usersByCountry, setUsersByCountry] = useState([]);
  const [globeLoading, setGlobeLoading] = useState(false);

  // User role checks
  const isAdmin = auth?.user?.role === "admin" || auth?.user?.role === "superadmin";
  const isSeller = auth?.user?.role === "seller" || auth?.user?.isSeller;
  const tabs = isAdmin ? adminTabs : sellerTabs;

  // Seller ID - can be from sellerProfile or direct sellerId
  const [sellerProfileId, setSellerProfileId] = useState(null);

  // Get auth token
  const getAuthToken = useCallback(() => {
    return auth?.token || localStorage.getItem("token");
  }, [auth?.token]);

  // Current Path
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.pathname);
    }
  }, []);

  // Fetch seller profile ID if user is a seller
  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!isSeller || isAdmin) return;

      const token = getAuthToken();
      if (!token) return;

      // Check if sellerProfile is already available in user object
      if (auth?.user?.sellerProfile) {
        setSellerProfileId(auth.user.sellerProfile);
        return;
      }

      // Otherwise fetch from server using /profile endpoint
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/seller/profile`,
          { headers: { Authorization: token } }
        );
        if (data?.seller?._id) {
          setSellerProfileId(data.seller._id);
        }
      } catch (error) {
        console.error("Error fetching seller profile:", error);
      }
    };

    if (auth?.user) {
      fetchSellerProfile();
    }
  }, [auth?.user, isSeller, isAdmin, getAuthToken]);

  // Fetch all analytics data
  const fetchAnalytics = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    const headers = { Authorization: token };

    try {
      if (isAdmin) {
        // Fetch admin analytics
        const [overview, revenue, sellers, products, orders, users, commission] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/advanced-analytics/platform/overview?period=${period}`,
            { headers }
          ).catch(err => ({ data: null })),
          axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/advanced-analytics/revenue?period=${period}`,
            { headers }
          ).catch(err => ({ data: null })),
          axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/advanced-analytics/top-sellers?period=${period}&limit=10`,
            { headers }
          ).catch(err => ({ data: null })),
          axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/advanced-analytics/top-products?period=${period}&limit=10`,
            { headers }
          ).catch(err => ({ data: null })),
          axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/advanced-analytics/order-status?period=${period}`,
            { headers }
          ).catch(err => ({ data: null })),
          axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/advanced-analytics/users?period=${period}`,
            { headers }
          ).catch(err => ({ data: null })),
          axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/advanced-analytics/commission?period=${period}`,
            { headers }
          ).catch(err => ({ data: null })),
        ]);

        if (overview.data?.success) setPlatformOverview(overview.data.data);
        if (revenue.data?.success) setRevenueAnalytics(revenue.data.data);
        if (sellers.data?.success) setTopSellers(sellers.data.data);
        if (products.data?.success) setTopProducts(products.data.data);
        if (orders.data?.success) setOrderStatus(orders.data.data);
        if (users.data?.success) setUserAnalytics(users.data.data);
        if (commission.data?.success) setCommissionAnalytics(commission.data.data);

        // Fetch users by country for globe
        setGlobeLoading(true);
        try {
          const countryRes = await axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/advanced-analytics/users/by-country`,
            { headers }
          );
          if (countryRes.data?.success) {
            setUsersByCountry(countryRes.data.data.countries || []);
          }
        } catch (err) {
          console.error("Error fetching users by country:", err);
        } finally {
          setGlobeLoading(false);
        }
      } else if (isSeller && sellerProfileId) {
        // Fetch seller analytics using the seller profile ID
        const sellerRes = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/advanced-analytics/seller/${sellerProfileId}?period=${period}`,
          { headers }
        ).catch(err => ({ data: null }));

        if (sellerRes.data?.success) setSellerDashboard(sellerRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAdmin, isSeller, period, sellerProfileId, getAuthToken]);

  useEffect(() => {
    // For admin, fetch immediately. For seller, wait until sellerProfileId is available
    if (auth?.user) {
      if (isAdmin) {
        fetchAnalytics();
      } else if (isSeller && sellerProfileId) {
        fetchAnalytics();
      }
    }
  }, [fetchAnalytics, auth?.user, isAdmin, isSeller, sellerProfileId]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  // Format currency - €630.00 format
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `€${num.toFixed(2)}`;
  };

  // Format percentage with color
  const formatPercentage = (value) => {
    if (!value) return { text: "0%", isPositive: true };
    const isPositive = value.toString().startsWith("+") || parseFloat(value) >= 0;
    return {
      text: value.toString().includes("%") ? value : `${value}%`,
      isPositive,
    };
  };

  // Stat Card Component
  const StatCard = ({ title, value, change, icon: Icon, iconColor, bgGradient, onClick }) => {
    const percentage = formatPercentage(change);
    return (
      <div
        onClick={onClick}
        className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            {change && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                percentage.isPositive
                  ? "bg-green-500/20 text-green-100"
                  : "bg-red-500/20 text-red-100"
              }`}>
                {percentage.isPositive ? (
                  <TbArrowUpRight className="w-3 h-3" />
                ) : (
                  <TbArrowDownRight className="w-3 h-3" />
                )}
                {percentage.text}
              </div>
            )}
          </div>
          <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
      </div>
    );
  };

  // Chart Card Component
  const ChartCard = ({ title, children, action }) => (
    <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );

  // Revenue Line Chart Data
  const revenueChartData = {
    labels: revenueAnalytics?.revenueOverTime?.map(item => item._id) || [],
    datasets: [
      {
        label: "Revenue",
        data: revenueAnalytics?.revenueOverTime?.map(item => item.revenue) || [],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Orders",
        data: revenueAnalytics?.revenueOverTime?.map(item => item.orders * 10) || [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Order Status Doughnut Data
  const orderStatusChartData = {
    labels: orderStatus?.orderStatus?.map(item => item._id) || [],
    datasets: [
      {
        data: orderStatus?.orderStatus?.map(item => item.count) || [],
        backgroundColor: [
          "#22c55e", // Delivered - Green
          "#3b82f6", // Processing - Blue
          "#f59e0b", // Pending - Yellow
          "#ef4444", // Cancelled - Red
          "#8b5cf6", // Shipped - Purple
          "#ec4899", // Packing - Pink
          "#6b7280", // Returned - Gray
        ],
        borderWidth: 0,
      },
    ],
  };

  // Commission Bar Chart Data
  const commissionChartData = {
    labels: commissionAnalytics?.commissionOverTime?.slice(-14).map(item => item._id) || [],
    datasets: [
      {
        label: "Commission",
        data: commissionAnalytics?.commissionOverTime?.slice(-14).map(item => item.commission) || [],
        backgroundColor: "#10b981",
        borderRadius: 8,
      },
      {
        label: "Seller Earnings",
        data: commissionAnalytics?.commissionOverTime?.slice(-14).map(item => item.sellerEarnings) || [],
        backgroundColor: "#6366f1",
        borderRadius: 8,
      },
    ],
  };

  // Common chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, padding: 20 },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f3f4f6" }, beginAtZero: true },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: { usePointStyle: true, padding: 15 },
      },
    },
    cutout: "70%",
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, padding: 20 },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f3f4f6" }, beginAtZero: true },
    },
  };

  // Render Admin Overview Tab
  const renderAdminOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(platformOverview?.overview?.totalRevenue)}
          change={platformOverview?.overview?.revenueChange}
          icon={TbCurrencyEuro}
          iconColor="text-white"
          bgGradient="from-rose-500 to-red-600"
          onClick={() => router.push("/dashboard/orders")}
        />
        <StatCard
          title="Platform Earnings"
          value={formatCurrency(platformOverview?.overview?.platformEarnings)}
          change={platformOverview?.overview?.earningsChange}
          icon={MdAccountBalance}
          iconColor="text-white"
          bgGradient="from-emerald-500 to-green-600"
        />
        <StatCard
          title="Total Orders"
          value={platformOverview?.overview?.totalOrders || 0}
          change={platformOverview?.overview?.ordersChange}
          icon={MdShoppingCart}
          iconColor="text-white"
          bgGradient="from-blue-500 to-indigo-600"
          onClick={() => router.push("/dashboard/orders")}
        />
        <StatCard
          title="Total Users"
          value={platformOverview?.overview?.totalUsers || 0}
          icon={MdPerson}
          iconColor="text-white"
          bgGradient="from-purple-500 to-violet-600"
          onClick={() => router.push("/dashboard/users")}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MdStore className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Active Sellers</p>
              <p className="text-lg font-bold text-gray-800">
                {platformOverview?.overview?.activeSellers || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <TbPackage className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Delivered Orders</p>
              <p className="text-lg font-bold text-gray-800">
                {platformOverview?.overview?.deliveredOrders || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <MdInventory className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Active Products</p>
              <p className="text-lg font-bold text-gray-800">
                {platformOverview?.overview?.activeProducts || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <HiOutlineUserGroup className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Total Sellers</p>
              <p className="text-lg font-bold text-gray-800">
                {platformOverview?.overview?.totalSellers || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <ChartCard title="Revenue & Orders Trend">
            <div className="h-72">
              <Line data={revenueChartData} options={lineChartOptions} />
            </div>
          </ChartCard>
        </div>

        {/* Order Status */}
        <ChartCard title="Order Status Distribution">
          <div className="h-72">
            <Doughnut data={orderStatusChartData} options={doughnutOptions} />
          </div>
        </ChartCard>
      </div>

      {/* Top Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <ChartCard
          title="Top Sellers"
          action={
            <button
              onClick={() => setActiveTab("sellers")}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              View All
            </button>
          }
        >
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {topSellers.slice(0, 5).map((seller, index) => (
              <div key={seller.sellerId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-full font-bold text-sm">
                  {index + 1}
                </div>
                <img
                  src={seller.storeLogo || "/default-store.png"}
                  alt={seller.sellerName}
                  className="w-10 h-10 rounded-full object-cover bg-gray-200"
                  onError={(e) => e.target.src = "/default-store.png"}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{seller.sellerName || "Unknown Store"}</p>
                  <p className="text-xs text-gray-500">{seller.totalOrders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{formatCurrency(seller.totalRevenue)}</p>
                  <p className="text-xs text-green-600">+{formatCurrency(seller.totalCommission)} comm.</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Top Products */}
        <ChartCard
          title="Top Products"
          action={
            <button
              onClick={() => setActiveTab("products")}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              View All
            </button>
          }
        >
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full font-bold text-sm">
                  {index + 1}
                </div>
                <img
                  src={product.image || "/default-product.png"}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-200"
                  onError={(e) => e.target.src = "/default-product.png"}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{product.name || "Unknown Product"}</p>
                  <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{formatCurrency(product.totalRevenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Earth Globe - Global Users & Orders */}
      <div className="mt-6">
        <EarthGlobe
          userData={usersByCountry}
          loading={globeLoading}
          onCountrySelect={(country) => {
            console.log("Selected country:", country);
          }}
        />
      </div>
    </div>
  );

  // Render Revenue Tab
  const renderRevenueTab = () => (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(platformOverview?.overview?.totalRevenue)}
          change={platformOverview?.overview?.revenueChange}
          icon={TbCurrencyEuro}
          iconColor="text-white"
          bgGradient="from-rose-500 to-red-600"
        />
        <StatCard
          title="Platform Commission"
          value={formatCurrency(commissionAnalytics?.summary?.totalCommission)}
          icon={MdAccountBalance}
          iconColor="text-white"
          bgGradient="from-emerald-500 to-green-600"
        />
        <StatCard
          title="Seller Earnings"
          value={formatCurrency(commissionAnalytics?.summary?.totalSellerEarnings)}
          icon={MdStore}
          iconColor="text-white"
          bgGradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(
            commissionAnalytics?.summary?.totalRevenue /
            (commissionAnalytics?.summary?.orderCount || 1)
          )}
          icon={TbChartPie}
          iconColor="text-white"
          bgGradient="from-purple-500 to-violet-600"
        />
      </div>

      {/* Revenue Chart */}
      <ChartCard title="Revenue Over Time">
        <div className="h-80">
          <Line data={revenueChartData} options={lineChartOptions} />
        </div>
      </ChartCard>

      {/* Commission Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Platform vs Seller Earnings">
          <div className="h-72">
            <Bar data={commissionChartData} options={barChartOptions} />
          </div>
        </ChartCard>

        {/* Revenue by Payment Method */}
        <ChartCard title="Revenue by Payment Method">
          <div className="space-y-4">
            {revenueAnalytics?.revenueByPaymentMethod?.map((method, index) => {
              const total = revenueAnalytics.revenueByPaymentMethod.reduce(
                (sum, m) => sum + m.revenue, 0
              );
              const percentage = total > 0 ? (method.revenue / total) * 100 : 0;
              const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500"];

              return (
                <div key={method._id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{method._id}</span>
                    <span className="text-gray-500">
                      {formatCurrency(method.revenue)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Revenue by Country */}
      <ChartCard title="Top Countries by Revenue">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {revenueAnalytics?.revenueByCountry?.slice(0, 5).map((country, index) => (
            <div
              key={country._id || index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow"
            >
              <p className="text-2xl mb-2">
                {getCountryFlag(country._id)}
              </p>
              <p className="font-medium text-gray-800">{country._id || "Unknown"}</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(country.revenue)}</p>
              <p className="text-xs text-gray-500">{country.orders} orders</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );

  // Render Sellers Tab
  const renderSellersTab = () => (
    <div className="space-y-6">
      {/* Seller Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sellers"
          value={platformOverview?.overview?.totalSellers || 0}
          icon={MdStore}
          iconColor="text-white"
          bgGradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Active Sellers"
          value={platformOverview?.overview?.activeSellers || 0}
          icon={FiTrendingUp}
          iconColor="text-white"
          bgGradient="from-emerald-500 to-green-600"
        />
        <StatCard
          title="Total Commission"
          value={formatCurrency(commissionAnalytics?.summary?.totalCommission)}
          icon={MdAccountBalance}
          iconColor="text-white"
          bgGradient="from-purple-500 to-violet-600"
        />
        <StatCard
          title="Avg Commission Rate"
          value={`${(commissionAnalytics?.summary?.avgCommissionRate || 0).toFixed(1)}%`}
          icon={TbChartPie}
          iconColor="text-white"
          bgGradient="from-orange-500 to-amber-600"
        />
      </div>

      {/* All Sellers Table */}
      <ChartCard title="All Sellers Performance">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Seller</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Orders</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Commission</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Earnings</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Rating</th>
              </tr>
            </thead>
            <tbody>
              {topSellers.map((seller, index) => (
                <tr key={seller.sellerId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index < 3 ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-gray-400"
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={seller.storeLogo || "/default-store.png"}
                        alt={seller.sellerName}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                        onError={(e) => e.target.src = "/default-store.png"}
                      />
                      <div>
                        <p className="font-medium text-gray-800">{seller.sellerName || "Unknown Store"}</p>
                        <p className="text-xs text-gray-500">{seller.totalProducts || 0} products</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">{seller.totalOrders}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-800">
                    {formatCurrency(seller.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right text-green-600 font-medium">
                    {formatCurrency(seller.totalCommission)}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-600 font-medium">
                    {formatCurrency(seller.totalEarnings)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{(seller.rating || 0).toFixed(1)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Commission by Seller Chart */}
      <ChartCard title="Commission by Seller">
        <div className="h-72">
          <Bar
            data={{
              labels: commissionAnalytics?.commissionBySeller?.map(s => s.sellerName || "Unknown") || [],
              datasets: [{
                label: "Commission Earned",
                data: commissionAnalytics?.commissionBySeller?.map(s => s.commission) || [],
                backgroundColor: "#10b981",
                borderRadius: 8,
              }]
            }}
            options={{
              ...barChartOptions,
              indexAxis: "y",
            }}
          />
        </div>
      </ChartCard>
    </div>
  );

  // Render Products Tab
  const renderProductsTab = () => (
    <div className="space-y-6">
      {/* Product Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={platformOverview?.overview?.totalProducts || 0}
          icon={MdInventory}
          iconColor="text-white"
          bgGradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Active Products"
          value={platformOverview?.overview?.activeProducts || 0}
          icon={FiTrendingUp}
          iconColor="text-white"
          bgGradient="from-emerald-500 to-green-600"
        />
        <StatCard
          title="Total Products Sold"
          value={topProducts.reduce((sum, p) => sum + (p.totalSold || 0), 0)}
          icon={TbPackage}
          iconColor="text-white"
          bgGradient="from-purple-500 to-violet-600"
        />
        <StatCard
          title="Product Revenue"
          value={formatCurrency(topProducts.reduce((sum, p) => sum + (p.totalRevenue || 0), 0))}
          icon={TbCurrencyEuro}
          iconColor="text-white"
          bgGradient="from-orange-500 to-amber-600"
        />
      </div>

      {/* All Products Table */}
      <ChartCard title="Top Selling Products">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Product</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Units Sold</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Orders</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index < 3 ? "bg-gradient-to-br from-rose-400 to-red-500" : "bg-gray-400"
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image || "/default-product.png"}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-200"
                        onError={(e) => e.target.src = "/default-product.png"}
                      />
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{product.name || "Unknown Product"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-medium">
                      {product.totalSold}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-800">
                    {formatCurrency(product.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">{product.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );

  // Render Users Tab
  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={platformOverview?.overview?.totalUsers || 0}
          change={platformOverview?.overview?.usersChange}
          icon={MdPerson}
          iconColor="text-white"
          bgGradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Active Buyers"
          value={userAnalytics?.activeUsersCount || 0}
          icon={FiTrendingUp}
          iconColor="text-white"
          bgGradient="from-emerald-500 to-green-600"
        />
        <StatCard
          title="Total Sellers"
          value={platformOverview?.overview?.totalSellers || 0}
          icon={MdStore}
          iconColor="text-white"
          bgGradient="from-purple-500 to-violet-600"
        />
        <StatCard
          title="Active Sellers"
          value={platformOverview?.overview?.activeSellers || 0}
          icon={HiOutlineUserGroup}
          iconColor="text-white"
          bgGradient="from-orange-500 to-amber-600"
        />
      </div>

      {/* User Growth Chart */}
      <ChartCard title="User Growth Over Time">
        <div className="h-72">
          <Line
            data={{
              labels: userAnalytics?.userGrowth?.map(item => item._id) || [],
              datasets: [{
                label: "New Users",
                data: userAnalytics?.userGrowth?.map(item => item.newUsers) || [],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
              }]
            }}
            options={lineChartOptions}
          />
        </div>
      </ChartCard>

      {/* Users by Role & Top Buyers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <ChartCard title="Users by Role">
          <div className="h-72">
            <Doughnut
              data={{
                labels: userAnalytics?.usersByRole?.map(item => item._id || "user") || [],
                datasets: [{
                  data: userAnalytics?.usersByRole?.map(item => item.count) || [],
                  backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
                  borderWidth: 0,
                }]
              }}
              options={doughnutOptions}
            />
          </div>
        </ChartCard>

        {/* Top Buyers */}
        <ChartCard title="Top Buyers">
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {userAnalytics?.topBuyers?.map((buyer, index) => (
              <div key={buyer.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index < 3 ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-gray-400"
                }`}>
                  {index + 1}
                </div>
                <img
                  src={buyer.avatar || "/default-avatar.png"}
                  alt={buyer.name}
                  className="w-10 h-10 rounded-full object-cover bg-gray-200"
                  onError={(e) => e.target.src = "/default-avatar.png"}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{buyer.name || "Unknown User"}</p>
                  <p className="text-xs text-gray-500">{buyer.totalOrders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{formatCurrency(buyer.totalSpent)}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );

  // Render Commission Tab
  const renderCommissionTab = () => (
    <div className="space-y-6">
      {/* Commission Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Commission"
          value={formatCurrency(commissionAnalytics?.summary?.totalCommission)}
          icon={MdAccountBalance}
          iconColor="text-white"
          bgGradient="from-emerald-500 to-green-600"
        />
        <StatCard
          title="Avg Commission/Order"
          value={formatCurrency(commissionAnalytics?.summary?.avgCommission)}
          icon={TbChartPie}
          iconColor="text-white"
          bgGradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Avg Commission Rate"
          value={`${(commissionAnalytics?.summary?.avgCommissionRate || 0).toFixed(1)}%`}
          icon={TbCurrencyEuro}
          iconColor="text-white"
          bgGradient="from-purple-500 to-violet-600"
        />
        <StatCard
          title="Current Default Rate"
          value={`${commissionAnalytics?.currentSettings?.defaultRate || 5}%`}
          icon={MdBarChart}
          iconColor="text-white"
          bgGradient="from-orange-500 to-amber-600"
        />
      </div>

      {/* Commission Settings Summary */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Commission Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-white/70 text-sm">Default Rate</p>
            <p className="text-2xl font-bold">{commissionAnalytics?.currentSettings?.defaultRate}%</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Type</p>
            <p className="text-2xl font-bold capitalize">{commissionAnalytics?.currentSettings?.type}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Minimum Amount</p>
            <p className="text-2xl font-bold">{formatCurrency(commissionAnalytics?.currentSettings?.minimumAmount)}</p>
          </div>
          <div>
            <p className="text-white/70 text-sm">Maximum Amount</p>
            <p className="text-2xl font-bold">
              {commissionAnalytics?.currentSettings?.maximumAmount > 0
                ? formatCurrency(commissionAnalytics?.currentSettings?.maximumAmount)
                : "No Cap"
              }
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          Manage Commission Settings →
        </button>
      </div>

      {/* Commission Over Time */}
      <ChartCard title="Commission Earnings Over Time">
        <div className="h-72">
          <Bar data={commissionChartData} options={barChartOptions} />
        </div>
      </ChartCard>

      {/* Commission by Seller */}
      <ChartCard title="Commission by Seller">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Seller</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Orders</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Commission Rate</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Commission Earned</th>
              </tr>
            </thead>
            <tbody>
              {commissionAnalytics?.commissionBySeller?.map((seller) => (
                <tr key={seller._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{seller.sellerName || "Unknown"}</td>
                  <td className="py-3 px-4 text-right">{seller.orders}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(seller.revenue)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                      {(seller.avgRate || 0).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">
                    {formatCurrency(seller.commission)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );

  // Render Seller Dashboard (for sellers)
  const renderSellerOverview = () => {
    if (!sellerDashboard) return null;

    return (
      <div className="space-y-6">
        {/* Seller Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(sellerDashboard.overview?.totalRevenue)}
            change={sellerDashboard.overview?.revenueChange}
            icon={TbCurrencyEuro}
            iconColor="text-white"
            bgGradient="from-rose-500 to-red-600"
          />
          <StatCard
            title="My Earnings"
            value={formatCurrency(sellerDashboard.overview?.totalEarnings)}
            change={sellerDashboard.overview?.earningsChange}
            icon={MdAccountBalance}
            iconColor="text-white"
            bgGradient="from-emerald-500 to-green-600"
          />
          <StatCard
            title="Total Orders"
            value={sellerDashboard.overview?.totalOrders || 0}
            change={sellerDashboard.overview?.ordersChange}
            icon={MdShoppingCart}
            iconColor="text-white"
            bgGradient="from-blue-500 to-indigo-600"
          />
          <StatCard
            title="Platform Commission"
            value={formatCurrency(sellerDashboard.overview?.totalCommission)}
            icon={TbChartPie}
            iconColor="text-white"
            bgGradient="from-purple-500 to-violet-600"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TbPackage className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Delivered</p>
                <p className="text-lg font-bold text-gray-800">
                  {sellerDashboard.overview?.deliveredOrders || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BiTime className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Pending</p>
                <p className="text-lg font-bold text-gray-800">
                  {sellerDashboard.overview?.pendingOrders || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <MdInventory className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Products</p>
                <p className="text-lg font-bold text-gray-800">
                  {sellerDashboard.overview?.totalProducts || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdStore className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Store</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {sellerDashboard.seller?.storeName || "My Store"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Over Time */}
          <ChartCard title="Earnings Over Time">
            <div className="h-72">
              <Line
                data={{
                  labels: sellerDashboard.revenueOverTime?.map(item => item._id) || [],
                  datasets: [{
                    label: "Earnings",
                    data: sellerDashboard.revenueOverTime?.map(item => item.earnings) || [],
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    fill: true,
                    tension: 0.4,
                  }]
                }}
                options={lineChartOptions}
              />
            </div>
          </ChartCard>

          {/* Order Status */}
          <ChartCard title="Order Status">
            <div className="h-72">
              <Doughnut
                data={{
                  labels: sellerDashboard.orderStatusBreakdown?.map(item => item._id) || [],
                  datasets: [{
                    data: sellerDashboard.orderStatusBreakdown?.map(item => item.count) || [],
                    backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
                    borderWidth: 0,
                  }]
                }}
                options={doughnutOptions}
              />
            </div>
          </ChartCard>
        </div>

        {/* Top Products */}
        <ChartCard title="My Top Products">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {sellerDashboard.topProducts?.map((product, index) => (
              <div key={product._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index < 3 ? "bg-gradient-to-br from-rose-400 to-red-500" : "bg-gray-400"
                }`}>
                  {index + 1}
                </div>
                <img
                  src={product.image || "/default-product.png"}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-200"
                  onError={(e) => e.target.src = "/default-product.png"}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{product.name || "Unknown Product"}</p>
                  <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{formatCurrency(product.totalRevenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    );
  };

  // Get country flag emoji
  const getCountryFlag = (countryCode) => {
    const flags = {
      "Germany": "🇩🇪",
      "DE": "🇩🇪",
      "Austria": "🇦🇹",
      "AT": "🇦🇹",
      "Switzerland": "🇨🇭",
      "CH": "🇨🇭",
      "France": "🇫🇷",
      "FR": "🇫🇷",
      "Netherlands": "🇳🇱",
      "NL": "🇳🇱",
      "Belgium": "🇧🇪",
      "BE": "🇧🇪",
      "Italy": "🇮🇹",
      "IT": "🇮🇹",
      "Spain": "🇪🇸",
      "ES": "🇪🇸",
      "United Kingdom": "🇬🇧",
      "UK": "🇬🇧",
      "GB": "🇬🇧",
      "United States": "🇺🇸",
      "US": "🇺🇸",
    };
    return flags[countryCode] || "🌍";
  };

  // Advanced Animated Loader Component
  const AdvancedLoader = ({ message = "Loading..." }) => (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-24 h-24 rounded-full border-4 border-gray-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-red-500 border-r-red-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        {/* Middle pulsing ring */}
        <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-emerald-500 border-l-emerald-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />

        {/* Inner ring */}
        <div className="w-8 h-8 rounded-full border-4 border-transparent border-t-blue-500 border-b-blue-500 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '0.5s' }} />

        {/* Center dot with pulse */}
        <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />

        {/* Loading text */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center w-48">
          <p className="text-gray-600 font-medium animate-pulse">{message}</p>
          <div className="flex justify-center gap-1 mt-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );

  // Skeleton Loader for cards
  const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-5 h-32">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gray-300 rounded-xl" />
              <div className="w-16 h-6 bg-gray-300 rounded-full" />
            </div>
            <div className="w-20 h-4 bg-gray-300 rounded mb-2" />
            <div className="w-28 h-8 bg-gray-300 rounded" />
          </div>
        ))}
      </div>

      {/* Secondary Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div>
                <div className="w-16 h-3 bg-gray-200 rounded mb-2" />
                <div className="w-12 h-5 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <div className="w-32 h-5 bg-gray-200 rounded mb-4" />
          <div className="h-72 bg-gray-100 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <div className="w-32 h-5 bg-gray-200 rounded mb-4" />
          <div className="h-72 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );

  // Render active tab content
  const renderTabContent = () => {
    // Show loading for sellers waiting for profile ID
    if (isSeller && !isAdmin && !sellerProfileId) {
      return <AdvancedLoader message="Loading seller profile..." />;
    }

    if (loading) {
      return <SkeletonLoader />;
    }

    if (isSeller && !isAdmin) {
      // Show message if no data available
      if (!sellerDashboard) {
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
              <MdStore className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Analytics Data Yet
              </h3>
              <p className="text-gray-400 mb-4">
                Your store analytics will appear here once you start receiving orders.
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Refresh Data
              </button>
            </div>
          </div>
        );
      }
      return renderSellerOverview();
    }

    switch (activeTab) {
      case "overview":
        return renderAdminOverview();
      case "revenue":
        return renderRevenueTab();
      case "sellers":
        return renderSellersTab();
      case "products":
        return renderProductsTab();
      case "users":
        return renderUsersTab();
      case "commission":
        return renderCommissionTab();
      default:
        return renderAdminOverview();
    }
  };

  return (
    <MainLayout
      title="Admin Dashboard - Advanced Analytics"
      description="Advanced analytics dashboard for managing your e-commerce platform"
      keywords="admin dashboard, analytics, eCommerce, sales management, revenue tracking"
    >
      <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Breadcrumb path={currentUrl} />
              <h1 className="text-2xl font-bold text-gray-800 mt-2">
                {isAdmin ? "Admin Dashboard" : "Seller Dashboard"}
              </h1>
              <p className="text-gray-500 text-sm">
                {isAdmin
                  ? "Complete platform analytics and performance metrics"
                  : "Track your store performance and earnings"
                }
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Period Filter */}
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 cursor-pointer hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                >
                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <TbCalendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-red-300 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <MdRefresh className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs (Admin only) */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </MainLayout>
  );
}
