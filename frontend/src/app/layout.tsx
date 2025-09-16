'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReduxProvider } from './providers/ReduxProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { LanguageProvider } from './providers/LanguageProvider'
import { RBACProvider } from '../core/rbac/context'
import { ReduxLayout } from './components/ReduxLayout'
import '../styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <QueryClientProvider client={queryClient}>
            <RBACProvider>
              <ThemeProvider>
                <LanguageProvider>
                  <ReduxLayout>
                    {children}
                  </ReduxLayout>
                </LanguageProvider>
              </ThemeProvider>
            </RBACProvider>
          </QueryClientProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
