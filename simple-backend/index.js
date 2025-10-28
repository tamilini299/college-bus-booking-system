const http = require('http');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-user-role');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'CBBS Backend is running!', status: 'success' }));
    return;
  }

  // Routes endpoint
  if (req.url === '/api/routes') {
    const routes = [
      { id: 1, code: 'R001', display_name: 'Route 1 - Campus to Downtown' },
      { id: 2, code: 'R002', display_name: 'Route 2 - Campus to Airport' },
      { id: 3, code: 'R003', display_name: 'Route 3 - Campus to Mall' },
      { id: 4, code: 'R004', display_name: 'Route 4 - Campus to Station' },
      { id: 5, code: 'R005', display_name: 'Route 5 - Campus to Hospital' }
    ];
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(routes));
    return;
  }

  // Bookings endpoint
  if (req.url === '/api/bookings') {
    const bookings = [
      { id: 1, route_id: 1, user_id: 1, booking_date: '2024-01-15', status: 'confirmed' },
      { id: 2, route_id: 2, user_id: 2, booking_date: '2024-01-16', status: 'pending' }
    ];
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(bookings));
    return;
  }

  // Authentication endpoints
  if (req.url === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        // Mock successful registration
        const response = {
          success: true,
          message: 'Account created successfully',
          user: {
            id: Math.floor(Math.random() * 1000),
            name: userData.name,
            email: userData.email,
            role: userData.role
          }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid request data' }));
      }
    });
    return;
  }

  if (req.url === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const loginData = JSON.parse(body);
        // Mock successful login
        const response = {
          success: true,
          message: 'Login successful',
          user: {
            id: 1,
            name: 'Test User',
            email: loginData.email,
            role: 'Student'
          },
          token: 'mock-jwt-token-' + Date.now()
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Invalid request data' }));
      }
    });
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
