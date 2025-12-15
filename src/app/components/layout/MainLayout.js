"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMenu, IoClose } from "react-icons/io5";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AdminProtected from "@/app/hooks/adminProtected";
import { Helmet } from "react-helmet";
import { useAuth } from "@/app/context/authContext";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { BiShieldAlt2, BiErrorCircle } from "react-icons/bi";

/**
 * Advanced Layout Validator
 * Validates user access, role permissions, and session status
 */
const validateLayoutAccess = (user, pathname) => {
  const errors = [];
  const warnings = [];

  // Check authentication
  if (!user) {
    errors.push({
      type: "authentication",
      message: "User not authenticated",
      severity: "error",
    });
    return { isValid: false, errors, warnings };
  }

  // Check user status
  if (user.status === false) {
    errors.push({
      type: "account_status",
      message: "Your account has been suspended",
      severity: "error",
    });
    return { isValid: false, errors, warnings };
  }

  // Check seller status if accessing seller routes
  if (pathname?.includes("/seller") && user.isSeller) {
    if (user.sellerStatus === "pending") {
      warnings.push({
        type: "seller_status",
        message: "Your seller account is pending approval",
        severity: "warning",
      });
    } else if (user.sellerStatus === "suspended") {
      errors.push({
        type: "seller_status",
        message: "Your seller account has been suspended",
        severity: "error",
      });
      return { isValid: false, errors, warnings };
    } else if (user.sellerStatus === "rejected") {
      errors.push({
        type: "seller_status",
        message: "Your seller account application was rejected",
        severity: "error",
      });
      return { isValid: false, errors, warnings };
    }
  }

  // Check role validity
  const validRoles = ["admin", "superadmin", "agent", "seller"];
  if (!validRoles.includes(user.role?.toLowerCase())) {
    errors.push({
      type: "role",
      message: "Invalid user role",
      severity: "error",
    });
    return { isValid: false, errors, warnings };
  }

  return { isValid: true, errors, warnings };
};

export default function MainLayout({
  children,
  title,
  description,
  keywords,
  author,
}) {
  const { auth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [isValidating, setIsValidating] = useState(true);

  // Validate layout access on mount and route change
  useEffect(() => {
    const validate = async () => {
      setIsValidating(true);
      const validation = validateLayoutAccess(auth?.user, pathname);
      setValidationState(validation);

      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          toast.error(error.message, {
            duration: 5000,
            icon: "🚫",
          });
        });

        // Redirect if critical error
        if (validation.errors.some((e) => e.severity === "error")) {
          setTimeout(() => {
            router.push("/");
          }, 2000);
        }
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach((warning) => {
          toast(warning.message, {
            duration: 4000,
            icon: "⚠️",
          });
        });
      }

      setIsValidating(false);
    };

    validate();
  }, [auth?.user, pathname, router]);

  // Handle mobile menu toggle
  const handleMobileMenuToggle = useCallback(() => {
    setShow((prev) => !prev);
  }, []);

  // Handle sidebar collapse
  const handleSidebarToggle = useCallback((newHide) => {
    setHide(newHide);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  // Layout animation variants
  const layoutVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  // Show loading state during validation
  if (isValidating) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-[9999]">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-[#c6080a] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <p className="text-gray-600 font-medium">Validating access...</p>
        </motion.div>
      </div>
    );
  }

  // Show error state if validation failed
  if (!validationState.isValid) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center z-[9999] p-4">
        <motion.div
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 border border-red-200"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <BiErrorCircle className="text-3xl text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          </div>
          <div className="space-y-2 mb-6">
            {validationState.errors.map((error, index) => (
              <p key={index} className="text-gray-700">
                {error.message}
              </p>
            ))}
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-[#c6080a] to-[#e63946] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
          >
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminProtected>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <title>{title}</title>
      </Helmet>

      <motion.div
        className="relative w-full h-screen overflow-hidden flex flex-col text-black bg-gradient-to-br from-gray-50 via-white to-gray-50"
        variants={layoutVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full flex-1 gap-0 flex h-screen fixed top-0 left-0 z-[999] overflow-hidden">
          {/* Mobile Menu Button */}
          <AnimatePresence>
            {!show && (
              <motion.div
                className="flex sm:hidden absolute top-5 left-4 z-[9999]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <motion.button
                  onClick={handleMobileMenuToggle}
                  className="p-2.5 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoMenu size={24} className="text-gray-700" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <motion.div
            className="hidden sm:flex transition-all duration-300"
            animate={{
              width: hide ? "5rem" : "15rem",
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Sidebar hide={hide} setHide={handleSidebarToggle} />
          </motion.div>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {show && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] sm:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleMobileMenuToggle}
                />

                {/* Mobile Sidebar */}
                <motion.div
                  className="absolute top-0 left-0 flex bg-white sm:hidden z-[999] w-[280px] h-screen pt-6 shadow-2xl"
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                  {/* Close Button */}
                  <motion.button
                    className="absolute top-4 right-4 z-[1000] p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={handleMobileMenuToggle}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IoClose size={24} className="text-gray-700" />
                  </motion.button>

                  <Sidebar hide={false} setHide={() => {}} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex flex-col w-full h-screen overflow-hidden">
            {/* Header */}
            <Header />

            {/* Content Area */}
            <motion.div
              className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50 w-full h-[calc(100vh-3.8rem)] overflow-y-auto custom-scrollbar"
              variants={contentVariants}
            >
              {/* Validation Warnings Banner */}
              <AnimatePresence>
                {validationState.warnings.length > 0 && (
                  <motion.div
                    className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded-lg"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="flex items-center gap-3">
                      <BiShieldAlt2 className="text-yellow-600 text-xl" />
                      <div className="flex-1">
                        {validationState.warnings.map((warning, index) => (
                          <p key={index} className="text-sm text-yellow-800">
                            {warning.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Page Content */}
              <div className="p-4 sm:p-6">{children}</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            #c6080a,
            #e63946
          );
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            #a00608,
            #c6080a
          );
        }
      `}</style>
    </AdminProtected>
  );
}

MainLayout.defaultProps = {
  title: "Darloo Admin - E-commerce Admin Panel | Manage Products & Orders",
  description:
    "Darloo Admin Panel is an intuitive and powerful admin interface for managing your e-commerce store. Track orders, manage products, and oversee inventory with ease. Built with MERN stack.",
  keywords:
    "E-commerce admin panel, MERN stack, Darloo Admin, product management, order management, inventory control, online store dashboard, eCommerce backend, admin dashboard, e-commerce store management, admin interface",
  author: "Salman Sadiq",
};
