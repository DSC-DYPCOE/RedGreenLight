import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// app/layout.js
export const metadata = {
  title: "Type or Die",
  description: "Master touch typing in the most thrilling way possible!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}

