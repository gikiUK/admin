import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Giki Admin",
  description: "Giki administration dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sourceSans3.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
