import Image from "next/image";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function BannerGallery(
  {
    // bannersData,
    // onAddBanner,
    // onDeleteBanner,
  }
) {
  const [bannersData, setBannersData] = useState([]);

  // Fetch all Banners function
  const fetchAllBanners = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/banners/fatch/banners`
      );
      console.log(data);

      if (data?.banners) {
        setBannersData(data.banners);
      }
    } catch (error) {
      console.log("Error fetching banners:", error);
    }
  };

  // Fetch blogs on component mount
  useEffect(() => {
    fetchAllBanners();
  }, []);

  return (
    <div className="relative bg-white rounded-md shadow p-4 sm:p-6">
      <div className="flex items-center gap-4 w-full justify-end">
        <button
          className={`flex text-[14px] items-center justify-center text-white bg-[#c6080a] hover:bg-red-800  py-2 rounded-md shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.03] px-4`}
        >
          ADD NEW BANNER
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
        {bannersData.map((banner) => (
          <div
            key={banner._id}
            className="relative w-full h-64 overflow-hidden rounded-lg shadow-lg shadow-red-200 border-2 border-red-300 transition-transform hover:scale-105 group"
          >
            <Image
              src={banner.image}
              alt={`Banner-${banner._id}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              unoptimized
              onError={(e) =>
                console.error("Failed to load image:", banner.image)
              }
            />

            <button
              // onClick={() => onDeleteBanner(banner.id)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Delete banner ${banner.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
