import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const RevenueByDevice = () => {
  const revenueData = {
    desktop: 830.03,
    mobile: 755.75,
    tablet: 550.81,
    unknown: 150.84,
  };

  const totalRevenue = Object.values(revenueData).reduce((a, b) => a + b, 0);

  // Calculate the percentage for each device
  const getPercentage = (value) => ((value / totalRevenue) * 100).toFixed(1);

  const data = {
    labels: ["Desktop", "Mobile", "Tablet", "Unknown"],
    datasets: [
      {
        data: [
          revenueData.desktop,
          revenueData.mobile,
          revenueData.tablet,
          revenueData.unknown,
        ],
        backgroundColor: ["#ff392b", "#2f80ed", "#00c3f8", "#c6080a"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            return `${tooltipItem.label}: $${value.toFixed(2)}`;
          },
        },
        backgroundColor: "rgba(0,0,0,0.6)",
        titleColor: "white",
        bodyColor: "white",
      },
      customCanvasBackgroundColor: {
        id: "customCanvasBackgroundColor",
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          const centerX = chart.chartArea.width / 2 + chart.chartArea.left;
          const centerY = chart.chartArea.height / 2 + chart.chartArea.top;

          // Set the font and text color for the center label
          ctx.save();
          ctx.font = "20px Arial";
          ctx.fillStyle = "#000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Draw total revenue percentage in the center
          ctx.fillText("100%", centerX, centerY - 10);
          ctx.fillText("Total Revenue", centerX, centerY + 15);

          // Restore the canvas state to not affect the chart's other drawing operations
          ctx.restore();
        },
      },
    },
    cutout: "60%",
    animation: {
      animateRotate: true,
      animateScale: true,
    },
    legend: {
      display: false,
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-full">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        Revenue by Device
      </h3>
      <div className="relative w-full h-[16rem] flex items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-4 w-full flex items-center justify-center ">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full ">
          {Object.keys(revenueData).map((device) => (
            <li key={device} className="text-sm flex items-center gap-4">
              <div className="flex items-center gap-1 w-[5rem]">
                <span
                  className="w-[.5rem] h-[.5rem] rounded-full"
                  style={{
                    background:
                      device === "desktop"
                        ? "#ff392b"
                        : device === "mobile"
                        ? "#2f80ed"
                        : device === "tablet"
                        ? "#00c3f8"
                        : "#c6080a",
                  }}
                ></span>
                <span className="font-normal text-[12px] text-gray-600">
                  {device.charAt(0).toUpperCase() + device.slice(1)}:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className=" text-gray-900 text-[13px] font-medium">
                  ${revenueData[device].toFixed(2)} |
                </span>
                <span className="text-gray-600 text-[11px]">
                  {getPercentage(revenueData[device])}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RevenueByDevice;
