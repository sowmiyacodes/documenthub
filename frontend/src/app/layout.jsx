// app/layout.jsx

import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}