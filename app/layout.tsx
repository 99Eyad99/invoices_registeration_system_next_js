import type { Metadata } from "next";
import Providers from "./Providers";
import "./globals.css";

export const metadata: Metadata = { title: process.env.NEXT_PUBLIC_APP_NAME || "Invoice Management" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
