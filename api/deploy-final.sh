#!/bin/bash
# Final deployment script for Azure Functions backend

echo "🚀 Deploying College Bus Booking System backend to Azure Functions..."

# Variables
RG="cbbs-rg"
FUNC_APP="cbbs-functions1234"

# Ensure we're in the api directory
cd /home/cbbs/CollegeBusBookingWebsite/api

# Install dependencies locally
echo "📦 Installing dependencies..."
npm install

# Create deployment package
echo "📦 Creating deployment package..."
zip -r /home/cbbs/api_final.zip * -x "node_modules/*" >/dev/null

# Configure Function App settings
echo "⚙️ Configuring Function App settings..."
az functionapp config appsettings set \
  -g $RG -n $FUNC_APP \
  --settings FUNCTIONS_WORKER_RUNTIME=node SCM_DO_BUILD_DURING_DEPLOYMENT=true ENABLE_ORYX_BUILD=true WEBSITE_RUN_FROM_PACKAGE=0

# Deploy to Azure Function App
echo "📤 Deploying to Azure Function App..."
az functionapp deployment source config-zip \
  -g $RG -n $FUNC_APP \
  --src /home/cbbs/api_final.zip

# Wait for deployment
echo "⏰ Waiting for deployment to complete..."
sleep 30

# Verify function registration
echo "🔍 Verifying function registration..."
az functionapp list-functions -g $RG -n $FUNC_APP -o table

# Test API endpoints
echo ""
echo "🧪 Testing API endpoints..."

echo "Testing health endpoint:"
curl -s "https://$FUNC_APP.azurewebsites.net/" | head -c 200; echo

echo ""
echo "Testing routes endpoint:"
curl -s "https://$FUNC_APP.azurewebsites.net/api/routes" | head -c 500; echo

echo ""
echo "========================================="
echo "✅ DEPLOYMENT COMPLETED!"
echo "========================================="
echo ""
echo "🌐 Your backend is now live at:"
echo "https://$FUNC_APP.azurewebsites.net"
echo ""
echo "📋 Test these endpoints:"
echo "- GET  / (health check)"
echo "- GET  /api/routes"
echo ""
