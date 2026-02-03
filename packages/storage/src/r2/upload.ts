/**
 * R2 Upload Helpers
 * 
 * Utilities for uploading files to Cloudflare R2
 */

import type { R2Bucket } from '@cloudflare/workers-types'

export interface UploadOptions {
  folder?: string
  ticketId?: string
  commentId?: string
  maxSize?: number // in bytes
  allowedMimeTypes?: string[]
}

export interface UploadResult {
  key: string
  fileName: string
  fileSize: number
  mimeType: string
  url?: string // Public URL if bucket is public
}

/**
 * Upload file to R2
 */
export async function uploadToR2(
  bucket: R2Bucket,
  file: File | Blob,
  fileName: string,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const {
    folder = 'uploads',
    ticketId,
    commentId,
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedMimeTypes,
  } = options

  // Validate file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`)
  }

  // Validate MIME type
  if (allowedMimeTypes && file.type) {
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error(
        `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      )
    }
  }

  // Generate file key
  const timestamp = Date.now()
  const randomId = crypto.randomUUID().slice(0, 8)
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const extension = fileName.split('.').pop() || 'bin'

  let key = `${folder}`
  if (ticketId) {
    key += `/tickets/${ticketId}`
  }
  if (commentId) {
    key += `/comments/${commentId}`
  }
  key += `/${timestamp}-${randomId}-${sanitizedFileName}`

  // Upload to R2 - use file directly, R2 accepts File/Blob
  // Type assertion needed due to Node.js vs Cloudflare Workers Blob type differences
  await bucket.put(key, file as any, {
    httpMetadata: {
      contentType: file.type || 'application/octet-stream',
      contentDisposition: `attachment; filename="${fileName}"`,
    },
    customMetadata: {
      originalFileName: fileName,
      uploadedAt: new Date().toISOString(),
      ...(ticketId && { ticketId }),
      ...(commentId && { commentId }),
    },
  })

  return {
    key,
    fileName,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
  }
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string,
): Promise<void> {
  await bucket.delete(key)
}

/**
 * Get file from R2
 */
export async function getFromR2(
  bucket: R2Bucket,
  key: string,
): Promise<import('@cloudflare/workers-types').R2ObjectBody | null> {
  const object = await bucket.get(key)
  return object
}

/**
 * Generate presigned URL for file access (if needed)
 * 
 * Note: R2 doesn't have built-in presigned URLs like S3.
 * This implementation uses public URLs if available, or provides
 * a worker endpoint pattern for secure access.
 */
export async function getPresignedUrl(
  bucket: R2Bucket,
  key: string,
  expiresIn: number = 3600, // 1 hour default
  options?: {
    publicUrl?: string;
    workerEndpoint?: string;
  }
): Promise<string> {
  // If public URL is configured, return public URL
  if (options?.publicUrl) {
    return `${options.publicUrl}/${key}`;
  }

  // If worker endpoint is configured, return worker endpoint URL
  // The worker should handle authentication and generate signed URLs
  if (options?.workerEndpoint) {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
    return `${options.workerEndpoint}/${key}?expires=${expiresAt}`;
  }

  // Fallback: Check if bucket is public (this requires R2 public access)
  // In production, you should configure a custom domain for R2
  const publicUrl = process.env.R2_PUBLIC_URL || process.env.R2_CUSTOM_DOMAIN;
  if (publicUrl) {
    return `${publicUrl}/${key}`;
  }

  throw new Error(
    'Presigned URLs require either:\n' +
    '1. R2_PUBLIC_URL or R2_CUSTOM_DOMAIN environment variable set\n' +
    '2. A Cloudflare Worker endpoint configured for secure file access\n' +
    '3. Public bucket access with custom domain configured in Cloudflare dashboard'
  );
}
