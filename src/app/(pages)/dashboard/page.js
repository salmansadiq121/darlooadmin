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
  useEffect(() => {
    const pathArray = window.location.pathname;
    setCurrentUrl(pathArray);
  }, []);

  const data = [
    {
      title: "Revenue",
      value: "$7,825",
      percentage: "+22%",
      color: "text-green-500", // Use green for positive values
      chartColor: "#22c55e",
      chartData: [10, 30, 20, 50, 40, 60, 50],
    },
    {
      title: "Orders",
      value: "920",
      percentage: "-25%",
      color: "text-red-500", // Use red for negative values
      chartColor: "#ef4444",
      chartData: [50, 40, 30, 20, 40, 30, 10],
    },
    {
      title: "Visitors",
      value: "15.5K",
      percentage: "+49%",
      color: "text-green-500",
      chartColor: "#22c55e",
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {data?.map((item, index) => (
              <div
                key={index}
                className="w-full bg-white flex items-center justify-between gap-4 p-3 sm:p-4 border rounded-lg shadow-sm hover:shadow-md shadow-gray-200 hover:drop-shadow-md cursor-pointer transition-all duration-300 ease-in-out"
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
                <div className=" flex flex-col gap-2">
                  <div className="w-full flex items-center justify-end">
                    <span className={`text-[12px] font-medium ${item?.color}`}>
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
