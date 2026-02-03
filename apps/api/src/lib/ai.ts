/**
 * Shared AI Utilities
 *
 * Provides common AI operations that can be used across all apps.
 * Supports both OpenAI and Cloudflare Workers AI.
 *
 * Usage:
 * ```typescript
 * import { createAIClient, analyzeText, generateSuggestions } from './shared-ai-utilities';
 *
 * const ai = createAIClient();
 * const suggestions = await generateSuggestions(ai, 'CRM', 'lead scoring');
 * ```
 */

/**
 * AI Client Configuration
 */
export interface AIConfig {
  provider: 'openai' | 'cloudflare' | 'anthropic';
  apiKey?: string;
  model?: string;
  aiBinding?: any; // Cloudflare Workers AI binding
}

/**
 * Create an AI client based on configuration
 */
export function createAIClient(config?: AIConfig) {
  const provider = config?.provider || (typeof process !== 'undefined' && process.env.AI_PROVIDER) || 'openai';
  
  if (provider === 'cloudflare' && config?.aiBinding) {
    return {
      type: 'cloudflare' as const,
      binding: config.aiBinding,
    };
  }

  if (provider === 'openai') {
    const apiKey = config?.apiKey || (typeof process !== 'undefined' && process.env.OPENAI_API_KEY);
    if (!apiKey) {
      console.warn('OPENAI_API_KEY not set - OpenAI features disabled');
      return null;
    }

    // Dynamic import to avoid bundling in unsupported environments
    return {
      type: 'openai' as const,
      apiKey,
    };
  }

  return null;
}

/**
 * Analyze text and extract insights
 */
export async function analyzeText(
  ai: ReturnType<typeof createAIClient>,
  text: string,
  task: 'sentiment' | 'summary' | 'keywords' | 'categories'
): Promise<any> {
  if (!ai) throw new Error('AI client not configured');

  if (ai.type === 'openai') {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: ai.apiKey });

    const prompts = {
      sentiment: 'Analyze the sentiment of this text. Return JSON: {"sentiment": "positive|negative|neutral", "score": 0-1, "confidence": 0-1}',
      summary: 'Summarize this text in 2-3 sentences. Return JSON: {"summary": "..."}',
      keywords: 'Extract key topics and keywords from this text. Return JSON: {"keywords": ["..."]}',
      categories: 'Categorize this text. Return JSON: {"categories": ["..."]}',
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompts[task] },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  if (ai.type === 'cloudflare') {
    // Use Cloudflare Workers AI
    const response = await ai.binding.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      messages: [
        { role: 'system', content: `Analyze this text for ${task}` },
        { role: 'user', content: text },
      ],
    });

    return response;
  }

  throw new Error('Unsupported AI provider');
}

/**
 * Generate suggestions based on context
 */
export async function generateSuggestions(
  ai: ReturnType<typeof createAIClient>,
  app: string,
  context: string,
  type: 'actions' | 'improvements' | 'insights'
): Promise<string[]> {
  if (!ai) throw new Error('AI client not configured');

  const prompts = {
    actions: `Based on this ${app} context: "${context}", suggest 3-5 actionable next steps. Return JSON: {"suggestions": ["..."]}`,
    improvements: `Based on this ${app} context: "${context}", suggest 3-5 improvements. Return JSON: {"suggestions": ["..."]}`,
    insights: `Based on this ${app} context: "${context}", provide 3-5 key insights. Return JSON: {"suggestions": ["..."]}`,
  };

  if (ai.type === 'openai') {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: ai.apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompts[type] },
        { role: 'user', content: context },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return result.suggestions || [];
  }

  throw new Error('Unsupported AI provider for suggestions');
}

/**
 * Auto-tag content
 */
export async function autoTag(
  ai: ReturnType<typeof createAIClient>,
  content: string,
  maxTags: number = 5
): Promise<Array<{ label: string; confidence: number }>> {
  if (!ai) throw new Error('AI client not configured');

  if (ai.type === 'openai') {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: ai.apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Generate ${maxTags} relevant tags for this content. Return JSON: {"tags": [{"label": "...", "confidence": 0-1}]}`,
        },
        { role: 'user', content },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return result.tags || [];
  }

  throw new Error('Unsupported AI provider for tagging');
}

/**
 * Predict value/score
 */
export async function predictScore(
  ai: ReturnType<typeof createAIClient>,
  context: string,
  predictionType: 'priority' | 'risk' | 'value' | 'success'
): Promise<{ score: number; reasoning: string }> {
  if (!ai) throw new Error('AI client not configured');

  if (ai.type === 'openai') {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: ai.apiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Predict ${predictionType} based on this context. Return JSON: {"score": 0-100, "reasoning": "..."}`,
        },
        { role: 'user', content: context },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  throw new Error('Unsupported AI provider for prediction');
}
