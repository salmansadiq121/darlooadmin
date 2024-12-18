"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineMenuFold } from "react-icons/ai";
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { LuLayoutDashboard } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { LuWarehouse } from "react-icons/lu";
import { AiOutlineProduct } from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
import { HiOutlineNewspaper } from "react-icons/hi2";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { BsChatRightText } from "react-icons/bs";

export default function Sidebar({ hide, setHide }) {
  const router = useRouter();
  const [active, setActive] = useState("");

  useEffect(() => {
    const pathArray = window.location.pathname.split("/");
    const fileIdFromPath = pathArray[2];
    setActive(fileIdFromPath ? fileIdFromPath : "dashboard");

    // exlint-disable-next-line
  }, [setActive]);

  return (
    <div className="w-full h-screen py-2 border-r border-gray-200 bg-white text-black">
      <div className="flex items-center justify-center w-full relative px-4 py-2 ">
        {hide ? (
          <div className="">
            <h1 className="text-center text-xl mt-[1rem] font-serif font-semibold text-[#c6080a]">
              Logo
            </h1>
          </div>
        ) : (
          <h1 className=" text-center text-3xl font-serif font-semibold text-[#c6080a]">
            Ayoob
          </h1>
        )}
        <div className=" absolute top-1 right-1 z-30 hidden sm:flex items-center justify-end pr-1 ">
          {hide ? (
            <AiOutlineMenuUnfold
              onClick={() => setHide(!hide)}
              className="text-[20px] cursor-pointer hover:text-red-600 transition-all duration-300"
            />
          ) : (
            <AiOutlineMenuFold
              onClick={() => setHide(!hide)}
              className="text-[20px] cursor-pointer hover:text-red-600 transition-all duration-300"
            />
          )}
        </div>
      </div>
      {/* border-2 border-red-600  */}
      <div className="relative w-full h-[calc(100vh-10.5vh)] sm:h-[calc(100vh-7.5vh)] overflow-y-auto scroll-smooth py-3 pb-[2rem]">
        <div className="flex flex-col gap-3 px-3 ">
          {/* 1 */}

          <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "dashboard" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "dashboard" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300`}
            >
              {hide ? (
                <LuLayoutDashboard
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "dashboard" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <LuLayoutDashboard
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "dashboard" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "dashboard" && "#fff" }}
                  >
                    Dashboard
                  </span>
                </div>
              )}
            </div>
          </div>
          <hr className="w-full h-[1px] bg-gray-400" />
          {/* user */}
          <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "users" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard/users");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "users" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300`}
            >
              {hide ? (
                <FiUsers
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "users" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <FiUsers
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "users" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "users" && "#fff" }}
                  >
                    Users
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Product */}
          <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "products" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard/products");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "products" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300 `}
            >
              {hide ? (
                <LuWarehouse
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "products" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <LuWarehouse
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "products" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "products" && "#fff" }}
                  >
                    Products
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Categories */}
          <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "categories" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard/categories");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "categories" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300 `}
            >
              {hide ? (
                <AiOutlineProduct
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "categories" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <AiOutlineProduct
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "categories" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "categories" && "#fff" }}
                  >
                    Categories
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Orders */}
          <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "orders" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard/orders");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "orders" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300 `}
            >
              {hide ? (
                <BsBoxSeam
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "orders" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsBoxSeam
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "orders" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "orders" && "#fff" }}
                  >
                    Orders
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Orders */}
          <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "orders" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard/chat");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "chat" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300 `}
            >
              {hide ? (
                <BsChatRightText
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "chat" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <BsChatRightText
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "chat" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "chat" && "#fff" }}
                  >
                    Chat
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Blogs */}
          <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "blogs" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard/blogs");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "blogs" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300 `}
            >
              {hide ? (
                <HiOutlineNewspaper
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "blogs" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <HiOutlineNewspaper
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "blogs" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "blogs" && "#fff" }}
                  >
                    Blogs
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Notifications */}
          <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "notifications" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard/notifications");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "notifications" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300 `}
            >
              {hide ? (
                <MdOutlineNotificationsActive
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "notifications" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <MdOutlineNotificationsActive
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "notifications" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "notifications" && "#fff" }}
                  >
                    Notifications
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Term & Policy */}
          <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "privacy" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard/privacy");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "privacy" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300 `}
            >
              {hide ? (
                <MdOutlinePrivacyTip
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "privacy" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <MdOutlinePrivacyTip
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "privacy" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "privacy" && "#fff" }}
                  >
                    Term & Policy
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <hr className="w-full h-[1px] bg-gray-300" />
          <div
            className={` relative h-[2.4rem] rounded-md cursor-pointer hover:shadow-md   shadow-gray-300 ${
              active === "settings" ? "bg-[#c6080a]" : "bg-white"
            }  filter hover:drop-shadow-md  overflow-hidden transition-all duration-300`}
            onClick={() => {
              router.push("/dashboard/settings");
            }}
          >
            <div
              className={`relative w-full h-full flex items-center ${
                active === "settings" ? "bg-[#c6080a]" : "bg-white"
              } px-2 z-30 bg-transparent hover:bg-[#c6080a] hover:text-white transition-all duration-300 `}
            >
              {hide ? (
                <IoSettingsOutline
                  className="h-5 w-5 cursor-pointer ml-2"
                  style={{ color: active === "settings" && "#fff" }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <IoSettingsOutline
                    className="h-5 w-5 cursor-pointer ml-2"
                    style={{ color: active === "settings" && "#fff" }}
                  />
                  <span
                    className="text-[14px] font-[400]"
                    style={{ color: active === "settings" && "#fff" }}
                  >
                    Settings
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
