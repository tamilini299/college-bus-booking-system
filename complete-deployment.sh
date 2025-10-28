#!/bin/bash
# Complete Azure Deployment Script
# Run this in Azure Cloud Shell: https://shell.azure.com

echo "🚀 Completing Azure Deployment..."

# Configuration
RESOURCE_GROUP="cbbs-rg"
ACR_NAME="cbbsacr1234"
BACKEND_APP="cbbs-backend-1234"
FRONTEND_APP="cbbs-frontend-1234"

# Login to ACR
echo "📦 Logging into Azure Container Registry..."
az acr login --name $ACR_NAME

# Build and push backend
echo "🔨 Building backend Docker image..."
docker build -t $ACR_NAME.azurecr.io/cbbs-backend:latest -f api/Dockerfile api/

echo "📤 Pushing backend image..."
docker push $ACR_NAME.azurecr.io/cbbs-backend:latest

# Build and push frontend
echo "🔨 Building frontend Docker image..."
docker build -t $ACR_NAME.azurecr.io/cbbs-frontend:latest -f frontend/Dockerfile frontend/

echo "📤 Pushing frontend image..."
docker push $ACR_NAME.azurecr.io/cbbs-frontend:latest

# Restart apps
echo "🔄 Restarting backend app..."
az webapp restart --name $BACKEND_APP --resource-group $RESOURCE_GROUP

echo "🔄 Restarting frontend app..."
az webapp restart --name $FRONTEND_APP --resource-group $RESOURCE_GROUP

echo ""
echo "========================================="
echo "✅ Deployment completed successfully!"
echo "========================================="
echo ""
echo "🌐 Application URLs:"
echo "Frontend: https://$FRONTEND_APP.azurewebsites.net"
echo "Backend: https://$BACKEND_APP.azurewebsites.net"
echo ""
echo "⏰ Wait 2-3 minutes for containers to start, then test your application!"
echo ""
echo "🧪 Test backend API:"
echo "curl https://$BACKEND_APP.azurewebsites.net/api/routes"
echo ""

