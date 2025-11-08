import type { Metadata } from 'next'
import { Inter as FontSans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
 
import { cn } from "@/lib/utils"
import "./globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})
 
export const metadata: Metadata = {
  title: 'FLY HOT AIR!',
  description: 'Experience the sky with FLY HOT AIR! - connect pilots and passengers for unforgettable balloon rides',
  generator: 'v0.app',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
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
      </body>
    </html>
  )
}
