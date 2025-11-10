import type { Metadata } from 'next'
import { Inter as FontSans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/next"
 
import { cn } from "@/lib/utils"
import "./globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})
 
export const metadata: Metadata = {
  title: 'Flying Hot Air',
  description: 'Experience the sky with Flying Hot Air - connect pilots and passengers for unforgettable balloon rides',
  generator: 'v0.app',
  icons: {
    icon: '/logo1.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
    <head>
      <meta charSet="utf-8" />
      {/* Explicit favicon links to improve cross-browser support */}
      <link rel="icon" href="/logo1.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/logo1.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/logo1.png" />
      <link rel="apple-touch-icon" href="/logo1.png" />
    </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
