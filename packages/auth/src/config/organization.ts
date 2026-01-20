/**
 * Organization Plugin Configuration
 *
 * Multi-tenant team support with role-based access control.
 * Pattern adapted from Fanbeam/Samva.
 */

import { organization } from "better-auth/plugins";

export type OrganizationRole = "viewer" | "member" | "admin" | "owner";

export interface OrganizationConfig {
  /** Maximum organizations per user (free tier) */
  organizationLimit?: number;
  /** Allow users to create organizations */
  allowUserToCreateOrganization?: boolean;
  /** Custom invitation email handler */
  sendInvitationEmail?: (params: {
    email: string;
    organization: { id: string; name: string; slug?: string };
    inviter: { id: string; name?: string; email: string };
    url: string;
  }) => Promise<void>;
}

/**
 * Create organization plugin configuration
 */
export function organizationConfig(config: OrganizationConfig = {}) {
  const {
    organizationLimit = 3,
    allowUserToCreateOrganization = true,
    sendInvitationEmail,
  } = config;

  return organization({
    allowUserToCreateOrganization,
    organizationLimit,
    sendInvitationEmail:
      sendInvitationEmail ??
      (async ({ email, organization }) => {
        // Default: log invitation (replace with email service)
        console.log(`[Auth] Invitation to ${email} for org ${organization.name}`);
      }),
  });
}
