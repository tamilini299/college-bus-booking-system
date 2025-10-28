# Deploy College Bus Booking System to Azure Container Instances
# This script creates containers without needing Terraform

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName = "cbbs-rg",
    
    [Parameter(Mandatory=$true)]
    [string]$Location = "Central India"
)

Write-Host "🚀 Deploying College Bus Booking System to Azure Container Instances..." -ForegroundColor Green

# Create Resource Group
Write-Host "📋 Creating Resource Group..." -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location

# Create Container Registry
$RegistryName = "cbbsacr$(Get-Random -Maximum 9999)"
Write-Host "📦 Creating Container Registry: $RegistryName" -ForegroundColor Yellow
az acr create --resource-group $ResourceGroupName --name $RegistryName --sku Basic --admin-enabled true

# Get registry credentials
$RegistryLoginServer = az acr show --name $RegistryName --resource-group $ResourceGroupName --query loginServer --output tsv
$RegistryUsername = az acr credential show --name $RegistryName --query username --output tsv
$RegistryPassword = az acr credential show --name $RegistryName --query passwords[0].value --output tsv

Write-Host "🔐 Logging into Container Registry..." -ForegroundColor Yellow
az acr login --name $RegistryName

# Build and push frontend image
Write-Host "🏗️ Building and pushing frontend image..." -ForegroundColor Yellow
docker build -t $RegistryLoginServer/cbbs-frontend:latest ./frontend
docker push $RegistryLoginServer/cbbs-frontend:latest

# Build and push backend image
Write-Host "🏗️ Building and pushing backend image..." -ForegroundColor Yellow
docker build -t $RegistryLoginServer/cbbs-backend:latest ./api
docker push $RegistryLoginServer/cbbs-backend:latest

# Create SQL Database
Write-Host "🗄️ Creating SQL Database..." -ForegroundColor Yellow
$SqlServerName = "cbbs-sql-$(Get-Random -Maximum 9999)"
$SqlPassword = -join ((1..16) | ForEach {Get-Random -InputObject @('A'..'Z','a'..'z','0'..'9','!','@','#','$','%','^','&','*')})

az sql server create --name $SqlServerName --resource-group $ResourceGroupName --location $Location --admin-user cbbsadmin --admin-password $SqlPassword

az sql db create --resource-group $ResourceGroupName --server $SqlServerName --name cbbs-database --service-objective Basic

# Deploy Frontend Container
Write-Host "🚀 Deploying Frontend Container..." -ForegroundColor Yellow
az container create `
    --resource-group $ResourceGroupName `
    --name cbbs-frontend `
    --image $RegistryLoginServer/cbbs-frontend:latest `
    --registry-login-server $RegistryLoginServer `
    --registry-username $RegistryUsername `
    --registry-password $RegistryPassword `
    --dns-name-label cbbs-frontend-$(Get-Random -Maximum 9999) `
    --ports 80 `
    --cpu 1 `
    --memory 1

# Deploy Backend Container
Write-Host "🚀 Deploying Backend Container..." -ForegroundColor Yellow
az container create `
    --resource-group $ResourceGroupName `
    --name cbbs-backend `
    --image $RegistryLoginServer/cbbs-backend:latest `
    --registry-login-server $RegistryLoginServer `
    --registry-username $RegistryUsername `
    --registry-password $RegistryPassword `
    --dns-name-label cbbs-backend-$(Get-Random -Maximum 9999) `
    --ports 7071 `
    --cpu 1 `
    --memory 1 `
    --environment-variables `
        FUNCTIONS_WORKER_RUNTIME=node `
        WEBSITE_NODE_DEFAULT_VERSION=18

# Get container URLs
$FrontendUrl = az container show --resource-group $ResourceGroupName --name cbbs-frontend --query ipAddress.fqdn --output tsv
$BackendUrl = az container show --resource-group $ResourceGroupName --name cbbs-backend --query ipAddress.fqdn --output tsv

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "Frontend: http://$FrontendUrl" -ForegroundColor White
Write-Host "Backend: http://$BackendUrl" -ForegroundColor White
Write-Host ""
Write-Host "📊 Container Registry: $RegistryLoginServer" -ForegroundColor Cyan
Write-Host "🗄️ SQL Server: $SqlServerName" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Your College Bus Booking System is now live!" -ForegroundColor Green
