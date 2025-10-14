import {
  clearTestData,
  createStandardTestUsers,
  createTestAssignment,
  createTestSubmission,
  createTestFeedback,
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
} from './setup';

describe('Feedback Endpoints', () => {
  let student: any;
  let student2: any;
  let ta: any;
  let ta2: any;
  let instructor: any;
  let admin: any;
  let assignment: any;
  let submission: any;
  let submission2: any;

  beforeEach(async () => {
    await clearTestData();
    const users = await createStandardTestUsers();
    student = users.student;
    ta = users.ta;
    instructor = users.instructor;
    admin = users.admin;

    // Create additional test users
    const { createTestUser } = require('./setup');
    student2 = await createTestUser('student2@test.com', 'password123', 'Second', 'Student', 'student');
    ta2 = await createTestUser('ta2@test.com', 'password123', 'Second', 'TA', 'ta');

    // Create test assignment and submissions
    assignment = await createTestAssignment(ta.id);
    submission = await createTestSubmission(assignment.id, student.id, {
      textContent: 'Student submission',
      status: 'submitted',
      submittedAt: new Date(),
    });
    submission2 = await createTestSubmission(assignment.id, student2.id, {
      textContent: 'Student 2 submission',
      status: 'submitted',
      submittedAt: new Date(),
    });
  });

  describe('POST /api/feedback', () => {
    it('should allow TA to add feedback with grade', async () => {
      const feedbackData = {
        submissionId: submission.id,
        content: 'Great work! Well done.',
        grade: 95,
      };

      const response = await authenticatedPost('/api/feedback', ta.token, feedbackData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toMatchObject({
        submissionId: submission.id,
        reviewerId: ta.id,
        content: feedbackData.content,
      });
    });

    it('should allow instructor to add feedback', async () => {
      const feedbackData = {
        submissionId: submission.id,
        content: 'Excellent submission',
        grade: 98,
      };

      const response = await authenticatedPost('/api/feedback', instructor.token, feedbackData);

      expect(response.status).toBe(201);
      expect(response.body.reviewerId).toBe(instructor.id);
    });

    it('should validate grade is between 0 and 100', async () => {
      const invalidGrade = {
        submissionId: submission.id,
        content: 'Feedback',
        grade: 150,
      };

      const response = await authenticatedPost('/api/feedback', ta.token, invalidGrade);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/grade|0.*100/i);
    });

    it('should reject negative grade', async () => {
      const invalidGrade = {
        submissionId: submission.id,
        content: 'Feedback',
        grade: -10,
      };

      const response = await authenticatedPost('/api/feedback', ta.token, invalidGrade);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept grade of 0', async () => {
      const feedbackData = {
        submissionId: submission.id,
        content: 'Needs improvement',
        grade: 0,
      };

      const response = await authenticatedPost('/api/feedback', ta.token, feedbackData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should accept grade of 100', async () => {
      const feedbackData = {
        submissionId: submission.id,
        content: 'Perfect!',
        grade: 100,
      };

      const response = await authenticatedPost('/api/feedback', ta.token, feedbackData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should allow feedback without grade', async () => {
      const feedbackData = {
        submissionId: submission.id,
        content: 'Please revise and resubmit',
      };

      const response = await authenticatedPost('/api/feedback', ta.token, feedbackData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should deny students from adding feedback', async () => {
      const feedbackData = {
        submissionId: submission.id,
        content: 'Student feedback',
        grade: 90,
      };

      const response = await authenticatedPost('/api/feedback', student.token, feedbackData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/forbidden|permission/i);
    });

    it('should reject feedback with missing submission ID', async () => {
      const feedbackData = {
        content: 'Missing submission ID',
        grade: 90,
      };

      const response = await authenticatedPost('/api/feedback', ta.token, feedbackData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject feedback with missing content', async () => {
      const feedbackData = {
        submissionId: submission.id,
        grade: 90,
      };

      const response = await authenticatedPost('/api/feedback', ta.token, feedbackData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/content|required/i);
    });

    it('should reject feedback for non-existent submission', async () => {
      const feedbackData = {
        submissionId: '00000000-0000-0000-0000-000000000000',
        content: 'Feedback for non-existent',
        grade: 90,
      };

      const response = await authenticatedPost('/api/feedback', ta.token, feedbackData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should update submission status to graded when grade is provided', async () => {
      const feedbackData = {
        submissionId: submission.id,
        content: 'Good work',
        grade: 85,
      };

      const response = await authenticatedPost('/api/feedback', ta.token, feedbackData);

      expect(response.status).toBe(201);

      // Verify submission status updated
      const submissionResponse = await authenticatedGet(
        `/api/submissions/${submission.id}`,
        student.token
      );
      expect(submissionResponse.body.status).toBe('graded');
      expect(submissionResponse.body.grade).toBe(85);
    });

    it('should require authentication', async () => {
      const feedbackData = {
        submissionId: submission.id,
        content: 'Feedback',
        grade: 90,
      };

      const response = await authenticatedPost('/api/feedback', 'invalid-token', feedbackData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should support markdown in feedback content', async () => {
      const feedbackData = {
        submissionId: submission.id,
        content: '# Great Work\n\n- Point 1\n- Point 2\n\n**Bold text**',
        grade: 92,
      };

      const response = await authenticatedPost('/api/feedback', ta.token, feedbackData);

      expect(response.status).toBe(201);
      expect(response.body.content).toBe(feedbackData.content);
    });
  });

  describe('PUT /api/feedback/:id', () => {
    let feedback: any;

    beforeEach(async () => {
      feedback = await createTestFeedback(submission.id, ta.id, {
        content: 'Original feedback',
        grade: 80,
      });
    });

    it('should allow original reviewer to update their feedback', async () => {
      const updateData = {
        content: 'Updated feedback',
        grade: 85,
      };

      const response = await authenticatedPut(`/api/feedback/${feedback.id}`, ta.token, updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: feedback.id,
        content: updateData.content,
      });
    });

    it('should allow instructor to update any feedback', async () => {
      const updateData = {
        content: 'Instructor updated feedback',
        grade: 90,
      };

      const response = await authenticatedPut(
        `/api/feedback/${feedback.id}`,
        instructor.token,
        updateData
      );

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(updateData.content);
    });

    it('should deny other TAs from updating feedback', async () => {
      const updateData = {
        content: 'Unauthorized update',
        grade: 70,
      };

      const response = await authenticatedPut(`/api/feedback/${feedback.id}`, ta2.token, updateData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/forbidden|permission/i);
    });

    it('should deny students from updating feedback', async () => {
      const updateData = {
        content: 'Student trying to update',
        grade: 100,
      };

      const response = await authenticatedPut(
        `/api/feedback/${feedback.id}`,
        student.token,
        updateData
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate updated grade', async () => {
      const updateData = {
        content: 'Updated feedback',
        grade: 150,
      };

      const response = await authenticatedPut(`/api/feedback/${feedback.id}`, ta.token, updateData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/grade/i);
    });

    it('should allow updating only content', async () => {
      const updateData = {
        content: 'Just updating content',
      };

      const response = await authenticatedPut(`/api/feedback/${feedback.id}`, ta.token, updateData);

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(updateData.content);
    });

    it('should allow updating only grade', async () => {
      const updateData = {
        grade: 88,
      };

      const response = await authenticatedPut(`/api/feedback/${feedback.id}`, ta.token, updateData);

      expect(response.status).toBe(200);
      // Grade should be updated in submission, not feedback table
    });

    it('should return 404 for non-existent feedback', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const updateData = {
        content: 'Update non-existent',
      };

      const response = await authenticatedPut(`/api/feedback/${fakeId}`, ta.token, updateData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid feedback ID', async () => {
      const updateData = {
        content: 'Update',
      };

      const response = await authenticatedPut('/api/feedback/invalid-id', ta.token, updateData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const updateData = {
        content: 'Updated',
      };

      const response = await authenticatedPut(
        `/api/feedback/${feedback.id}`,
        'invalid-token',
        updateData
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should update submission grade when grade is changed', async () => {
      const updateData = {
        grade: 95,
      };

      const response = await authenticatedPut(`/api/feedback/${feedback.id}`, ta.token, updateData);

      expect(response.status).toBe(200);

      // Verify submission grade updated
      const submissionResponse = await authenticatedGet(
        `/api/submissions/${submission.id}`,
        student.token
      );
      expect(submissionResponse.body.grade).toBe(95);
    });
  });

  describe('GET /api/feedback/by-submission/:submissionId', () => {
    beforeEach(async () => {
      await createTestFeedback(submission.id, ta.id, {
        content: 'First feedback',
        grade: 80,
      });
      await createTestFeedback(submission.id, instructor.id, {
        content: 'Second feedback',
        grade: 85,
      });
    });

    it('should allow submission owner to view feedback', async () => {
      const response = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        student.token
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      response.body.forEach((feedback: any) => {
        expect(feedback).toHaveProperty('id');
        expect(feedback).toHaveProperty('content');
        expect(feedback).toHaveProperty('reviewerId');
        expect(feedback).toHaveProperty('createdAt');
      });
    });

    it('should allow TA to view feedback', async () => {
      const response = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        ta.token
      );

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should allow instructor to view feedback', async () => {
      const response = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        instructor.token
      );

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should deny other students from viewing feedback', async () => {
      const response = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        student2.token
      );

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/forbidden|permission/i);
    });

    it('should return empty array for submission with no feedback', async () => {
      const noFeedbackSubmission = await createTestSubmission(assignment.id, student2.id, {
        status: 'submitted',
      });

      const response = await authenticatedGet(
        `/api/feedback/by-submission/${noFeedbackSubmission.id}`,
        ta.token
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 404 for non-existent submission', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await authenticatedGet(`/api/feedback/by-submission/${fakeId}`, ta.token);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid submission ID', async () => {
      const response = await authenticatedGet('/api/feedback/by-submission/invalid-id', ta.token);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        'invalid-token'
      );

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return feedback in chronological order', async () => {
      const response = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        student.token
      );

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if feedback is ordered by creation date
      for (let i = 1; i < response.body.length; i++) {
        const prev = new Date(response.body[i - 1].createdAt);
        const curr = new Date(response.body[i].createdAt);
        expect(prev.getTime()).toBeLessThanOrEqual(curr.getTime());
      }
    });
  });

  describe('Feedback Integration Tests', () => {
    it('should complete full feedback workflow: create -> update -> view', async () => {
      // TA adds initial feedback
      const createResponse = await authenticatedPost('/api/feedback', ta.token, {
        submissionId: submission.id,
        content: 'Initial feedback',
        grade: 75,
      });

      expect(createResponse.status).toBe(201);
      const feedbackId = createResponse.body.id;

      // TA updates their feedback
      const updateResponse = await authenticatedPut(`/api/feedback/${feedbackId}`, ta.token, {
        content: 'Updated feedback with more details',
        grade: 80,
      });

      expect(updateResponse.status).toBe(200);

      // Instructor adds additional feedback
      const instructorFeedback = await authenticatedPost('/api/feedback', instructor.token, {
        submissionId: submission.id,
        content: 'Instructor comments',
        grade: 85,
      });

      expect(instructorFeedback.status).toBe(201);

      // Student views all feedback
      const viewResponse = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        student.token
      );

      expect(viewResponse.status).toBe(200);
      expect(viewResponse.body.length).toBeGreaterThanOrEqual(2);

      // Verify submission has final grade
      const submissionResponse = await authenticatedGet(
        `/api/submissions/${submission.id}`,
        student.token
      );
      expect(submissionResponse.body.status).toBe('graded');
      expect(submissionResponse.body.grade).toBe(85); // Latest grade
    });

    it('should allow multiple feedback entries from different reviewers', async () => {
      const taFeedback = await authenticatedPost('/api/feedback', ta.token, {
        submissionId: submission.id,
        content: 'TA feedback',
        grade: 82,
      });

      const instructorFeedback = await authenticatedPost('/api/feedback', instructor.token, {
        submissionId: submission.id,
        content: 'Instructor feedback',
        grade: 88,
      });

      expect(taFeedback.status).toBe(201);
      expect(instructorFeedback.status).toBe(201);
      expect(taFeedback.body.id).not.toBe(instructorFeedback.body.id);

      // Both should be visible
      const allFeedback = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        student.token
      );

      expect(allFeedback.status).toBe(200);
      expect(allFeedback.body.length).toBeGreaterThanOrEqual(2);

      const reviewerIds = allFeedback.body.map((f: any) => f.reviewerId);
      expect(reviewerIds).toContain(ta.id);
      expect(reviewerIds).toContain(instructor.id);
    });

    it('should maintain feedback history when grade changes', async () => {
      // First feedback
      const first = await authenticatedPost('/api/feedback', ta.token, {
        submissionId: submission.id,
        content: 'First review - grade 70',
        grade: 70,
      });

      expect(first.status).toBe(201);

      // Instructor gives different grade
      const second = await authenticatedPost('/api/feedback', instructor.token, {
        submissionId: submission.id,
        content: 'Instructor review - grade 90',
        grade: 90,
      });

      expect(second.status).toBe(201);

      // Both feedback entries should exist
      const allFeedback = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        ta.token
      );

      expect(allFeedback.status).toBe(200);
      expect(allFeedback.body.length).toBe(2);

      // Submission should have latest grade
      const submissionResponse = await authenticatedGet(
        `/api/submissions/${submission.id}`,
        student.token
      );
      expect(submissionResponse.body.grade).toBe(90);
    });

    it('should enforce role-based access control throughout feedback lifecycle', async () => {
      // Create feedback as TA
      const feedback = await authenticatedPost('/api/feedback', ta.token, {
        submissionId: submission.id,
        content: 'TA feedback',
        grade: 80,
      });

      expect(feedback.status).toBe(201);
      const feedbackId = feedback.body.id;

      // Student cannot create feedback
      const studentCreate = await authenticatedPost('/api/feedback', student.token, {
        submissionId: submission2.id,
        content: 'Student feedback',
        grade: 100,
      });
      expect(studentCreate.status).toBe(403);

      // Student cannot update feedback
      const studentUpdate = await authenticatedPut(`/api/feedback/${feedbackId}`, student.token, {
        content: 'Hacked!',
      });
      expect(studentUpdate.status).toBe(403);

      // Other students cannot view feedback
      const otherStudentView = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        student2.token
      );
      expect(otherStudentView.status).toBe(403);

      // Owner can view feedback
      const ownerView = await authenticatedGet(
        `/api/feedback/by-submission/${submission.id}`,
        student.token
      );
      expect(ownerView.status).toBe(200);

      // Instructor can update any feedback
      const instructorUpdate = await authenticatedPut(
        `/api/feedback/${feedbackId}`,
        instructor.token,
        {
          content: 'Instructor override',
          grade: 95,
        }
      );
      expect(instructorUpdate.status).toBe(200);
    });
  });
});
