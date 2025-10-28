const { app } = require('@azure/functions');

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: '',
  handler: async (request, context) => {
    return {
      status: 200,
      body: "CBBS backend running successfully 🚀"
    };
  }
});
