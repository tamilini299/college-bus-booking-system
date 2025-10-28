const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 7071;

// Trust proxy for Azure
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage
let bookingsData = [];
let bookingIdCounter = 1;

// Sample data
const routes = [
  { id: 1, code: 'R001', display_name: 'Route 1 - Campus to Downtown' },
  { id: 2, code: 'R002', display_name: 'Route 2 - Campus to Airport' },
  { id: 3, code: 'R003', display_name: 'Route 3 - Campus to Mall' },
  { id: 4, code: 'R004', display_name: 'Route 4 - Campus to Station' },
  { id: 5, code: 'R005', display_name: 'Route 5 - Campus to Hospital' }
];

const stops = [
  { id: 1, route_id: 1, name: 'Main Campus Gate', seq: 1 },
  { id: 2, route_id: 1, name: 'Library Junction', seq: 2 },
  { id: 3, route_id: 1, name: 'City Center', seq: 3 },
  { id: 4, route_id: 1, name: 'Downtown Terminal', seq: 4 },
  
  { id: 5, route_id: 2, name: 'Main Campus Gate', seq: 1 },
  { id: 6, route_id: 2, name: 'Highway Exit', seq: 2 },
  { id: 7, route_id: 2, name: 'Airport Road', seq: 3 },
  { id: 8, route_id: 2, name: 'Airport Terminal', seq: 4 },
  
  { id: 9, route_id: 3, name: 'Main Campus Gate', seq: 1 },
  { id: 10, route_id: 3, name: 'Shopping District', seq: 2 },
  { id: 11, route_id: 3, name: 'Central Mall', seq: 3 },
  
  { id: 12, route_id: 4, name: 'Main Campus Gate', seq: 1 },
  { id: 13, route_id: 4, name: 'Park Avenue', seq: 2 },
  { id: 14, route_id: 4, name: 'Railway Station', seq: 3 },
  
  { id: 15, route_id: 5, name: 'Main Campus Gate', seq: 1 },
  { id: 16, route_id: 5, name: 'Medical District', seq: 2 },
  { id: 17, route_id: 5, name: 'City Hospital', seq: 3 }
];

const buses = [
  { id: 1, bus_number: 'BUS-101', capacity: 70 },
  { id: 2, bus_number: 'BUS-102', capacity: 70 },
  { id: 3, bus_number: 'BUS-103', capacity: 65 },
  { id: 4, bus_number: 'BUS-104', capacity: 75 },
  { id: 5, bus_number: 'BUS-105', capacity: 70 }
];

// Generate schedules dynamically
function generateSchedules(date, routeId = null) {
  const schedules = [];
  const times = ['08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  
  routes.forEach(route => {
    if (routeId && route.id !== parseInt(routeId)) return;
    
    times.forEach((time, idx) => {
      const bus = buses[idx % buses.length];
      const bookedCount = bookingsData.filter(b => 
        b.schedule_route_id === route.id && 
        b.schedule_time === time && 
        b.date === date
      ).length;
      
      schedules.push({
        id: route.id * 100 + idx,
        route_id: route.id,
        route_name: route.display_name,
        date: date,
        bus_id: bus.id,
        bus_number: bus.bus_number,
        departure_time: time,
        status: 'scheduled',
        capacity: bus.capacity,
        booked_count: bookedCount,
        available_seats: bus.capacity - bookedCount
      });
    });
  });
  
  return schedules;
}

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'CBBS Backend API is running!', status: 'success' });
});

// Routes endpoint
app.get('/api/routes', (req, res) => {
  res.json({ routes });
});

// Stops for a specific route
app.get('/api/routes/:routeId/stops', (req, res) => {
  const routeId = parseInt(req.params.routeId);
  const routeStops = stops.filter(s => s.route_id === routeId);
  res.json({ stops: routeStops });
});

// Schedules endpoint
app.get('/api/schedules', (req, res) => {
  const { date, routeId } = req.query;
  const scheduleDate = date || new Date().toISOString().slice(0, 10);
  const schedules = generateSchedules(scheduleDate, routeId);
  res.json({ schedules });
});

// Create booking
app.post('/api/bookings', (req, res) => {
  const { scheduleId, stopId, autoBook } = req.body;
  const userId = req.headers['x-user-id'] || 1;
  const date = new Date().toISOString().slice(0, 10);
  
  // Find the schedule details
  const allSchedules = generateSchedules(date);
  const schedule = allSchedules.find(s => s.id === scheduleId);
  
  if (!schedule) {
    return res.status(404).json({ message: 'Schedule not found' });
  }
  
  // Check capacity
  if (schedule.booked_count >= schedule.capacity) {
    return res.status(400).json({ message: 'Bus is fully booked' });
  }
  
  // Create booking
  const booking = {
    id: bookingIdCounter++,
    user_id: userId,
    schedule_id: scheduleId,
    schedule_route_id: schedule.route_id,
    schedule_time: schedule.departure_time,
    stop_id: stopId,
    date: date,
    auto_book: autoBook,
    status: 'confirmed',
    created_at: new Date().toISOString()
  };
  
  bookingsData.push(booking);
  
  res.json({ 
    message: 'Booking confirmed successfully!', 
    booking 
  });
});

// Get all bookings (for admin)
app.get('/api/bookings', (req, res) => {
  const { date } = req.query;
  let filteredBookings = bookingsData;
  
  if (date) {
    filteredBookings = bookingsData.filter(b => b.date === date);
  }
  
  // Enrich bookings with route and stop info
  const enrichedBookings = filteredBookings.map(booking => {
    const route = routes.find(r => r.id === booking.schedule_route_id);
    const stop = stops.find(s => s.id === booking.stop_id);
    
    return {
      ...booking,
      route_name: route ? route.display_name : 'Unknown Route',
      stop_name: stop ? stop.name : 'Unknown Stop'
    };
  });
  
  res.json({ bookings: enrichedBookings });
});

// Get route utilization stats (for admin)
app.get('/api/stats/route-utilization', (req, res) => {
  const { date } = req.query;
  const scheduleDate = date || new Date().toISOString().slice(0, 10);
  const schedules = generateSchedules(scheduleDate);
  
  const utilization = routes.map(route => {
    const routeSchedules = schedules.filter(s => s.route_id === route.id);
    const totalCapacity = routeSchedules.reduce((sum, s) => sum + s.capacity, 0);
    const totalBooked = routeSchedules.reduce((sum, s) => sum + s.booked_count, 0);
    const utilizationPercent = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
    
    return {
      route_id: route.id,
      route_name: route.display_name,
      total_capacity: totalCapacity,
      total_booked: totalBooked,
      utilization_percent: utilizationPercent,
      schedule_count: routeSchedules.length
    };
  });
  
  res.json({ utilization });
});

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple mock authentication
  if (username === 'admin' && password === 'admin') {
    res.json({ 
      success: true, 
      user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' },
      token: 'mock-jwt-token'
    });
  } else if (username === 'student' && password === 'student') {
    res.json({ 
      success: true, 
      user: { id: 2, username: 'student', name: 'John Student', role: 'student' },
      token: 'mock-jwt-token'
    });
  } else if (username === 'driver' && password === 'driver') {
    res.json({ 
      success: true, 
      user: { id: 3, username: 'driver', name: 'Mike Driver', role: 'driver' },
      token: 'mock-jwt-token'
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Available routes:`);
  console.log(`  GET  /api/routes`);
  console.log(`  GET  /api/routes/:routeId/stops`);
  console.log(`  GET  /api/schedules?date=YYYY-MM-DD&routeId=X`);
  console.log(`  POST /api/bookings`);
  console.log(`  GET  /api/bookings?date=YYYY-MM-DD`);
  console.log(`  GET  /api/stats/route-utilization?date=YYYY-MM-DD`);
  console.log(`  POST /api/auth/login`);
});
