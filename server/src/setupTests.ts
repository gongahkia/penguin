// Test setup for server-side testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/penguin-os-test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '5001';