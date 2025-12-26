"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMenu, IoClose, IoSparkles, IoShieldCheckmark } from "react-icons/io5";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { BiShieldAlt2, BiErrorCircle, BiHomeAlt } from "react-icons/bi";
import { RiLoader4Line } from "react-icons/ri";
import Header from "./Header";
import Sidebar, { validateAccess as validateSidebarAccess } from "./Sidebar";
import AdminProtected from "@/app/hooks/adminProtected";
import { Helmet } from "react-helmet";
import { useAuth } from "@/app/context/authContext";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

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

  // Enforce sidebar role permissions for any /dashboard route
  if (pathname?.startsWith("/dashboard")) {
    const segments = pathname.split("/");
    const segment = segments[2] || "dashboard";

    // Normalize route segment to sidebar menu id
    let menuId = segment.toLowerCase();
    // Special-case mappings where path segment and menu id differ
    const routeToMenuIdMap = {
      "products-1688": "1688-products",
      "return-center": "return",
      "seller-settings": "seller-settings",
    };

    if (routeToMenuIdMap[menuId]) {
      menuId = routeToMenuIdMap[menuId];
    }

    const accessResult = validateSidebarAccess(user, menuId);

    if (!accessResult.hasAccess) {
      errors.push({
        type: "route_permission",
        message: `Access denied: ${accessResult.reason}`,
        severity: "error",
      });
      return { isValid: false, errors, warnings };
    }
  }

  return { isValid: true, errors, warnings };
};

// Decorative floating particles component
const FloatingParticles = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-red-400/10 to-orange-400/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Loading screen component
const LoadingScreen = () => (
  <div className="fixed inset-0 z-[9999] overflow-hidden">
    {/* Animated background gradient */}
    <motion.div
      className="absolute inset-0"
      animate={{
        background: [
          "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)",
          "linear-gradient(135deg, #16213e 0%, #0f0f0f 50%, #1a1a2e 100%)",
        ],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear",
      }}
    />

    {/* Animated mesh gradient overlay */}
    <div className="absolute inset-0 opacity-30">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle, #c6080a 0%, transparent 70%)",
          left: "20%",
          top: "30%",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
        style={{
          background: "radial-gradient(circle, #e63946 0%, transparent 70%)",
          right: "10%",
          bottom: "20%",
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>

    {/* Grid pattern overlay */}
    <div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
      }}
    />

    <FloatingParticles />

    {/* Center content */}
    <div className="relative z-10 flex items-center justify-center min-h-screen">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo/Brand area */}
        <motion.div
          className="relative"
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c6080a] to-[#e63946] flex items-center justify-center shadow-2xl shadow-red-500/30">
            <IoShieldCheckmark className="text-4xl text-white" />
          </div>
          {/* Glowing ring */}
          <motion.div
            className="absolute -inset-2 rounded-3xl border-2 border-red-500/30"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Loading spinner */}
        <div className="relative">
          <motion.div
            className="w-16 h-16 border-4 border-red-500/20 rounded-full"
            style={{ borderTopColor: "#c6080a", borderRightColor: "#e63946" }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-orange-500/20 rounded-full"
            style={{ borderBottomColor: "#f97316", borderLeftColor: "#fb923c" }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <motion.p
            className="text-white/90 font-semibold text-lg tracking-wide"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Validating Access
          </motion.p>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Status indicators */}
        <motion.div
          className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <HiOutlineStatusOnline className="text-green-400 text-lg" />
          <span className="text-white/70 text-sm">Checking permissions...</span>
        </motion.div>
      </motion.div>
    </div>
  </div>
);

// Error screen component
const ErrorScreen = ({ errors, onGoHome }) => (
  <div className="fixed inset-0 z-[9999] overflow-hidden">
    {/* Dark background with red tint */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-950/30 to-gray-900" />

    {/* Animated error glow */}
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
      style={{
        background: "radial-gradient(circle, #ef4444 0%, transparent 70%)",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.2, 0.3, 0.2],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* Grid pattern */}
    <div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
      }}
    />

    {/* Center content */}
    <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card */}
        <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-3xl p-8 border border-red-500/20 backdrop-blur-xl shadow-2xl">
          {/* Decorative top gradient line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full" />

          {/* Error icon */}
          <motion.div
            className="flex justify-center mb-6"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center">
                <BiErrorCircle className="text-5xl text-red-500" />
              </div>
              {/* Pulse ring */}
              <motion.div
                className="absolute -inset-2 rounded-full border-2 border-red-500/30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Access Denied
          </h2>
          <p className="text-gray-400 text-center text-sm mb-6">
            You don't have permission to access this resource
          </p>

          {/* Error messages */}
          <div className="space-y-3 mb-8">
            {errors.map((error, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white/90 text-sm font-medium">
                    {error.message}
                  </p>
                  <p className="text-gray-500 text-xs mt-1 capitalize">
                    {error.type?.replace(/_/g, " ")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action button */}
          <motion.button
            onClick={onGoHome}
            className="w-full relative overflow-hidden group py-4 rounded-xl font-semibold text-white transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Button background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#c6080a] via-[#e63946] to-[#c6080a] bg-[length:200%_100%] group-hover:animate-gradient-x" />
            {/* Button shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              <BiHomeAlt className="text-xl" />
              Return to Home
            </span>
          </motion.button>

          {/* Help text */}
          <p className="text-gray-500 text-xs text-center mt-4">
            If you believe this is an error, please contact your administrator
          </p>
        </div>
      </motion.div>
    </div>
  </div>
);

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
        duration: 0.4,
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
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Show loading state during validation
  if (isValidating) {
    return <LoadingScreen />;
  }

  // Show error state if validation failed
  if (!validationState.isValid) {
    return (
      <ErrorScreen
        errors={validationState.errors}
        onGoHome={() => router.push("/")}
      />
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
        className="relative w-full h-screen overflow-hidden flex flex-col text-black"
        variants={layoutVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background layers */}
        <div className="fixed inset-0 -z-10">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-100" />

          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #c6080a 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Decorative gradient blobs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-red-100/40 to-orange-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/30 to-purple-100/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
        </div>

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
                  className="relative p-3 rounded-xl overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Button background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c6080a] to-[#e63946] opacity-90 group-hover:opacity-100 transition-opacity" />
                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  {/* Shadow */}
                  <div className="absolute inset-0 shadow-lg shadow-red-500/30" />
                  <IoMenu size={24} className="relative text-white" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <motion.div
            className="hidden sm:flex transition-all duration-300 relative"
            animate={{
              width: hide ? "5rem" : "16rem",
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {/* Sidebar shadow/glow effect */}
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-black/5 pointer-events-none z-10" />
            <Sidebar hide={hide} setHide={handleSidebarToggle} />
          </motion.div>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {show && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 z-[998] sm:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleMobileMenuToggle}
                >
                  {/* Blur backdrop */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                </motion.div>

                {/* Mobile Sidebar */}
                <motion.div
                  className="absolute top-0 left-0 flex sm:hidden z-[999] w-[300px] h-screen shadow-2xl shadow-black/30"
                  initial={{ x: -300 }}
                  animate={{ x: 0 }}
                  exit={{ x: -300 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                  {/* Close Button */}
                  <motion.button
                    className="absolute top-4 right-4 z-[1000] p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all"
                    onClick={handleMobileMenuToggle}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IoClose size={22} className="text-white" />
                  </motion.button>

                  <Sidebar hide={false} setHide={() => {}} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex flex-col w-full h-screen overflow-hidden bg-transparent">
            {/* Header */}
            <Header />

            {/* Content Area */}
            <motion.div
              className="flex-1 w-full h-[calc(100vh-3.8rem)] overflow-y-auto custom-scrollbar relative"
              variants={contentVariants}
            >
              {/* Validation Warnings Banner */}
              <AnimatePresence>
                {validationState.warnings.length > 0 && (
                  <motion.div
                    className="sticky top-0 z-50 mx-4 mt-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="relative overflow-hidden rounded-xl">
                      {/* Background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-500/20" />

                      {/* Content */}
                      <div className="relative p-4 flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <BiShieldAlt2 className="text-amber-600 text-xl" />
                          </div>
                        </div>
                        <div className="flex-1">
                          {validationState.warnings.map((warning, index) => (
                            <p
                              key={index}
                              className="text-sm text-amber-800 font-medium"
                            >
                              {warning.message}
                            </p>
                          ))}
                        </div>
                        <motion.button
                          className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <IoClose className="text-amber-600" />
                        </motion.button>
                      </div>

                      {/* Animated border */}
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500"
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 5, ease: "linear" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Page Content */}
              <motion.div
                className="p-4 sm:p-6 lg:p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, #f1f5f9, #e2e8f0);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #c6080a, #e63946);
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #a00608, #c6080a);
        }

        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #c6080a #f1f5f9;
        }

        /* Gradient animation keyframes */
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }

        /* Smooth scroll behavior */
        .custom-scrollbar {
          scroll-behavior: smooth;
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
