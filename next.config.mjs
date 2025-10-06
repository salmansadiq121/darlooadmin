/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   webpack(config) {
//     config.module.rules.push({
//       test: /\.svg$/,
//       use: ["@svgr/webpack"],
//     });
//     return config;
//   },
//   images: {
//     unoptimized: true,
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "darloo.com",
//         port: "",
//         pathname: "/**",
//       },
//       {
//         protocol: "https",
//         hostname: "secure.gravatar.com",
//       },
//       {
//         protocol: "https",
//         hostname: "flagcdn.com",
//       },
//     ],
//   },

//   webpack: (config, context) => {
//     config.externals.push({
//       "thread-stream": "commonjs thread-stream",
//     });
//     return config;
//   },
//   staticPageGenerationTimeout: 280,
// };

// export default nextConfig;
