import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tienda Virtual",
  description: "Aplicación de Tienda Virtual desarollada para el curso de Lenguajes de Programación",
};

export const dynamic = "force-dynamic";

// Google Analytics 4: ID de medicion del flujo "Web - Tienda Virtual".
const GA_MEASUREMENT_ID = "G-2XRTF1N0T5";

// Orden: js -> config. debug_mode solo en localhost (DebugView);
// fuera de localhost se omite, porque debug_mode: false no desactiva la depuracion.
const gtagSnippet = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  const config = {};
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') config.debug_mode = true;
  gtag('config', '${GA_MEASUREMENT_ID}', config);
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PE">
      <head>
        {/* Google tag (gtag.js): una sola vez, en el layout raiz */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: gtagSnippet }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900">
          <Navbar />
          <main className="container mx-auto flex-1 p-4 md:p-6">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
