"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from "react-icons/ai";
import { LuLayoutDashboard } from "react-icons/lu";
import { FiUsers, FiChevronRight } from "react-icons/fi";
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
import { FaRegQuestionCircle, FaUserCircle, FaWallet } from "react-icons/fa";
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
    profile: { access: true, priority: 1 },
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
    "seller-settings": { access: true, priority: 1 },
    contact: { access: true, priority: 1 },
    sellers: { access: true, priority: 1 },
    verifications: { access: true, priority: 1 },
    payouts: { access: true, priority: 1 },
  },
  admin: {
    dashboard: { access: true, priority: 2 },
    profile: { access: true, priority: 2 },
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
    "seller-settings": { access: true, priority: 2 },
    contact: { access: true, priority: 2 },
    sellers: { access: true, priority: 2 },
    verifications: { access: true, priority: 2 },
    payouts: { access: true, priority: 2 },
  },
  agent: {
    dashboard: { access: true, priority: 3 },
    orders: { access: true, priority: 3 },
    chat: { access: true, priority: 3 },
    notifications: { access: true, priority: 3 },
  },
  seller: {
    profile: { access: true, priority: 4 },
    dashboard: { access: true, priority: 4 },
    products: { access: true, priority: 4 },
    coupon: { access: true, priority: 4 },
    orders: { access: true, priority: 4 },
    return: { access: true, priority: 4 },
    chat: { access: true, priority: 4 },
    notifications: { access: true, priority: 4 },
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
    // Allow sellers to access profile to complete verification even if not yet approved
    if (menuId === "profile") {
      return { hasAccess: true, priority: menuPermission.priority };
    }

    // For other menu items, check if seller is verified
    if (!user.isSeller || user.sellerStatus !== "approved") {
      return {
        hasAccess: false,
        reason: `Please complete seller verification to access this section. Current status: ${
          user.sellerStatus || "pending"
        }`,
      };
    }
  }

  // Check user status
  if (user.status === false) {
    return { hasAccess: false, reason: "Account suspended" };
  }

  return { hasAccess: true, priority: menuPermission.priority };
};

// Menu sections for grouping
const menuSections = {
  main: { label: "Main", order: 1 },
  management: { label: "Management", order: 2 },
  catalog: { label: "Catalog", order: 3 },
  marketing: { label: "Marketing", order: 4 },
  operations: { label: "Operations", order: 5 },
  support: { label: "Support", order: 6 },
  legal: { label: "Legal", order: 7 },
  system: { label: "System", order: 8 },
};

export default function Sidebar({ hide, setHide }) {
  const { auth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set(["main", "management", "catalog", "marketing", "operations", "support", "legal", "system"]));

  // Validate user authentication
  useEffect(() => {
    if (!auth?.user) {
      toast.error("Authentication required");
      router.push("/");
      return;
    }

    const pathArray = pathname.split("/");
    const fileIdFromPath = (pathArray[2] || "dashboard").toLowerCase();
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
        color: "from-violet-500 to-purple-600",
      },
      {
        id: "profile",
        label: "Seller Profile",
        icon: FaUserCircle,
        path: "/dashboard/Profile",
        badge: null,
        section: "main",
        color: "from-pink-500 to-rose-600",
      },
      {
        id: "users",
        label: "Users",
        icon: FiUsers,
        path: "/dashboard/users",
        badge: null,
        section: "management",
        color: "from-blue-500 to-cyan-600",
      },
      {
        id: "sellers",
        label: "Sellers",
        icon: MdStorefront,
        path: "/dashboard/sellers",
        badge: null,
        section: "management",
        color: "from-indigo-500 to-violet-600",
      },
      {
        id: "verifications",
        label: "Verifications",
        icon: TbShieldCheck,
        path: "/dashboard/verifications",
        badge: null,
        section: "management",
        color: "from-emerald-500 to-teal-600",
      },
      {
        id: "payouts",
        label: "Payouts",
        icon: FaWallet,
        path: "/dashboard/payouts",
        badge: null,
        section: "management",
        color: "from-green-500 to-emerald-600",
      },
      {
        id: "products",
        label: "Products",
        icon: LuPackageSearch,
        path: "/dashboard/products",
        badge: null,
        section: "catalog",
        color: "from-orange-500 to-amber-600",
      },
      {
        id: "1688-products",
        label: "1688 Products",
        icon: LuWarehouse,
        path: "/dashboard/products-1688",
        badge: null,
        section: "catalog",
        color: "from-yellow-500 to-orange-600",
      },
      {
        id: "coupon",
        label: "Coupons",
        icon: RiCoupon4Line,
        path: "/dashboard/coupon",
        badge: null,
        section: "marketing",
        color: "from-fuchsia-500 to-pink-600",
      },
      {
        id: "card",
        label: "Cards",
        icon: FaRegCreditCard,
        path: "/dashboard/cards",
        badge: null,
        section: "marketing",
        color: "from-cyan-500 to-blue-600",
      },
      {
        id: "categories",
        label: "Categories",
        icon: AiOutlineProduct,
        path: "/dashboard/categories",
        badge: null,
        section: "catalog",
        color: "from-lime-500 to-green-600",
      },
      {
        id: "orders",
        label: "Orders",
        icon: BsBoxSeam,
        path: "/dashboard/orders",
        badge: null,
        section: "operations",
        color: "from-red-500 to-rose-600",
      },
      {
        id: "affiliates",
        label: "Affiliates",
        icon: HiOutlineUserGroup,
        path: "/dashboard/affiliates",
        badge: null,
        section: "marketing",
        color: "from-teal-500 to-emerald-600",
      },
      {
        id: "return",
        label: "Return Center",
        icon: TbTruckReturn,
        path: "/dashboard/return-center",
        badge: null,
        section: "operations",
        color: "from-amber-500 to-yellow-600",
      },
      {
        id: "chat",
        label: "Chat",
        icon: BsChatRightText,
        path: "/dashboard/chat",
        badge: null,
        section: "support",
        color: "from-green-500 to-emerald-600",
      },
      {
        id: "notifications",
        label: "Notifications",
        icon: MdOutlineNotificationsActive,
        path: "/dashboard/notifications",
        badge: null,
        section: "support",
        color: "from-purple-500 to-violet-600",
      },
      {
        id: "faq",
        label: "FAQ",
        icon: FaRegQuestionCircle,
        path: "/dashboard/faq",
        badge: null,
        section: "support",
        color: "from-sky-500 to-blue-600",
      },
      {
        id: "contact",
        label: "Contact",
        icon: LuContact,
        path: "/dashboard/contact",
        badge: null,
        section: "support",
        color: "from-rose-500 to-pink-600",
      },
      {
        id: "privacy",
        label: "Terms & Privacy",
        icon: MdOutlinePrivacyTip,
        path: "/dashboard/privacy",
        badge: null,
        section: "legal",
        color: "from-slate-500 to-gray-600",
      },
      {
        id: "settings",
        label: "Settings",
        icon: IoSettingsOutline,
        path: "/dashboard/settings",
        badge: null,
        section: "system",
        color: "from-gray-500 to-slate-600",
      },
      {
        id: "seller-settings",
        label: "Seller Settings",
        icon: IoSettingsOutline,
        path: "/dashboard/seller-settings",
        badge: null,
        section: "system",
        color: "from-indigo-500 to-purple-600",
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

  // Group items by section
  const groupedMenuItems = useMemo(() => {
    const groups = {};
    filteredMenuItems.forEach((item) => {
      if (!groups[item.section]) {
        groups[item.section] = [];
      }
      groups[item.section].push(item);
    });
    return groups;
  }, [filteredMenuItems]);

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

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.25,
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

  const sectionVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  return (
    <motion.div className="w-full h-full py-2 border-r border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-white text-black shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-red-500/10 to-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-violet-500/10 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header Section */}
      <div className="relative flex items-center justify-center w-full px-4 py-4 border-b border-slate-200/50 bg-gradient-to-r from-white to-slate-50/50">
        <AnimatePresence mode="wait">
          {hide ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6080a] to-[#e63946] flex items-center justify-center shadow-lg shadow-red-500/25">
                <span className="text-white font-bold text-lg">D</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6080a] to-[#e63946] flex items-center justify-center shadow-lg shadow-red-500/25">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#c6080a] to-[#e63946] bg-clip-text text-transparent">
                  Darloo
                </h1>
                <p className="text-[9px] text-slate-500 font-medium -mt-0.5">Admin Panel</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          className="absolute top-1/2 -translate-y-1/2 right-2 z-30 hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#c6080a] transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggle}
        >
          {hide ? (
            <AiOutlineMenuUnfold className="text-lg" />
          ) : (
            <AiOutlineMenuFold className="text-lg" />
          )}
        </motion.button>
      </div>

      {/* Menu Items Section */}
      <div className="relative w-full h-[calc(100vh-10.5vh)] sm:h-[calc(100vh-8vh)] overflow-y-auto scroll-smooth py-3 pb-8 custom-scrollbar px-2">
        {/* Render sections */}
        {Object.entries(menuSections).map(([sectionKey, sectionData]) => {
          const sectionItems = groupedMenuItems[sectionKey];
          if (!sectionItems || sectionItems.length === 0) return null;

          const isExpanded = expandedSections.has(sectionKey);

          return (
            <div key={sectionKey} className="mb-2">
              {/* Section Header (only show if not collapsed) */}
              {!hide && (
                <motion.button
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span>{sectionData.label}</span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiChevronRight className="w-3 h-3" />
                  </motion.div>
                </motion.button>
              )}

              {/* Section Items */}
              <AnimatePresence initial={false}>
                {(isExpanded || hide) && (
                  <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-1"
                  >
                    {sectionItems.map((item, index) => {
                      const isActive = active === item.id;
                      const Icon = item.icon;
                      const isHovered = hoveredItem === item.id;

                      return (
                        <motion.div
                          key={item.id}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          variants={menuItemVariants}
                          onHoverStart={() => setHoveredItem(item.id)}
                          onHoverEnd={() => setHoveredItem(null)}
                          className="relative"
                        >
                          <motion.button
                            className={`relative w-full h-[2.5rem] rounded-xl cursor-pointer overflow-hidden group transition-all duration-300 ${
                              isActive
                                ? `bg-gradient-to-r ${item.color} shadow-lg`
                                : "bg-white/80 hover:bg-slate-100 border border-slate-100"
                            }`}
                            onClick={() => handleMenuClick(item)}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              boxShadow: isActive
                                ? `0 8px 20px -4px rgba(198, 8, 10, 0.3)`
                                : "none",
                            }}
                          >
                            {/* Active indicator */}
                            {isActive && (
                              <motion.div
                                className="absolute left-0 top-0 bottom-0 w-1 bg-white/50 rounded-r-full"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}

                            {/* Hover effect glow */}
                            {isHovered && !isActive && (
                              <motion.div
                                className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.1 }}
                                exit={{ opacity: 0 }}
                              />
                            )}

                            <div
                              className={`relative w-full h-full flex items-center px-3 z-10 ${
                                isActive ? "text-white" : "text-slate-700"
                              }`}
                            >
                              {/* Icon with gradient background for active */}
                              <div
                                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-300 ${
                                  isActive
                                    ? "bg-white/20"
                                    : isHovered
                                    ? `bg-gradient-to-br ${item.color} bg-opacity-10`
                                    : "bg-slate-100"
                                }`}
                              >
                                <Icon
                                  className={`h-4 w-4 flex-shrink-0 transition-all duration-300 ${
                                    isActive
                                      ? "text-white"
                                      : isHovered
                                      ? "text-[#c6080a]"
                                      : "text-slate-500"
                                  }`}
                                />
                              </div>

                              {!hide && (
                                <motion.span
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={`text-[12px] font-medium ml-3 whitespace-nowrap ${
                                    isActive
                                      ? "text-white font-semibold"
                                      : "text-slate-700 group-hover:text-slate-900"
                                  } transition-colors duration-300`}
                                >
                                  {item.label}
                                </motion.span>
                              )}

                              {/* Badge indicator */}
                              {item.badge && !hide && (
                                <motion.span
                                  className="ml-auto bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                >
                                  {item.badge}
                                </motion.span>
                              )}

                              {/* Arrow indicator for active */}
                              {isActive && !hide && (
                                <motion.div
                                  className="ml-auto"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <FiChevronRight className="w-4 h-4 text-white/70" />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>

                          {/* Tooltip for collapsed state */}
                          {hide && isHovered && (
                            <motion.div
                              className="absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 whitespace-nowrap"
                              initial={{ opacity: 0, x: -10, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: -10, scale: 0.95 }}
                            >
                              {item.label}
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* User Role Badge */}
        {!hide && auth?.user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 mx-2 p-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6080a] to-[#e63946] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-500/20">
                {auth?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-900 truncate">
                  {auth?.user?.name || "User"}
                </p>
                <p className="text-[9px] text-slate-500 capitalize flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {auth?.user?.role || "Unknown"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
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

// Export permission helpers so layout and other components can enforce
// the same access rules even when users navigate directly via URL.
export { validateAccess, rolePermissions };
