import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { AppProviders } from "../components/app-providers"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const geistSans = GeistSans
  const geistMono = GeistMono

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <style>{`
html {
  font-family: ${geistSans.style.fontFamily};
  --font-sans: ${geistSans.variable};
  --font-mono: ${geistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Suspense>
          <AppProviders>{children}</AppProviders>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
