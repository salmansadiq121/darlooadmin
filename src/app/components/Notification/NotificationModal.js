"use client";
import { Style } from "@/app/utils/CommonStyle";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoCameraOutline } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import axios from "axios";
import JoditEditor from "jodit-react";
import { users } from "../DummyData/DummyData";
import Select from "react-select";

export default function NotificationModal({
  closeModal,
  setAddNotification,
  notificationId,
  setNotificationId,
}) {
  const [usersData, setUsersData] = useState([...users]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [emails, setEmails] = useState([]);
  const editor = useRef(null);
  const [usersOptions, setUsersOptions] = useState([]);
  const [isloading, setIsloading] = useState(false);

  console.log("emails:", emails);

  useEffect(() => {
    if (usersData && Array.isArray(usersData)) {
      const formattedOptions = usersData.map((user) => ({
        value: user.email,
        label: user.name,
      }));
      setUsersOptions(formattedOptions);
    }
  }, [usersData]);

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
    height: 450,
    width: 1000,
    color: "#111",
    placeholder: "Write content here...",
  };
  //   Handle Multiple Select Emails
  //   const handleChange = (selectedOptions) => {
  //     const selectedEmails = selectedOptions
  //       ? selectedOptions.map((option) => option.value)
  //       : [];

  //     const updatedEmails = Array.from(new Set([...emails, ...selectedEmails]));

  //     setEmails(updatedEmails);
  //   };
  return (
    <div
      //   ref={closeModal}
      className="w-[40rem] bg-white rounded-md overflow-hidden shadow min-h-[15rem] max-h-[99%] flex flex-col"
    >
      <div className="flex items-center justify-between bg-customRed px-4 py-2 sm:py-4 ">
        <h3 className="text-lg font-medium text-white">
          {notificationId ? "Edit Notification" : "Add Notification"}
        </h3>
        <span
          onClick={() => {
            setNotificationId("");
            setAddNotification(false);
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
          {/* Left */}
          <div className="flex flex-col gap-4">
            {/* --------Name---------- */}
            <div className="">
              <label className="block text-sm font-medium text-gray-700">
                Subject<span className="text-red-700">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`${Style.input} w-full`}
                placeholder="Enter Subject"
                required
              />
            </div>
            {/* Users */}
            <div className="">
              <label className="block text-sm font-medium text-gray-700">
                Emails
              </label>
              <Select
                options={usersOptions}
                value={emails}
                onChange={setEmails}
                isMulti
                placeholder="Select Users"
              />
            </div>

            {/*  */}
          </div>
          {/* Description */}
          <JoditEditor
            ref={editor}
            value={content}
            config={config}
            color="#fff"
            tabIndex={1}
            onBlur={(newContent) => setContent(newContent)}
          />

          <div className="flex items-center justify-end w-full pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setNotificationId("");
                  setAddNotification(false);
                }}
                className="w-[6rem] py-[.3rem] text-[14px] rounded-sm border-2 border-customRed text-red-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.03] transition-all duration-300 "
              >
                CANCEL
              </button>
              <button className="w-[6rem] py-[.4rem] text-[14px] rounded-sm bg-customRed hover:bg-red-700 hover:shadow-md hover:scale-[1.03] transition-all duration-300 text-white">
                {notificationId ? "Save" : "SUBMIT"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
