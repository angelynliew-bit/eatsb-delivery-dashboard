import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EATSB Delivery Dashboard",
  description: "Order and delivery tracking dashboard for East Asian Traders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
