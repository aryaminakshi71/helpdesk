import { HeadContent, Scripts, Outlet, createRootRoute } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NotFoundPage } from '@/components/error'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Helpdesk - Customer Support Platform' },
      {
        name: 'description',
        content:
          'Modern helpdesk for managing support tickets, knowledge bases, and customer success workflows.',
      },
    ],
  }),
  component: RootDocument,
  notFoundComponent: NotFoundPage,
})

const queryClient = new QueryClient()

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  )
}
