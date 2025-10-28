#!/bin/bash

# Build and Push Docker Images to Azure Container Registry
# Usage: ./scripts/build-and-push.sh <registry-url> <username> <password>

set -e

REGISTRY_URL=$1
USERNAME=$2
PASSWORD=$3

if [ -z "$REGISTRY_URL" ] || [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
    echo "Usage: $0 <registry-url> <username> <password>"
    echo "Example: $0 cbbsacr1234.azurecr.io admin password123"
    exit 1
fi

echo "🔐 Logging into Azure Container Registry..."
echo $PASSWORD | docker login $REGISTRY_URL -u $USERNAME --password-stdin

echo "🏗️ Building frontend image..."
docker build -t $REGISTRY_URL/cbbs-frontend:latest ./frontend

echo "🏗️ Building backend image..."
docker build -t $REGISTRY_URL/cbbs-backend:latest ./api

echo "📤 Pushing frontend image..."
docker push $REGISTRY_URL/cbbs-frontend:latest

echo "📤 Pushing backend image..."
docker push $REGISTRY_URL/cbbs-backend:latest

echo "✅ All images built and pushed successfully!"
echo "Frontend: $REGISTRY_URL/cbbs-frontend:latest"
echo "Backend: $REGISTRY_URL/cbbs-backend:latest"
