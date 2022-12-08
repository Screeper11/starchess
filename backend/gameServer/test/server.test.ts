import { describe, expect, it } from 'bun:test'

describe('Server is live', () => {
  it('Should return 200 Response', async () => {
    const res = await fetch('http://localhost:8080');
    expect(res.status).toBe(200);
  })
});

describe('Register', () => {
  it('Should return 200 Response', async () => {
    const res = await fetch('http://localhost:8080/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testUser',
        password: 'testPassword',
      }),
    });
    expect(res.status).toBe(200);
  })
});

describe('Login', () => {
  it('Should return 200 Response', async () => {
    const res = await fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testUser',
        password: 'testPassword',
      }),
    });
    expect(res.status).toBe(200);
  })
});

describe('User exists', () => {
  it('Should return 200 Response', async () => {
    const res = await fetch('http://localhost:8080/userExists/testUser');
    expect(res.status).toBe(200);
  })
});
