/**
 * Tickets Schema
 * 
 * Core helpdesk ticket management tables
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from './auth.schema'
import { users } from './auth.schema'

// Tickets table
export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    ticketNumber: varchar('ticket_number', { length: 50 }).notNull().unique(),
    subject: varchar('subject', { length: 500 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 50 }).default('open').notNull(), // 'open', 'in_progress', 'waiting', 'resolved', 'closed'
    priority: varchar('priority', { length: 20 }).default('medium'), // 'low', 'medium', 'high', 'urgent'
    category: varchar('category', { length: 100 }),
    assignedTo: uuid('assigned_to').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    requesterName: varchar('requester_name', { length: 255 }),
    requesterEmail: varchar('requester_email', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
  },
  (table) => ({
    organizationIdIdx: index('idx_tickets_organization_id').on(
      table.organizationId,
    ),
    statusIdx: index('idx_tickets_status').on(table.status),
    priorityIdx: index('idx_tickets_priority').on(table.priority),
    assignedToIdx: index('idx_tickets_assigned_to').on(table.assignedTo),
    createdByIdx: index('idx_tickets_created_by').on(table.createdBy),
    ticketNumberIdx: index('idx_tickets_ticket_number').on(
      table.ticketNumber,
    ),
  }),
)

// Ticket comments (thread/replies)
export const ticketComments = pgTable(
  'ticket_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    content: text('content').notNull(),
    isInternal: boolean('is_internal').default(false).notNull(), // Internal notes vs customer-visible
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ticketIdIdx: index('idx_ticket_comments_ticket_id').on(table.ticketId),
    userIdIdx: index('idx_ticket_comments_user_id').on(table.userId),
    createdAtIdx: index('idx_ticket_comments_created_at').on(table.createdAt),
  }),
)

// Ticket attachments
export const ticketAttachments = pgTable(
  'ticket_attachments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id').references(() => ticketComments.id, {
      onDelete: 'cascade',
    }),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileKey: varchar('file_key', { length: 500 }).notNull(), // R2 key
    fileSize: varchar('file_size', { length: 50 }),
    mimeType: varchar('mime_type', { length: 100 }),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ticketIdIdx: index('idx_ticket_attachments_ticket_id').on(table.ticketId),
    commentIdIdx: index('idx_ticket_attachments_comment_id').on(
      table.commentId,
    ),
  }),
)

// Ticket tags
export const ticketTags = pgTable(
  'ticket_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    tag: varchar('tag', { length: 100 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ticketIdIdx: index('idx_ticket_tags_ticket_id').on(table.ticketId),
    tagIdx: index('idx_ticket_tags_tag').on(table.tag),
    ticketTagIdx: index('idx_ticket_tags_ticket_tag').on(
      table.ticketId,
      table.tag,
    ),
  }),
)

// Relations
export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [tickets.organizationId],
    references: [organizations.id],
  }),
  assignee: one(users, {
    fields: [tickets.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [tickets.createdBy],
    references: [users.id],
  }),
  comments: many(ticketComments),
  attachments: many(ticketAttachments),
  tags: many(ticketTags),
}))

export const ticketCommentsRelations = relations(
  ticketComments,
  ({ one, many }) => ({
    ticket: one(tickets, {
      fields: [ticketComments.ticketId],
      references: [tickets.id],
    }),
    user: one(users, {
      fields: [ticketComments.userId],
      references: [users.id],
    }),
    attachments: many(ticketAttachments),
  }),
)

export const ticketAttachmentsRelations = relations(
  ticketAttachments,
  ({ one }) => ({
    ticket: one(tickets, {
      fields: [ticketAttachments.ticketId],
      references: [tickets.id],
    }),
    comment: one(ticketComments, {
      fields: [ticketAttachments.commentId],
      references: [ticketComments.id],
    }),
    uploader: one(users, {
      fields: [ticketAttachments.uploadedBy],
      references: [users.id],
    }),
  }),
)

export const ticketTagsRelations = relations(ticketTags, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketTags.ticketId],
    references: [tickets.id],
  }),
}))
