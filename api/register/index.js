import { app } from '@azure/functions';
import { query, getPool } from '../shared/db.js';

app.http('register', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/register',
  handler: async (request, context) => {
    try {
      const { name, email, role, password } = await request.json();
      
      if (!name || !email || !role || !password) {
        return {
          status: 400,
          jsonBody: { error: 'All fields are required' },
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
          }
        };
      }

      // Check if user already exists
      const existingUsers = await query(
        'SELECT id FROM users WHERE email = @email',
        { email }
      );

      if (existingUsers.length > 0) {
        return {
          status: 409,
          jsonBody: { error: 'User already exists' },
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
          }
        };
      }

      // Insert new user
      const pool = await getPool();
      const requestDb = pool.request();
      requestDb.input('name', name);
      requestDb.input('email', email);
      requestDb.input('role', role);
      
      const insertRes = await requestDb.query(
        `INSERT INTO users(name, email, role) 
         OUTPUT INSERTED.id
         VALUES(@name, @email, @role)`
      );

      const userId = insertRes.recordset?.[0]?.id;

      return {
        status: 201,
        jsonBody: { 
          user: {
            id: userId,
            name,
            email,
            role
          },
          message: 'Registration successful'
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    } catch (err) {
      context.error('Error during registration', err);
      return {
        status: 500,
        jsonBody: { error: 'Registration failed' },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    }
  }
});
