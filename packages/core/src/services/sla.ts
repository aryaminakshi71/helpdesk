/**
 * SLA (Service Level Agreement) Management Service
 * 
 * Handles SLA tracking, calculations, and breach detection
 */

export interface SLATargets {
  firstResponseTime: number; // in minutes
  resolutionTime: number; // in minutes
}

export interface SLAStatus {
  ticketId: string;
  firstResponseDue: Date | null;
  firstResponseAt: Date | null;
  firstResponseBreached: boolean;
  resolutionDue: Date | null;
  resolvedAt: Date | null;
  resolutionBreached: boolean;
  currentStatus: "on_track" | "at_risk" | "breached";
}

/**
 * Calculate SLA due dates based on priority
 */
export function calculateSLADueDates(
  createdAt: Date,
  priority: "low" | "medium" | "high" | "urgent",
  targets: SLATargets,
): {
  firstResponseDue: Date;
  resolutionDue: Date;
} {
  // Priority-based multipliers
  const priorityMultipliers = {
    urgent: 0.5, // 50% of base time
    high: 0.75, // 75% of base time
    medium: 1.0, // 100% of base time
    low: 1.5, // 150% of base time
  };

  const multiplier = priorityMultipliers[priority];

  const firstResponseMinutes = targets.firstResponseTime * multiplier;
  const resolutionMinutes = targets.resolutionTime * multiplier;

  const firstResponseDue = new Date(
    createdAt.getTime() + firstResponseMinutes * 60 * 1000,
  );
  const resolutionDue = new Date(
    createdAt.getTime() + resolutionMinutes * 60 * 1000,
  );

  return {
    firstResponseDue,
    resolutionDue,
  };
}

/**
 * Check if SLA is breached or at risk
 */
export function checkSLAStatus(
  sla: {
    firstResponseDue: Date | null;
    firstResponseAt: Date | null;
    resolutionDue: Date | null;
    resolvedAt: Date | null;
  },
): "on_track" | "at_risk" | "breached" {
  const now = new Date();

  // Check if breached
  if (sla.firstResponseDue && !sla.firstResponseAt) {
    if (now > sla.firstResponseDue) {
      return "breached";
    }
  }

  if (sla.resolutionDue && !sla.resolvedAt) {
    if (now > sla.resolutionDue) {
      return "breached";
    }
  }

  // Check if at risk (within 20% of deadline)
  if (sla.firstResponseDue && !sla.firstResponseAt) {
    const timeRemaining = sla.firstResponseDue.getTime() - now.getTime();
    const totalTime = sla.firstResponseDue.getTime() - (sla.firstResponseDue.getTime() - 60 * 60 * 1000); // Approximate
    if (timeRemaining / totalTime < 0.2) {
      return "at_risk";
    }
  }

  if (sla.resolutionDue && !sla.resolvedAt) {
    const timeRemaining = sla.resolutionDue.getTime() - now.getTime();
    const totalTime = sla.resolutionDue.getTime() - (sla.resolutionDue.getTime() - 60 * 60 * 1000);
    if (timeRemaining / totalTime < 0.2) {
      return "at_risk";
    }
  }

  return "on_track";
}

/**
 * Get default SLA targets by priority
 */
export function getDefaultSLATargets(
  priority: "low" | "medium" | "high" | "urgent",
): SLATargets {
  const targets: Record<string, SLATargets> = {
    urgent: {
      firstResponseTime: 30, // 30 minutes
      resolutionTime: 240, // 4 hours
    },
    high: {
      firstResponseTime: 60, // 1 hour
      resolutionTime: 480, // 8 hours
    },
    medium: {
      firstResponseTime: 240, // 4 hours
      resolutionTime: 1440, // 24 hours
    },
    low: {
      firstResponseTime: 480, // 8 hours
      resolutionTime: 2880, // 48 hours
    },
  };

  return targets[priority]!;
}
