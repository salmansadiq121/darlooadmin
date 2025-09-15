/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["*"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "cbu01.alicdn.com",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;

// export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "cbu01.alicdn.com", // 1688 images
//       },
//       {
//         protocol: "https",
//         hostname: "s3.eu-north-1.amazonaws.com", // AWS S3
//       },
//       {
//         protocol: "https",
//         hostname: "your-cloudfront-domain.cloudfront.net", // CloudFront
//       },
//       {
//         protocol: "https",
//         hostname: "cdn.shopify.com",
//         pathname: "**",
//       },
//       {
//         protocol: "https",
//         hostname: "avatars.githubusercontent.com", // GitHub avatars
//       },
//       {
//         protocol: "https",
//         hostname: "raw.githubusercontent.com", // GitHub raw files
//       },
//       {
//         protocol: "https",
//         hostname: "user-images.githubusercontent.com", // GitHub repo assets
//       },
//     ],
//   },
//   reactStrictMode: true,
// };

// export default nextConfig;
