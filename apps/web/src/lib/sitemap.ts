/**
 * Sitemap generation utility
 * Generates XML sitemap for search engines
 */

export interface SitemapRoute {
  path: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  lastmod?: string
}

export function generateSitemap(routes: SitemapRoute[], baseUrl: string): string {
  const urlset = routes
    .map((route) => {
      const url = new URL(route.path, baseUrl).toString()
      const lastmod = route.lastmod || new Date().toISOString().split('T')[0]
      const changefreq = route.changefreq || 'weekly'
      const priority = route.priority ?? 0.8

      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`
}

/**
 * Get public routes for Helpdesk app
 */
export function getHelpdeskRoutes(): SitemapRoute[] {
  return [
    { path: '/', changefreq: 'daily', priority: 1.0 },
    { path: '/login', changefreq: 'monthly', priority: 0.5 },
    { path: '/register', changefreq: 'monthly', priority: 0.5 },
    { path: '/features', changefreq: 'monthly', priority: 0.7 },
    { path: '/pricing', changefreq: 'monthly', priority: 0.8 },
    { path: '/about', changefreq: 'monthly', priority: 0.6 },
  ]
}
