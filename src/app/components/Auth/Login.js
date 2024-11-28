"use client";
import { Style } from "@/app/utils/CommonStyle";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdOutlineAttachEmail } from "react-icons/md";
import { TbPasswordUser } from "react-icons/tb";
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { BiLoaderCircle } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "../../../../redux/features/auth/authApi";
import { useLoadUserQuery } from "../../../../redux/features/api/apiSlice";
import { useSelector } from "react-redux";

export default function Login({ setActive }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const [login, { isSuccess, error }] = useLoginMutation();
  const {
    data: userData,
    isLoading,
    refetch,
  } = useLoadUserQuery(undefined, { refetchOnMountOrArgChange: true });
  const { user } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login({ email, password }).unwrap();
      refetch();
      setLoading(false);
      router.push("/dashboard");
    } catch (err) {
      setLoading(false);
      const errorMessage = err?.data?.message || "An error occurred!";
      toast.error(errorMessage);
      console.error(err);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Login successfully!");
    }

    if (error) {
      const errorMessage = error?.data?.message || "An error occurred!";
      toast.error(errorMessage);
    }
    // eslint-disable-next-line
  }, [isSuccess, error]);

  console.log("user:", user);

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const { data } = await axios.post(
  //       `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/login`,
  //       { email, password, rememberMe },
  //       {
  //         withCredentials: true,
  //       }
  //     );
  //     if (data) {
  //       router.push("/dashboard");
  //       setAuth({ ...auth, user: data?.user, token: data?.accessToken });
  //       localStorage.setItem("auth", JSON.stringify(data));
  //       toast.success(data.message);
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     setLoading(false);
  //     toast.error(error?.response?.data?.message);
  //     if (
  //       error?.response?.data?.message === "User not found. Please login again."
  //     ) {
  //       setAuth({ user: null, token: "" });
  //       localStorage.removeItem("auth");
  //       router.push("/login");
  //     }
  //   }
  // };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-4 px-4 bg-gradient-to-r from-[#FF8A00] via-[#E52E71] to-[#FF5F6D]">
      <div className="w-[30rem] py-4 px-2 sm:px-4 bg-gray-100 shadow-md dark:bg-gray-800 rounded-md">
        <form onSubmit={handleLogin} className="">
          <div className="flex items-center justify-center flex-col gap-2 w-full">
            <Image src="/Sociallogo3.png" alt="Logo" width={60} height={60} />
            <h2 className=" text-2xl sm:text-3xl font-semibold text-center">
              Welcome to <span className="tgradient">Ayoob</span>
            </h2>
            <div className="flex flex-col gap-4 w-full mt-4 ">
              <div className="relative w-full">
                <MdOutlineAttachEmail className="absolute top-[.7rem] left-2 h-5 w-5  z-10  " />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${Style.input} pl-8`}
                />
              </div>

              <div className="relative w-full">
                <span
                  className="absolute top-[.5rem] right-2   z-10  cursor-pointer "
                  onClick={() => setShow(!show)}
                >
                  {!show ? (
                    <IoMdEyeOff className="h-6 w-6" />
                  ) : (
                    <IoEye className="h-6 w-6" />
                  )}
                </span>

                <TbPasswordUser className="absolute top-[.7rem] left-2 h-5 w-5 z-10 " />

                <input
                  type={show ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${Style.input} pl-8`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[14px]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 border rounded-sm bg-white  accent-red-600 cursor-pointer relative  "
                  />
                  Remember me
                </span>

                <span
                  onClick={() => setActive("resetPassword")}
                  className="text-[14px] text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Forgot Password
                </span>
              </div>
              {/* Button */}
              <div className="flex items-center justify-center w-full py-4 px-2 sm:px-[2rem]">
                <button type="submit" className={`${Style.button1}`}>
                  {loading ? (
                    <BiLoaderCircle className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
