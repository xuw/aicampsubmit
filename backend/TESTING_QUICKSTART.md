# Testing Quick Start Guide
## AI+ Bootcamp Submission System Backend

This guide will help you quickly set up and run the comprehensive test suite.

---

## Prerequisites

Before running tests, ensure you have:

1. **Node.js 18+** installed
2. **PostgreSQL** installed and running
3. **Project dependencies** installed

```bash
node --version  # Should be 18+
psql --version  # Should show PostgreSQL version
```

---

## Setup Steps

### 1. Install Dependencies

```bash
cd /Users/xuw/submitclaude/backend
npm install
```

This will install:
- `jest` - Test framework
- `ts-jest` - TypeScript support for Jest
- `supertest` - HTTP assertion library
- All other dependencies from package.json

### 2. Create Test Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create test database
CREATE DATABASE homework_test;

# Grant permissions (if needed)
GRANT ALL PRIVILEGES ON DATABASE homework_test TO your_user;

# Exit psql
\q
```

### 3. Run Database Migrations

```bash
# Apply schema to test database
psql -U postgres -d homework_test -f path/to/init.sql
```

Or use your migration tool:
```bash
DATABASE_URL=postgresql://localhost:5432/homework_test npm run migrate
```

### 4. Configure Environment Variables

Create `.env.test` file:

```bash
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://localhost:5432/homework_test
JWT_SECRET=test-secret-key-minimum-32-characters-long
PORT=5001
```

Or export directly:

```bash
export DATABASE_URL=postgresql://localhost:5432/homework_test
export JWT_SECRET=test-secret-key-minimum-32-characters-long
export NODE_ENV=test
```

---

## Running Tests

### Run All Tests

```bash
npm test
```

Expected output:
```
PASS  src/__tests__/auth.test.ts (10.234s)
PASS  src/__tests__/users.test.ts (8.123s)
PASS  src/__tests__/assignments.test.ts (12.456s)
PASS  src/__tests__/submissions.test.ts (15.789s)
PASS  src/__tests__/feedback.test.ts (14.321s)

Test Suites: 5 passed, 5 total
Tests:       214 passed, 214 total
Snapshots:   0 total
Time:        60.923s
```

### Run Specific Test File

```bash
# Run authentication tests only
npm test auth.test.ts

# Run user management tests
npm test users.test.ts

# Run assignment tests
npm test assignments.test.ts

# Run submission tests
npm test submissions.test.ts

# Run feedback tests
npm test feedback.test.ts
```

### Run With Coverage

```bash
npm test -- --coverage
```

This generates:
- Console coverage summary
- HTML report in `coverage/` directory
- LCOV report for CI/CD

View HTML coverage:
```bash
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Run in Watch Mode

```bash
npm test -- --watch
```

Tests will re-run automatically when files change.

### Run With Verbose Output

```bash
npm test -- --verbose
```

Shows detailed test execution information.

### Run Specific Test

```bash
# Run only tests matching pattern
npm test -- --testNamePattern="should register a new user"

# Run only describe blocks matching pattern
npm test -- --testNamePattern="Authentication"
```

---

## Understanding Test Results

### Successful Test Run

```
✓ should register a new user with valid data (125ms)
✓ should reject registration with missing fields (45ms)
✓ should reject duplicate email registration (67ms)
```

- ✓ Green checkmark = Test passed
- Time in parentheses = Execution time

### Failed Test Run

```
✕ should register a new user with valid data (125ms)

  Expected: 201
  Received: 400

  Error: Request failed with status code 400
    at createTestUser (setup.ts:89:11)
    at Object.<anonymous> (auth.test.ts:12:24)
```

- ✕ Red X = Test failed
- Shows expected vs actual values
- Includes stack trace

---

## Common Issues and Solutions

### Issue 1: Database Connection Error

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Linux
   systemctl status postgresql
   ```

2. Verify connection string:
   ```bash
   psql postgresql://localhost:5432/homework_test
   ```

3. Check firewall settings

### Issue 2: Database Not Found

**Error:**
```
Error: database "homework_test" does not exist
```

**Solution:**
```bash
# Create database
createdb homework_test

# Or in psql
psql -U postgres -c "CREATE DATABASE homework_test"
```

### Issue 3: JWT Secret Not Set

**Error:**
```
Error: JWT_SECRET not configured
```

**Solution:**
```bash
# Set in environment
export JWT_SECRET=test-secret-key-minimum-32-characters-long

# Or add to .env.test file
echo "JWT_SECRET=test-secret-key-minimum-32-characters-long" >> .env.test
```

### Issue 4: Tests Timing Out

**Error:**
```
Timeout - Async callback was not invoked within the 10000 ms timeout
```

**Solution:**
1. Increase timeout in jest.config.js:
   ```javascript
   testTimeout: 30000  // 30 seconds
   ```

2. Or for specific test:
   ```typescript
   it('should do something', async () => {
     // test code
   }, 30000);  // 30 second timeout
   ```

### Issue 5: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution:**
1. Use different port:
   ```bash
   export PORT=5002
   ```

2. Or kill process using port:
   ```bash
   # macOS/Linux
   lsof -ti:5001 | xargs kill

   # Windows
   netstat -ano | findstr :5001
   taskkill /PID <PID> /F
   ```

### Issue 6: Permission Denied

**Error:**
```
Error: permission denied for table users
```

**Solution:**
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

---

## Test Structure Overview

```
src/__tests__/
├── setup.ts              # Test utilities (imported by all tests)
│   ├── Database management
│   ├── Test user creation
│   ├── Test data helpers
│   └── Authenticated request helpers
│
├── auth.test.ts          # 36 tests
│   ├── POST /api/auth/register (13 tests)
│   ├── POST /api/auth/login (10 tests)
│   └── GET /api/auth/me (13 tests)
│
├── users.test.ts         # 28 tests
│   ├── GET /api/users (16 tests)
│   └── PATCH /api/users/:id/role (12 tests)
│
├── assignments.test.ts   # 48 tests
│   ├── POST /api/assignments (14 tests)
│   ├── GET /api/assignments (10 tests)
│   ├── GET /api/assignments/:id (5 tests)
│   ├── PUT /api/assignments/:id (8 tests)
│   ├── DELETE /api/assignments/:id (7 tests)
│   └── Integration tests (4 tests)
│
├── submissions.test.ts   # 52 tests
│   ├── POST /api/submissions (16 tests)
│   ├── GET /api/submissions/my (5 tests)
│   ├── GET /api/submissions/:id (7 tests)
│   ├── GET /api/submissions/by-assignment/:id (8 tests)
│   ├── GET /api/submissions/attachments/:id/download (5 tests)
│   └── Integration tests (11 tests)
│
└── feedback.test.ts      # 50 tests
    ├── POST /api/feedback (15 tests)
    ├── PUT /api/feedback/:id (11 tests)
    ├── GET /api/feedback/by-submission/:id (12 tests)
    └── Integration tests (12 tests)
```

**Total: 214 tests covering 20 API endpoints**

---

## Quick Testing Checklist

Before committing code, ensure:

- [ ] All tests pass: `npm test`
- [ ] No test warnings or deprecations
- [ ] Coverage is adequate: `npm test -- --coverage`
- [ ] New features have tests
- [ ] Bug fixes include regression tests
- [ ] Tests are independent (can run in any order)
- [ ] Test names are descriptive
- [ ] No hardcoded values (use helpers)

---

## Next Steps

1. **Read Full Documentation**
   - See `src/__tests__/README.md` for detailed documentation
   - See `TEST_COVERAGE_SUMMARY.md` for complete coverage report

2. **Explore Test Files**
   - Start with `auth.test.ts` (simplest)
   - Review `setup.ts` to understand helpers
   - Check integration tests for workflow examples

3. **Add New Tests**
   - Follow existing patterns
   - Use helpers from setup.ts
   - Test success and failure cases
   - Include role-based access tests

4. **Set Up CI/CD**
   - Configure GitHub Actions or similar
   - Run tests on every push
   - Require passing tests for merge

---

## Quick Reference Commands

```bash
# Setup
npm install
createdb homework_test
export DATABASE_URL=postgresql://localhost:5432/homework_test
export JWT_SECRET=test-secret-key

# Run tests
npm test                          # All tests
npm test auth.test.ts            # Specific file
npm test -- --coverage           # With coverage
npm test -- --watch              # Watch mode
npm test -- --verbose            # Verbose output

# Debug
npm test -- --detectOpenHandles  # Find hanging operations
npm test -- --runInBand          # Run serially (easier to debug)
npm test -- --no-cache           # Clear Jest cache

# Coverage
npm test -- --coverage
open coverage/index.html

# Clean up
rm -rf coverage/
rm -rf node_modules/
npm ci
```

---

## Getting Help

If you encounter issues:

1. Check this guide for common problems
2. Review test file comments and documentation
3. Check Jest documentation: https://jestjs.io/
4. Check Supertest documentation: https://github.com/visionmedia/supertest
5. Review SPECIFICATION.md for API requirements

---

## Testing Best Practices

1. **Run tests before committing**
   ```bash
   npm test && git commit
   ```

2. **Write tests for new features**
   - Tests should be written first (TDD)
   - Or immediately after implementation

3. **Update tests when changing API**
   - Keep tests in sync with implementation
   - Update test expectations

4. **Use descriptive test names**
   ```typescript
   // Good
   it('should allow admin to promote student to TA', async () => { ... });

   // Bad
   it('should work', async () => { ... });
   ```

5. **Keep tests independent**
   - Don't rely on test execution order
   - Clean up after each test
   - Use beforeEach for setup

---

**Happy Testing!** 🎉

For questions or issues, refer to:
- Full test documentation: `src/__tests__/README.md`
- Coverage report: `TEST_COVERAGE_SUMMARY.md`
- API specification: `SPECIFICATION.md`
