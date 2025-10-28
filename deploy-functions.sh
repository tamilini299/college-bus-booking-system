#!/bin/bash
# Deploy restructured Azure Functions backend

echo "🚀 Deploying restructured Azure Functions backend..."

# Variables
RG="cbbs-rg"
FUNC_APP="cbbs-functions1234"

# Navigate to api directory
cd api

# Create deployment package (exclude node_modules)
echo "📦 Creating deployment package..."
zip -r /home/cbbs/api-restructured.zip . -x "node_modules/*" >/dev/null

# Deploy to Azure Functions
echo "📤 Deploying to Azure Functions..."
az functionapp deployment source config-zip \
  -g $RG -n $FUNC_APP \
  --src /home/cbbs/api-restructured.zip

echo ""
echo "⏰ Waiting for deployment to complete..."
sleep 30

# Test the API
echo "🧪 Testing the API..."
echo "Testing health endpoint:"
curl -s "https://$FUNC_APP.azurewebsites.net/" | head -c 200; echo

echo ""
echo "Testing routes endpoint:"
curl -s "https://$FUNC_APP.azurewebsites.net/api/routes" | head -c 500; echo

echo ""
echo "Testing schedules endpoint:"
curl -s "https://$FUNC_APP.azurewebsites.net/api/schedules" | head -c 500; echo

echo ""
echo "========================================="
echo "✅ Deployment completed!"
echo "========================================="
echo ""
echo "🌐 Your backend is now available at:"
echo "https://$FUNC_APP.azurewebsites.net"
echo ""
echo "📋 Available endpoints:"
echo "- GET  / (health check)"
echo "- GET  /api/routes"
echo "- GET  /api/schedules"
echo "- GET  /api/stops"
echo "- GET  /api/buses"
echo "- GET  /api/bookings"
echo "- POST /api/bookings"
echo "- POST /api/auth/login"
echo "- POST /api/auth/register"
echo ""
