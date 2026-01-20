/**
 * Knowledge Base Validation Schemas
 */

import { z } from 'zod'

// Create article schema
export const createArticleSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .transform((val) => val.trim()),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255, 'Slug must be less than 255 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .transform((val) => val.trim()),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50000 characters'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed').optional(),
  isPublished: z.boolean().optional().default(false),
})

// Update article schema
export const updateArticleSchema = createArticleSchema.partial().extend({
  slug: z
    .string()
    .max(255, 'Slug must be less than 255 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .transform((val) => val.trim())
    .optional(),
})

// Article filter schema
export const articleFilterSchema = z.object({
  category: z.string().optional(),
  isPublished: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

// Type exports
export type CreateArticleInput = z.infer<typeof createArticleSchema>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>
export type ArticleFilterInput = z.infer<typeof articleFilterSchema>
