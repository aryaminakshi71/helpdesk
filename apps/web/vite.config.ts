import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

import path from "node:path";

const config = defineConfig({
  // Vite equivalent of Next.js transpilePackages for monorepo workspace packages
  optimizeDeps: {
    // Exclude workspace packages so they are compiled as source (enabling HMR and alias resolution)
    exclude: [
      '@helpdesk/env',
      "@helpdesk/auth",
      "@helpdesk/core",
      "@helpdesk/storage",
      "@helpdesk/logger",
      // Removed @helpdesk/tsconfig - TypeScript config package, not a runtime dependency
      "@helpdesk/api",
    ],
  },
  ssr: {
    noExternal: [
      '@helpdesk/env',
      "@helpdesk/auth",
      "@helpdesk/core",
      "@helpdesk/storage",
      "@helpdesk/logger",
      "@helpdesk/api",
      // Removed @helpdesk/tsconfig - TypeScript config package, not a runtime dependency
    ],
    target: 'webworker',
  },
  resolve: {
    alias: {
      // Core package exports
      "@helpdesk/core/validators/ticket": path.resolve(__dirname, "../../packages/core/src/validators/ticket.ts"),
      "@helpdesk/core/validators/kb": path.resolve(__dirname, "../../packages/core/src/validators/kb.ts"),
      "@helpdesk/core/services/email": path.resolve(__dirname, "../../packages/core/src/services/email.ts"),
      "@helpdesk/core/services/sla": path.resolve(__dirname, "../../packages/core/src/services/sla.ts"),
      "@helpdesk/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
      // Storage package exports
      "@helpdesk/storage/schema": path.resolve(__dirname, "../../packages/storage/src/db/schema/index.ts"),
      "@helpdesk/storage/db": path.resolve(__dirname, "../../packages/storage/src/db/index.ts"),
      "@helpdesk/storage/r2": path.resolve(__dirname, "../../packages/storage/src/r2/index.ts"),
      "@helpdesk/storage": path.resolve(__dirname, "../../packages/storage/src/db/index.ts"),
      // Auth package exports
      "@helpdesk/auth/client": path.resolve(__dirname, "../../packages/auth/src/client.ts"),
      "@helpdesk/auth": path.resolve(__dirname, "../../packages/auth/src/index.ts"),
      // API package exports
      "@helpdesk/api/app": path.resolve(__dirname, "../../apps/api/src/app.ts"),
      "@helpdesk/api/router": path.resolve(__dirname, "../../apps/api/src/routers/index.ts"),
      "@helpdesk/api/procedures": path.resolve(__dirname, "../../apps/api/src/procedures/index.ts"),
      "@helpdesk/api/context": path.resolve(__dirname, "../../apps/api/src/context.ts"),
      "@helpdesk/api": path.resolve(__dirname, "../../apps/api/src/index.ts"),
      // Env package exports
      "@helpdesk/env": path.resolve(__dirname, "../../packages/env/src/index.ts"),
      // Logger package exports
      "@helpdesk/logger": path.resolve(__dirname, "../../packages/logger/src/index.ts"),
    },
  },
  server: {
    host: true,
    port: 3004,
    strictPort: true, // Keep strict to ensure consistent port for Playwright tests
  },
  plugins: [
    // Path aliases from tsconfig
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    // Cloudflare Workers integration (must be before tanstackStart)
    // Only include if not skipping Cloudflare (for testing routes without Cloudflare services)
    ...(process.env.SKIP_CLOUDFLARE !== 'true' ? [
      cloudflare({ viteEnvironment: { name: 'ssr' } })
    ] : []),
    // TanStack devtools
    devtools(),
    // Tailwind CSS v4
    tailwindcss(),
    // TanStack Start SSR framework
    tanstackStart({
      srcDirectory: "src",
      start: { entry: "./start.tsx" },
      server: { entry: "./server.ts" },
    }),
    // React with compiler optimization
    viteReact(),
  ],
})

export default config
