import { describe, expect, it } from 'vitest';
import { classifyCommand, interpretCommand } from './command-engine';

describe('LinkUp command engine', () => {
  it('recognizes math', () => expect(classifyCommand('Calculate 847 × 39')).toBe('math'));
  it('recognizes messaging intent', () => expect(classifyCommand('reply to Amina')).toBe('message'));
  it('creates a confirmation-aware message plan', () => {
    expect(interpretCommand('send a message to Amina').detail).toContain('confirmation');
  });
});
