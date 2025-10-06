"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/authContext";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import SocketHandler from "./context/SocketHandler";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="author" content="Darloo" />
        <meta name="description" content="Admin Panel for Darloo" />
        <meta name="keywords" content="admin, panel, darloo" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://darloo.com" />

        {/* 🔒 Important for AliCDN / local IP image fixes */}
        <meta name="referrer" content="no-referrer" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
        />
        <meta httpEquiv="Cross-Origin-Resource-Policy" content="cross-origin" />
        <meta httpEquiv="Cross-Origin-Embedder-Policy" content="unsafe-none" />
        <meta
          httpEquiv="Cross-Origin-Opener-Policy"
          content="same-origin-allow-popups"
        />
        <title>Darloo - Admin Panel</title>
      </head>
      <body
        className={`${inter.className} w-full min-h-screen bg-white  text-black`}
      >
        <AuthProvider>
          <main className="overflow-x-hidden">{children}</main>
          <Toaster />
          <SocketHandler />
          <Tooltip
            id="my-tooltip"
            place="bottom"
            effect="solid"
            className="!bg-gradient-to-r !from-red-500 !via-red-500 !to-yellow-500 !text-white !text-[11px] !py-1 !px-2"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
