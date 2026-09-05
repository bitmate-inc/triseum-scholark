import "../asset/style/globals.css";

import type { Metadata } from "next";
import localFont from "next/font/local";

import { StoreProvider } from "../feature/api/client/provider/store-provider";
import { SiteFooter } from "../feature/layout/shared/component/site-footer";
import { SiteHeader } from "../feature/layout/shared/component/site-header";

const geistSans = localFont({
	src: "../asset/font/geist-vf.woff",
	variable: "--font-geist-sans",
});
const geistMono = localFont({
	src: "../asset/font/geist-mono-vf.woff",
	variable: "--font-geist-mono",
});

export const metadata: Metadata = {
	title: "ScholArk · Games for serious learning",
	description:
    "Discover educational games built for universities, classrooms, and curious minds.",
	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<StoreProvider>
					<SiteHeader/>
					{children}
					<SiteFooter/>
				</StoreProvider>
			</body>
		</html>
	);
}
