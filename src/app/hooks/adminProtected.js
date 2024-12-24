import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";

export default function AdminProtected({ children }) {
  const { auth } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const user = auth?.user;

  useEffect(() => {
    if (!user || user?.role !== "admin") {
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [user]);

  if (shouldRedirect) {
    redirect("/");
    return null;
  }

  if (!user || user?.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
