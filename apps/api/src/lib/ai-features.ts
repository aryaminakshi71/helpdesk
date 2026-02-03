/**
 * Helpdesk AI Features
 *
 * AI-powered features for Helpdesk:
 * - Auto-tagging tickets
 * - Suggested responses
 * - Sentiment analysis
 * - Knowledge base suggestions
 */

import { createAIClient, analyzeText, generateSuggestions, autoTag } from "./ai";

const ai = createAIClient({ provider: "openai" });

/**
 * Auto-tag a ticket based on its content
 */
export async function autoTagTicket(
  subject: string,
  description: string
): Promise<Array<{ label: string; confidence: number }>> {
  if (!ai) {
    return [];
  }

  const content = `Subject: ${subject}\n\nDescription: ${description}`;
  return await autoTag(ai, content, 5);
}

/**
 * Generate suggested response for a ticket
 */
export async function suggestResponse(
  ticketContent: string,
  category?: string
): Promise<string[]> {
  if (!ai) {
    return [];
  }

  const context = `Ticket: ${ticketContent}${category ? `\nCategory: ${category}` : ""}`;
  return await generateSuggestions(ai, "Helpdesk", context, "actions");
}

/**
 * Analyze sentiment of ticket
 */
export async function analyzeTicketSentiment(
  content: string
): Promise<{ sentiment: "positive" | "negative" | "neutral"; score: number }> {
  if (!ai) {
    return { sentiment: "neutral", score: 0.5 };
  }

  const analysis = await analyzeText(ai, content, "sentiment");
  return {
    sentiment: analysis.sentiment || "neutral",
    score: analysis.score || 0.5,
  };
}

/**
 * Suggest knowledge base articles
 */
export async function suggestKnowledgeBaseArticles(
  ticketContent: string
): Promise<string[]> {
  if (!ai) {
    return [];
  }

  const context = `Ticket content: ${ticketContent}`;
  const keywords = await analyzeText(ai, ticketContent, "keywords");
  return keywords.keywords || [];
}
