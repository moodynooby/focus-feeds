/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		formats: ["image/webp", "image/avif"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.google.com",
			},
		],
	},
};

export default nextConfig;
