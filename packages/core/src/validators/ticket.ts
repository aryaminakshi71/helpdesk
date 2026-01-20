/**
 * Ticket Validation Schemas
 * Zod schemas for validating ticket-related requests
 */

import { z, type ZodIssue } from 'zod'

// Enums
export const ticketStatusSchema = z.enum([
  'open',
  'in_progress',
  'waiting',
  'resolved',
  'closed',
])
export const ticketPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
export const ticketCategorySchema = z.enum([
  'billing',
  'technical',
  'account',
  'feature_request',
  'how_to',
  'general',
])

// Email validation
const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email too long')

// Common field validations
const subjectSchema = z
  .string()
  .min(1, 'Subject is required')
  .max(500, 'Subject must be less than 500 characters')
  .transform((val) => val.trim())

const descriptionSchema = z
  .string()
  .max(10000, 'Description must be less than 10000 characters')
  .transform((val) => val.trim())

const nameSchema = z
  .string()
  .max(255, 'Name must be less than 255 characters')
  .transform((val) => val.trim())

// Create ticket request
export const createTicketSchema = z.object({
  subject: subjectSchema,
  description: descriptionSchema.optional(),
  priority: ticketPrioritySchema.optional().default('medium'),
  category: ticketCategorySchema.optional(),
  requesterEmail: emailSchema.optional(),
  requesterName: nameSchema.optional(),
  assignedTo: z.string().uuid('Invalid assignee ID').optional(),
})

// Update ticket request
export const updateTicketSchema = z.object({
  subject: subjectSchema.optional(),
  description: descriptionSchema.optional(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  category: ticketCategorySchema.optional(),
  assignedTo: z.string().uuid('Invalid assignee ID').nullable().optional(),
  tags: z
    .array(z.string().max(50))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
})

// Ticket filter/query params
export const ticketFilterSchema = z.object({
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  category: ticketCategorySchema.optional(),
  assignedTo: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
  search: z.string().optional(),
})

// Ticket form data (for frontend)
export const ticketFormSchema = z.object({
  subject: subjectSchema,
  description: descriptionSchema.optional(),
  status: ticketStatusSchema.default('open'),
  priority: ticketPrioritySchema.default('medium'),
  requesterName: nameSchema,
  requesterEmail: emailSchema,
})

// Add comment schema
export const addCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment is required')
    .max(10000, 'Comment must be less than 10000 characters')
    .transform((val) => val.trim()),
  isInternal: z.boolean().optional().default(false),
})

// Type exports from schemas
export type TicketStatus = z.infer<typeof ticketStatusSchema>
export type TicketPriority = z.infer<typeof ticketPrioritySchema>
export type TicketCategory = z.infer<typeof ticketCategorySchema>
export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type TicketFilterInput = z.infer<typeof ticketFilterSchema>
export type TicketFormInput = z.infer<typeof ticketFormSchema>
export type AddCommentInput = z.infer<typeof addCommentSchema>

/**
 * Validate and parse request body
 * Returns either the validated data or an error object
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errorMessage = result.error.issues
    .map((e: ZodIssue) => `${e.path.join('.')}: ${e.message}`)
    .join(', ')
  return { success: false, error: errorMessage }
}
