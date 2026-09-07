import { describe, expect, it } from 'vitest';
import { executeLocalCommand } from './assistant-executor';

describe('executeLocalCommand', () => {
  it('calculates safe arithmetic without eval', () => {
    const result = executeLocalCommand('Calculate 847 × 39');
    expect(result.intent).toBe('math');
    expect(result.answer).toBe('33033');
  });

  it('plans navigation to messages', () => {
    const result = executeLocalCommand('Open my messages');
    expect(result.intent).toBe('navigation');
    expect(result.route).toBe('/(tabs)/messages');
  });

  it('requires confirmation for message actions', () => {
    const result = executeLocalCommand('Send a message to Amina');
    expect(result.intent).toBe('message');
    expect(result.requiresConfirmation).toBe(true);
  });
});
