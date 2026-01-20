/**
 * Knowledge Base Schema
 * 
 * Knowledge base articles for self-service support
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { organizations } from './auth.schema'
import { users } from './auth.schema'

// Knowledge base articles
export const knowledgeBaseArticles = pgTable(
  'knowledge_base_articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    content: text('content').notNull(),
    excerpt: text('excerpt'),
    category: varchar('category', { length: 100 }),
    tags: text('tags').array(),
    isPublished: boolean('is_published').default(false).notNull(),
    viewCount: integer('view_count').default(0).notNull(),
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
    organizationIdIdx: index('idx_kb_articles_organization_id').on(
      table.organizationId,
    ),
    slugIdx: index('idx_kb_articles_slug').on(table.slug),
    categoryIdx: index('idx_kb_articles_category').on(table.category),
    isPublishedIdx: index('idx_kb_articles_is_published').on(
      table.isPublished,
    ),
    orgSlugIdx: index('idx_kb_articles_org_slug').on(
      table.organizationId,
      table.slug,
    ),
  }),
)

// Relations
export const knowledgeBaseArticlesRelations = relations(
  knowledgeBaseArticles,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [knowledgeBaseArticles.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [knowledgeBaseArticles.createdBy],
      references: [users.id],
    }),
  }),
)
