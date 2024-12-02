"use client";

import React, { useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import axios from "axios";
import { Style } from "@/app/utils/CommonStyle";

export default function SettingModal({
  setAddSetting,
  settingId,
  setSettingId,
  type,
}) {
  const [bankAccount, setBankAccount] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  const [isloading, setIsloading] = useState(false);

  //   -----------Handle Submit--------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !thumnail) {
      toast.error("Please fill out all required fields.");
      return;
    }
    setIsloading(true);

    const productData = {
      title,
      file: thumnail,
    };

    try {
      const { data } = await axios.put(`/api/v1/setting`, productData);
      if (data) {
        console.log("Setting Data Submitted: ", productData);
        toast.success("Setting added successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsloading(false);
    }
  };

  return (
    <div className="w-[28rem] bg-white rounded-md overflow-hidden shadow min-h-[15rem] max-h-[99%] flex flex-col">
      <div className="flex items-center justify-between bg-customRed px-4 py-2 sm:py-4 ">
        <h3 className="text-lg font-medium text-white">
          {type === "account" ? "Edit Bank Account" : "Edit Pick-Up Location"}
        </h3>
        <span
          onClick={() => {
            setSettingId("");
            setAddSetting(false);
          }}
          className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white "
        >
          <CgClose className="text-[18px]" />
        </span>
      </div>
      <div className="w-full h-[98%] overflow-y-auto ">
        <form
          onSubmit={handleSubmit}
          className=" flex flex-col gap-4 px-4 py-2 mt-4 h-full w-full "
        >
          {/* --------Name---------- */}
          {type === "account" ? (
            <div className="">
              <label className="block text-sm font-medium text-gray-700">
                Bank Account<span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className={`${Style.input} w-full`}
                placeholder="Enter back account"
              />
            </div>
          ) : (
            <div className="">
              <label className="block text-sm font-medium text-gray-700">
                Pick-Up Location<span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className={`${Style.input} w-full`}
                placeholder="Enter pickup location"
              />
            </div>
          )}
          <div className="flex items-center justify-end w-full pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSettingId("");
                  setAddSetting(false);
                }}
                className="w-[6rem] py-[.3rem] text-[14px] rounded-sm border-2 border-customRed text-red-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.03] transition-all duration-300 "
              >
                CANCEL
              </button>
              <button className="w-[6rem] py-[.4rem] text-[14px] rounded-sm bg-customRed hover:bg-red-700 hover:shadow-md hover:scale-[1.03] transition-all duration-300 text-white">
                {settingId ? "Save" : "SUBMIT"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
