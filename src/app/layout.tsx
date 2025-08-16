import type { Metadata } from "next";
import { Geist, Geist_Mono, } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Convertly - Free Online File Converter",
  description: "Convert your files to different formats easily with our free online file converter. Support for JPG, PNG, PDF, DOCX, XLSX, PPTX and more.",
  keywords: [
    'file converter',
    'convert files',
    'online converter',
    'PDF to Word',
    'image converter',
    'document converter',
    'free file converter',
    'JPG to PNG',
    'DOCX to PDF',
    'PPTX to PDF',
    'XLSX to CSV'
  ],
  authors: [{ name: 'Convertly Team' }],
  creator: 'Convertly',
  publisher: 'Convertly',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
