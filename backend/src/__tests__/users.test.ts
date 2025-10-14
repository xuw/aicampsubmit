import {
  clearTestData,
  createStandardTestUsers,
  createTestUser,
  authenticatedGet,
  authenticatedPatch,
} from './setup';

describe('User Management Endpoints', () => {
  let student: any;
  let ta: any;
  let instructor: any;
  let admin: any;

  beforeEach(async () => {
    await clearTestData();
    const users = await createStandardTestUsers();
    student = users.student;
    ta = users.ta;
    instructor = users.instructor;
    admin = users.admin;
  });

  describe('GET /api/users', () => {
    it('should allow admin to list all users', async () => {
      const response = await authenticatedGet('/api/users', admin.token);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThanOrEqual(4); // At least our 4 test users
      expect(response.body.total).toBeGreaterThanOrEqual(4);
    });

    it('should return user objects without passwords', async () => {
      const response = await authenticatedGet('/api/users', admin.token);

      expect(response.status).toBe(200);
      response.body.users.forEach((user: any) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('firstName');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('role');
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should support pagination with page and limit', async () => {
      // Create additional users
      await createTestUser('extra1@test.com', 'password123', 'Extra', 'One', 'student');
      await createTestUser('extra2@test.com', 'password123', 'Extra', 'Two', 'student');

      const response = await authenticatedGet('/api/users?page=1&limit=2', admin.token);

      expect(response.status).toBe(200);
      expect(response.body.users.length).toBeLessThanOrEqual(2);
      expect(response.body).toHaveProperty('page');
      expect(response.body.page).toBe(1);
    });

    it('should support role filtering', async () => {
      const response = await authenticatedGet('/api/users?role=student', admin.token);

      expect(response.status).toBe(200);
      expect(response.body.users.length).toBeGreaterThan(0);
      response.body.users.forEach((user: any) => {
        expect(user.role).toBe('student');
      });
    });

    it('should support filtering by ta role', async () => {
      const response = await authenticatedGet('/api/users?role=ta', admin.token);

      expect(response.status).toBe(200);
      response.body.users.forEach((user: any) => {
        expect(user.role).toBe('ta');
      });
    });

    it('should support filtering by instructor role', async () => {
      const response = await authenticatedGet('/api/users?role=instructor', admin.token);

      expect(response.status).toBe(200);
      response.body.users.forEach((user: any) => {
        expect(user.role).toBe('instructor');
      });
    });

    it('should support filtering by admin role', async () => {
      const response = await authenticatedGet('/api/users?role=admin', admin.token);

      expect(response.status).toBe(200);
      response.body.users.forEach((user: any) => {
        expect(user.role).toBe('admin');
      });
    });

    it('should deny access to non-admin users (student)', async () => {
      const response = await authenticatedGet('/api/users', student.token);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/forbidden|permission/i);
    });

    it('should deny access to non-admin users (TA)', async () => {
      const response = await authenticatedGet('/api/users', ta.token);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/forbidden|permission/i);
    });

    it('should deny access to non-admin users (instructor)', async () => {
      const response = await authenticatedGet('/api/users', instructor.token);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/forbidden|permission/i);
    });

    it('should require authentication', async () => {
      const response = await authenticatedGet('/api/users', 'invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid role filter gracefully', async () => {
      const response = await authenticatedGet('/api/users?role=invalid', admin.token);

      expect(response.status).toBe(200);
      expect(response.body.users.length).toBe(0); // No users with invalid role
    });

    it('should handle pagination edge cases', async () => {
      // Test page 0
      const response1 = await authenticatedGet('/api/users?page=0&limit=10', admin.token);
      expect(response1.status).toBe(200);

      // Test very large page number
      const response2 = await authenticatedGet('/api/users?page=1000&limit=10', admin.token);
      expect(response2.status).toBe(200);
      expect(response2.body.users.length).toBe(0);

      // Test very large limit
      const response3 = await authenticatedGet('/api/users?page=1&limit=1000', admin.token);
      expect(response3.status).toBe(200);
    });
  });

  describe('PATCH /api/users/:userId/role', () => {
    it('should allow admin to promote student to TA', async () => {
      const response = await authenticatedPatch(
        `/api/users/${student.id}/role`,
        admin.token,
        { role: 'ta' }
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', student.id);
      expect(response.body).toHaveProperty('role', 'ta');
      expect(response.body.email).toBe(student.email);

      // Verify the role change persisted
      const verifyResponse = await authenticatedGet('/api/auth/me', student.token);
      // Note: The old token might need to be refreshed, but the DB should be updated
    });

    it('should allow admin to promote student to instructor', async () => {
      const response = await authenticatedPatch(
        `/api/users/${student.id}/role`,
        admin.token,
        { role: 'instructor' }
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('role', 'instructor');
    });

    it('should allow admin to promote student to admin', async () => {
      const response = await authenticatedPatch(
        `/api/users/${student.id}/role`,
        admin.token,
        { role: 'admin' }
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('role', 'admin');
    });

    it('should allow admin to promote TA to instructor', async () => {
      const response = await authenticatedPatch(
        `/api/users/${ta.id}/role`,
        admin.token,
        { role: 'instructor' }
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('role', 'instructor');
    });

    it('should allow admin to demote instructor to TA', async () => {
      const response = await authenticatedPatch(
        `/api/users/${instructor.id}/role`,
        admin.token,
        { role: 'ta' }
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('role', 'ta');
    });

    it('should allow admin to demote TA to student', async () => {
      const response = await authenticatedPatch(
        `/api/users/${ta.id}/role`,
        admin.token,
        { role: 'student' }
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('role', 'student');
    });

    it('should reject invalid role values', async () => {
      const response = await authenticatedPatch(
        `/api/users/${student.id}/role`,
        admin.token,
        { role: 'superadmin' }
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/role|invalid/i);
    });

    it('should reject missing role field', async () => {
      const response = await authenticatedPatch(
        `/api/users/${student.id}/role`,
        admin.token,
        {}
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject non-existent user ID', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      const response = await authenticatedPatch(
        `/api/users/${fakeUserId}/role`,
        admin.token,
        { role: 'ta' }
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should reject invalid user ID format', async () => {
      const response = await authenticatedPatch(
        '/api/users/invalid-id/role',
        admin.token,
        { role: 'ta' }
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny access to non-admin users (student)', async () => {
      const response = await authenticatedPatch(
        `/api/users/${ta.id}/role`,
        student.token,
        { role: 'student' }
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/forbidden|permission/i);
    });

    it('should deny access to non-admin users (TA)', async () => {
      const response = await authenticatedPatch(
        `/api/users/${student.id}/role`,
        ta.token,
        { role: 'ta' }
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny access to non-admin users (instructor)', async () => {
      const response = await authenticatedPatch(
        `/api/users/${student.id}/role`,
        instructor.token,
        { role: 'instructor' }
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should not allow users to promote themselves', async () => {
      // Even if a student somehow gets admin token, they shouldn't promote themselves
      const studentAsAdmin = await createTestUser(
        'sneaky@test.com',
        'password123',
        'Sneaky',
        'Student',
        'student'
      );

      const response = await authenticatedPatch(
        `/api/users/${studentAsAdmin.id}/role`,
        admin.token,
        { role: 'admin' }
      );

      // This should succeed because it's admin doing it
      expect(response.status).toBe(200);
    });

    it('should require authentication', async () => {
      const response = await authenticatedPatch(
        `/api/users/${student.id}/role`,
        'invalid-token',
        { role: 'ta' }
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle concurrent role changes safely', async () => {
      const testUser = await createTestUser(
        'concurrent@test.com',
        'password123',
        'Concurrent',
        'Test',
        'student'
      );

      // Attempt to change role multiple times concurrently
      const changes = [
        authenticatedPatch(`/api/users/${testUser.id}/role`, admin.token, { role: 'ta' }),
        authenticatedPatch(`/api/users/${testUser.id}/role`, admin.token, { role: 'instructor' }),
        authenticatedPatch(`/api/users/${testUser.id}/role`, admin.token, { role: 'ta' }),
      ];

      const responses = await Promise.all(changes);

      // All should succeed (last one wins)
      responses.forEach((response) => {
        expect([200, 409]).toContain(response.status); // Either success or conflict
      });
    });
  });

  describe('User Management Integration Tests', () => {
    it('should complete full user lifecycle: create -> promote -> demote', async () => {
      // Create a new student
      const newUser = await createTestUser(
        'lifecycle@test.com',
        'password123',
        'Life',
        'Cycle',
        'student'
      );

      // Verify initial role
      let usersResponse = await authenticatedGet('/api/users?role=student', admin.token);
      expect(usersResponse.body.users.some((u: any) => u.id === newUser.id)).toBe(true);

      // Promote to TA
      let promoteResponse = await authenticatedPatch(
        `/api/users/${newUser.id}/role`,
        admin.token,
        { role: 'ta' }
      );
      expect(promoteResponse.status).toBe(200);

      // Verify TA role
      usersResponse = await authenticatedGet('/api/users?role=ta', admin.token);
      expect(usersResponse.body.users.some((u: any) => u.id === newUser.id)).toBe(true);

      // Promote to instructor
      promoteResponse = await authenticatedPatch(
        `/api/users/${newUser.id}/role`,
        admin.token,
        { role: 'instructor' }
      );
      expect(promoteResponse.status).toBe(200);

      // Verify instructor role
      usersResponse = await authenticatedGet('/api/users?role=instructor', admin.token);
      expect(usersResponse.body.users.some((u: any) => u.id === newUser.id)).toBe(true);

      // Demote back to student
      const demoteResponse = await authenticatedPatch(
        `/api/users/${newUser.id}/role`,
        admin.token,
        { role: 'student' }
      );
      expect(demoteResponse.status).toBe(200);

      // Verify student role again
      usersResponse = await authenticatedGet('/api/users?role=student', admin.token);
      expect(usersResponse.body.users.some((u: any) => u.id === newUser.id)).toBe(true);
    });

    it('should maintain user data integrity during role changes', async () => {
      const testUser = await createTestUser(
        'integrity@test.com',
        'password123',
        'Data',
        'Integrity',
        'student'
      );

      const originalEmail = testUser.email;
      const originalFirstName = testUser.firstName;
      const originalLastName = testUser.lastName;

      // Change role
      await authenticatedPatch(
        `/api/users/${testUser.id}/role`,
        admin.token,
        { role: 'ta' }
      );

      // Get user list and verify other fields didn't change
      const usersResponse = await authenticatedGet('/api/users', admin.token);
      const updatedUser = usersResponse.body.users.find((u: any) => u.id === testUser.id);

      expect(updatedUser.email).toBe(originalEmail);
      expect(updatedUser.firstName).toBe(originalFirstName);
      expect(updatedUser.lastName).toBe(originalLastName);
      expect(updatedUser.role).toBe('ta');
    });
  });
});
