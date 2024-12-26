"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import RevenueCharts from "@/app/components/dashboard/RevenueChart";
import RevenueByDevice from "@/app/components/dashboard/RevenueByDevice";
import TrafficChart from "@/app/components/dashboard/TrafficChart";
import dynamic from "next/dynamic";
import axios from "axios";
import OrderUserAnalytics from "@/app/components/dashboard/OrderUserAnalytics";
import TopCards from "@/app/components/Loaders/Dashboard/TopCards";
import OrderUserLoader from "@/app/components/Loaders/Dashboard/OrderUserLoader";
const MainLayout = dynamic(
  () => import("./../../components/layout/MainLayout"),
  {
    ssr: false,
  }
);
const Breadcrumb = dynamic(() => import("./../../utils/Breadcrumb"), {
  ssr: false,
});

// Register the required modules
ChartJS.register(
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [revenue, setRevenue] = useState("0");
  const [orders, setOrders] = useState(0);
  const [revenuePercentage, setRevenuePercentage] = useState("");
  const [ordersPercentage, setOrderPercentage] = useState("");
  const [ordersAnalytics, setOrderAnalytics] = useState(null);
  const [usersAnalytics, setUsersAnalytics] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [userDifference, setUserDifference] = useState(0);
  const [cardLoading, setCardLoading] = useState(false);
  const [isloading, setIsLoading] = useState(false);

  // Current Path
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathArray = window.location.pathname;
      setCurrentUrl(pathArray);
    }
    // exlint-disable-next-line
  }, []);

  // -----------------Order Data----------->
  const orderData = async () => {
    setCardLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/order/total/revenue`
      );
      console.log("data:", data);
      if (data) {
        setRevenue(data.allTime.totalRevenue);
        setOrders(data.allTime.totalOrders);
        setRevenuePercentage(data.percentageChange.revenue);
        setOrderPercentage(data.percentageChange.orders);
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
    } finally {
      setCardLoading(false);
    }
  };

  // --------Order Analytics--------
  const orderAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/analytics/orders`
      );
      if (data) {
        setOrderAnalytics(data.order.last12Months);
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  // -----------User Analytics---------
  const userAnalytics = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/analytics/users`
      );
      if (data) {
        setUsersAnalytics(data.users.last12Months);
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // User Count
  const fetchUserCount = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/users/count`
      );
      console.log("userCount:", data);
      if (data) {
        setUserCount(data.count);
        setUserDifference(data.percentageChange);
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    orderData();
    orderAnalytics();
    userAnalytics();
    fetchUserCount();
  }, []);

  const formatCount = (count) => {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`;
    } else if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const data = [
    {
      title: "Revenue",
      value: `$${revenue.toLocaleString()}`,
      percentage: revenuePercentage,
      color: revenuePercentage?.startsWith("+")
        ? "text-green-500"
        : "text-red-500",
      chartColor: revenuePercentage?.startsWith("+") ? "#22c55e" : "#ef4444",
      chartData: [10, 30, 20, 50, 40, 60, 50],
    },
    {
      title: "Orders",
      value: orders,
      percentage: ordersPercentage,
      color: ordersPercentage?.startsWith("+")
        ? "text-green-500"
        : "text-red-500",
      chartColor: ordersPercentage?.startsWith("+") ? "#22c55e" : "#ef4444",
      chartData: [50, 40, 30, 20, 40, 30, 10],
    },
    {
      title: "Users",
      value: formatCount(userCount),
      percentage: userDifference,
      color:
        userDifference && userDifference?.startsWith("+")
          ? "text-green-500"
          : "text-red-500",
      chartColor:
        userDifference && userDifference?.startsWith("+")
          ? "#22c55e"
          : "#ef4444",
      chartData: [20, 40, 30, 50, 70, 60, 80],
    },
    {
      title: "Conversion",
      value: "28%",
      percentage: "+1.9%",
      color: "text-orange-500",
      chartColor: "#f97316",
      chartData: [30, 20, 40, 60, 50, 70, 60],
    },
  ];

  const renderChart = (chartColor, chartData) => ({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        data: chartData,
        borderColor: chartColor,
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  });

  return (
    <MainLayout>
      <div className="p-4 sm:p-4 h-[100%] w-full pb-4">
        <div className="flex flex-col gap-4 w-full h-full">
          <Breadcrumb path={currentUrl} />
          {/* -----------1st------- */}
          {!cardLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {data?.map((item, index) => (
                <div
                  key={index}
                  className="w-full bg-white flex overflow-hidden items-center justify-between gap-4 p-3 sm:p-4 border rounded-lg shadow-sm hover:shadow-md shadow-gray-200 hover:drop-shadow-md cursor-pointer transition-all duration-300 ease-in-out"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[14px] font-medium text-gray-600">
                        {item?.title}
                      </label>
                    </div>
                    <span className="text-[22px] font-medium text-black">
                      {item?.value}
                    </span>
                  </div>
                  <div className=" flex flex-col gap-2 mr-2">
                    <div className="w-full flex items-center justify-end">
                      <span
                        className={`text-[12px] font-medium ${item?.color}`}
                      >
                        {item?.percentage}
                      </span>
                    </div>
                    <div className="w-[6rem] sm:w-[8rem] h-[3rem] sm:h-[4rem]">
                      <Line
                        data={renderChart(item.chartColor, item.chartData)}
                        options={{
                          plugins: {
                            legend: { display: false },
                          },
                          scales: {
                            x: { display: false },
                            y: { display: false },
                          },
                          elements: {
                            line: { tension: 0.4 },
                            point: { radius: 0 },
                          },
                          maintainAspectRatio: false,
                          responsive: true,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TopCards />
          )}
          {/* ------------Users & Orders---------- */}
          {!isloading ? (
            <OrderUserAnalytics
              ordersAnalytics={ordersAnalytics}
              usersAnalytics={usersAnalytics}
            />
          ) : (
            <OrderUserLoader />
          )}
          {/*------------2nd----------  */}
          <RevenueCharts />
          {/* -----------3rd------------ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RevenueByDevice />
            <TrafficChart />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
