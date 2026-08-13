/**
 * Test setup — sets required environment variables before tests run.
 * This ensures the Zod env validation passes in the test environment.
 */

process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '4000';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test_db?schema=public';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['SUPABASE_URL'] = 'https://slnrfbsaqzgdiyuimogo.supabase.co';
process.env['SUPABASE_ANON_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test_service';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['LOG_LEVEL'] = 'silent';
