import { redirect } from "next/navigation";
import React from "react";
import { useAuth } from "../context/authContext";

export default function AdminProtected({ children }) {
  const { auth } = useAuth();
  const user = auth.user;

  if (!user) {
    redirect("/");
    return null;
  }

  const isAdmin = user?.role === "admin";
  if (!isAdmin) {
    redirect("/");
    return null;
  }

  return <>{children}</>;
}
