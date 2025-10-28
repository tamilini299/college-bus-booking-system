# Simple deployment script for College Bus Booking System
# This script uses the easiest method to deploy containers to Azure

Write-Host "🚀 Simple Azure Container Deployment for College Bus Booking System" -ForegroundColor Green
Write-Host ""

# Set variables
$ResourceGroupName = "cbbs-rg"
$Location = "Central India"
$RegistryName = "cbbsacr$(Get-Random -Maximum 9999)"

Write-Host "📋 Step 1: Creating Resource Group..." -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location

Write-Host "📦 Step 2: Creating Container Registry..." -ForegroundColor Yellow
az acr create --resource-group $ResourceGroupName --name $RegistryName --sku Basic --admin-enabled true

Write-Host "🔐 Step 3: Getting Registry Credentials..." -ForegroundColor Yellow
$RegistryLoginServer = az acr show --name $RegistryName --resource-group $ResourceGroupName --query loginServer --output tsv
$RegistryUsername = az acr credential show --name $RegistryName --query username --output tsv
$RegistryPassword = az acr credential show --name $RegistryName --query passwords[0].value --output tsv

Write-Host "🔑 Registry URL: $RegistryLoginServer" -ForegroundColor Cyan
Write-Host "👤 Username: $RegistryUsername" -ForegroundColor Cyan

Write-Host "🔐 Step 4: Logging into Container Registry..." -ForegroundColor Yellow
az acr login --name $RegistryName

Write-Host "🏗️ Step 5: Building Frontend Image..." -ForegroundColor Yellow
docker build -t $RegistryLoginServer/cbbs-frontend:latest ./frontend

Write-Host "🏗️ Step 6: Building Backend Image..." -ForegroundColor Yellow
docker build -t $RegistryLoginServer/cbbs-backend:latest ./api

Write-Host "📤 Step 7: Pushing Images to Registry..." -ForegroundColor Yellow
docker push $RegistryLoginServer/cbbs-frontend:latest
docker push $RegistryLoginServer/cbbs-backend:latest

Write-Host "✅ Images built and pushed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to Azure Portal: https://portal.azure.com" -ForegroundColor White
Write-Host "2. Navigate to your Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "3. Create App Services or Container Instances using your images:" -ForegroundColor White
Write-Host "   - Frontend: $RegistryLoginServer/cbbs-frontend:latest" -ForegroundColor White
Write-Host "   - Backend: $RegistryLoginServer/cbbs-backend:latest" -ForegroundColor White
Write-Host ""
Write-Host "📊 Registry Details:" -ForegroundColor Cyan
Write-Host "Registry: $RegistryLoginServer" -ForegroundColor White
Write-Host "Username: $RegistryUsername" -ForegroundColor White
Write-Host "Password: $RegistryPassword" -ForegroundColor Red
Write-Host ""
Write-Host "🎉 Your container images are ready for deployment!" -ForegroundColor Green
