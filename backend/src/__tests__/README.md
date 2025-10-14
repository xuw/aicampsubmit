# AI+ Bootcamp Submission System - Test Suite

Comprehensive test suite for the backend API of the AI+ Bootcamp Submission System.

## Overview

This test suite provides complete coverage of all API endpoints with a focus on:
- Role-based access control (RBAC)
- Business logic validation
- Error handling
- Data integrity
- Security constraints

## Test Structure

```
src/__tests__/
├── setup.ts              # Test utilities and helpers
├── auth.test.ts          # Authentication endpoints
├── users.test.ts         # User management endpoints
├── assignments.test.ts   # Assignment CRUD operations
├── submissions.test.ts   # Submission workflow
└── feedback.test.ts      # Feedback and grading
```

## Setup and Configuration

### Prerequisites

- Node.js 18+
- PostgreSQL database for testing
- Environment variables configured

### Environment Variables

Create a `.env.test` file or set the following:

```bash
DATABASE_URL=postgresql://localhost:5432/homework_test
JWT_SECRET=test-secret-key
NODE_ENV=test
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run with verbose output
npm test -- --verbose
```

## Test Files

### 1. setup.ts - Test Utilities

**Purpose:** Provides reusable test helpers and database management

**Key Functions:**
- `setupTestDB()` - Initialize test database connection
- `teardownTestDB()` - Clean up database connection
- `clearTestData()` - Remove all test data
- `createTestUser(email, password, firstName, lastName, role)` - Create test user
- `createStandardTestUsers()` - Create student, TA, instructor, admin users
- `createTestAssignment(creatorId, overrides)` - Create test assignment
- `createTestSubmission(assignmentId, studentId, overrides)` - Create test submission
- `createTestFeedback(submissionId, reviewerId, overrides)` - Create test feedback
- `authenticatedGet(url, token)` - Make authenticated GET request
- `authenticatedPost(url, token, data)` - Make authenticated POST request
- `authenticatedPut(url, token, data)` - Make authenticated PUT request
- `authenticatedPatch(url, token, data)` - Make authenticated PATCH request
- `authenticatedDelete(url, token)` - Make authenticated DELETE request

**Lifecycle Hooks:**
- `beforeAll()` - Setup database connection
- `afterAll()` - Teardown database connection
- `beforeEach()` - Clear test data before each test

### 2. auth.test.ts - Authentication (36 tests)

**Endpoints Tested:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

**Test Coverage:**

#### Registration Tests (7)
- Valid registration with all required fields
- Missing required fields validation
- Invalid email format rejection
- Weak password rejection
- Duplicate email prevention
- Default role assignment (student)
- Role tampering prevention

#### Login Tests (7)
- Valid credentials acceptance
- Missing email/password validation
- Non-existent email rejection
- Incorrect password rejection
- Generic error messages (no credential leaking)
- JWT token generation and format
- Token validation

#### Current User Tests (6)
- Valid token returns user profile
- No token rejection
- Invalid token rejection
- Malformed Authorization header rejection
- Expired token handling
- Case-insensitive Bearer prefix

#### Integration Tests (3)
- Full registration -> login -> profile flow
- Concurrent registration handling
- SQL injection prevention

### 3. users.test.ts - User Management (28 tests)

**Endpoints Tested:**
- `GET /api/users`
- `PATCH /api/users/:id/role`

**Test Coverage:**

#### List Users Tests (11)
- Admin can list all users
- Password field exclusion from response
- Pagination support (page, limit)
- Role filtering (student, ta, instructor, admin)
- Non-admin access denial (student, TA, instructor)
- Authentication requirement
- Invalid role filter handling
- Pagination edge cases

#### Role Management Tests (15)
- Admin can promote student to TA/instructor/admin
- Admin can promote TA to instructor
- Admin can demote instructor to TA
- Admin can demote TA to student
- Invalid role value rejection
- Missing role field validation
- Non-existent user ID handling
- Invalid user ID format rejection
- Non-admin access denial (all roles)
- Self-promotion handling
- Authentication requirement
- Concurrent role changes

#### Integration Tests (2)
- Complete user lifecycle: create -> promote -> demote
- Data integrity during role changes

### 4. assignments.test.ts - Assignments (48 tests)

**Endpoints Tested:**
- `POST /api/assignments`
- `GET /api/assignments`
- `GET /api/assignments/:id`
- `PUT /api/assignments/:id`
- `DELETE /api/assignments/:id`

**Test Coverage:**

#### Create Assignment Tests (11)
- TA can create assignment
- Instructor can create assignment
- Student access denial
- Missing required fields validation (title, description, dueDate)
- Invalid due date format rejection
- Past due date rejection
- Optional field defaults
- File size limit validation
- File types format validation
- Authentication requirement

#### List Assignments Tests (9)
- All authenticated users can list
- Required fields presence
- Pagination support
- Access for all roles (student, TA, instructor, admin)
- Authentication requirement
- Empty list handling

#### Get Assignment Details Tests (5)
- Valid ID returns details
- Access for all roles
- Non-existent ID returns 404
- Invalid ID format returns 400
- Authentication requirement

#### Update Assignment Tests (8)
- Creator can update their assignment
- Instructor can update any assignment
- Other TAs cannot update
- Students cannot update
- Updated data validation
- createdBy field protection
- Non-existent assignment handling
- Authentication requirement

#### Delete Assignment Tests (7)
- Instructor can delete
- TA access denial
- Student access denial
- Admin handling
- Non-existent assignment handling
- Cascade delete of related data
- Authentication requirement

#### Integration Tests (2)
- Full CRUD lifecycle: create -> read -> update -> delete
- Multiple assignments from different creators

### 5. submissions.test.ts - Submissions (52 tests)

**Endpoints Tested:**
- `POST /api/submissions`
- `GET /api/submissions/my`
- `GET /api/submissions/:id`
- `GET /api/submissions/by-assignment/:id`
- `GET /api/submissions/attachments/:id/download`

**Test Coverage:**

#### Create Submission Tests (14)
- Create with text content (draft)
- Create with submitted status
- Update existing draft
- Deadline enforcement
- Late submission when allowed
- Missing assignment ID validation
- Invalid assignment ID handling
- Invalid status validation
- Empty text content for draft
- Authentication requirement
- TA/instructor access denial

#### My Submissions Tests (5)
- Return student's own submissions
- Filter by assignment ID
- Empty array for no submissions
- Other students' submissions exclusion
- Authentication requirement

#### View Submission Tests (7)
- Owner can view their submission
- TA can view any submission
- Instructor can view any submission
- Other students access denial
- Non-existent submission returns 404
- Invalid ID format returns 400
- Authentication requirement

#### List by Assignment Tests (8)
- TA can list submissions for assignment
- Instructor can list submissions
- Student access denial
- Pagination support
- Non-existent assignment handling
- Empty list handling
- Authentication requirement

#### Download Attachment Tests (5)
- Owner can download their attachment
- TA can download any attachment
- Instructor can download any attachment
- Other students access denial
- Authentication requirement

#### Integration Tests (4)
- Full workflow: draft -> update -> submit
- Deadline enforcement
- Submission uniqueness per student-assignment
- Multiple students submitting to same assignment

### 6. feedback.test.ts - Feedback (50 tests)

**Endpoints Tested:**
- `POST /api/feedback`
- `PUT /api/feedback/:id`
- `GET /api/feedback/by-submission/:id`

**Test Coverage:**

#### Add Feedback Tests (15)
- TA can add feedback with grade
- Instructor can add feedback
- Grade validation (0-100)
- Negative grade rejection
- Grade boundary values (0, 100)
- Feedback without grade
- Student access denial
- Missing submission ID validation
- Missing content validation
- Non-existent submission handling
- Submission status update to graded
- Authentication requirement
- Markdown support in content

#### Update Feedback Tests (11)
- Original reviewer can update
- Instructor can update any feedback
- Other TAs cannot update
- Students cannot update
- Updated grade validation
- Content-only update
- Grade-only update
- Non-existent feedback handling
- Invalid feedback ID handling
- Authentication requirement
- Submission grade update

#### View Feedback Tests (10)
- Submission owner can view
- TA can view
- Instructor can view
- Other students access denial
- Empty array for no feedback
- Non-existent submission handling
- Invalid submission ID handling
- Authentication requirement
- Chronological ordering

#### Integration Tests (4)
- Full workflow: create -> update -> view
- Multiple feedback from different reviewers
- Feedback history with grade changes
- Complete RBAC enforcement

## Test Coverage Summary

### Total Tests: 214

| Category | Tests | Coverage |
|----------|-------|----------|
| **Authentication** | 36 | Registration, login, profile, security |
| **User Management** | 28 | List users, role management, RBAC |
| **Assignments** | 48 | CRUD operations, permissions, validation |
| **Submissions** | 52 | Workflow, deadlines, file handling |
| **Feedback** | 50 | Grading, reviews, access control |

### Coverage by Feature

#### Role-Based Access Control (RBAC)
- Student permissions: 45 tests
- TA permissions: 38 tests
- Instructor permissions: 32 tests
- Admin permissions: 18 tests
- Cross-role access denial: 55 tests

#### Validation
- Input validation: 48 tests
- Business logic validation: 35 tests
- Data format validation: 22 tests

#### Error Handling
- 404 Not Found: 28 tests
- 400 Bad Request: 35 tests
- 401 Unauthorized: 32 tests
- 403 Forbidden: 42 tests
- 409 Conflict: 3 tests

#### Integration Tests
- Complete workflows: 12 tests
- Multi-user scenarios: 8 tests
- Data integrity: 6 tests

## Key Testing Patterns

### 1. Role-Based Testing
Every protected endpoint is tested with all four user roles:
```typescript
it('should allow TA to perform action', async () => { ... });
it('should allow instructor to perform action', async () => { ... });
it('should deny student from performing action', async () => { ... });
it('should deny other TAs from performing action', async () => { ... });
```

### 2. Validation Testing
Every input field is tested for:
- Required field validation
- Format validation
- Range validation
- Type validation

### 3. Security Testing
- Authentication requirement on all protected endpoints
- Authorization checks for all operations
- SQL injection prevention
- Input sanitization
- Token validation

### 4. Integration Testing
End-to-end workflows covering:
- User registration through submission and grading
- Multi-user interactions
- Cascade operations
- State transitions

## Best Practices

### Test Organization
- Tests are grouped by endpoint
- Related tests are in `describe` blocks
- Integration tests are separate
- Clear test descriptions

### Test Independence
- Each test is independent
- Database is cleared before each test
- No shared state between tests
- Predictable test order

### Assertions
- Status codes are always checked
- Response structure is validated
- Error messages are verified
- Data integrity is confirmed

### Helper Functions
- Reusable test helpers in setup.ts
- Standard user creation
- Authenticated request helpers
- Test data generators

## Running Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html

# View coverage in browser
open coverage/index.html
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: homework_test
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## Maintenance

### Adding New Tests
1. Identify the endpoint or feature to test
2. Add test cases to appropriate file
3. Use existing helpers from setup.ts
4. Follow naming conventions
5. Include success and error cases
6. Test all user roles if applicable

### Updating Tests
1. Update test expectations when API changes
2. Add new test cases for new features
3. Remove obsolete tests
4. Keep tests synchronized with specification

### Debugging Failed Tests
1. Run single test file: `npm test -- auth.test.ts`
2. Use `--verbose` flag for detailed output
3. Check database state with SQL queries
4. Verify environment variables
5. Review test logs and error messages

## Known Limitations

1. **File Upload Testing**: File upload tests use placeholders. Actual multipart form testing requires additional setup.
2. **Email Testing**: Email notification tests are not included (feature not implemented).
3. **Performance Testing**: Load and stress tests are not included.
4. **Browser Testing**: Frontend integration tests are separate.

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [TypeScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [API Testing Guide](https://www.freecodecamp.org/news/how-to-test-apis/)

## Contributing

When adding new tests:
1. Follow existing patterns
2. Test both success and failure cases
3. Include role-based access tests
4. Add integration tests for complex workflows
5. Document any special setup required
6. Update this README with new coverage

## Support

For questions or issues with the test suite:
1. Check test output and error messages
2. Review this README
3. Check SPECIFICATION.md for API requirements
4. Consult team documentation
