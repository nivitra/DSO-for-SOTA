export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PAUSED = 'PAUSED'
}

export type AIProvider = 'google' | 'openai' | 'anthropic';

export interface ConversationItem {
  id: string;
  original: string;
  rewritten?: string;
  reasoning?: string; // For CoT extraction
  status: ProcessingStatus;
  error?: string;
  timestamp?: number;
  retryCount: number;
}

export interface PipelineConfig {
  provider: AIProvider;
  apiKey: string;
  endpoint?: string; // For custom proxy/enterprise endpoints
  model: string;
  temperature: number;
  concurrency: number;
  delayMs: number;
  maxRetries: number;
  systemInstruction: string;
  promptTemplate: string;
  useNativeThinking: boolean; // Gemini 2.5 Thinking Config
  thinkingBudget: number;
}

export interface PipelineStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  startTime: number | null;
  estimatedTimeRemaining: number | null;
}