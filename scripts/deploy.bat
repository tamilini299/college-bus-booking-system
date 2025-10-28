@echo off
REM Deploy College Bus Booking System to Azure
REM Usage: scripts\deploy.bat

echo 🚀 Starting deployment of College Bus Booking System...

REM Check if Terraform is installed
terraform version >nul 2>&1
if errorlevel 1 (
    echo ❌ Terraform is not installed. Please install Terraform first.
    exit /b 1
)

REM Check if Azure CLI is installed
az version >nul 2>&1
if errorlevel 1 (
    echo ❌ Azure CLI is not installed. Please install Azure CLI first.
    exit /b 1
)

REM Check if user is logged in to Azure
az account show >nul 2>&1
if errorlevel 1 (
    echo ❌ Not logged in to Azure. Please run 'az login' first.
    exit /b 1
)

echo 📋 Initializing Terraform...
cd terraform
terraform init

echo 📊 Planning Terraform deployment...
terraform plan -out=tfplan

echo 🏗️ Applying Terraform configuration...
terraform apply tfplan

echo ✅ Deployment completed successfully!
echo.
echo 🎉 Your College Bus Booking System is now live!
echo.
echo 📝 Next steps:
echo 1. Build and push Docker images
echo 2. Update App Service configurations
echo 3. Test the deployed application

cd ..
