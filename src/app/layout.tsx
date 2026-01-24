import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Somalia Master Health Facility Registry",
  description: "Comprehensive registry of health facilities in Somalia.",
  icons: {
    icon: [
      { url: '/logo.jpg', type: 'image/jpeg' },
    ],
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
