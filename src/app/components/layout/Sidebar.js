"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { LuLayoutDashboard } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import { LuWarehouse } from "react-icons/lu";
import { AiOutlineProduct } from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
import { FaRegCreditCard } from "react-icons/fa6";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { BsChatRightText } from "react-icons/bs";
import { RiCoupon4Line } from "react-icons/ri";
import { useAuth } from "@/app/context/authContext";
import { FaRegQuestionCircle } from "react-icons/fa";
import { LuContact } from "react-icons/lu";
import { TbTruckReturn } from "react-icons/tb";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { LuPackageSearch } from "react-icons/lu";
import { MdStorefront } from "react-icons/md";
import { BiShieldAlt2 } from "react-icons/bi";
import { TbShieldCheck } from "react-icons/tb";
import toast from "react-hot-toast";

/**
 * Advanced Role-Based Permission System
 * Supports granular permissions with hierarchical access control
 */
const rolePermissions = {
  superadmin: {
    // Full access to all features
    dashboard: { access: true, priority: 1 },
    users: { access: true, priority: 1 },
    products: { access: true, priority: 1 },
    "1688-products": { access: true, priority: 1 },
    coupon: { access: true, priority: 1 },
    card: { access: true, priority: 1 },
    categories: { access: true, priority: 1 },
    orders: { access: true, priority: 1 },
    affiliates: { access: true, priority: 1 },
    return: { access: true, priority: 1 },
    chat: { access: true, priority: 1 },
    notifications: { access: true, priority: 1 },
    faq: { access: true, priority: 1 },
    privacy: { access: true, priority: 1 },
    settings: { access: true, priority: 1 },
    contact: { access: true, priority: 1 },
    sellers: { access: true, priority: 1 },
    verifications: { access: true, priority: 1 },
  },
  admin: {
    dashboard: { access: true, priority: 2 },
    users: { access: true, priority: 2 },
    products: { access: true, priority: 2 },
    "1688-products": { access: true, priority: 2 },
    coupon: { access: true, priority: 2 },
    card: { access: true, priority: 2 },
    categories: { access: true, priority: 2 },
    orders: { access: true, priority: 2 },
    affiliates: { access: true, priority: 2 },
    return: { access: true, priority: 2 },
    chat: { access: true, priority: 2 },
    notifications: { access: true, priority: 2 },
    faq: { access: true, priority: 2 },
    privacy: { access: true, priority: 2 },
    settings: { access: true, priority: 2 },
    contact: { access: true, priority: 2 },
    sellers: { access: true, priority: 2 },
    verifications: { access: true, priority: 2 },
  },
  agent: {
    dashboard: { access: true, priority: 3 },
    orders: { access: true, priority: 3 },
    chat: { access: true, priority: 3 },
    notifications: { access: true, priority: 3 },
  },
  seller: {
    dashboard: { access: true, priority: 4 },
    products: { access: true, priority: 4 },
    orders: { access: true, priority: 4 },
    chat: { access: true, priority: 4 },
    notifications: { access: true, priority: 4 },
    faq: { access: true, priority: 4 },
    privacy: { access: true, priority: 4 },
    "seller-settings": { access: true, priority: 4 },
  },
};

/**
 * Advanced Permission Validator
 * Validates user access with role hierarchy and status checks
 */
const validateAccess = (user, menuId) => {
  if (!user || !user.role) {
    return { hasAccess: false, reason: "User not authenticated" };
  }

  const role = user.role.toLowerCase();
  const permissions = rolePermissions[role];

  if (!permissions) {
    return { hasAccess: false, reason: "Invalid role" };
  }

  const menuPermission = permissions[menuId];

  if (!menuPermission || !menuPermission.access) {
    return { hasAccess: false, reason: "Access denied" };
  }

  // Additional validation for sellers
  if (role === "seller") {
    if (!user.isSeller) {
      return { hasAccess: false, reason: "Seller account not found" };
    }
    if (user.sellerStatus !== "approved") {
      return {
        hasAccess: false,
        reason: `Seller account ${user.sellerStatus}`,
      };
    }
  }

  // Check user status
  if (user.status === false) {
    return { hasAccess: false, reason: "Account suspended" };
  }

  return { hasAccess: true, priority: menuPermission.priority };
};

export default function Sidebar({ hide, setHide }) {
  const { auth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isCollapsing, setIsCollapsing] = useState(false);

  // Validate user authentication
  useEffect(() => {
    if (!auth?.user) {
      toast.error("Authentication required");
      router.push("/");
      return;
    }

    const pathArray = pathname.split("/");
    const fileIdFromPath = pathArray[2] || "dashboard";
    setActive(fileIdFromPath);
  }, [pathname, auth, router]);

  // Menu items configuration with metadata
  const menuItems = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/dashboard",
        badge: null,
        section: "main",
      },
      {
        id: "users",
        label: "Users",
        icon: FiUsers,
        path: "/dashboard/users",
        badge: null,
        section: "management",
      },
      {
        id: "sellers",
        label: "Sellers",
        icon: MdStorefront,
        path: "/dashboard/sellers",
        badge: null,
        section: "management",
      },
      {
        id: "verifications",
        label: "Verifications",
        icon: TbShieldCheck,
        path: "/dashboard/verifications",
        badge: null,
        section: "management",
      },
      {
        id: "products",
        label: "Products",
        icon: LuPackageSearch,
        path: "/dashboard/products",
        badge: null,
        section: "catalog",
      },
      {
        id: "1688-products",
        label: "1688 Products",
        icon: LuWarehouse,
        path: "/dashboard/products-1688",
        badge: null,
        section: "catalog",
      },
      {
        id: "coupon",
        label: "Coupons",
        icon: RiCoupon4Line,
        path: "/dashboard/coupon",
        badge: null,
        section: "marketing",
      },
      {
        id: "card",
        label: "Cards",
        icon: FaRegCreditCard,
        path: "/dashboard/cards",
        badge: null,
        section: "marketing",
      },
      {
        id: "categories",
        label: "Categories",
        icon: AiOutlineProduct,
        path: "/dashboard/categories",
        badge: null,
        section: "catalog",
      },
      {
        id: "orders",
        label: "Orders",
        icon: BsBoxSeam,
        path: "/dashboard/orders",
        badge: null,
        section: "operations",
      },
      {
        id: "affiliates",
        label: "Affiliates",
        icon: HiOutlineUserGroup,
        path: "/dashboard/affiliates",
        badge: null,
        section: "marketing",
      },
      {
        id: "return",
        label: "Return Center",
        icon: TbTruckReturn,
        path: "/dashboard/return-center",
        badge: null,
        section: "operations",
      },
      {
        id: "chat",
        label: "Chat",
        icon: BsChatRightText,
        path: "/dashboard/chat",
        badge: null,
        section: "support",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: MdOutlineNotificationsActive,
        path: "/dashboard/notifications",
        badge: null,
        section: "support",
      },
      {
        id: "faq",
        label: "FAQ",
        icon: FaRegQuestionCircle,
        path: "/dashboard/faq",
        badge: null,
        section: "support",
      },
      {
        id: "contact",
        label: "Contact",
        icon: LuContact,
        path: "/dashboard/contact",
        badge: null,
        section: "support",
      },
      {
        id: "privacy",
        label: "Terms & Privacy",
        icon: MdOutlinePrivacyTip,
        path: "/dashboard/privacy",
        badge: null,
        section: "legal",
      },
      {
        id: "settings",
        label: "Settings",
        icon: IoSettingsOutline,
        path: "/dashboard/settings",
        badge: null,
        section: "system",
      },
      {
        id: "seller-settings",
        label: "Seller Settings",
        icon: IoSettingsOutline,
        path: "/dashboard/seller-settings",
        badge: null,
        section: "system",
      },
    ],
    []
  );

  // Filter menu items based on role permissions
  const filteredMenuItems = useMemo(() => {
    if (!auth?.user) return [];

    return menuItems.filter((item) => {
      const validation = validateAccess(auth.user, item.id);
      return validation.hasAccess;
    });
  }, [auth?.user, menuItems]);

  // Handle menu item click with validation
  const handleMenuClick = useCallback(
    (item) => {
      const validation = validateAccess(auth?.user, item.id);

      if (!validation.hasAccess) {
        toast.error(`Access denied: ${validation.reason}`);
        return;
      }

      setActive(item.id);
      router.push(item.path);
    },
    [auth?.user, router]
  );

  // Handle sidebar toggle with animation
  const handleToggle = useCallback(() => {
    setIsCollapsing(true);
    setTimeout(() => {
      setHide(!hide);
      setIsCollapsing(false);
    }, 150);
  }, [hide, setHide]);

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
    hover: {
      scale: 1.02,
      x: 4,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div className="w-full h-full py-2 border-r border-gray-200/80 bg-gradient-to-b from-white via-gray-50/30 to-white text-black shadow-lg backdrop-blur-sm">
      {/* Header Section */}
      <div className="flex items-center justify-center w-full relative px-4 py-3 border-b border-gray-200/50">
        <AnimatePresence mode="wait">
          {hide ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-center text-lg mt-2 font-serif font-bold bg-gradient-to-r from-[#c6080a] to-[#e63946] bg-clip-text text-transparent">
                D
              </h1>
            </motion.div>
          ) : (
            <motion.h1
              key="expanded-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center text-2xl font-serif font-bold bg-gradient-to-r from-[#c6080a] to-[#e63946] bg-clip-text text-transparent"
            >
              Darloo
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.div
          className="absolute top-2 right-2 z-30 hidden sm:flex items-center justify-end"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {hide ? (
            <AiOutlineMenuUnfold
              onClick={handleToggle}
              className="text-xl cursor-pointer text-gray-600 hover:text-[#c6080a] transition-all duration-300 p-1.5 rounded-lg hover:bg-gray-100"
            />
          ) : (
            <AiOutlineMenuFold
              onClick={handleToggle}
              className="text-xl cursor-pointer text-gray-600 hover:text-[#c6080a] transition-all duration-300 p-1.5 rounded-lg hover:bg-gray-100"
            />
          )}
        </motion.div>
      </div>

      {/* Menu Items Section */}
      <div className="relative w-full h-[calc(100vh-10.5vh)] sm:h-[calc(100vh-7.5vh)] overflow-y-auto scroll-smooth py-4 pb-8 custom-scrollbar">
        <div className="flex flex-col gap-2 px-3">
          <AnimatePresence>
            {filteredMenuItems.map((item, index) => {
              const isActive = active === item.id;
              const Icon = item.icon;
              const validation = validateAccess(auth?.user, item.id);

              return (
                <motion.div
                  key={item.id}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  whileHover="hover"
                  className="relative"
                >
                  <motion.div
                    className={`relative h-[2.6rem] rounded-xl cursor-pointer overflow-hidden group ${
                      isActive
                        ? "bg-gradient-to-r from-[#c6080a] to-[#e63946] shadow-lg shadow-red-500/30"
                        : "bg-white/80 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200/50"
                    } transition-all duration-300`}
                    onClick={() => handleMenuClick(item)}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 rounded-r-full"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}

                    {/* Hover effect */}
                    {hoveredItem === item.id && !isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#c6080a]/10 to-[#e63946]/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}

                    <div
                      className={`relative w-full h-full flex items-center px-3 z-10 ${
                        isActive ? "text-white" : "text-gray-700"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                          isActive
                            ? "text-white scale-110"
                            : "text-gray-600 group-hover:text-[#c6080a] group-hover:scale-110"
                        }`}
                      />
                      {!hide && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`text-sm font-medium ml-3 whitespace-nowrap ${
                            isActive
                              ? "text-white font-semibold"
                              : "text-gray-700 group-hover:text-[#c6080a]"
                          } transition-colors duration-300`}
                        >
                          {item.label}
                        </motion.span>
                      )}

                      {/* Badge indicator */}
                      {item.badge && !hide && (
                        <motion.span
                          className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          {item.badge}
                        </motion.span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {hide && hoveredItem === item.id && (
                        <motion.div
                          className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 whitespace-nowrap"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          {item.label}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Divider after specific items */}
                  {(item.id === "dashboard" || item.id === "privacy") && (
                    <motion.hr
                      className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Role Badge */}
        {!hide && auth?.user && (
          <motion.div
            className="relative bottom-0 left-3 right-3 p-3 bg-gradient-to-r from-[#c6080a]/10 to-[#e63946]/10 rounded-lg border border-[#c6080a]/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-2">
              <BiShieldAlt2 className="text-[#c6080a] text-lg flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-semibold text-gray-700 leading-tight break-words overflow-wrap-anywhere">
                  {(() => {
                    const role = auth.user.role?.toLowerCase() || "";
                    if (role === "superadmin") return "Super Admin";
                    if (role === "seller") return "Seller";
                    return (
                      role.charAt(0).toUpperCase() + role.slice(1) || "User"
                    );
                  })()}
                </p>
                {auth.user.isSeller && (
                  <p className="text-xs text-gray-500 leading-tight break-words mt-1 overflow-wrap-anywhere">
                    Status:{" "}
                    <span className="font-medium">
                      {auth.user.sellerStatus?.charAt(0).toUpperCase() +
                        auth.user.sellerStatus?.slice(1).toLowerCase() || "N/A"}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #c6080a, #e63946);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #a00608, #c6080a);
        }
      `}</style>
    </motion.div>
  );
}
