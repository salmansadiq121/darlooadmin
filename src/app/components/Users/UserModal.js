"use client";
import { Style } from "@/app/utils/CommonStyle";
import React, { useEffect, useMemo, useState } from "react";
import { CgClose } from "react-icons/cg";
import toast from "react-hot-toast";
import axios from "axios";
import { FaSpinner } from "react-icons/fa6";
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiHome,
  FiFlag,
  FiHash,
  FiCreditCard,
  FiUserCheck,
} from "react-icons/fi";

export default function UserModal({
  closeModal,
  setShowAddUser,
  userId,
  setUserId,
  fetchUsers,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [number, setNumber] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [ifscCode, setIFSCCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // -------Get User Info--------->
  const getUserInfo = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/userDetail/${userId}`
      );
      if (data) {
        setName(data.user.name);
        setEmail(data.user.email);
        setNumber(data.user.number);
        setPincode(data.user.addressDetails.pincode);
        setCity(data.user.addressDetails.city);
        setState(data.user.addressDetails.state);
        setCountry(data.user.addressDetails.country);
        setAddress(data.user.addressDetails.address);
        setAccountNumber(data.user.bankDetails.accountNumber);
        setAccountHolder(data.user.bankDetails.accountHolder);
        setIFSCCode(data.user.bankDetails.ifscCode);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserInfo();
    // eslint-disable-next-line
  }, [userId]);

  // -----------handle User--------
  const handleUser = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) validationErrors.name = "Name is required";
    if (!email.trim() || !emailRegex.test(email))
      validationErrors.email = "Valid email is required";
    if (!number.trim()) validationErrors.number = "Contact number is required";
    if (!country.trim()) validationErrors.country = "Country is required";
    if (!address.trim()) validationErrors.address = "Address is required";

    // For new user ensure password
    if (!userId && !password.trim()) {
      validationErrors.password = "Password is required for new users";
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      toast.error("Please fix validation errors");
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      if (userId) {
        const { data } = await axios.put(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/update/userInfo/${userId}`,
          {
            name,
            email,
            password,
            number,
            addressDetails: { pincode, city, state, country, address },
            bankDetails: { accountNumber, accountHolder, ifscCode },
          }
        );

        if (data) {
          fetchUsers();
          toast.success(data?.message || "User info updated successfully");
          setShowAddUser(false);
        }
      } else {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/add/user`,
          {
            name,
            email,
            password,
            number,
            addressDetails: { pincode, city, state, country, address },
            bankDetails: { accountNumber, accountHolder, ifscCode },
          }
        );

        if (data) {
          fetchUsers();
          toast.success(data?.message || "User added successfully");
          setShowAddUser(false);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const helperText = useMemo(
    () => ({
      name: "Enter full name",
      email: "We will never share your email",
      number: "Include country code if applicable",
      password: userId ? "Leave blank to keep current password" : "At least 6 characters",
      address: "Street and house number",
    }),
    [userId]
  );

  return (
    <div
      ref={closeModal}
      className="w-[38rem] bg-white rounded-md overflow-hidden shadow min-h-[15rem] max-h-[99%] flex flex-col"
    >
      <div className="flex items-center justify-between bg-customRed px-4 py-2 sm:py-4 ">
        <h3 className="text-lg font-medium text-white">
          {userId ? "Edit User" : "Add User"}
        </h3>
        <span
          onClick={() => {
            setUserId("");
            setShowAddUser(false);
          }}
          className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white "
        >
          <CgClose className="text-[18px]" />
        </span>
      </div>
      <div className="w-full h-[90%] overflow-y-auto ">
        <form
          onSubmit={handleUser}
          className=" flex flex-col gap-4 px-4 py-2 mt-4 h-full w-full "
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            <div className="inputBox relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${Style.input} w-full `}
                required
              />
              <span>Name</span>
              <FiUser className="absolute right-3 top-3 text-gray-400" />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
              <p className="text-[11px] text-gray-500 mt-1">
                {helperText.name}
              </p>
            </div>
            <div className="inputBox relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${Style.input} w-full `}
                required
              />
              <span>Email</span>
              <FiMail className="absolute right-3 top-3 text-gray-400" />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
              <p className="text-[11px] text-gray-500 mt-1">
                {helperText.email}
              </p>
            </div>
            <div className="inputBox relative">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${Style.input} w-full`}
              />
              <span>Password</span>
              <FiLock className="absolute right-3 top-3 text-gray-400" />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
              <p className="text-[11px] text-gray-500 mt-1">
                {helperText.password}
              </p>
            </div>
            <div className="inputBox relative">
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className={`${Style.input} w-full `}
                required
              />
              <span>Contact Number</span>
              <FiPhone className="absolute right-3 top-3 text-gray-400" />
              {errors.number && (
                <p className="text-xs text-red-500 mt-1">{errors.number}</p>
              )}
            </div>
            <div className="inputBox relative">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>City</span>
              <FiMapPin className="absolute right-3 top-3 text-gray-400" />
            </div>
            <div className="inputBox relative">
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>State</span>
              <FiMapPin className="absolute right-3 top-3 text-gray-400" />
            </div>
            <div className="inputBox relative">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>Country</span>
              <FiFlag className="absolute right-3 top-3 text-gray-400" />
              {errors.country && (
                <p className="text-xs text-red-500 mt-1">{errors.country}</p>
              )}
            </div>
            <div className="inputBox relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>Address</span>
              <FiHome className="absolute right-3 top-3 text-gray-400" />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
              )}
              <p className="text-[11px] text-gray-500 mt-1">
                {helperText.address}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            <div className="inputBox relative">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>Pin Code</span>
              <FiHash className="absolute right-3 top-3 text-gray-400" />
            </div>
            <div className="inputBox relative">
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>Account Number</span>
              <FiCreditCard className="absolute right-3 top-3 text-gray-400" />
            </div>
            <div className="inputBox relative">
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>Account Holder</span>
              <FiUserCheck className="absolute right-3 top-3 text-gray-400" />
            </div>

            <div className="inputBox relative">
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIFSCCode(e.target.value)}
                className={`${Style.input} w-full `}
              />
              <span>IFSC Code</span>
              <FiHash className="absolute right-3 top-3 text-gray-400" />
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
              <button
                disabled={loading}
                className="w-[6rem] py-[.4rem] text-[14px] flex items-center justify-center rounded-sm bg-customRed hover:bg-red-700 hover:shadow-md hover:scale-[1.03] transition-all duration-300 text-white"
              >
                {loading ? (
                  <span>
                    <FaSpinner className="h-5 w-5 text-white animate-spin" />
                  </span>
                ) : (
                  <span>{userId ? "Save" : "SUBMIT"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
