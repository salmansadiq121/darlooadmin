"use client";
import { Style } from "@/app/utils/CommonStyle";
import React, { useState } from "react";
import { CgClose } from "react-icons/cg";

export default function UserModal({
  closeModal,
  setShowaddUser,
  userId,
  setUserId,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [ifscCode, setIFSCCode] = useState("");

  return (
    <div
      ref={closeModal}
      className="w-[35rem] bg-white rounded-md overflow-hidden shadow min-h-[15rem] max-h-[99%] flex flex-col"
    >
      <div className="flex items-center justify-between bg-customRed px-4 py-2 sm:py-4 ">
        <h3 className="text-lg font-medium text-white">
          {userId ? "Edit User" : "Add User"}
        </h3>
        <span
          onClick={() => {
            setUserId("");
            setShowaddUser(false);
          }}
          className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white "
        >
          <CgClose className="text-[18px]" />
        </span>
      </div>
      <div className="w-full h-[90%] overflow-y-auto ">
        <form className=" flex flex-col gap-4 px-4 py-2 mt-4 h-full w-full ">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            <div className="inputBox">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${Style.input} w-full `}
                required
              />
              <span>Name</span>
            </div>
            <div className="inputBox">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${Style.input} w-full `}
                required
              />
              <span>Email</span>
            </div>
            <div className="inputBox">
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className={`${Style.input} w-full `}
                required
              />
              <span>Contact Number</span>
            </div>
            <div className="inputBox">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>City</span>
            </div>
            <div className="inputBox">
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>State</span>
            </div>
            <div className="inputBox">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>Country</span>
            </div>
          </div>
          <div className="inputBox">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${Style.input} w-full `}
            />
            <span>Address</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            <div className="inputBox">
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>Account Number</span>
            </div>
            <div className="inputBox">
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>Account Holder</span>
            </div>
            <div className="inputBox">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>Pin Code</span>
            </div>
            <div className="inputBox">
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIFSCCode(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>IFSC Code</span>
            </div>
          </div>
          <div className="flex items-center justify-end w-full pb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setUserId("");
                  setShowaddUser(false);
                }}
                className="w-[6rem] py-[.3rem] text-[14px] rounded-sm border-2 border-customRed text-red-700 hover:bg-gray-100 hover:shadow-md hover:scale-[1.03] transition-all duration-300 "
              >
                CANCEL
              </button>
              <button className="w-[6rem] py-[.4rem] text-[14px] rounded-sm bg-customRed hover:bg-red-700 hover:shadow-md hover:scale-[1.03] transition-all duration-300 text-white">
                {userId ? "Save" : "SUBMIT"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
