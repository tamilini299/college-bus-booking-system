import { app } from '@azure/functions';
import { query } from '../shared/db.js';

app.http('schedules', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'schedules',
  handler: async (request, context) => {
    try {
      const url = new URL(request.url);
      const routeId = url.searchParams.get('routeId');
      const date = url.searchParams.get('date');
      const where = [];
      const params = {};
      if (routeId) { where.push('s.route_id = @routeId'); params.routeId = Number(routeId); }
      if (date) { where.push('s.date = @date'); params.date = date; }
      const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
      const rows = await query(
        `SELECT s.id, s.route_id, s.date, s.bus_id, s.departure_time, s.status,
                b.bus_number, b.capacity,
                (SELECT COUNT(1) FROM bookings bk WHERE bk.schedule_id = s.id AND bk.status = 'confirmed') AS booked_count
         FROM schedules s
         LEFT JOIN buses b ON b.id = s.bus_id
         ${whereSql}
         ORDER BY s.departure_time`,
        params
      );
      const schedules = rows.map(r => ({ ...r, soft_overbook: r.booked_count > r.capacity }));
      return { 
        status: 200, 
        jsonBody: { schedules },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    } catch (err) {
      context.error('Error fetching schedules', err);
      return { 
        status: 500, 
        jsonBody: { error: 'Failed to fetch schedules' },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    }
  }
});

