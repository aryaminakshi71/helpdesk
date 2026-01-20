// Billing schema - subscriptions and plans (minimal for Stripe support)
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { organizations } from "./auth.schema";

/**
 * Feature limits schema - defines what each plan includes
 */
export const planLimitsSchema = z.object({
  storage: z.number(), // in megabytes (MB)
  teamMembers: z.number(), // max team members
  assets: z.number().nullable(), // max assets (null = unlimited)
  bandwidth: z.number().nullable(), // monthly bandwidth in GB (null = unlimited)
  apiRequests: z.number().nullable(), // monthly API requests (null = unlimited)
});

export type PlanLimits = z.infer<typeof planLimitsSchema>;

/**
 * Feature gates schema - boolean feature toggles
 */
export const featureGatesSchema = z.object({
  apiAccess: z.boolean(), // REST API access
  customDomain: z.boolean(), // Custom domain support
  prioritySupport: z.boolean(), // Priority support
  analytics: z.boolean(), // Analytics dashboard
  webhooks: z.boolean(), // Webhook notifications
  sso: z.boolean(), // SSO integration
});

export type FeatureGates = z.infer<typeof featureGatesSchema>;

export const subscriptionPlans = pgTable(
  "subscription_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tier: text("tier").notNull().default("free"), // 'free', 'pro', 'enterprise'
    name: text("name").notNull(),
    description: text("description"),
    stripePriceId: text("stripe_price_id"),
    price: integer("price").notNull(), // in cents
    interval: text("interval").notNull().default("month"), // 'month', 'year'
    trialDays: integer("trial_days").default(0),
    isActive: boolean("is_active").notNull().default(true),
    // Limits (defines quotas)
    limits: jsonb("limits").$type<PlanLimits>().notNull(),
    // Feature gates (boolean toggles)
    featureGates: jsonb("feature_gates").$type<FeatureGates>().notNull(),
    // Marketing features (display on pricing page)
    marketingFeatures: jsonb("marketing_features")
      .$type<string[]>()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);
