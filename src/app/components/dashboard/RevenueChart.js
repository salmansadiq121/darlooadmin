"use client";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function RevenueCharts() {
  // Data for bar chart
  const barChartData = {
    labels: [
      "20",
      "22",
      "24",
      "26",
      "28",
      "30",
      "02",
      "06",
      "10",
      "12",
      "14",
      "16",
    ],
    datasets: [
      {
        label: "Revenue",
        data: [350, 850, 750, 600, 900, 700, 400, 600, 850, 500, 700, 750],
        backgroundColor: "#ef4444", // Smooth red color
        borderRadius: 10, // Rounded bar edges
        barThickness: 8, // Bar width
      },
    ],
  };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
    },
    scales: {
      x: {
        grid: { display: false }, // Hide grid lines
        ticks: { font: { size: 12 }, color: "#6b7280" }, // Light gray labels
      },
      y: {
        grid: { drawBorder: false, color: "#f3f4f6" }, // Light gray grid lines
        ticks: {
          font: { size: 12 },
          color: "#6b7280", // Light gray labels
          callback: function (value) {
            return `$${value}`; // Prepend $ symbol
          },
        },
      },
    },
  };

  // Data for doughnut chart
  const doughnutData = {
    labels: ["Abandoned", "Completed"],
    datasets: [
      {
        data: [38, 62], // Percentage data
        backgroundColor: ["#623cea", "#e5e7eb"], // Purple gradient and light gray
        hoverOffset: 5,
        borderWidth: 0, // No border
      },
    ],
  };

  // Doughnut chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.raw}%`; // Show percentage in tooltip
          },
        },
      },
    },
    cutout: "75%", // Inner radius
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="col-span-3 sm:col-span-2 bg-white shadow-md rounded-lg p-4 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Dashboard
            </h2>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-red-600 hover:underline"
            >
              Advanced Report →
            </a>
          </div>
          <div className="h-60">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="col-span-3  sm:col-span-1 bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
          <h2 className="text-lg font-medium text-gray-700 mb-4 text-start w-full">
            Cart
          </h2>
          <div className="relative w-36 h-36">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-gray-700">38%</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 w-full flex items-start flex-col gap-3">
            <div className="flex items-center gap-4 text-gray-800">
              <p className="text-[14px] font-medium w-[10rem]">
                Abandoned Cart:
              </p>
              <strong className="text-[14px]">720</strong>
            </div>
            <div className="flex items-center gap-4 text-gray-800">
              <p className="text-[14px] font-medium w-[10rem]">
                Abandoned Revenue:
              </p>
              <strong className="text-[14px]">$5,900</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
