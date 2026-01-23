/**
 * Optimized Image Component
 * 
 * Automatically optimizes images with WebP/AVIF format, responsive sizes, and lazy loading.
 * Works with Cloudflare Images or R2 with on-demand transformations.
 */

import { env } from "@helpdesk/env";
import { useState } from "react";

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "auto";
  priority?: boolean;
  className?: string;
  sizes?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

/**
 * Generate optimized image URL
 * Supports Cloudflare Images or R2 with query params
 */
function getOptimizedImageUrl(
  src: string,
  width?: number,
  quality: number = 85,
  format: "webp" | "avif" | "auto" = "auto"
): string {
  // If already a full URL with CDN, add optimization params
  if (src.startsWith("http://") || src.startsWith("https://")) {
    const url = new URL(src);
    if (width) url.searchParams.set("w", width.toString());
    url.searchParams.set("q", quality.toString());
    if (format !== "auto") {
      url.searchParams.set("f", format);
    }
    return url.toString();
  }

  // Relative path - prepend CDN URL if available
  const cdnUrl = env.VITE_PUBLIC_CDN_URL || "";
  const baseUrl = cdnUrl ? `${cdnUrl}${src.startsWith("/") ? "" : "/"}${src}` : src;
  const url = new URL(baseUrl, window.location.origin);
  
  if (width) url.searchParams.set("w", width.toString());
  url.searchParams.set("q", quality.toString());
  if (format !== "auto") {
    url.searchParams.set("f", format);
  }
  
  return url.toString();
}

/**
 * Optimized Image Component
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 85,
  format = "auto",
  priority = false,
  className = "",
  sizes,
  objectFit = "cover",
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Generate optimized URLs
  const webpSrc = getOptimizedImageUrl(src, width, quality, "webp");
  const avifSrc = getOptimizedImageUrl(src, width, quality, "avif");
  const fallbackSrc = src;

  // Responsive sizes
  const responsiveSizes = sizes || (width ? `${width}px` : "100vw");

  return (
    <picture className={className}>
      <source
        srcSet={avifSrc}
        type="image/avif"
        sizes={responsiveSizes}
      />
      <source
        srcSet={webpSrc}
        type="image/webp"
        sizes={responsiveSizes}
      />
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          objectFit,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        className={className}
      />
    </picture>
  );
}
