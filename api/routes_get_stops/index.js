import { app } from '@azure/functions';
import { query, sql } from '../shared/db.js';

app.http('routes_get_stops', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'routes/{id}/stops',
  handler: async (request, context) => {
    try {
      const id = request.params.id;
      const stops = await query(
        'SELECT id, route_id, name, seq FROM stops WHERE route_id = @routeId ORDER BY seq',
        { routeId: Number(id) }
      );
      return { 
        status: 200, 
        jsonBody: { stops },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    } catch (err) {
      context.error('Error fetching stops', err);
      return { 
        status: 500, 
        jsonBody: { error: 'Failed to fetch stops' },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    }
  }
});

