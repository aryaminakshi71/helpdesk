/**
 * Example Workflow
 *
 * This is a template workflow - uncomment and modify as needed.
 * To use workflows, you'll need to:
 *
 * 1. Add the workflow binding to wrangler.jsonc:
 *    "workflows": [{ "name": "example-workflow", "binding": "EXAMPLE_WORKFLOW", "class_name": "ExampleWorkflow" }]
 *
 * 2. Export the workflow class from your worker entry point
 *
 * 3. Trigger the workflow from your API routes
 *
 * @see https://developers.cloudflare.com/workflows/
 */

// import { WorkflowEntrypoint, WorkflowEvent, WorkflowStep } from "cloudflare:workers";
// import type { WorkflowEvent as AppWorkflowEvent } from "./types";

// interface ExamplePayload {
//   userId: string;
//   action: string;
// }

// export class ExampleWorkflow extends WorkflowEntrypoint {
//   async run(event: WorkflowEvent<ExamplePayload>, step: WorkflowStep) {
//     // Step 1: Validate input
//     const validated = await step.do("validate-input", async () => {
//       const { userId, action } = event.payload;
//       if (!userId || !action) {
//         throw new Error("Missing required fields");
//       }
//       return { userId, action };
//     });

//     // Step 2: Process action
//     const result = await step.do("process-action", async () => {
//       // Your business logic here
//       console.log(`Processing ${validated.action} for user ${validated.userId}`);
//       return { success: true };
//     });

//     // Step 3: Send notification (optional)
//     await step.do("send-notification", async () => {
//       // Could integrate with email, Slack, etc.
//       console.log("Workflow completed:", result);
//     });

//     return result;
//   }
// }
