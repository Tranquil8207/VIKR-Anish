import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "./fonts/Poppins/Poppins-Thin.ttf", weight: "100", style: "normal" },
    { path: "./fonts/Poppins/Poppins-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "./fonts/Poppins/Poppins-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "./fonts/Poppins/Poppins-ExtraLightItalic.ttf", weight: "200", style: "italic" },
    { path: "./fonts/Poppins/Poppins-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Poppins/Poppins-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "./fonts/Poppins/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Poppins/Poppins-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/Poppins/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Poppins/Poppins-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "./fonts/Poppins/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Poppins/Poppins-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "./fonts/Poppins/Poppins-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Poppins/Poppins-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "./fonts/Poppins/Poppins-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "./fonts/Poppins/Poppins-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "./fonts/Poppins/Poppins-Black.ttf", weight: "900", style: "normal" },
    { path: "./fonts/Poppins/Poppins-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-poppins",
  display: "swap"
});

import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "VIKR Partner Hub",
  description: "Your central platform for product information, training, announcements and partner support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} ${poppins.className} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
