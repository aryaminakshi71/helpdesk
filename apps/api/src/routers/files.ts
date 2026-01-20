/**
 * Files Router
 *
 * File upload and management for tickets
 */

import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { orgAuthed, getDb, schema } from '../procedures'
import { ORPCError } from '@orpc/server'
import { uploadToR2, deleteFromR2 } from '@helpdesk/storage/r2'
import type { OrgContext } from '../context'

export const filesRouter = {
  /**
   * Upload file to R2 and create attachment record
   */
  upload: orgAuthed
    .route({
      method: 'POST',
      path: '/files/upload',
      summary: 'Upload file for ticket',
      tags: ['Files'],
    })
    .input(
      z.object({
        ticketId: z.string().uuid(),
        commentId: z.string().uuid().optional(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        file: z.string(), // Base64 encoded file or FormData
      }),
    )
    .output(
      z.object({
        id: z.string().uuid(),
        fileKey: z.string(),
        fileName: z.string(),
        fileSize: z.string(),
        mimeType: z.string(),
      }),
    )
    .handler(async ({ context, input }: { context: OrgContext; input: { ticketId: string; commentId?: string; fileName: string; fileSize: number; mimeType: string; file: string } }) => {
      const db = getDb(context)

      // Verify ticket exists and belongs to org
      const [ticket] = await db
        .select({ id: schema.tickets.id })
        .from(schema.tickets)
        .where(
          and(
            eq(schema.tickets.id, input.ticketId),
            eq(schema.tickets.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!ticket) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Ticket not found',
        })
      }

      // Get R2 bucket from environment
      const bucket = context.env.BUCKET
      if (!bucket) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'R2 bucket not configured',
        })
      }

      // Convert base64 to Blob if needed
      let fileBlob: Blob
      if (input.file.startsWith('data:')) {
        // Base64 data URL
        const response = await fetch(input.file)
        fileBlob = await response.blob()
      } else {
        // Assume it's already a blob or needs to be handled differently
        // In a real implementation, you'd handle FormData properly
        throw new ORPCError('BAD_REQUEST', {
          message: 'File format not supported. Use FormData or base64.',
        })
      }

      // Upload to R2
      const uploadResult = await uploadToR2(
        bucket,
        fileBlob,
        input.fileName,
        {
          folder: 'tickets',
          ticketId: input.ticketId,
          commentId: input.commentId,
          maxSize: 10 * 1024 * 1024, // 10MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'text/plain',
            'text/csv',
          ],
        },
      )

      // Create attachment record
      const [attachment] = await db
        .insert(schema.ticketAttachments)
        .values({
          ticketId: input.ticketId,
          commentId: input.commentId,
          fileName: input.fileName,
          fileKey: uploadResult.key,
          fileSize: String(input.fileSize),
          mimeType: input.mimeType,
          uploadedBy: context.user.id,
        })
        .returning()

      if (!attachment) {
        // Clean up R2 file if DB insert failed
        if (bucket) {
          await deleteFromR2(bucket, uploadResult.key)
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to create attachment record',
        })
      }

      context.logger.info(
        { ticketId: input.ticketId, attachmentId: attachment.id },
        'File uploaded',
      )

      return {
        id: attachment.id,
        fileKey: attachment.fileKey,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize || String(input.fileSize),
        mimeType: attachment.mimeType || input.mimeType,
      }
    }),

  /**
   * Delete file attachment
   */
  delete: orgAuthed
    .route({
      method: 'DELETE',
      path: '/files/{id}',
      summary: 'Delete file attachment',
      tags: ['Files'],
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }: { context: OrgContext; input: { id: string } }) => {
      const db = getDb(context)

      // Get attachment and verify it belongs to org's ticket
      const [attachment] = await db
        .select({
          id: schema.ticketAttachments.id,
          fileKey: schema.ticketAttachments.fileKey,
          ticketId: schema.ticketAttachments.ticketId,
        })
        .from(schema.ticketAttachments)
        .innerJoin(
          schema.tickets,
          eq(schema.tickets.id, schema.ticketAttachments.ticketId),
        )
        .where(
          and(
            eq(schema.ticketAttachments.id, input.id),
            eq(schema.tickets.organizationId, context.organization.id),
          ),
        )
        .limit(1)

      if (!attachment) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Attachment not found',
        })
      }

      // Delete from R2
      const bucket = context.env.BUCKET
      if (!bucket) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'R2 bucket not configured',
        })
      }
      await deleteFromR2(bucket, attachment.fileKey)

      // Delete from database
      await db
        .delete(schema.ticketAttachments)
        .where(eq(schema.ticketAttachments.id, input.id))

      context.logger.info({ attachmentId: input.id }, 'File deleted')

      return { success: true }
    }),
}
