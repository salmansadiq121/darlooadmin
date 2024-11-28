/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["socialface.s3.eu-north-1.amazonaws.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "socialface.s3.eu-north-1.amazonaws.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
