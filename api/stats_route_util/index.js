import { app } from '@azure/functions';
import { query } from '../shared/db.js';

app.http('stats_route_util', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'stats/route-utilization',
  handler: async (request, context) => {
    try {
      const url = new URL(request.url);
      const date = url.searchParams.get('date');
      const where = date ? 'WHERE s.date = @date' : '';
      const params = date ? { date } : {};
      const rows = await query(
        `SELECT r.id as route_id, r.code, r.display_name,
                COUNT(DISTINCT s.id) AS num_buses,
                COALESCE(SUM(b.capacity), 0) AS total_capacity,
                COALESCE(SUM((SELECT COUNT(1) FROM bookings bk WHERE bk.schedule_id = s.id AND bk.status = 'confirmed')), 0) AS total_booked
         FROM routes r
         LEFT JOIN schedules s ON s.route_id = r.id
         LEFT JOIN buses b ON b.id = s.bus_id
         ${where}
         GROUP BY r.id, r.code, r.display_name
         ORDER BY r.display_name`,
        params
      );
      const utilization = rows.map(r => ({
        ...r,
        removable_buses: r.total_booked < 35 ? 1 : 0
      }));
      return { 
        status: 200, 
        jsonBody: { utilization },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    } catch (err) {
      context.error('Error fetching route utilization', err);
      return { 
        status: 500, 
        jsonBody: { error: 'Failed to fetch utilization' },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    }
  }
});

