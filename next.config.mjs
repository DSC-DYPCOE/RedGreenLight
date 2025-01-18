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
              value: "*"  // Or your specific domain
            },
            {
              key: "Access-Control-Allow-Methods",
              value: "GET, POST, PUT, DELETE, OPTIONS"
            },
            {
              key: "Access-Control-Allow-Headers",
              value: "Content-Type"
            }
          ]
        }
      ];
    },
  };
  
export default nextConfig;
