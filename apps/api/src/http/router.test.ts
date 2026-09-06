import { describe, expect, it } from 'vitest';
import { Router } from './router';

describe('Router', () => {
  it('matches an exact method and path', () => {
    const router = new Router();
    const handler = async () => new Response('ok');

    router.register('POST', '/api/v1/auth/register', handler);

    expect(router.match('POST', '/api/v1/auth/register')).toBe(handler);
  });

  it('does not match an unknown path', () => {
    const router = new Router();
    const handler = async () => new Response('ok');

    router.register('POST', '/api/v1/auth/register', handler);

    expect(router.match('POST', '/api/v1/auth/login')).toBeNull();
  });

  it('does not match an unsupported method', () => {
    const router = new Router();
    const handler = async () => new Response('ok');

    router.register('POST', '/api/v1/auth/register', handler);

    expect(router.match('GET', '/api/v1/auth/register')).toBeNull();
  });
});
