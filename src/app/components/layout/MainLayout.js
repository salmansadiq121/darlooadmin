"use client";
import React, { useEffect, useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AdminProtected from "@/app/hooks/adminProtected";

export default function MainLayout({ children }) {
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);

  return (
    <AdminProtected>
      <div className="relative w-full h-screen overflow-hidden flex flex-col text-black ">
        <div className=" w-full flex-1 gap-0 flex h-screen  fixed top-0 left-0 z-[999] overflow-hidden">
          {!show && (
            <div className=" flex sm:hidden  absolute top-5 left-2 z-[9999]">
              <IoMenu
                onClick={() => setShow(true)}
                size={25}
                className="hover:text-blue-500 transition-all duration-150"
              />
            </div>
          )}
          <div
            className={`hidden sm:flex  transition-all duration-200  ${
              hide ? "w-[5rem]" : "w-[15rem]"
            }`}
          >
            <Sidebar hide={hide} setHide={setHide} />
          </div>
          {show && (
            <div className=" absolute top-0 left-0 flex  bg-white sm:hidden z-[999] w-[13rem] pt-[0rem]">
              <div className="absolute top-2 right-2 z-[999] transition-all duration-300 hover:text-red-600">
                <IoClose
                  onClick={() => setShow(false)}
                  size={25}
                  className=""
                />
              </div>
              <Sidebar />
            </div>
          )}
          <div className="flex flex-col w-full h-screen overflow-hidden">
            <Header />
            <div className="flex-[1.8] bg-gray-100 w-full h-[calc(100vh-3.8rem)]  overflow-y-auto shidden  ">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AdminProtected>
  );
}
