import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Somalia Master Health Facility Registry",
  description: "Comprehensive registry of health facilities in Somalia.",
  icons: {
    icon: [
      { url: '/applogo.jpeg', type: 'image/jpeg' },
    ],
    shortcut: '/applogo.jpeg',
    apple: '/applogo.jpeg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Providers>
          <Header />
          <main style={{ minHeight: '80vh' }}>
            {children}
          </main>
        </Providers>
        <footer style={{ 
          background: 'var(--gray-900)', 
          color: 'var(--gray-300)', 
          padding: '3rem 0',
          marginTop: '4rem',
          textAlign: 'center'
        }}>
          <div className="container">
            <p className="text-sm">© {new Date().getFullYear()} Somalia Ministry of Health. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
