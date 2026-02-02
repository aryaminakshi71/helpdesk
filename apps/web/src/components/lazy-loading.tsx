/**
 * Lazy Loading Utilities
 * Provides loading skeletons and lazy loading helpers
 */

import { Suspense, ComponentType, lazy } from 'react'

/**
 * Default loading skeleton for routes
 */
export function RouteLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Default loading skeleton for components
 */
export function ComponentLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

/**
 * Wrapper for lazy-loaded components with Suspense
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: P) {
    return (
      <Suspense fallback={fallback || <ComponentLoadingSkeleton />}>
        <Component {...props} />
      </Suspense>
    )
  }
}
