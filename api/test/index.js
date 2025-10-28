const { app } = require('@azure/functions');

app.http('test', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'test',
  handler: async (request, context) => {
    return {
      status: 200,
      body: "Test function working!"
    };
  }
});
