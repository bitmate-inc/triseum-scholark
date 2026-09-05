/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
	async rewrites() {
		if (!process.env.API_SERVER_BASE_URL) {
			return [];
		}

		return [
			{
				source: "/api/:path*",
				destination: `${process.env.API_SERVER_BASE_URL.replace(/\/$/, "")}/api/:path*`,
			},
		];
	},
};

export default nextConfig;
