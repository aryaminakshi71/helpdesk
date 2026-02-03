/**
 * Tickets Router
 *
 * Ticket management operations with organization scoping
 */

import { z } from 'zod'
import { eq, and, ilike, desc, sql, count } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../procedures'
import { getOrCache, invalidateCache } from '@helpdesk/storage/redis'
import { trackQuery } from '../lib/db-performance'
import {
  createTicketSchema,
  updateTicketSchema,
  ticketFilterSchema,
  addCommentSchema,
} from '@helpdesk/core/validators/ticket'
import { ORPCError } from '@orpc/server'
import { getEmailService, TicketEmailTemplates } from '@helpdesk/core/services/email'
import { calculateSLADueDates, getDefaultSLATargets } from '@helpdesk/core/services/sla'
import type { OrgContext } from '../context'

// Generate ticket number helper
function generateTicketNumber(organizationId: string, count: number): string {
  const prefix = organizationId.slice(0, 3).toUpperCase()
  const paddedCount = String(count + 1).padStart(6, '0')
  return `TKT-${prefix}-${paddedCount}`
}

export const ticketsRouter = {
  /**
   * List tickets for the organization
   */
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/tickets',
      summary: 'List tickets',
      tags: ['Tickets'],
    })
    .input(ticketFilterSchema)
    .output(
      z.object({
        tickets: z.array(z.any()), // Will be properly typed with Drizzle
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }: { context: OrgContext; input: z.infer<typeof ticketFilterSchema> }) => {
      const db = getDb(context)
      const { status, priority, category, assignedTo, search, limit, offset } =
        input

      // Build where conditions
      const conditions = [
        eq(schema.tickets.organizationId, context.organization.id),
      ]

      if (status) {
        conditions.push(eq(schema.tickets.status, status))
      }

      if (priority) {
        conditions.push(eq(schema.tickets.priority, priority))
      }

      if (category) {
        conditions.push(eq(schema.tickets.category, category))
      }

      if (assignedTo) {
        conditions.push(eq(schema.tickets.assignedTo, assignedTo))
      }

      if (search) {
        conditions.push(
          ilike(schema.tickets.subject, `%${search}%`),
        )
      }

      // Query with pagination
      const tickets = await db
        .select()
        .from(schema.tickets)
        .where(and(...conditions))
        .orderBy(desc(schema.tickets.createdAt))
        .limit(limit)
        .offset(offset)

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.tickets)
        .where(and(...conditions))

      return {
        tickets,
        total: totalResult?.count || 0,
      }
    }),

  /**
   * Get a single ticket by ID
   */
  get: orgAuthed
    .route({
      method: 'GET',
      path: '/tickets/{id}',
      summary: 'Get ticket by ID',
      tags: ['Tickets'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } }) => {
      const db = getDb(context)

      // Cache ticket with related data (30 minutes TTL)
      return await trackQuery('getTicket', async () => {
        return await getOrCache(
          `ticket:${input.id}`,
        async () => {
          const [ticket] = await db
            .select()
            .from(schema.tickets)
            .where(
              and(
                eq(schema.tickets.id, input.id),
                eq(schema.tickets.organizationId, context.organization.id),
              ),
            )
            .limit(1)

          if (!ticket) {
            throw new ORPCError('NOT_FOUND', {
              message: 'Ticket not found',
            })
          }

          // Get comments
          const comments = await db
            .select()
            .from(schema.ticketComments)
            .where(eq(schema.ticketComments.ticketId, ticket.id))
            .orderBy(schema.ticketComments.createdAt)

          // Get attachments
          const attachments = await db
            .select()
            .from(schema.ticketAttachments)
            .where(eq(schema.ticketAttachments.ticketId, ticket.id))

          // Get tags
          const tags = await db
            .select()
            .from(schema.ticketTags)
            .where(eq(schema.ticketTags.ticketId, ticket.id))

          // Get SLA status if exists
          const [slaStatus] = await db
            .select()
            .from(schema.slaStatus)
            .where(eq(schema.slaStatus.ticketId, ticket.id))
            .limit(1)

          return {
            ...ticket,
            comments,
            attachments,
            tags: tags.map((t) => t.tag),
            slaStatus: slaStatus || null,
          };
        },
        1800 // 30 minutes
      );
    }),

  /**
   * Create a new ticket
   */
  create: orgAuthed
    .route({
      method: 'POST',
      path: '/tickets',
      summary: 'Create a new ticket',
      tags: ['Tickets'],
    })
    .input(createTicketSchema)
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: z.infer<typeof createTicketSchema> }) => {
      const db = getDb(context)

      // Generate ticket number
      const [countResult] = await db
        .select({ count: count() })
        .from(schema.tickets)
        .where(eq(schema.tickets.organizationId, context.organization.id))

      const ticketNumber = generateTicketNumber(
        context.organization.id,
        countResult?.count || 0,
      )

      const [ticket] = await db
        .insert(schema.tickets)
        .values({
          organizationId: context.organization.id,
          ticketNumber,
          subject: input.subject,
          description: input.description,
          priority: input.priority || 'medium',
          category: input.category,
          status: 'open',
          assignedTo: input.assignedTo,
          createdBy: context.user.id,
          requesterName: input.requesterName,
          requesterEmail: input.requesterEmail,
        })
        .returning()

      if (!ticket) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to create ticket',
        })
      }

      // Create SLA status
      const slaTargets = getDefaultSLATargets(ticket.priority as any)
      const { firstResponseDue, resolutionDue } = calculateSLADueDates(
        ticket.createdAt,
        ticket.priority as any,
        slaTargets,
      )

      await db.insert(schema.slaStatus).values({
        ticketId: ticket.id,
        firstResponseDue,
        resolutionDue,
        currentStatus: 'on_track',
      })

      // Send email notification
      if (ticket.requesterEmail) {
        try {
          const emailService = getEmailService()
          await emailService.send(
            TicketEmailTemplates.ticketCreated({
              ticketNumber: ticket.ticketNumber,
              subject: ticket.subject,
              requesterName: ticket.requesterName || undefined,
              requesterEmail: ticket.requesterEmail || undefined,
              priority: ticket.priority || 'medium',
            }),
          )
        } catch (error) {
          context.logger.error({ error }, 'Failed to send ticket creation email')
        }
      }

      context.logger.info({ ticketId: ticket.id }, 'Ticket created')

      // Invalidate tickets list cache
      await invalidateCache(`tickets:list:${context.organization.id}`);

      return ticket
    }),

  /**
   * Update an existing ticket
   */
  update: orgAuthed
    .route({
      method: 'PATCH',
      path: '/tickets/{id}',
      summary: 'Update a ticket',
      tags: ['Tickets'],
    })
    .input(z.object({ id: z.string().uuid() }).merge(updateTicketSchema))
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } & z.infer<typeof updateTicketSchema> }) => {
      const db = getDb(context)
      const { id, ...updates } = input

      // Verify ownership
      const [existing] = await db
        .select({ id: schema.tickets.id, status: schema.tickets.status, requesterEmail: schema.tickets.requesterEmail, subject: schema.tickets.subject, ticketNumber: schema.tickets.ticketNumber })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.id, id),
            eq(schema.tickets.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Ticket not found',
        })
      }

      // Set resolvedAt/closedAt based on status
      const updateData: any = {
        ...updates,
        updatedAt: new Date(),
      }

      if (updates.status === 'resolved' && existing.status !== 'resolved') {
        updateData.resolvedAt = new Date()
        
        // Update SLA status
        await db
          .update(schema.slaStatus)
          .set({ resolvedAt: new Date() })
          .where(eq(schema.slaStatus.ticketId, id))

        // Send resolution email
        if (existing.requesterEmail) {
          try {
            const emailService = getEmailService()
            await emailService.send(
              TicketEmailTemplates.ticketResolved({
                ticketNumber: existing.ticketNumber,
                subject: existing.subject,
                requesterEmail: existing.requesterEmail,
              }),
            )
          } catch (error) {
            context.logger.error({ error }, 'Failed to send ticket resolution email')
          }
        }
      }

      if (updates.status === 'closed' && existing.status !== 'closed') {
        updateData.closedAt = new Date()
      }

      // Send update email if status changed
      if (updates.status && updates.status !== existing.status && existing.requesterEmail) {
        try {
          const emailService = getEmailService()
          await emailService.send(
            TicketEmailTemplates.ticketUpdated({
              ticketNumber: existing.ticketNumber,
              subject: existing.subject,
              status: updates.status,
              requesterEmail: existing.requesterEmail,
            }),
          )
        } catch (error) {
          context.logger.error({ error }, 'Failed to send ticket update email')
        }
      }

      const [ticket] = await db
        .update(schema.tickets)
        .set(updateData)
        .where(eq(schema.tickets.id, id))
        .returning()

      if (!ticket) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to update ticket',
        })
      }

      context.logger.info({ ticketId: ticket.id }, 'Ticket updated')

      // Invalidate caches
      await invalidateCache(`ticket:${ticket.id}`);
      await invalidateCache(`tickets:list:${context.organization.id}`);

      return ticket
    }),

  /**
   * Delete a ticket
   */
  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/tickets/{id}',
      summary: 'Delete a ticket',
      tags: ['Tickets'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } }) => {
      const db = getDb(context)

      // Verify ownership before delete
      const [existing] = await db
        .select({ id: schema.tickets.id })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.id, input.id),
            eq(schema.tickets.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Ticket not found',
        })
      }

      await db.delete(schema.tickets).where(eq(schema.tickets.id, input.id))

      context.logger.info({ ticketId: input.id }, 'Ticket deleted')

      // Invalidate caches
      await invalidateCache(`ticket:${input.id}`);
      await invalidateCache(`tickets:list:${context.organization.id}`);

      return { success: true }
    }),

  /**
   * Assign ticket to agent
   */
  assign: orgAuthed
    .route({
      method: 'POST',
      path: '/tickets/{id}/assign',
      summary: 'Assign ticket to agent',
      tags: ['Tickets'],
    })
    .input(
      z.object({
        id: z.string().uuid(),
        assignedTo: z.string().uuid().nullable(),
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string; assignedTo: string | null } }) => {
      const db = getDb(context)

      // Verify ticket exists and belongs to org
      const [ticket] = await db
        .select()
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.id, input.id),
            eq(schema.tickets.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!ticket) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Ticket not found',
        })
      }

      const [updated] = await db
        .update(schema.tickets)
        .set({
          assignedTo: input.assignedTo,
          updatedAt: new Date(),
        })
        .where(eq(schema.tickets.id, input.id))
        .returning()

      // Send assignment email if assigned
      if (input.assignedTo && updated) {
        try {
          // Get assignee user info
          const [assignee] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, input.assignedTo))
            .limit(1)

          if (assignee?.email) {
            const emailService = getEmailService()
            await emailService.send(
              TicketEmailTemplates.ticketAssigned({
                ticketNumber: updated.ticketNumber,
                subject: updated.subject,
                assignedToName: assignee.name || assignee.email,
              }),
            )
          }
        } catch (error) {
          context.logger.error({ error }, 'Failed to send assignment email')
        }
      }

      context.logger.info(
        { ticketId: input.id, assignedTo: input.assignedTo },
        'Ticket assigned',
      )

      return updated
    }),

  /**
   * Add comment to ticket
   */
  addComment: orgAuthed
    .route({
      method: 'POST',
      path: '/tickets/{id}/comments',
      summary: 'Add comment to ticket',
      tags: ['Tickets'],
    })
    .input(
      z.object({ id: z.string().uuid() }).merge(addCommentSchema),
    )
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } & z.infer<typeof addCommentSchema> }) => {
      const db = getDb(context)
      const { id, ...commentData } = input

      // Verify ticket exists and belongs to org
      const [ticket] = await db
        .select({ id: schema.tickets.id, requesterEmail: schema.tickets.requesterEmail })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.id, id),
            eq(schema.tickets.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!ticket) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Ticket not found',
        })
      }

      const [comment] = await db
        .insert(schema.ticketComments)
        .values({
          ticketId: id,
          userId: context.user.id,
          content: commentData.content,
          isInternal: commentData.isInternal || false,
        })
        .returning()

      // Update ticket updatedAt
      await db
        .update(schema.tickets)
        .set({ updatedAt: new Date() })
        .where(eq(schema.tickets.id, id))

      // Update first response time in SLA if this is the first comment
      const [existingComments] = await db
        .select({ count: count() })
        .from(schema.ticketComments)
        .where(
          and(
            eq(schema.ticketComments.ticketId, id),
            eq(schema.ticketComments.isInternal, false),
          ),
        )

      if (existingComments?.count === 1 && !commentData.isInternal) {
        // First public comment - update SLA
        await db
          .update(schema.slaStatus)
          .set({ firstResponseAt: new Date() })
          .where(eq(schema.slaStatus.ticketId, id))
      }

      context.logger.info(
        { ticketId: id, commentId: comment?.id },
        'Comment added',
      )

      return comment
    }),

  /**
   * Get ticket comments
   */
  getComments: orgAuthed
    .route({
      method: 'GET',
      path: '/tickets/{id}/comments',
      summary: 'Get ticket comments',
      tags: ['Tickets'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.array(z.any()))
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } }) => {
      const db = getDb(context)

      // Verify ticket exists and belongs to org
      const [ticket] = await db
        .select({ id: schema.tickets.id })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.id, input.id),
            eq(schema.tickets.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!ticket) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Ticket not found',
        })
      }

      const comments = await db
        .select()
        .from(schema.ticketComments)
        .where(eq(schema.ticketComments.ticketId, input.id))
        .orderBy(schema.ticketComments.createdAt)

      return comments
    }),
}
