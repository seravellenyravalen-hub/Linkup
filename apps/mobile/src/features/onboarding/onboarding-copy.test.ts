import { describe, expect, it } from 'vitest';

import { onboardingCopy } from './onboarding-copy';

describe('onboardingCopy', () => {
  it('presents LinkUp as a private space for meaningful conversations', () => {
    expect(onboardingCopy.title).toBe('Stay close. Stay LinkUp.');
    expect(onboardingCopy.description).toContain('people who matter');
    expect(onboardingCopy.primaryAction).toBe('Create account');
    expect(onboardingCopy.secondaryAction).toBe('Sign in');
  });
});
