/** @type {import('next').NextConfig} */
const nextConfig = {
    // Other configurations...
    async headers() {
      return [
        {
          source: "/api/:path*",
          headers: [
            {
              key: "Access-Control-Allow-Origin",
              value: "https://redgreenlight-1.onrender.com", // Update this to your frontend URL
            },
            {
              key: "Access-Control-Allow-Methods",
              value: "GET, POST, PUT, DELETE, OPTIONS",
            },
            {
              key: "Access-Control-Allow-Headers",
              value: "Content-Type",
            },
          ],
        },
      ];
    },
  };
  
export default nextConfig;
