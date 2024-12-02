"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import dynamic from "next/dynamic";
const MainLayout = dynamic(
  () => import("./../../../components/layout/MainLayout"),
  {
    ssr: false,
  }
);
const Breadcrumb = dynamic(() => import("./../../../utils/Breadcrumb"), {
  ssr: false,
});
const SettingModal = dynamic(
  () => import("./../../../components/Settings/SettingModal"),
  {
    ssr: false,
  }
);

export default function Settings() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [settingId, setSettingId] = useState("");
  const [addSetting, setAddSetting] = useState(false);
  const [type, setType] = useState("");

  // Page URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathArray = window.location.pathname;
      setCurrentUrl(pathArray);
    }
    // exlint-disable-next-line
  }, []);
  return (
    <MainLayout>
      <div className="p-1 sm:p-2 px-1 sm:px-6 h-[100%] w-full pb-4 scroll-smooth">
        <div className="flex flex-col pb-2 h-full">
          <Breadcrumb path={currentUrl} />
          <div className="flex flex-col gap-4 mt-4  w-full h-full">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-sans font-semibold text-black">
                Settings
              </h1>
            </div>
            {/*  */}
            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden w-full  py-3 sm:py-4 bg-white rounded-md shadow px-3 sm:px-4  overflow-y-auto shidden">
                <div className="flex flex-col gap-2">
                  <h3 className="text-md font-semibold text-gray-900">
                    Setup / Edit Bank Account
                  </h3>
                  <div className="flex items-center flex-wrap gap-4 ">
                    <div className="flex flex-col gap-3 p-4 rounded-md bg-red-100">
                      <span className="text-[14px] text-gray-600 flex items-center gap-2">
                        Setup / Edit Bank Account{" "}
                        <AiOutlineExclamationCircle className="text-gray-500 hover:text-gray-700 cursor-pointer text-[17px]" />
                      </span>
                      <span className="text-[14px] text-gray-600">
                        **** **** **** 7685
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setType("account");
                        setAddSetting("true");
                      }}
                      className={`flex text-[15px] w-[9rem] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800  py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03]`}
                    >
                      EDIT ACCOUNT
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden w-full  py-3 sm:py-4 bg-white rounded-md shadow px-3 sm:px-4  overflow-y-auto shidden">
                <div className="flex flex-col gap-2">
                  <h3 className="text-md font-semibold text-gray-900">
                    Setup / Edit Pick-Up Location
                  </h3>
                  <div className="flex items-center flex-wrap gap-4 ">
                    <div className="flex flex-col gap-3 p-4 rounded-md bg-red-100">
                      <span className="text-[14px] text-gray-600 flex items-center gap-2">
                        Setup / Edit Pick-Up Location{" "}
                        <AiOutlineExclamationCircle className="text-gray-500 hover:text-gray-700 cursor-pointer text-[17px]" />
                      </span>
                      <span className="text-[14px] text-gray-600">
                        29 Street, NY 21342
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setType("address");
                        setAddSetting("true");
                      }}
                      className={`flex text-[15px] w-[9rem] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800  py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03]`}
                    >
                      EDIT ACCOUNT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* -------------Handle Setting Modal------------ */}
        {addSetting && (
          <div className="fixed top-0 left-0 p-2 sm:p-4 w-full h-full flex items-center justify-center z-[9999999] bg-gray-300/80 overflow-y-auto shidden">
            <SettingModal
              setAddSetting={setAddSetting}
              settingId={settingId}
              setSettingId={setSettingId}
              type={type}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
