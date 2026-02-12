// Theme provider temporarily disabled - next-themes not compatible with standard React
// Install a React-compatible theme solution if needed

import React from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
