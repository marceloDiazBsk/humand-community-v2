import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Humand Community",
  description: "Humand Community App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ fontFamily: "'Roboto', sans-serif" }}>{children}</body>
    </html>
  );
}
