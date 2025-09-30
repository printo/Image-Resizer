"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "./theme-provider"
import { AuthProvider } from "@/context/AuthContext"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}
