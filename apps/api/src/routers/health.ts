import { z } from "zod";
import { pub } from "../procedures";

export const healthRouter = {
  /**
   * Health check endpoint
   */
  check: pub
    .route({
      method: "GET",
      path: "/health",
      summary: "Health check",
      tags: ["Health"],
    })
    .input(z.object({}).optional())
    .output(
      z.object({
        status: z.string(),
        timestamp: z.string(),
        version: z.string(),
      }),
    )
    .handler(async () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };
    }),
};
