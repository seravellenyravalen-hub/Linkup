import { router } from 'expo-router';
import { interpretCommand, type CommandIntent } from './command-engine';

export type AssistantResult = {
  intent: CommandIntent;
  title: string;
  detail: string;
  answer?: string;
  route?: string;
  requiresConfirmation?: boolean;
};

function calculate(expression: string): number | null {
  const cleaned = expression
    .replace(/^(calculate|compute|what is)\s+/i, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/[^0-9+\-*/().%\s]/g, '')
    .trim();
  if (!cleaned || !/[0-9]/.test(cleaned)) return null;

  const tokens = cleaned.match(/\d+(?:\.\d+)?|[+\-*/%()]|\s+/g);
  if (!tokens || tokens.join('') !== cleaned) return null;
  const values = tokens.filter((token) => !/^\s+$/.test(token));
  const output: (number | string)[] = [];
  const ops: string[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };

  const apply = () => {
    const op = ops.pop();
    if (!op) return false;
    const right = output.pop();
    const left = output.pop();
    if (typeof left !== 'number' || typeof right !== 'number') return false;
    if (op === '/' && right === 0) return false;
    const result = op === '+' ? left + right : op === '-' ? left - right : op === '*' ? left * right : op === '/' ? left / right : left % right;
    if (!Number.isFinite(result)) return false;
    output.push(result);
    return true;
  };

  for (const token of values) {
    if (/^\d/.test(token)) output.push(Number(token));
    else if (token === '(') ops.push(token);
    else if (token === ')') {
      while (ops.length && ops.at(-1) !== '(') if (!apply()) return null;
      if (ops.pop() !== '(') return null;
    } else {
      while (ops.length && ops.at(-1) !== '(' && precedence[ops.at(-1)] >= precedence[token]) if (!apply()) return null;
      ops.push(token);
    }
  }
  while (ops.length) if (!apply()) return null;
  return output.length === 1 && typeof output[0] === 'number' ? output[0] : null;
}

export function executeLocalCommand(input: string): AssistantResult {
  const plan = interpretCommand(input);

  if (plan.intent === 'math') {
    const answer = calculate(input);
    return answer === null
      ? { ...plan, detail: 'I could not safely parse that calculation. Try a plain expression such as 847 × 39.' }
      : { ...plan, answer: String(answer), detail: 'Calculated locally without sending the expression to a server.' };
  }

  if (plan.intent === 'navigation') {
    const value = input.toLowerCase();
    const route = value.includes('message') ? '/(tabs)/messages' : value.includes('profile') ? '/(tabs)/profile' : value.includes('setting') ? '/settings' : value.includes('notification') ? '/notifications' : value.includes('home') ? '/(tabs)' : '/(tabs)/explore';
    return { ...plan, route, detail: `Ready to open ${route === '/(tabs)/messages' ? 'Messages' : route === '/(tabs)/profile' ? 'Profile' : route === '/settings' ? 'Settings' : route === '/notifications' ? 'Notifications' : route === '/(tabs)' ? 'Home' : 'Discover'}.` };
  }

  if (plan.intent === 'message') {
    return { ...plan, requiresConfirmation: true, detail: 'I can prepare the message, but sending it requires an explicit confirmation.' };
  }

  if (plan.intent === 'search') {
    return { ...plan, route: '/(tabs)/explore', detail: 'I can open Discover so you can search LinkUp content and people.' };
  }

  return { ...plan, answer: 'I understand the request. I can plan supported LinkUp actions here, and the server AI layer can be connected for broader tasks.' };
}

export function applyLocalNavigation(result: AssistantResult) {
  if (result.route) router.push(result.route as never);
}
