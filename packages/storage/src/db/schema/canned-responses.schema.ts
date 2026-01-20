/**
 * Canned Responses Schema
 * 
 * Reusable response templates for agents
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from './auth.schema'
import { users } from './auth.schema'

// Canned responses
export const cannedResponses = pgTable(
  'canned_responses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    category: varchar('category', { length: 100 }),
    tags: text('tags').array(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_canned_responses_organization_id').on(
      table.organizationId,
    ),
    categoryIdx: index('idx_canned_responses_category').on(table.category),
  }),
)

// Relations
export const cannedResponsesRelations = relations(
  cannedResponses,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [cannedResponses.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [cannedResponses.createdBy],
      references: [users.id],
    }),
  }),
)
