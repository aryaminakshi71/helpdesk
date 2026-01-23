"use client";

import { env } from "@helpdesk/env";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, type ReactNode } from "react";

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && env.VITE_PUBLIC_POSTHOG_KEY) {
      posthog.init(env.VITE_PUBLIC_POSTHOG_KEY, {
        api_host: "/ingest",
        ui_host: env.VITE_PUBLIC_POSTHOG_HOST,
        person_profiles: "identified_only",
        session_recording: {
          maskAllInputs: true,
          maskInputOptions: { password: true },
          maskTextSelector: ".sensitive, .ph-no-capture",
        },
        autocapture: {
          dom_event_allowlist: ["click", "change", "submit"],
          url_allowlist: ["/app/*", "/auth/*"],
          element_allowlist: ["button", "a", "input"],
        },
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            posthog.debug();
          }
        },
      });
    }
  }, []);

  if (!env.VITE_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

export function identifyUser(
  userId: string,
  properties?: {
    email?: string;
    name?: string;
    createdAt?: Date | string;
    [key: string]: unknown;
  }
) {
  if (typeof window !== "undefined" && env.VITE_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, properties);
  }
}

export function setOrganization(
  orgId: string,
  properties?: {
    name?: string;
    slug?: string;
    createdAt?: Date | string;
    [key: string]: unknown;
  }
) {
  if (typeof window !== "undefined" && env.VITE_PUBLIC_POSTHOG_KEY) {
    posthog.group("organization", orgId, properties);
  }
}

export function resetUser() {
  if (typeof window !== "undefined" && env.VITE_PUBLIC_POSTHOG_KEY) {
    posthog.reset();
  }
}
