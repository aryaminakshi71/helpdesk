import { useState, useEffect } from 'react'
import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import { ErrorPage, NotFoundPage } from '@/components/error'
import { generateOrganizationSchema, generateWebSiteSchema, getHelpdeskOrganizationSchema } from '@/lib/structured-data'
import { registerServiceWorker } from '@/lib/service-worker'

import appCss from '@/styles/globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Helpdesk - Customer Support & Ticket Management System' },
      { name: 'description', content: 'Modern helpdesk platform for managing customer support tickets, knowledge base, and customer communications. Streamline your support operations.' },
      { name: 'keywords', content: 'helpdesk, customer support, ticket management, support system, customer service, help desk software' },
      { property: 'og:title', content: 'Helpdesk - Customer Support System' },
      { property: 'og:description', content: 'Manage customer support tickets and streamline your support operations.' },
      { property: 'og:type', content: 'website' },
      { name: 'robots', content: 'index, follow' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'dns-prefetch', href: 'https://api.your-domain.com' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootDocument,
  errorComponent: ({ error }) => <ErrorPage error={error} />,
  notFoundComponent: () => <NotFoundPage />,
})

function RootDocument() {
  // Register service worker
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Create a single QueryClient instance that persists across renders
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }))

  const organizationSchema = generateOrganizationSchema(getHelpdeskOrganizationSchema())
  const websiteSchema = generateWebSiteSchema({
    name: 'Helpdesk',
    url: import.meta.env.VITE_PUBLIC_SITE_URL || 'https://helpdesk.your-domain.com',
    description: 'Customer support and helpdesk management platform for efficient ticket handling.',
  })

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:rounded-br-lg"
        >
          Skip to main content
        </a>
        <QueryClientProvider client={queryClient}>
          <main id="main-content">
            <Outlet />
          </main>
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
        {import.meta.env.PROD ? null : <TanStackRouterDevtools />}
        <Scripts />
      </body>
    </html>
  )
}

