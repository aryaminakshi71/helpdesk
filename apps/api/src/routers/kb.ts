/**
 * Knowledge Base Router
 *
 * Knowledge base article management
 */

import { z } from 'zod'
import { eq, and, ilike, desc, count, sql } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../procedures'
import {
  createArticleSchema,
  updateArticleSchema,
  articleFilterSchema,
} from '@helpdesk/core/validators/kb'
import { ORPCError } from '@orpc/server'
import type { OrgContext } from '../context'

export const kbRouter = {
  /**
   * List knowledge base articles
   */
  list: orgAuthed
    .route({
      method: 'GET',
      path: '/kb/articles',
      summary: 'List knowledge base articles',
      tags: ['Knowledge Base'],
    })
    .input(articleFilterSchema)
    .output(
      z.object({
        articles: z.array(z.any()),
        total: z.number(),
      }),
    )
    .handler(async ({ context, input }: { context: OrgContext; input: z.infer<typeof articleFilterSchema> }) => {
      const db = getDb(context)
      const { category, isPublished, search, limit, offset } = input

      // Build where conditions
      const conditions = [
        eq(schema.knowledgeBaseArticles.organizationId, context.organization.id),
      ]

      if (category) {
        conditions.push(
          eq(schema.knowledgeBaseArticles.category, category),
        )
      }

      if (isPublished !== undefined) {
        conditions.push(
          eq(schema.knowledgeBaseArticles.isPublished, isPublished),
        )
      }

      if (search) {
        conditions.push(
          ilike(schema.knowledgeBaseArticles.title, `%${search}%`),
        )
      }

      // Query with pagination
      const articles = await db
        .select()
        .from(schema.knowledgeBaseArticles)
        .where(and(...conditions))
        .orderBy(desc(schema.knowledgeBaseArticles.createdAt))
        .limit(limit)
        .offset(offset)

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(schema.knowledgeBaseArticles)
        .where(and(...conditions))

      return {
        articles,
        total: totalResult?.count || 0,
      }
    }),

  /**
   * Get a single article by ID or slug
   */
  get: orgAuthed
    .route({
      method: 'GET',
      path: '/kb/articles/{id}',
      summary: 'Get article by ID or slug',
      tags: ['Knowledge Base'],
    })
    .input(
      z.object({
        id: z.string(), // Can be UUID or slug
      }),
    )
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } }) => {
      const db = getDb(context)

      // Try UUID first, then slug
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        input.id,
      )

      const [article] = await db
        .select()
        .from(schema.knowledgeBaseArticles)
        .where(
          and(
            isUuid
              ? eq(schema.knowledgeBaseArticles.id, input.id)
              : eq(schema.knowledgeBaseArticles.slug, input.id),
            eq(
              schema.knowledgeBaseArticles.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!article) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Article not found',
        })
      }

      // Increment view count if published
      if (article.isPublished) {
        await db
          .update(schema.knowledgeBaseArticles)
          .set({
            viewCount: sql`${schema.knowledgeBaseArticles.viewCount} + 1`,
          })
          .where(eq(schema.knowledgeBaseArticles.id, article.id))
      }

      return article
    }),

  /**
   * Create a new article
   */
  create: orgAuthed
    .route({
      method: 'POST',
      path: '/kb/articles',
      summary: 'Create a new article',
      tags: ['Knowledge Base'],
    })
    .input(createArticleSchema)
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: z.infer<typeof createArticleSchema> }) => {
      const db = getDb(context)

      // Check if slug already exists
      const [existing] = await db
        .select({ id: schema.knowledgeBaseArticles.id })
        .from(schema.knowledgeBaseArticles)
        .where(
          and(
            eq(schema.knowledgeBaseArticles.slug, input.slug),
            eq(
              schema.knowledgeBaseArticles.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (existing) {
        throw new ORPCError('CONFLICT', {
          message: 'Article with this slug already exists',
        })
      }

      const [article] = await db
        .insert(schema.knowledgeBaseArticles)
        .values({
          organizationId: context.organization.id,
          title: input.title,
          slug: input.slug,
          content: input.content,
          excerpt: input.excerpt,
          category: input.category,
          tags: input.tags,
          isPublished: input.isPublished || false,
          createdBy: context.user.id,
        })
        .returning()

      if (!article) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to create article',
        })
      }

      context.logger.info({ articleId: article.id }, 'Article created')

      return article
    }),

  /**
   * Update an existing article
   */
  update: orgAuthed
    .route({
      method: 'PATCH',
      path: '/kb/articles/{id}',
      summary: 'Update an article',
      tags: ['Knowledge Base'],
    })
    .input(z.object({ id: z.string().uuid() }).merge(updateArticleSchema))
    .output(z.any())
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } & z.infer<typeof updateArticleSchema> }) => {
      const db = getDb(context)
      const { id, ...updates } = input

      // Verify ownership
      const [existing] = await db
        .select({ id: schema.knowledgeBaseArticles.id })
        .from(schema.knowledgeBaseArticles)
        .where(
          and(
            eq(schema.knowledgeBaseArticles.id, id),
            eq(
              schema.knowledgeBaseArticles.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Article not found',
        })
      }

      // Check slug uniqueness if updating slug
      if (updates.slug) {
        const [slugExists] = await db
          .select({ id: schema.knowledgeBaseArticles.id })
          .from(schema.knowledgeBaseArticles)
          .where(
            and(
              eq(schema.knowledgeBaseArticles.slug, updates.slug),
              eq(
                schema.knowledgeBaseArticles.organizationId,
                context.organization.id,
              ),
              sql`${schema.knowledgeBaseArticles.id} != ${id}`,
            ),
          )
          .limit(1)

        if (slugExists) {
          throw new ORPCError('CONFLICT', {
            message: 'Article with this slug already exists',
          })
        }
      }

      const [article] = await db
        .update(schema.knowledgeBaseArticles)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(schema.knowledgeBaseArticles.id, id))
        .returning()

      if (!article) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to update article',
        })
      }

      context.logger.info({ articleId: article.id }, 'Article updated')

      return article
    }),

  /**
   * Delete an article
   */
  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/kb/articles/{id}',
      summary: 'Delete an article',
      tags: ['Knowledge Base'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } }) => {
      const db = getDb(context)

      // Verify ownership before delete
      const [existing] = await db
        .select({ id: schema.knowledgeBaseArticles.id })
        .from(schema.knowledgeBaseArticles)
        .where(
          and(
            eq(schema.knowledgeBaseArticles.id, input.id),
            eq(
              schema.knowledgeBaseArticles.organizationId,
              context.organization.id,
            ),
          ),
        )
        .limit(1)

      if (!existing) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Article not found',
        })
      }

      await db
        .delete(schema.knowledgeBaseArticles)
        .where(eq(schema.knowledgeBaseArticles.id, input.id))

      context.logger.info({ articleId: input.id }, 'Article deleted')

      return { success: true }
    }),

  /**
   * Search articles (public endpoint - no auth required for published articles)
   */
  search: orgAuthed
    .route({
      method: 'GET',
      path: '/kb/search',
      summary: 'Search articles',
      tags: ['Knowledge Base'],
    })
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().int().min(1).max(50).optional().default(10),
      }),
    )
    .output(
      z.object({
        articles: z.array(z.any()),
      }),
    )
    .handler(async ({ context, input }: { context: OrgContext; input: { query: string; limit: number } }) => {
      const db = getDb(context)

      const articles = await db
        .select()
        .from(schema.knowledgeBaseArticles)
        .where(
          and(
            eq(
              schema.knowledgeBaseArticles.organizationId,
              context.organization.id,
            ),
            eq(schema.knowledgeBaseArticles.isPublished, true),
            ilike(schema.knowledgeBaseArticles.title, `%${input.query}%`),
          ),
        )
        .orderBy(desc(schema.knowledgeBaseArticles.viewCount))
        .limit(input.limit)

      return { articles }
    }),
}
