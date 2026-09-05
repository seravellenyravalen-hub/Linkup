import { describe, expect, it } from 'vitest';
import { PasswordHasher } from './password.hasher';

describe('PasswordHasher', () => {
  it('hashes a password without storing the plaintext', async () => {
    const hasher = new PasswordHasher();

    const hash = await hasher.hash('correct horse battery staple');

    expect(hash).not.toBe('correct horse battery staple');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('produces a different hash each time for the same password', async () => {
    const hasher = new PasswordHasher();
    const password = 'correct horse battery staple';

    const firstHash = await hasher.hash(password);
    const secondHash = await hasher.hash(password);

    expect(firstHash).not.toBe(secondHash);
  });

  it('verifies the correct password and rejects an incorrect password', async () => {
    const hasher = new PasswordHasher();
    const password = 'correct horse battery staple';

    const hash = await hasher.hash(password);

    await expect(hasher.verify(hash, password)).resolves.toBe(true);
    await expect(hasher.verify(hash, 'wrong password')).resolves.toBe(false);
  });

  it('rejects malformed hashes', async () => {
    const hasher = new PasswordHasher();

    await expect(
      hasher.verify('not-a-valid-hash', 'password'),
    ).resolves.toBe(false);

    await expect(
      hasher.verify('scrypt$v2$invalid$invalid', 'password'),
    ).resolves.toBe(false);
  });

  it('rejects a tampered hash', async () => {
    const hasher = new PasswordHasher();
    const password = 'correct horse battery staple';

    const hash = await hasher.hash(password);
    const tamperedHash = `${hash}tampered`;

    await expect(
      hasher.verify(tamperedHash, password),
    ).resolves.toBe(false);
  });
});
