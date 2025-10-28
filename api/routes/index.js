const { app } = require('@azure/functions');

app.http('routes', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'api/routes',
  handler: async (request, context) => {
    try {
      // For now, return mock data to test the endpoint
      const mockRoutes = [
        { id: 1, code: 'R001', display_name: 'Route 1 - Campus to Downtown' },
        { id: 2, code: 'R002', display_name: 'Route 2 - Campus to Airport' },
        { id: 3, code: 'R003', display_name: 'Route 3 - Campus to Mall' }
      ];
      
      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify(mockRoutes)
      };
    } catch (err) {
      context.error("Error:", err);
      return {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: err.message })
      };
    }
  }
});
