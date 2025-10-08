import { app } from '@azure/functions';
import { query, getPool } from '../shared/db.js';

app.http('auth', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/login',
  handler: async (request, context) => {
    try {
      const { email, password } = await request.json();
      
      if (!email || !password) {
        return {
          status: 400,
          jsonBody: { error: 'Email and password are required' },
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
          }
        };
      }

      // Simple password check (in real app, use proper hashing)
      const users = await query(
        'SELECT id, name, email, role FROM users WHERE email = @email',
        { email }
      );

      if (users.length === 0) {
        return {
          status: 401,
          jsonBody: { error: 'Invalid credentials' },
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
          }
        };
      }

      const user = users[0];
      
      return {
        status: 200,
        jsonBody: { 
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          message: 'Login successful'
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    } catch (err) {
      context.error('Error during login', err);
      return {
        status: 500,
        jsonBody: { error: 'Login failed' },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    }
  }
});
