export type CommandIntent = 'math' | 'message' | 'navigation' | 'search' | 'general';

export type CommandPlan = {
  intent: CommandIntent;
  title: string;
  detail: string;
};

const mathPattern = /^(calculate|compute|what is)\b/i;
const messagePattern = /\b(reply|message|send|text|tell)\b/i;
const navigationPattern = /\b(open|go to|show|take me)\b/i;
const searchPattern = /\b(find|search|look for|locate)\b/i;

export function classifyCommand(input: string): CommandIntent {
  const value = input.trim();
  if (mathPattern.test(value) || /^[\d\s().,+\-*/×÷%^]+$/.test(value)) return 'math';
  if (messagePattern.test(value)) return 'message';
  if (navigationPattern.test(value)) return 'navigation';
  if (searchPattern.test(value)) return 'search';
  return 'general';
}

export function interpretCommand(input: string): CommandPlan {
  const intent = classifyCommand(input);
  const plans: Record<CommandIntent, Omit<CommandPlan, 'intent'>> = {
    math: { title: 'Solve the calculation', detail: 'Parse the expression, calculate it, then return the result.' },
    message: { title: 'Prepare a message action', detail: 'Identify the recipient and content, then require confirmation before sending.' },
    navigation: { title: 'Navigate LinkUp', detail: 'Resolve the requested destination and open it without destructive side effects.' },
    search: { title: 'Search your LinkUp space', detail: 'Search conversations and people using the authenticated account context.' },
    general: { title: 'Understand and respond', detail: 'Interpret the request and choose the safest supported capability.' },
  };
  return { intent, ...plans[intent] };
}
