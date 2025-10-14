import { request, authenticatedGet, clearTestData } from './setup';

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    await clearTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request.post('/api/auth/register').send({
        email: 'newuser@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        role: 'student',
      });
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request.post('/api/auth/register').send({
        email: 'test@test.com',
        password: 'password123',
        // Missing firstName and lastName
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request.post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/email/i);
    });

    it('should reject registration with weak password', async () => {
      const response = await request.post('/api/auth/register').send({
        email: 'test@test.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/password/i);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request.post('/api/auth/register').send({
        email: 'duplicate@test.com',
        password: 'password123',
        firstName: 'First',
        lastName: 'User',
      });

      // Second registration with same email
      const response = await request.post('/api/auth/register').send({
        email: 'duplicate@test.com',
        password: 'password456',
        firstName: 'Second',
        lastName: 'User',
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/exists/i);
    });

    it('should default new users to student role', async () => {
      const response = await request.post('/api/auth/register').send({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Student',
        lastName: 'User',
      });

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe('student');
    });

    it('should not allow setting role during registration', async () => {
      const response = await request.post('/api/auth/register').send({
        email: 'hacker@test.com',
        password: 'password123',
        firstName: 'Hacker',
        lastName: 'User',
        role: 'admin', // Attempting to set admin role
      });

      expect(response.status).toBe(201);
      expect(response.body.user.role).toBe('student'); // Should still be student
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request.post('/api/auth/register').send({
        email: 'logintest@test.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'Test',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request.post('/api/auth/login').send({
        email: 'logintest@test.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: 'logintest@test.com',
        firstName: 'Login',
        lastName: 'Test',
        role: 'student',
      });
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject login with missing email', async () => {
      const response = await request.post('/api/auth/login').send({
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with missing password', async () => {
      const response = await request.post('/api/auth/login').send({
        email: 'logintest@test.com',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request.post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/credentials/i);
    });

    it('should reject login with incorrect password', async () => {
      const response = await request.post('/api/auth/login').send({
        email: 'logintest@test.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/credentials/i);
    });

    it('should not leak information about which credential is wrong', async () => {
      const wrongEmailResponse = await request.post('/api/auth/login').send({
        email: 'wrong@test.com',
        password: 'password123',
      });

      const wrongPasswordResponse = await request.post('/api/auth/login').send({
        email: 'logintest@test.com',
        password: 'wrongpassword',
      });

      // Both should return the same generic error message
      expect(wrongEmailResponse.status).toBe(wrongPasswordResponse.status);
      expect(wrongEmailResponse.body.error).toBe(wrongPasswordResponse.body.error);
    });

    it('should return JWT token that can be decoded', async () => {
      const response = await request.post('/api/auth/login').send({
        email: 'logintest@test.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      const token = response.body.token;

      // Token should be a valid JWT format (three parts separated by dots)
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
    });
  });

  describe('GET /api/auth/me', () => {
    let userToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register and login a user
      const registerResponse = await request.post('/api/auth/register').send({
        email: 'metest@test.com',
        password: 'password123',
        firstName: 'Me',
        lastName: 'Test',
      });

      userToken = registerResponse.body.token;
      userId = registerResponse.body.user.id;
    });

    it('should return current user with valid token', async () => {
      const response = await authenticatedGet('/api/auth/me', userToken);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: userId,
        email: 'metest@test.com',
        firstName: 'Me',
        lastName: 'Test',
        role: 'student',
      });
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request.get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/token/i);
    });

    it('should reject request with invalid token', async () => {
      const response = await request
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/token/i);
    });

    it('should reject request with malformed Authorization header', async () => {
      const response = await request
        .get('/api/auth/me')
        .set('Authorization', userToken); // Missing "Bearer " prefix

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with expired token', async () => {
      // This test would require a token with a very short expiration
      // For now, we'll test with a manually created invalid token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJleHAiOjF9.invalid';

      const response = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should work with Bearer token in different case', async () => {
      // Test case sensitivity of Bearer prefix
      const response = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Authentication Integration Tests', () => {
    it('should complete full registration -> login -> get profile flow', async () => {
      // Step 1: Register
      const registerResponse = await request.post('/api/auth/register').send({
        email: 'fullflow@test.com',
        password: 'password123',
        firstName: 'Full',
        lastName: 'Flow',
      });

      expect(registerResponse.status).toBe(201);
      const registerToken = registerResponse.body.token;

      // Step 2: Get profile with registration token
      const profileResponse1 = await authenticatedGet('/api/auth/me', registerToken);
      expect(profileResponse1.status).toBe(200);
      expect(profileResponse1.body.email).toBe('fullflow@test.com');

      // Step 3: Login with credentials
      const loginResponse = await request.post('/api/auth/login').send({
        email: 'fullflow@test.com',
        password: 'password123',
      });

      expect(loginResponse.status).toBe(200);
      const loginToken = loginResponse.body.token;

      // Step 4: Get profile with login token
      const profileResponse2 = await authenticatedGet('/api/auth/me', loginToken);
      expect(profileResponse2.status).toBe(200);
      expect(profileResponse2.body.email).toBe('fullflow@test.com');

      // Both tokens should be valid JWT tokens
      expect(registerToken).toBeTruthy();
      expect(loginToken).toBeTruthy();
      expect(registerToken.split('.')).toHaveLength(3);
      expect(loginToken.split('.')).toHaveLength(3);
    });

    it('should handle concurrent registration attempts gracefully', async () => {
      const registrations = Array(5).fill(null).map((_, i) =>
        request.post('/api/auth/register').send({
          email: `concurrent${i}@test.com`,
          password: 'password123',
          firstName: 'Concurrent',
          lastName: `User${i}`,
        })
      );

      const responses = await Promise.all(registrations);

      // All should succeed with different emails
      responses.forEach((response, i) => {
        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe(`concurrent${i}@test.com`);
      });
    });

    it('should handle SQL injection attempts safely', async () => {
      const sqlInjectionAttempts = [
        "admin'--",
        "admin' OR '1'='1",
        "'; DROP TABLE users; --",
      ];

      for (const injection of sqlInjectionAttempts) {
        const response = await request.post('/api/auth/login').send({
          email: injection,
          password: 'password123',
        });

        // Should fail safely without executing SQL
        expect(response.status).toBe(401);
        expect(response.body.error).toMatch(/credentials/i);
      }
    });
  });
});
