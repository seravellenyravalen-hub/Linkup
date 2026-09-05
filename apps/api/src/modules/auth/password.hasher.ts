import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

const COST = 32768;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const MAX_MEMORY = 64 * 1024 * 1024;

export class PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);

    const derivedKey = (await scrypt(
      password,
      salt,
      KEY_LENGTH,
      {
        N: COST,
        r: BLOCK_SIZE,
        p: PARALLELIZATION,
        maxmem: MAX_MEMORY,
      },
    )) as Buffer;

    return [
      'scrypt',
      'v1',
      salt.toString('base64url'),
      derivedKey.toString('base64url'),
    ].join('$');
  }

  async verify(hash: string, password: string): Promise<boolean> {
    const parts = hash.split('$');

    if (
      parts.length !== 4 ||
      parts[0] !== 'scrypt' ||
      parts[1] !== 'v1'
    ) {
      return false;
    }

    const salt = Buffer.from(parts[2], 'base64url');
    const expectedKey = Buffer.from(parts[3], 'base64url');

    if (
      salt.length !== SALT_LENGTH ||
      expectedKey.length !== KEY_LENGTH
    ) {
      return false;
    }

    const actualKey = (await scrypt(
      password,
      salt,
      KEY_LENGTH,
      {
        N: COST,
        r: BLOCK_SIZE,
        p: PARALLELIZATION,
        maxmem: MAX_MEMORY,
      },
    )) as Buffer;

    return timingSafeEqual(actualKey, expectedKey);
  }
}
