import { pgEnum } from 'drizzle-orm/pg-core'

// Organization roles
export const organizationRoleEnum = pgEnum('organization_role', [
  'owner',
  'admin',
  'member',
])
