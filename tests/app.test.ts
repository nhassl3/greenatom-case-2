import supertest from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import EquipmentRepo from '@src/repos/EquipmentRepo';

import { agent } from './support/agent';

/**
 * Свежий экземпляр app с переопределённым окружением: env читается при импорте модулей.
 */
async function appWithEnv(env: Record<string, string>) {
  Object.assign(process.env, env);
  vi.resetModules();
  const { default: app } = await import('@src/app');
  return supertest(app);
}

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
});

describe('Общие ответы', () => {
  it('404 для неизвестного маршрута в общем формате', async () => {
    const res = await agent.get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatchObject({ code: 'ROUTE_NOT_FOUND' });
    expect(res.body.error.requestId).toBe(res.headers['x-request-id']);
  });

  it('400 INVALID_JSON для битого JSON', async () => {
    const res = await agent.post('/api/equipment').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  it('413 для слишком большого тела', async () => {
    const res = await agent.post('/api/equipment').send({ name: 'x'.repeat(200 * 1024) });
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('X-Request-Id: входящий корректный принимается, некорректный заменяется', async () => {
    const ok = await agent.get('/api/health').set('X-Request-Id', 'trace-42');
    expect(ok.headers['x-request-id']).toBe('trace-42');
    const bad = await agent.get('/api/health').set('X-Request-Id', 'evil value; with spaces');
    expect(bad.headers['x-request-id']).not.toContain(' ');
  });

  it('500 в общем формате при неожиданной ошибке', async () => {
    vi.spyOn(EquipmentRepo, 'findMany').mockRejectedValue(new Error('disk exploded'));
    const res = await agent.get('/api/equipment');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Безопасность', () => {
  it('helmet-заголовки на ответах', async () => {
    const res = await agent.get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('CORS: разрешённый origin получает заголовок, чужой — нет', async () => {
    const allowed = await agent.get('/api/health').set('Origin', 'http://localhost:5173');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    const evil = await agent.get('/api/health').set('Origin', 'https://evil.example');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('429 после превышения лимита, с Retry-After и в общем формате', async () => {
    const api = await appWithEnv({ RATE_LIMIT_MAX: '2' });
    await api.get('/api/health');
    await api.get('/api/health');
    const res = await api.get('/api/health');
    expect(res.status).toBe(429);
    expect(res.headers['retry-after']).toBeDefined();
    expect(res.body.error.code).toBe('TOO_MANY_REQUESTS');
  });

  it('X-API-Key обязателен для изменяющих запросов, если ключ задан', async () => {
    const api = await appWithEnv({ API_KEY: 'secret-key' });
    expect((await api.get('/api/equipment')).status).toBe(200);
    const noKey = await api.post('/api/equipment').send({});
    expect(noKey.status).toBe(401);
    expect(noKey.body.error.code).toBe('UNAUTHORIZED');
    const wrongKey = await api.post('/api/equipment').set('X-API-Key', 'wrong').send({});
    expect(wrongKey.status).toBe(401);
    const withKey = await api.post('/api/equipment').set('X-API-Key', 'secret-key').send({});
    expect(withKey.status).toBe(422);
  });

  it('production: текст неожиданной ошибки не попадает в ответ', async () => {
    const api = await appWithEnv({ NODE_ENV: 'production' });
    const { default: Repo } = await import('@src/repos/EquipmentRepo');
    vi.spyOn(Repo, 'findMany').mockRejectedValue(new Error('secret stack detail'));
    const res = await api.get('/api/equipment');
    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe('Внутренняя ошибка сервера');
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });
});
