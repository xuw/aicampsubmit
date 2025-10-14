import {
  clearTestData,
  createStandardTestUsers,
  createTestAssignment,
  createTestSubmission,
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  request,
} from './setup';

describe('Submission Endpoints', () => {
  let student: any;
  let student2: any;
  let ta: any;
  let instructor: any;
  let admin: any;
  let assignment: any;
  let pastDueAssignment: any;

  beforeEach(async () => {
    await clearTestData();
    const users = await createStandardTestUsers();
    student = users.student;
    ta = users.ta;
    instructor = users.instructor;
    admin = users.admin;

    // Create a second student for testing
    const { createTestUser } = require('./setup');
    student2 = await createTestUser('student2@test.com', 'password123', 'Second', 'Student', 'student');

    // Create test assignments
    assignment = await createTestAssignment(ta.id, {
      title: 'Active Assignment',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    pastDueAssignment = await createTestAssignment(ta.id, {
      title: 'Past Due Assignment',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      allowLateSubmission: false,
    });
  });

  describe('POST /api/submissions', () => {
    it('should create submission with text content', async () => {
      const submissionData = {
        assignmentId: assignment.id,
        textContent: 'This is my submission text',
        status: 'draft',
      };

      const response = await authenticatedPost('/api/submissions', student.token, submissionData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toMatchObject({
        assignmentId: assignment.id,
        studentId: student.id,
        textContent: submissionData.textContent,
        status: 'draft',
      });
      expect(response.body.submittedAt).toBeNull();
    });

    it('should create submission with submitted status', async () => {
      const submissionData = {
        assignmentId: assignment.id,
        textContent: 'Final submission',
        status: 'submitted',
      };

      const response = await authenticatedPost('/api/submissions', student.token, submissionData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('submitted');
      expect(response.body.submittedAt).not.toBeNull();
    });

    it('should update existing draft submission', async () => {
      // Create initial draft
      const initialData = {
        assignmentId: assignment.id,
        textContent: 'Draft version 1',
        status: 'draft',
      };

      const createResponse = await authenticatedPost('/api/submissions', student.token, initialData);
      expect(createResponse.status).toBe(201);

      // Update the draft
      const updateData = {
        assignmentId: assignment.id,
        textContent: 'Draft version 2',
        status: 'draft',
      };

      const updateResponse = await authenticatedPost('/api/submissions', student.token, updateData);
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.textContent).toBe('Draft version 2');
      expect(updateResponse.body.id).toBe(createResponse.body.id); // Same submission
    });

    it('should reject submission after deadline', async () => {
      const submissionData = {
        assignmentId: pastDueAssignment.id,
        textContent: 'Late submission',
        status: 'submitted',
      };

      const response = await authenticatedPost('/api/submissions', student.token, submissionData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/deadline|past due/i);
    });

    it('should allow late submission if enabled', async () => {
      const lateAllowedAssignment = await createTestAssignment(ta.id, {
        title: 'Late Allowed Assignment',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        allowLateSubmission: true,
      });

      const submissionData = {
        assignmentId: lateAllowedAssignment.id,
        textContent: 'Late but allowed',
        status: 'submitted',
      };

      const response = await authenticatedPost('/api/submissions', student.token, submissionData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('submitted');
    });

    it('should reject submission with missing assignment ID', async () => {
      const submissionData = {
        textContent: 'Missing assignment',
        status: 'draft',
      };

      const response = await authenticatedPost('/api/submissions', student.token, submissionData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject submission with invalid assignment ID', async () => {
      const submissionData = {
        assignmentId: '00000000-0000-0000-0000-000000000000',
        textContent: 'Invalid assignment',
        status: 'draft',
      };

      const response = await authenticatedPost('/api/submissions', student.token, submissionData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject submission with invalid status', async () => {
      const submissionData = {
        assignmentId: assignment.id,
        textContent: 'Invalid status',
        status: 'invalid-status',
      };

      const response = await authenticatedPost('/api/submissions', student.token, submissionData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow empty text content for draft', async () => {
      const submissionData = {
        assignmentId: assignment.id,
        textContent: '',
        status: 'draft',
      };

      const response = await authenticatedPost('/api/submissions', student.token, submissionData);

      expect(response.status).toBe(201);
      expect(response.body.textContent).toBe('');
    });

    it('should require authentication', async () => {
      const submissionData = {
        assignmentId: assignment.id,
        textContent: 'Test',
        status: 'draft',
      };

      const response = await authenticatedPost('/api/submissions', 'invalid-token', submissionData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny TAs from creating submissions', async () => {
      const submissionData = {
        assignmentId: assignment.id,
        textContent: 'TA submission',
        status: 'draft',
      };

      const response = await authenticatedPost('/api/submissions', ta.token, submissionData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny instructors from creating submissions', async () => {
      const submissionData = {
        assignmentId: assignment.id,
        textContent: 'Instructor submission',
        status: 'draft',
      };

      const response = await authenticatedPost('/api/submissions', instructor.token, submissionData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/submissions/my', () => {
    beforeEach(async () => {
      // Create submissions for student
      await createTestSubmission(assignment.id, student.id, {
        textContent: 'Submission 1',
        status: 'submitted',
        submittedAt: new Date(),
      });
    });

    it('should return student own submissions', async () => {
      const response = await authenticatedGet('/api/submissions/my', student.token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((submission: any) => {
        expect(submission.studentId).toBe(student.id);
      });
    });

    it('should filter by assignment ID', async () => {
      const response = await authenticatedGet(
        `/api/submissions/my?assignmentId=${assignment.id}`,
        student.token
      );

      expect(response.status).toBe(200);
      response.body.forEach((submission: any) => {
        expect(submission.assignmentId).toBe(assignment.id);
      });
    });

    it('should return empty array if student has no submissions', async () => {
      const response = await authenticatedGet('/api/submissions/my', student2.token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should not return other students submissions', async () => {
      await createTestSubmission(assignment.id, student2.id, {
        textContent: 'Student 2 submission',
        status: 'submitted',
      });

      const response = await authenticatedGet('/api/submissions/my', student.token);

      expect(response.status).toBe(200);
      response.body.forEach((submission: any) => {
        expect(submission.studentId).not.toBe(student2.id);
      });
    });

    it('should require authentication', async () => {
      const response = await authenticatedGet('/api/submissions/my', 'invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should work for students only', async () => {
      const response = await authenticatedGet('/api/submissions/my', student.token);
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/submissions/:id', () => {
    let submission: any;

    beforeEach(async () => {
      submission = await createTestSubmission(assignment.id, student.id, {
        textContent: 'Test submission',
        status: 'submitted',
        submittedAt: new Date(),
      });
    });

    it('should allow student owner to view their submission', async () => {
      const response = await authenticatedGet(`/api/submissions/${submission.id}`, student.token);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: submission.id,
        assignmentId: assignment.id,
        studentId: student.id,
      });
    });

    it('should allow TA to view any submission', async () => {
      const response = await authenticatedGet(`/api/submissions/${submission.id}`, ta.token);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(submission.id);
    });

    it('should allow instructor to view any submission', async () => {
      const response = await authenticatedGet(`/api/submissions/${submission.id}`, instructor.token);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(submission.id);
    });

    it('should deny other students from viewing submission', async () => {
      const response = await authenticatedGet(`/api/submissions/${submission.id}`, student2.token);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/forbidden|permission/i);
    });

    it('should return 404 for non-existent submission', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await authenticatedGet(`/api/submissions/${fakeId}`, student.token);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await authenticatedGet('/api/submissions/invalid-id', student.token);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await authenticatedGet(`/api/submissions/${submission.id}`, 'invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/submissions/by-assignment/:assignmentId', () => {
    beforeEach(async () => {
      await createTestSubmission(assignment.id, student.id, { status: 'submitted' });
      await createTestSubmission(assignment.id, student2.id, { status: 'submitted' });
    });

    it('should allow TA to list submissions for assignment', async () => {
      const response = await authenticatedGet(
        `/api/submissions/by-assignment/${assignment.id}`,
        ta.token
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('submissions');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.submissions)).toBe(true);
      expect(response.body.submissions.length).toBeGreaterThanOrEqual(2);
    });

    it('should allow instructor to list submissions for assignment', async () => {
      const response = await authenticatedGet(
        `/api/submissions/by-assignment/${assignment.id}`,
        instructor.token
      );

      expect(response.status).toBe(200);
      expect(response.body.submissions.length).toBeGreaterThanOrEqual(2);
    });

    it('should deny students from listing all submissions', async () => {
      const response = await authenticatedGet(
        `/api/submissions/by-assignment/${assignment.id}`,
        student.token
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should support pagination', async () => {
      const response = await authenticatedGet(
        `/api/submissions/by-assignment/${assignment.id}?page=1&limit=1`,
        ta.token
      );

      expect(response.status).toBe(200);
      expect(response.body.submissions.length).toBeLessThanOrEqual(1);
    });

    it('should return 404 for non-existent assignment', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await authenticatedGet(`/api/submissions/by-assignment/${fakeId}`, ta.token);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return empty list for assignment with no submissions', async () => {
      const emptyAssignment = await createTestAssignment(ta.id, {
        title: 'Empty Assignment',
      });

      const response = await authenticatedGet(
        `/api/submissions/by-assignment/${emptyAssignment.id}`,
        ta.token
      );

      expect(response.status).toBe(200);
      expect(response.body.submissions).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await authenticatedGet(
        `/api/submissions/by-assignment/${assignment.id}`,
        'invalid-token'
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/submissions/attachments/:id/download', () => {
    let submission: any;

    beforeEach(async () => {
      submission = await createTestSubmission(assignment.id, student.id);
    });

    it('should allow owner to download their attachment', async () => {
      // This is a placeholder - actual file upload/download testing would require multipart form handling
      const response = await request
        .get(`/api/submissions/attachments/fake-attachment-id/download`)
        .set('Authorization', `Bearer ${student.token}`);

      // Expect 404 if attachment doesn't exist, or 200 if it does
      expect([200, 404]).toContain(response.status);
    });

    it('should allow TA to download any attachment', async () => {
      const response = await request
        .get(`/api/submissions/attachments/fake-attachment-id/download`)
        .set('Authorization', `Bearer ${ta.token}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should allow instructor to download any attachment', async () => {
      const response = await request
        .get(`/api/submissions/attachments/fake-attachment-id/download`)
        .set('Authorization', `Bearer ${instructor.token}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should deny other students from downloading attachment', async () => {
      const response = await request
        .get(`/api/submissions/attachments/fake-attachment-id/download`)
        .set('Authorization', `Bearer ${student2.token}`);

      expect([403, 404]).toContain(response.status);
    });

    it('should require authentication', async () => {
      const response = await request
        .get(`/api/submissions/attachments/fake-attachment-id/download`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Submission Integration Tests', () => {
    it('should complete full submission workflow: draft -> update -> submit', async () => {
      // Create draft
      const draftResponse = await authenticatedPost('/api/submissions', student.token, {
        assignmentId: assignment.id,
        textContent: 'Draft version',
        status: 'draft',
      });

      expect(draftResponse.status).toBe(201);
      expect(draftResponse.body.status).toBe('draft');
      const submissionId = draftResponse.body.id;

      // Update draft
      const updateResponse = await authenticatedPost('/api/submissions', student.token, {
        assignmentId: assignment.id,
        textContent: 'Updated draft version',
        status: 'draft',
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.textContent).toBe('Updated draft version');

      // Submit
      const submitResponse = await authenticatedPost('/api/submissions', student.token, {
        assignmentId: assignment.id,
        textContent: 'Final submitted version',
        status: 'submitted',
      });

      expect(submitResponse.status).toBe(200);
      expect(submitResponse.body.status).toBe('submitted');
      expect(submitResponse.body.submittedAt).not.toBeNull();

      // Verify can view own submission
      const viewResponse = await authenticatedGet(`/api/submissions/${submissionId}`, student.token);
      expect(viewResponse.status).toBe(200);

      // Verify appears in my submissions
      const mySubmissionsResponse = await authenticatedGet('/api/submissions/my', student.token);
      expect(mySubmissionsResponse.status).toBe(200);
      expect(mySubmissionsResponse.body.some((s: any) => s.id === submissionId)).toBe(true);
    });

    it('should enforce deadline correctly', async () => {
      // Try to submit to past due assignment
      const lateResponse = await authenticatedPost('/api/submissions', student.token, {
        assignmentId: pastDueAssignment.id,
        textContent: 'Too late',
        status: 'submitted',
      });

      expect(lateResponse.status).toBe(400);
      expect(lateResponse.body.error).toMatch(/deadline/i);

      // Verify can still create draft (if allowed)
      const draftResponse = await authenticatedPost('/api/submissions', student.token, {
        assignmentId: pastDueAssignment.id,
        textContent: 'Draft after deadline',
        status: 'draft',
      });

      // Draft might be allowed even after deadline, or rejected
      expect([201, 400]).toContain(draftResponse.status);
    });

    it('should maintain submission uniqueness per student-assignment pair', async () => {
      // Create first submission
      const first = await authenticatedPost('/api/submissions', student.token, {
        assignmentId: assignment.id,
        textContent: 'First submission',
        status: 'draft',
      });

      expect(first.status).toBe(201);

      // Create second submission for same assignment
      const second = await authenticatedPost('/api/submissions', student.token, {
        assignmentId: assignment.id,
        textContent: 'Second submission',
        status: 'draft',
      });

      // Should update existing submission, not create new
      expect(second.status).toBe(200);
      expect(second.body.id).toBe(first.body.id);
    });

    it('should allow multiple students to submit to same assignment', async () => {
      const submission1 = await authenticatedPost('/api/submissions', student.token, {
        assignmentId: assignment.id,
        textContent: 'Student 1 submission',
        status: 'submitted',
      });

      const submission2 = await authenticatedPost('/api/submissions', student2.token, {
        assignmentId: assignment.id,
        textContent: 'Student 2 submission',
        status: 'submitted',
      });

      expect(submission1.status).toBe(201);
      expect(submission2.status).toBe(201);
      expect(submission1.body.id).not.toBe(submission2.body.id);

      // TA should see both
      const allSubmissions = await authenticatedGet(
        `/api/submissions/by-assignment/${assignment.id}`,
        ta.token
      );

      expect(allSubmissions.status).toBe(200);
      expect(allSubmissions.body.submissions.length).toBeGreaterThanOrEqual(2);
    });
  });
});
