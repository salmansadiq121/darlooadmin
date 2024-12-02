"use client";

import React, { useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import axios from "axios";
import JoditEditor from "jodit-react";

export default function PrivacyModal({
  setAddPrivacy,
  privacyId,
  setPrivacyId,
}) {
  const [description, setDescription] = useState("");
  const editor = useRef(null);

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
      const { data } = await axios.post(
        `/api/v1/products/create/product`,
        productData
      );
      if (data) {
        console.log("Blog Data Submitted: ", productData);
        toast.success("Blog added successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsloading(false);
    }
  };

  // Editor configuration
  const config = {
    readonly: false,
    contentCss: "body { color: red; }",
    height: 550,
    width: 1000,
    color: "#111",
    placeholder: "Write privacy here...",
  };
  return (
    <div className="w-[44rem] bg-white rounded-md overflow-hidden shadow min-h-[15rem] max-h-[99%] flex flex-col">
      <div className="flex items-center justify-between bg-customRed px-4 py-2 sm:py-4 ">
        <h3 className="text-lg font-medium text-white">
          {privacyId ? "Edit Privacy" : "Add New Privacy"}
        </h3>
        <span
          onClick={() => {
            setPrivacyId("");
            setAddPrivacy(false);
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
          {/* Description */}
          <JoditEditor
            ref={editor}
            value={description}
            config={config}
            color="#fff"
            tabIndex={1}
            onBlur={(newContent) => setDescription(newContent)}
          />

          <div className="flex items-center justify-end w-full pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setPrivacyId("");
                  setAddPrivacy(false);
                }}
                className="w-[6rem] py-[.3rem] text-[14px] rounded-sm border-2 border-customRed text-red-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.03] transition-all duration-300 "
              >
                CANCEL
              </button>
              <button className="w-[6rem] py-[.4rem] text-[14px] rounded-sm bg-customRed hover:bg-red-700 hover:shadow-md hover:scale-[1.03] transition-all duration-300 text-white">
                {privacyId ? "Save" : "SUBMIT"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
