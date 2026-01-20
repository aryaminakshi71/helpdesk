/**
 * App Router
 *
 * Composed router with all domain routers.
 */

import { healthRouter } from "./health";
import { ticketsRouter } from "./tickets";
import { dashboardRouter } from "./dashboard";
import { kbRouter } from "./kb";
import { filesRouter } from "./files";

export const appRouter = {
  health: healthRouter,
  tickets: ticketsRouter,
  dashboard: dashboardRouter,
  kb: kbRouter,
  files: filesRouter,
};

export type AppRouter = typeof appRouter;
