/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["socialface.s3.eu-north-1.amazonaws.com"],
  },
};

export default nextConfig;
