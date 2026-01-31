/**
 * Dashboard Router
 *
 * Dashboard metrics and analytics
 */

import { z } from 'zod'
import { eq, and, gte, sql, count, desc } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../procedures'
import type { OrgContext } from '../context'

export const dashboardRouter = {
  /**
   * Get dashboard metrics
   */
  metrics: orgAuthed
    .route({
      method: 'GET',
      path: '/dashboard/metrics',
      summary: 'Get dashboard metrics',
      tags: ['Dashboard'],
    })
    .input(z.object({}).optional())
    .output(
      z.object({
        openTickets: z.number(),
        resolvedToday: z.number(),
        avgResponseTime: z.number(),
        activeAgents: z.number(),
        satisfactionScore: z.number(),
        slaCompliance: z.number(),
        firstResponseTime: z.number(),
        resolutionRate: z.number(),
      }),
    )
    .handler(async ({ context }: { context: OrgContext }) => {
      const db = getDb(context)
      const orgId = context.organization.id

      // Open tickets count
      const [openTicketsResult] = await db
        .select({ count: count() })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.organizationId, orgId),
            eq(schema.tickets.status, 'open'),
          ),
        )

      const openTickets = openTicketsResult?.count || 0

      // Resolved today
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [resolvedTodayResult] = await db
        .select({ count: count() })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.organizationId, orgId),
            eq(schema.tickets.status, 'resolved'),
            gte(schema.tickets.resolvedAt, today),
          ),
        )

      const resolvedToday = resolvedTodayResult?.count || 0

      // Total tickets for resolution rate
      const [totalTicketsResult] = await db
        .select({ count: count() })
        .from(schema.tickets)
        .where(eq(schema.tickets.organizationId, orgId))

      const totalTickets = totalTicketsResult?.count || 0
      const [resolvedTicketsResult] = await db
        .select({ count: count() })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.organizationId, orgId),
            eq(schema.tickets.status, 'resolved'),
          ),
        )

      const resolvedTickets = resolvedTicketsResult?.count || 0
      const resolutionRate =
        totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0

      // Active agents (users with assigned tickets)
      const [activeAgentsResult] = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${schema.tickets.assignedTo})`,
        })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.organizationId, orgId),
            sql`${schema.tickets.assignedTo} IS NOT NULL`,
            sql`${schema.tickets.status} IN ('open', 'in_progress')`,
          ),
        )

      const activeAgents = Number(activeAgentsResult?.count) || 0

      // Calculate average response time (simplified - time to first comment)
      // In a real implementation, you'd track first response time more accurately
      const avgResponseTime = 2.5 // Placeholder - would calculate from ticketComments

      // First response time (placeholder)
      const firstResponseTime = 1.2

      // Satisfaction score (placeholder - would come from CSAT data)
      const satisfactionScore = 4.7

      // SLA compliance (placeholder - would calculate from slaStatus table)
      const slaCompliance = 94.2

      return {
        openTickets,
        resolvedToday,
        avgResponseTime,
        activeAgents,
        satisfactionScore,
        slaCompliance,
        firstResponseTime,
        resolutionRate: Math.round(resolutionRate * 10) / 10,
      }
    }),

  /**
   * Get ticket trends
   */
  trends: orgAuthed
    .route({
      method: 'GET',
      path: '/dashboard/trends',
      summary: 'Get ticket trends',
      tags: ['Dashboard'],
    })
    .input(
      z
        .object({
          days: z.number().int().min(1).max(30).optional().default(7),
        })
        .optional(),
    )
    .output(
      z.object({
        trends: z.array(
          z.object({
            day: z.string(),
            value: z.number(),
          }),
        ),
      }),
    )
    .handler(async ({ context, input }: { context: OrgContext; input?: { days?: number } }) => {
      const db = getDb(context)
      const orgId = context.organization.id
      const days = input?.days || 7

      // Generate date range
      const trends: Array<{ day: string; value: number }> = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)

        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const [result] = await db
          .select({ count: count() })
          .from(schema.tickets)
          .where(
            and(
              eq(schema.tickets.organizationId, orgId),
              gte(schema.tickets.createdAt, date),
              sql`${schema.tickets.createdAt} < ${nextDate}`,
            ),
          )

        trends.push({
          day: date.toISOString().split('T')[0] || '',
          value: result?.count || 0,
        })
      }

      return { trends }
    }),

  /**
   * Get recent tickets
   */
  recent: orgAuthed
    .route({
      method: 'GET',
      path: '/dashboard/recent',
      summary: 'Get recent tickets',
      tags: ['Dashboard'],
    })
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).optional().default(5),
        })
        .optional(),
    )
    .output(
      z.object({
        tickets: z.array(z.any()),
      }),
    )
    .handler(async ({ context, input }: { context: OrgContext; input?: { limit?: number } }) => {
      const db = getDb(context)
      const orgId = context.organization.id
      const limit = input?.limit || 5

      const tickets = await db
        .select()
        .from(schema.tickets)
        .where(eq(schema.tickets.organizationId, orgId))
        .orderBy(desc(schema.tickets.createdAt))
        .limit(limit)

      return { tickets }
    }),
}
