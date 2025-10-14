// Global teardown for Jest tests
// This runs once after ALL test suites have completed

module.exports = async () => {
  console.log('Jest global teardown: Cleaning up resources');

  // Give database connections time to close gracefully
  await new Promise(resolve => setTimeout(resolve, 500));
};
