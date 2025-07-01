import { Layout } from "./components/Layout/Layout";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";

const roboto = Roboto({
  style: ["italic"],
  subsets: ["latin"],
  weight: "300",
});
export const metadata = {
  title: "Weather Center",
  description: "The weather application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
