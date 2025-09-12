/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "**.alicdn.com", // supports cbu01.alicdn.com and others
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com", // example AWS
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com", // wildcard AWS bucket domains
      },
      {
        protocol: "https",
        hostname: "*.alibaba.com", // if you also need alibaba images
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;

// ------------------------------------------------------------------
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**",
//       },
//       {
//         protocol: "https",
//         hostname: "socialface.s3.eu-north-1.amazonaws.com",
//         pathname: "**",
//       },
//       {
//         protocol: "https",
//         hostname: "s3.eu-north-1.amazonaws.com",
//         pathname: "**",
//       },
//       {
//         protocol: "https",
//         hostname: "ayoob.ecom.s3.eu-north-1.amazonaws.com",
//         pathname: "**",
//       },
//       {
//         protocol: "https",
//         hostname: "cdn.shopify.com",
//         pathname: "**",
//       },
//       {
//         protocol: "https",
//         hostname: "cbu01.alicdn.com",
//         pathname: "/img/**",
//       },
//       {
//         protocol: "https",
//         hostname: "lh3.googleusercontent.com",
//         pathname: "**",
//       },
//     ],
//     domains: ["cdn.shopify.com", "lh3.googleusercontent.com"],
//   },
// };

// export default nextConfig;
