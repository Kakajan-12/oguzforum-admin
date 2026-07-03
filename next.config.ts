import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.oguzforum.com",
                port: "",
                pathname: "/uploads/**",
            },
            // Local dev uploads
            {
                protocol: "http",
                hostname: "localhost",
                pathname: "/uploads/**",
            },
        ],
    },
};

export default nextConfig;
