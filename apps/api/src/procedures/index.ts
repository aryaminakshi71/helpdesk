/**
 * Base Procedures
 *
 * Composable procedure builders with middleware.
 * Pattern adapted from Fanbeam/Samva oRPC setup.
 *
 * IMPORTANT: Database is NOT stored in context to avoid TS7056 type inference issues.
 * Use `getDb(context)` from `../lib/db` in procedures that need database access.
 * See: https://orpc.dev/docs/advanced/exceeds-the-maximum-length-problem
 */

import { os, ORPCError } from "@orpc/server";
import { eq, and } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { createAuthFromEnv } from "../lib/create-auth-from-env";
import type { InitialContext, AuthContext, OrgContext } from "../context";

/**
 * Base procedure with initial context (env, headers, requestId, logger)
 */
export const base = os.$context<InitialContext>();

/**
 * Public procedure - no auth required
 * Use getDb(context) in handlers when database access is needed.
 */
export const pub = base;

/**
 * Authenticated procedure - requires login (session auth) or demo mode
 * Uses .use<T>() for explicit type parameter instead of .middleware() for better type inference.
 */
export const authed = base.use<AuthContext>(async ({ context, next }) => {
  if (!context.headers) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Missing headers",
    });
  }

  // Check for demo mode
  const isDemo = context.headers.get("x-demo-mode") === "true";
  if (isDemo) {
    // Create a mock auth context for demo mode
    const db = getDb(context);
    const auth = createAuthFromEnv(db, context.env);
    
    // Return demo context with mock user and session
    return next({
      context: {
        ...context,
        auth,
        user: {
          id: "demo-user-001",
          email: "demo@example.com",
          name: "Demo User",
          emailVerified: true,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any,
        session: {
          id: "demo-session-001",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          token: "demo-token",
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: null,
          userAgent: null,
          userId: "demo-user-001",
          activeOrganizationId: "demo-org",
        } as any,
      },
    });
  }

  const db = getDb(context);
  const auth = createAuthFromEnv(db, context.env);

  // Try session authentication
  try {
    const session = await auth.api.getSession({
      headers: context.headers,
    });

    if (session?.user && session?.session) {
      return next({
        context: {
          ...context,
          auth,
          user: session.user,
          session: session.session,
        },
      });
    }
  } catch {
    // Session auth failed
  }

  // No valid auth - throw error
  throw new ORPCError("UNAUTHORIZED", {
    message: "Authentication required",
  });
});

/**
 * Organization-scoped procedure - requires org membership
 * Prefetches organization and member data in a single query.
 */
export const orgAuthed = authed.use<OrgContext>(async ({ context, next }) => {
  const orgSlug = context.headers.get("x-organization-slug");
  const orgId = context.headers.get("x-organization-id");

  if (!orgSlug && !orgId) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Organization identifier required (x-organization-slug or x-organization-id header)",
    });
  }

  const db = getDb(context);

  // Single query to load org + membership
  const result = await db
    .select({
      organization: {
        id: schema.organizations.id,
        name: schema.organizations.name,
        slug: schema.organizations.slug,
        plan: schema.organizations.plan,
      },
      member: {
        id: schema.members.id,
        role: schema.members.role,
      },
    })
    .from(schema.organizations)
    .innerJoin(
      schema.members,
      and(
        eq(schema.members.organizationId, schema.organizations.id),
        eq(schema.members.userId, context.user.id),
      ),
    )
    .where(
      orgSlug
        ? eq(schema.organizations.slug, orgSlug)
        : eq(schema.organizations.id, orgId!),
    )
    .limit(1);

  if (!result[0]) {
    throw new ORPCError("FORBIDDEN", {
      message: "Not a member of this organization",
    });
  }

  return next({
    context: {
      ...context,
      organization: result[0].organization,
      member: result[0].member,
    },
  });
});

/**
 * Require specific role(s)
 */
export function requireRole(...roles: Array<"owner" | "admin" | "member">) {
  return orgAuthed.use<OrgContext>(async ({ context, next }) => {
    if (!roles.includes(context.member.role)) {
      throw new ORPCError("FORBIDDEN", {
        message: `Required role: ${roles.join(" or ")}`,
      });
    }
    return next({ context });
  });
}

export const adminOnly = requireRole("admin", "owner");
export const ownerOnly = requireRole("owner");

// Re-export getDb and schema for convenience in procedure files
export { getDb, schema };
