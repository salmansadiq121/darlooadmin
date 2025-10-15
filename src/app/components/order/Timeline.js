import { format } from "date-fns";
import { TbShoppingCartCopy } from "react-icons/tb";
import { AiOutlineSync } from "react-icons/ai";
import { BiPackage } from "react-icons/bi";
import { FaTruck, FaUndo } from "react-icons/fa";
import { MdOutlineDoneAll, MdCancel } from "react-icons/md";

const statusMapping = [
  {
    status: "Pending",
    icon: TbShoppingCartCopy,
    color: "green",
    label: "Order Placed",
  },
  {
    status: "Processing",
    icon: AiOutlineSync,
    color: "sky",
    label: "Processing",
  },
  { status: "Packing", icon: BiPackage, color: "purple", label: "Packing" },
  { status: "Shipped", icon: FaTruck, color: "teal", label: "Shipped" },
  {
    status: "Delivered",
    icon: MdOutlineDoneAll,
    color: "green",
    label: "Order Delivered",
  },
  {
    status: "Cancelled",
    icon: MdCancel,
    color: "red",
    label: "Order Cancelled",
  },
  {
    status: "Returned",
    icon: FaUndo,
    color: "orange",
    label: "Order Returned",
  },
];

// Tailwind-safe color maps
const colorClasses = {
  green: { bg: "bg-green-600", text: "text-green-600", sub: "text-green-500" },
  sky: { bg: "bg-sky-600", text: "text-sky-600", sub: "text-sky-500" },
  purple: {
    bg: "bg-purple-600",
    text: "text-purple-600",
    sub: "text-purple-500",
  },
  teal: { bg: "bg-teal-600", text: "text-teal-600", sub: "text-teal-500" },
  red: { bg: "bg-red-600", text: "text-red-600", sub: "text-red-500" },
  orange: {
    bg: "bg-orange-600",
    text: "text-orange-600",
    sub: "text-orange-500",
  },
};

export default function OrderTimeline({ timeline = [] }) {
  const completedStatuses = timeline.map((t) => t.status);

  return (
    <div className="flex flex-col gap-4">
      {statusMapping.map(({ status, icon: Icon, color, label }) => {
        const isCompleted = completedStatuses.includes(status);
        const timelineItem = timeline.find((t) => t.status === status);
        const colors = colorClasses[color] || colorClasses.gray;

        return (
          <div key={status} className="flex items-center gap-4">
            {/* Icon circle */}
            <span
              className={`p-2 rounded-full flex items-center justify-center ${
                isCompleted ? colors.bg : "bg-gray-300"
              } text-white`}
            >
              <Icon className="text-[20px]" />
            </span>

            {/* Label and Date */}
            <div className="flex flex-col">
              <span
                className={`text-[13px] font-medium ${
                  isCompleted ? colors.text : "text-gray-600"
                }`}
              >
                {label}
              </span>
              <span
                className={`text-[11px] ${
                  isCompleted ? colors.sub : "text-gray-400"
                }`}
              >
                {timelineItem?.date
                  ? format(
                      new Date(timelineItem.date),
                      "MMM dd, yyyy • hh:mm a"
                    )
                  : "—"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
