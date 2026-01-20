import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/industries')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/industries"!</div>
}
