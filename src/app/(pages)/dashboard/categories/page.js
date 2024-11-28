"use client";
import { categories } from "@/app/components/DummyData/DummyData";
import MainLayout from "@/app/components/layout/MainLayout";
import Breadcrumb from "@/app/utils/Breadcrumb";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { MdDelete, MdModeEditOutline, MdNotInterested } from "react-icons/md";

export default function Categories() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryData, setCategoryData] = useState([...categories]);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch Page Link
  useEffect(() => {
    const pathArray = window.location.pathname;
    setCurrentUrl(pathArray);

    // exlint-disable-next-line
  }, []);

  useEffect(() => {
    setFilteredData(categoryData);
  }, [categoryData]);

  const handleSearch = (value) => {
    setSearchQuery(value);
    let filtered = categoryData;
    if (!value) {
      setFilteredData(categoryData);
      return;
    }

    if (value) {
      const lowercasedSearch = value.toLowerCase();
      filtered = filtered.filter((category) => {
        const { name = "" } = category;

        return name.toLowerCase().includes(lowercasedSearch);
      });
    }

    setFilteredData(filtered);
  };

  return (
    <MainLayout>
      <div className="p-1 sm:p-2 px-1 sm:px-6 h-[100%] w-full pb-4 scroll-smooth">
        <div className="flex flex-col pb-2 h-full">
          <Breadcrumb path={currentUrl} />
          <div className="flex flex-col gap-4 mt-4  w-full h-full">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-sans font-semibold text-black">
                Categories
              </h1>
              <div className="flex items-center gap-4">
                <button className="text-[14px] py-2 px-4 hover:border-2 hover:rounded-md hover:shadow-md hover:scale-[1.03] text-gray-600 hover:text-gray-800 border-b-2 border-gray-600 transition-all duration-300 ">
                  Delete All
                </button>
                <button
                  className={`flex text-[14px] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800  py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] px-4`}
                >
                  ADD NEW CATEGORY
                </button>
              </div>
            </div>
            {/*  */}
            <div className=" relative overflow-hidden w-full h-[93%] py-3 sm:py-4 bg-white rounded-md shadow  px-2 sm:px-4 mt-4 overflow-y-auto shidden ">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="relative">
                  <span className="absolute top-2 left-[.4rem] z-10">
                    <IoSearch className="text-[18px] text-gray-500" />
                  </span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search"
                    className="w-[17rem] h-[2.2rem] rounded-md border border-gray-400 focus:border-red-600 outline-none px-2 pl-[1.8rem] text-[12px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 gap-3 sm:gap-4 mt-4">
                {filteredData?.map((category) => (
                  <div
                    key={category?.id}
                    className=" relative  flex flex-col items-center justify-center p-4 rounded-md bg-gradient-to-tr from-red-50 to-grey-500 shadow hover:bg-red-100 hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <div className="absolute top-2 right-1 z-20 flex flex-col gap-2">
                      <span className="p-1 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-all duration-300 hover:scale-[1.03]">
                        <MdModeEditOutline className="text-[14px] text-white" />
                      </span>
                      <span className="p-1 bg-sky-200 hover:bg-sky-300 rounded-full transition-all duration-300 hover:scale-[1.03]">
                        <MdNotInterested className="text-[14px] text-sky-500 hover:text-sky-600" />
                      </span>
                      <span className="p-1 bg-red-200 hover:bg-red-300   rounded-full transition-all duration-300 hover:scale-[1.03]">
                        <MdDelete className="text-[14px] text-red-500 hover:text-red-600" />
                      </span>
                    </div>
                    <div className="w-[5.4rem] h-[5.4rem] relative rounded-full overflow-hidden flex items-center justify-center">
                      <Image
                        src={category?.image_id}
                        layout="fill"
                        alt={"Avatar"}
                        className="w-full h-full "
                      />
                    </div>
                    <h3 className="text-[16px] text-gray-800 font-medium">
                      {category?.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
            {/*  */}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
