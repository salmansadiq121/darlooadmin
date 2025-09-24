import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  Title,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  Title,
  CategoryScale,
  LinearScale
);

const TrafficChart = ({ usersAnalytics }) => {
  console.log(usersAnalytics);

  const labels = usersAnalytics?.map((item) => {
    // Format the date to show just month and day for cleaner display
    const date = new Date(item.month);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const chartData = usersAnalytics?.map((item) => item.count);

  const totalVisits = chartData.reduce((sum, count) => sum + count, 0);
  const averageVisits = Math.round(totalVisits / chartData.length);

  // Calculate percentage change (comparing last vs first non-zero value)
  const firstNonZero = chartData.find((count) => count > 0) || 0;
  const lastValue = chartData[chartData.length - 1];
  const percentageChange =
    firstNonZero > 0
      ? Math.round(((lastValue - firstNonZero) / firstNonZero) * 100)
      : 0;

  const data = {
    labels,
    datasets: [
      {
        label: "Store Visits",
        data: chartData,
        fill: true,
        borderColor: "#BD0206",
        backgroundColor: "rgba(255, 79, 90, 0.2)",
        tension: 0.4,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Added for better responsive behavior
    plugins: {
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.6)",
        titleColor: "white",
        bodyColor: "white",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#888",
          maxRotation: 45, // Rotate labels for better readability
        },
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#888",
        },
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        radius: 6,
        hitRadius: 10,
        hoverRadius: 8,
      },
    },
    animation: {
      duration: 1000,
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-full">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[16px] font-medium text-gray-800">Traffic</h3>
        <a
          href="#"
          className="text-sm text-gray-600 hover:text-red-600 hover:underline"
        >
          More →
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-gray-50 p-3 shadow rounded-lg flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <strong className="text-[14px] font-medium text-black">
              Total Visits:
            </strong>
            <span className="text-[13px] text-gray-600">
              {totalVisits.toLocaleString()}
            </span>
          </div>
          <span style={{ color: percentageChange >= 0 ? "green" : "red" }}>
            {percentageChange >= 0 ? "+" : ""}
            {percentageChange}%
          </span>
        </div>
        <div className="bg-gray-50 p-3 shadow rounded-lg flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <strong className="text-[14px] font-medium text-black">
              Average:
            </strong>
            <span className="text-[13px] text-gray-600">
              {averageVisits.toLocaleString()}
            </span>
          </div>
          <span style={{ color: lastValue > averageVisits ? "green" : "red" }}>
            {lastValue > averageVisits ? "↗" : "↘"}
          </span>
        </div>
      </div>
      <div className="w-full h-[18rem] mt-4">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default TrafficChart;
