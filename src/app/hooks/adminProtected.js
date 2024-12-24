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
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user]);

  if (shouldRedirect) {
    redirect("/");
  }

  if (!user || user?.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
