"use client"

import { ErrorBoundary } from "./error-boundary"

/**
 * Client-side wrapper for ErrorBoundary
 * This is needed because ErrorBoundary must be a client component,
 * but we want to use it in the server component layout.
 */
export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

