// Global setup for Jest tests
// Set environment variables before any modules are loaded

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://homework_user:homework_secure_password_123@localhost:5432/homework_system_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-minimum-32-chars';
process.env.PORT = '3002'; // Different port for test server

console.log('Jest setup: Test environment configured');
console.log(`Database URL: ${process.env.DATABASE_URL}`);
