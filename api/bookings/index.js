import { app } from '@azure/functions';
import { query, sql, getPool } from '../shared/db.js';

async function getScheduleWithCounts(scheduleId) {
  const rows = await query(
    `SELECT s.id, s.route_id, s.date, s.bus_id, s.departure_time, s.status,
            b.bus_number, b.capacity,
            (SELECT COUNT(1) FROM bookings bk WHERE bk.schedule_id = s.id AND bk.status = 'confirmed') AS booked_count
     FROM schedules s
     LEFT JOIN buses b ON b.id = s.bus_id
     WHERE s.id = @scheduleId`,
    { scheduleId }
  );
  return rows[0];
}

app.http('bookings', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'bookings',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const userId = Number(request.headers.get('x-user-id')) || body.userId || 1;
      const { scheduleId, stopId, autoBook } = body;
      if (!scheduleId || !stopId) {
        return { 
          status: 400, 
          jsonBody: { error: 'scheduleId and stopId are required' },
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
          }
        };
      }

      const schedule = await getScheduleWithCounts(Number(scheduleId));
      if (!schedule) {
        return { 
          status: 404, 
          jsonBody: { error: 'Schedule not found' },
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
          }
        };
      }

      const capacity = schedule.capacity ?? 70;
      const hardLimit = capacity;
      const softLimit = capacity + 5;

      if (schedule.booked_count >= hardLimit && !autoBook) {
        return { 
          status: 409, 
          jsonBody: { error: 'Bus full. Enable autoBook to soft-overbook.' },
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
          }
        };
      }
      if (schedule.booked_count >= softLimit) {
        return { 
          status: 409, 
          jsonBody: { error: 'Bus soft-overbook limit reached.' },
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
          }
        };
      }

      const pool = await getPool();
      const requestDb = pool.request();
      requestDb.input('user_id', userId);
      requestDb.input('schedule_id', Number(scheduleId));
      requestDb.input('stop_id', Number(stopId));
      const insertRes = await requestDb.query(
        `INSERT INTO bookings(user_id, schedule_id, stop_id, status)
         OUTPUT INSERTED.id
         VALUES(@user_id, @schedule_id, @stop_id, 'confirmed')`
      );
      const bookingId = insertRes.recordset?.[0]?.id;

      const updated = await getScheduleWithCounts(Number(scheduleId));

      return { 
        status: 201, 
        jsonBody: { bookingId, message: 'Booking confirmed', schedule: updated },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    } catch (err) {
      context.error('Error creating booking', err);
      return { 
        status: 500, 
        jsonBody: { error: 'Failed to create booking' },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role'
        }
      };
    }
  }
});

