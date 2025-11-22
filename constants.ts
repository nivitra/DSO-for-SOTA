export const DEFAULT_SYSTEM_INSTRUCTION = `You are an expert conversation rewriter.
Your goal is to improve the clarity, tone, and grammar of the provided conversation snippets while retaining the original meaning.

Implement Chain of Thought (CoT) reasoning. 
1. First, analyze the original text for flaws, ambiguity, or tonal issues.
2. Plan the rewriting strategy.
3. Finally, provide the rewritten version.

Output Format (Strictly follow this if not using native thinking):
---REASONING---
[Your step-by-step analysis here]
---REWRITTEN---
[The final rewritten text here]`;

export const DEFAULT_PROMPT_TEMPLATE = `Original Conversation:
{{text}}

Please analyze and rewrite this following the system instructions.`;

export const SAMPLE_DATASET = [
  { id: '1', original: "hey u there? need help with api wont work", status: 'IDLE' },
  { id: '2', original: "customer service was bad i want refund now", status: 'IDLE' },
  { id: '3', original: "wat time is the meeting 2moro?", status: 'IDLE' },
  { id: '4', original: "this code is buggy fix it plz", status: 'IDLE' },
  { id: '5', original: "tell me joke about ai", status: 'IDLE' },
];

export const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro Preview' },
];