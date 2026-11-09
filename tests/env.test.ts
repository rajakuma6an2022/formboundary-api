import { describe, expect, it } from 'vitest';
import { loadEnv } from '../src/config/env.js';

const valid = {
  NODE_ENV: 'test',
  PORT: '4000',
  MONGODB_URI: 'mongodb://localhost:27017/formboundary_test',
  CLIENT_ORIGIN: 'http://localhost:5173',
};

describe('loadEnv', () => {
  it('parses a valid environment', () => {
    const env = loadEnv(valid);
    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe('test');
  });

  it('throws with variable names but never values when invalid', () => {
    expect(() => loadEnv({ ...valid, MONGODB_URI: '' })).toThrow(/MONGODB_URI/);
    try {
      loadEnv({ ...valid, CLIENT_ORIGIN: 'not-a-url-secret123' });
    } catch (e) {
      expect(String(e)).toContain('CLIENT_ORIGIN');
      expect(String(e)).not.toContain('secret123');
    }
  });
});
