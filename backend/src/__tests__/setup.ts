import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import supertest from 'supertest';
import app from '../server';

// Test database pool
let testPool: Pool;

// Test request helper
export const request = supertest(app);

// Test user interface
export interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'ta' | 'instructor' | 'admin';
  token: string;
}

// Test users storage
const testUsers: { [key: string]: TestUser } = {};

/**
 * Initialize test database connection
 */
export const setupTestDB = async (): Promise<void> => {
  testPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/homework_test',
    max: 5,
  });

  // Wait for connection
  await testPool.query('SELECT 1');
};

/**
 * Clean up test database
 */
export const teardownTestDB = async (): Promise<void> => {
  if (testPool) {
    try {
      await testPool.end();
    } catch (error) {
      console.error('Error closing test pool:', error);
    }
  }
  // Note: main pool is closed in global teardown after all tests complete
};

/**
 * Clear all test data from database
 */
export const clearTestData = async (): Promise<void> => {
  if (!testPool) {
    console.warn('Test pool not initialized, skipping cleanup');
    return;
  }

  try {
    // Use TRUNCATE with CASCADE to handle foreign key constraints automatically
    // Note: Using UUID PKs, so no sequences to reset
    await testPool.query('TRUNCATE TABLE feedback, attachments, submissions, assignments, users CASCADE');

    // Clear in-memory test users storage
    Object.keys(testUsers).forEach(key => delete testUsers[key]);
  } catch (error) {
    console.error('Error clearing test data:', error);
    throw error; // Re-throw to make test failures visible
  }
};

/**
 * Generate JWT token for test user
 */
export const generateToken = (userId: string, email: string, role: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(
    { userId, email, role },
    jwtSecret,
    { expiresIn: '24h' }
  );
};

/**
 * Create a test user in the database
 */
export const createTestUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'student' | 'ta' | 'instructor' | 'admin' = 'student'
): Promise<TestUser> => {
  if (!testPool) {
    throw new Error('Test database not initialized');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await testPool.query(
    `INSERT INTO users (email, password, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name, last_name, role`,
    [email, hashedPassword, firstName, lastName, role]
  );

  const user = result.rows[0];
  const token = generateToken(user.id, user.email, user.role);

  return {
    id: user.id,
    email: user.email,
    password,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    token,
  };
};

/**
 * Create standard test users (student, TA, instructor, admin)
 * Uses unique email addresses to avoid conflicts between tests
 */
export const createStandardTestUsers = async (): Promise<{
  student: TestUser;
  ta: TestUser;
  instructor: TestUser;
  admin: TestUser;
}> => {
  // Generate unique suffix for this test run to avoid email conflicts
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  const student = await createTestUser(
    `student-${uniqueSuffix}@test.com`,
    'password123',
    'John',
    'Student',
    'student'
  );

  const ta = await createTestUser(
    `ta-${uniqueSuffix}@test.com`,
    'password123',
    'Jane',
    'TA',
    'ta'
  );

  const instructor = await createTestUser(
    `instructor-${uniqueSuffix}@test.com`,
    'password123',
    'Bob',
    'Instructor',
    'instructor'
  );

  const admin = await createTestUser(
    `admin-${uniqueSuffix}@test.com`,
    'password123',
    'Alice',
    'Admin',
    'admin'
  );

  // Store for later use
  testUsers.student = student;
  testUsers.ta = ta;
  testUsers.instructor = instructor;
  testUsers.admin = admin;

  return { student, ta, instructor, admin };
};

/**
 * Get stored test user
 */
export const getTestUser = (role: string): TestUser | undefined => {
  return testUsers[role];
};

/**
 * Create a test assignment
 */
export const createTestAssignment = async (
  creatorId: string,
  overrides: any = {}
): Promise<any> => {
  if (!testPool) {
    throw new Error('Test database not initialized');
  }

  const result = await testPool.query(
    `INSERT INTO assignments (title, description, created_by, due_date, allow_late_submission, max_file_size, allowed_file_types)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      overrides.title || 'Test Assignment',
      overrides.description || 'Test assignment description',
      creatorId,
      overrides.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      overrides.allowLateSubmission !== undefined ? overrides.allowLateSubmission : false,
      overrides.maxFileSize || 10,
      overrides.allowedFileTypes || ['pdf', 'docx', 'txt'],
    ]
  );

  return result.rows[0];
};

/**
 * Create a test submission
 */
export const createTestSubmission = async (
  assignmentId: string,
  studentId: string,
  overrides: any = {}
): Promise<any> => {
  if (!testPool) {
    throw new Error('Test database not initialized');
  }

  const result = await testPool.query(
    `INSERT INTO submissions (assignment_id, student_id, text_content, status, submitted_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      assignmentId,
      studentId,
      overrides.textContent || 'Test submission content',
      overrides.status || 'draft',
      overrides.submittedAt || null,
    ]
  );

  return result.rows[0];
};

/**
 * Create a test feedback
 */
export const createTestFeedback = async (
  submissionId: string,
  reviewerId: string,
  overrides: any = {}
): Promise<any> => {
  if (!testPool) {
    throw new Error('Test database not initialized');
  }

  const result = await testPool.query(
    `INSERT INTO feedback (submission_id, reviewer_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [
      submissionId,
      reviewerId,
      overrides.content || 'Test feedback content',
    ]
  );

  // Update submission grade if provided
  if (overrides.grade !== undefined) {
    await testPool.query(
      `UPDATE submissions SET grade = $1, status = 'graded' WHERE id = $2`,
      [overrides.grade, submissionId]
    );
  }

  return result.rows[0];
};

/**
 * Make authenticated GET request
 */
export const authenticatedGet = (url: string, token: string) => {
  return request.get(url).set('Authorization', `Bearer ${token}`);
};

/**
 * Make authenticated POST request
 */
export const authenticatedPost = (url: string, token: string, data: any) => {
  return request.post(url).set('Authorization', `Bearer ${token}`).send(data);
};

/**
 * Make authenticated PUT request
 */
export const authenticatedPut = (url: string, token: string, data: any) => {
  return request.put(url).set('Authorization', `Bearer ${token}`).send(data);
};

/**
 * Make authenticated PATCH request
 */
export const authenticatedPatch = (url: string, token: string, data: any) => {
  return request.patch(url).set('Authorization', `Bearer ${token}`).send(data);
};

/**
 * Make authenticated DELETE request
 */
export const authenticatedDelete = (url: string, token: string) => {
  return request.delete(url).set('Authorization', `Bearer ${token}`);
};

/**
 * Wait for a specified amount of time (useful for deadline tests)
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Setup and teardown for all tests
beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await clearTestData();
  await teardownTestDB();
});

// Clear data before each test
beforeEach(async () => {
  await clearTestData();
});
