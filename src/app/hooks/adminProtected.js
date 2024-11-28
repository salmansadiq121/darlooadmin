import { redirect } from "next/navigation";
import React from "react";
import { useSelector } from "react-redux";

export default function AdminProtected({ children }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    redirect("/");
    return null;
  }

  const isAdmin = user.role === "admin";
  if (!isAdmin) {
    redirect("/");
    return null;
  }

  return <>{children}</>;
}
