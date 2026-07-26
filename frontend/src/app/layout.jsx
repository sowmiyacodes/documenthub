// app/layout.jsx

import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "LifeHub AI",
  description: "Your Intelligent Personal Digital Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
      </body>
    </html>
  );
}