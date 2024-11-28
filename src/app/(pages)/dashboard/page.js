"use client";
import React, { useEffect, useState } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import Breadcrumb from "@/app/utils/Breadcrumb";

export default function Dashboard() {
  const [currentUrl, setCurrentUrl] = useState("");
  useEffect(() => {
    const pathArray = window.location.pathname;
    setCurrentUrl(pathArray);
  }, []);

  return (
    <MainLayout>
      <div className="p-1 sm:p-2 h-full w-full">
        <Breadcrumb path={currentUrl} />
      </div>
    </MainLayout>
  );
}
