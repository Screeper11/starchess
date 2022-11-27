import { describe, expect, it } from 'bun:test'

describe('Server is live', () => {
  it('Should return 200 Response', async () => {
    const req = new Request('https://localhost:8080/');
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
  })
});
