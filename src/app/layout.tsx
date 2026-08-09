import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Suspense } from "react";
import ToastNotifications from "@/components/ToastNotifications/ToastNotifications";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FEGEPI | Federação de Games e E-Sports do Piauí",
  description: "Federação de Games e E-Sports do Piauí",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable}`}>
      <body>
        <Suspense fallback={null}><ToastNotifications /></Suspense>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
