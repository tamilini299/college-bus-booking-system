#!/bin/bash

# Deploy College Bus Booking System to Azure
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Starting deployment of College Bus Booking System..."

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install Terraform first."
    exit 1
fi

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install Azure CLI first."
    exit 1
fi

# Check if user is logged in to Azure
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

echo "📋 Initializing Terraform..."
cd terraform
terraform init

echo "📊 Planning Terraform deployment..."
terraform plan -out=tfplan

echo "🏗️ Applying Terraform configuration..."
terraform apply tfplan

echo "📤 Getting deployment outputs..."
FRONTEND_URL=$(terraform output -raw frontend_url)
BACKEND_URL=$(terraform output -raw backend_url)
REGISTRY_URL=$(terraform output -raw container_registry_url)
REGISTRY_USERNAME=$(terraform output -raw container_registry_username)
REGISTRY_PASSWORD=$(terraform output -raw container_registry_password)

echo "🏗️ Building and pushing Docker images..."
cd ..
chmod +x scripts/build-and-push.sh
./scripts/build-and-push.sh $REGISTRY_URL $REGISTRY_USERNAME $REGISTRY_PASSWORD

echo "🔄 Restarting App Services to pull new images..."
az webapp restart --name $(terraform -chdir=terraform output -raw frontend_app_name) --resource-group $(terraform -chdir=terraform output -raw resource_group_name)
az webapp restart --name $(terraform -chdir=terraform output -raw backend_app_name) --resource-group $(terraform -chdir=terraform output -raw resource_group_name)

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""
echo "📊 Container Registry: $REGISTRY_URL"
echo ""
echo "🎉 Your College Bus Booking System is now live!"
