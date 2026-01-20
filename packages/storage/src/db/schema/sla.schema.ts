/**
 * SLA (Service Level Agreement) Schema
 * 
 * SLA rules and tracking
 */

import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from './auth.schema'
import { tickets } from './tickets.schema'

// SLA Rules
export const slaRules = pgTable(
  'sla_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    priority: varchar('priority', { length: 20 }), // 'low', 'medium', 'high', 'urgent'
    firstResponseTime: integer('first_response_time'), // in minutes
    resolutionTime: integer('resolution_time'), // in minutes
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    organizationIdIdx: index('idx_sla_rules_organization_id').on(
      table.organizationId,
    ),
    priorityIdx: index('idx_sla_rules_priority').on(table.priority),
    orgPriorityIdx: index('idx_sla_rules_org_priority').on(
      table.organizationId,
      table.priority,
    ),
  }),
)

// SLA Status tracking per ticket
export const slaStatus = pgTable(
  'sla_status',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' })
      .unique(),
    ruleId: uuid('rule_id').references(() => slaRules.id, {
      onDelete: 'set null',
    }),
    firstResponseDue: timestamp('first_response_due', { withTimezone: true }),
    firstResponseAt: timestamp('first_response_at', { withTimezone: true }),
    firstResponseBreached: boolean('first_response_breached')
      .default(false)
      .notNull(),
    resolutionDue: timestamp('resolution_due', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolutionBreached: boolean('resolution_breached')
      .default(false)
      .notNull(),
    currentStatus: varchar('current_status', { length: 20 }).default(
      'on_track',
    ), // 'on_track', 'at_risk', 'breached'
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ticketIdIdx: index('idx_sla_status_ticket_id').on(table.ticketId),
    ruleIdIdx: index('idx_sla_status_rule_id').on(table.ruleId),
    currentStatusIdx: index('idx_sla_status_current_status').on(
      table.currentStatus,
    ),
  }),
)

// Relations
export const slaRulesRelations = relations(slaRules, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [slaRules.organizationId],
    references: [organizations.id],
  }),
  statuses: many(slaStatus),
}))

export const slaStatusRelations = relations(slaStatus, ({ one }) => ({
  ticket: one(tickets, {
    fields: [slaStatus.ticketId],
    references: [tickets.id],
  }),
  rule: one(slaRules, {
    fields: [slaStatus.ruleId],
    references: [slaRules.id],
  }),
}))
