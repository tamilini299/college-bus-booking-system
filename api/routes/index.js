import { app } from '@azure/functions';
import { query } from '../shared/db.js';

app.http('routes', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'routes',
  handler: async (request, context) => {
    try {
      const routes = await query('SELECT id, code, display_name FROM routes ORDER BY display_name');
      return { 
        status: 200, 
        jsonBody: { routes },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    } catch (err) {
      context.error('Error fetching routes', err);
      return { 
        status: 500, 
        jsonBody: { error: 'Failed to fetch routes' },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    }
  }
});

