import { describe, expect, it } from 'vitest';

import { homeContent } from './home-content';

describe('homeContent', () => {
  it('defines the primary signed-in LinkUp experience', () => {
    expect(homeContent.greeting).toBe('Your circle, in sync.');
    expect(homeContent.aiPrompt).toContain('Ask LinkUp');
    expect(homeContent.conversations).toHaveLength(3);
    expect(homeContent.conversations[0]?.title).toBe('Amina');
  });
});
