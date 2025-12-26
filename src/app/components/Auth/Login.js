"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdOutlineAttachEmail } from "react-icons/md";
import { TbPasswordUser } from "react-icons/tb";
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { BiLoaderCircle } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";

export default function Login({ setActive }) {
  const { auth, setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  // Redirect if the user is already logged in
  useEffect(() => {
    if (auth?.token && auth?.user) {
      // Determine redirect path based on role and verification status
      let redirectPath = "/dashboard";

      if (auth.user.role === "seller") {
        // Check if seller is verified
        const isVerified = auth.user.sellerStatus === "approved";

        if (!isVerified) {
          // Unverified sellers can only access profile section
          redirectPath = "/dashboard/Profile";
        }
      }

      router.push(redirectPath);
    }

    // eslint-disable-next-line
  }, [auth, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/login`,
        {
          email,
          password,
          rememberMe,
        }
      );
      if (data) {
        if (data?.user?.role !== "user") {
          // Determine redirect path based on role and verification status
          let redirectPath = "/dashboard";

          if (data.user.role === "seller") {
            // Check if seller is verified
            const isVerified = data.user.sellerStatus === "approved";

            if (isVerified) {
              // Verified sellers can access dashboard
              redirectPath = "/dashboard";
            } else {
              // Unverified sellers can only access profile section
              redirectPath = "/dashboard/Profile";

              // Show informative message for unverified sellers
              toast.success(
                data.message +
                  " Please complete verification to access all features.",
                { duration: 4000 }
              );
            }
          } else {
            // Non-seller roles go to dashboard
            redirectPath = "/dashboard";
          }

          setAuth({ ...auth, user: data?.user, token: data?.token });
          localStorage.setItem("auth", JSON.stringify(data));

          if (
            data.user.role !== "seller" ||
            data.user.sellerStatus === "approved"
          ) {
            toast.success(data.message);
          }

          router.push(redirectPath);
          setLoading(false);
        } else {
          toast.error("You are not authorized to access this dashboard.");
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message);
      if (
        error?.response?.data?.message === "User not found. Please login again."
      ) {
        setAuth({ user: null, token: "" });
        localStorage.removeItem("auth");
        router.push("/login");
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-8 px-4 bg-gradient-to-br from-slate-50 via-red-50 to-red-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl blur-xl opacity-20 animate-pulse"></div>
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-br from-red-600 to-red-700 rounded-sm"></div>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <h2 className="text-xl font-semibold text-gray-700">
                  Sign in to{" "}
                  <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent font-bold">
                    Darloo
                  </span>
                </h2>
                <p className="text-sm text-gray-500">
                  Access your admin dashboard
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative">
                    <MdOutlineAttachEmail className="absolute top-5 left-4 h-5 w-5 text-gray-400 z-10 group-focus-within:text-red-600 transition-colors duration-200" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative">
                    <TbPasswordUser className="absolute top-5 left-4 h-5 w-5 text-gray-400 z-10 group-focus-within:text-red-600 transition-colors duration-200" />
                    <input
                      type={show ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      value={password}
                      minLength={8}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute top-5 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                    >
                      {!show ? (
                        <IoMdEyeOff className="h-5 w-5" />
                      ) : (
                        <IoEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-md border-2 transition-all duration-200 ${
                        rememberMe
                          ? "bg-gradient-to-r from-red-600 to-red-700 border-transparent shadow-md"
                          : "border-gray-300 bg-white group-hover:border-red-400 group-hover:shadow-sm"
                      }`}
                    >
                      {rememberMe && (
                        <svg
                          className="w-3 h-3 text-white absolute top-1 left-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200 select-none">
                    Remember me
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <BiLoaderCircle className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In to Dashboard</span>
                  )}
                </div>
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <span>Secured with 256-bit SSL encryption</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
