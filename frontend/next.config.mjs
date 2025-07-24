/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "backend-2-hqgo.onrender.com",
        pathname: "/api/video/thumbnail", // allow specific API thumbnail route
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/api/video/thumbnail",
      },
    ],
  },
};

export default nextConfig;
