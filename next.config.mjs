/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export
  output: process.env.NEXT_EXPORT === "true" ? "export" : undefined,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },

  ...(process.env.NEXT_EXPORT === "true" && {
    trailingSlash: true,
  }),
};

export default nextConfig;
