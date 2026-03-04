import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "TacticalPadel AI",
  description: "Sistema integral de analisis tactico de padel v2.1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-primary">TacticalPadel</span>
              <span className="text-muted text-sm font-normal">AI v2.1</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Partidos
              </Link>
              <Link
                href="/partido/nuevo"
                className="text-sm bg-primary text-black px-3 py-1.5 rounded-md font-medium hover:bg-primary-hover transition-colors"
              >
                Nuevo Partido
              </Link>
            </div>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
