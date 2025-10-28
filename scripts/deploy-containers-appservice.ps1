# Deploy College Bus Booking System to Azure App Service
# This script creates App Service containers for production deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName = "cbbs-rg",
    
    [Parameter(Mandatory=$true)]
    [string]$Location = "Central India"
)

Write-Host "🚀 Deploying College Bus Booking System to Azure App Service..." -ForegroundColor Green

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

# Create App Service Plans
Write-Host "📋 Creating App Service Plans..." -ForegroundColor Yellow
az appservice plan create --name cbbs-frontend-plan --resource-group $ResourceGroupName --location $Location --is-linux --sku B1
az appservice plan create --name cbbs-backend-plan --resource-group $ResourceGroupName --location $Location --is-linux --sku B1

# Create Frontend Web App
Write-Host "🚀 Creating Frontend Web App..." -ForegroundColor Yellow
$FrontendAppName = "cbbs-frontend-$(Get-Random -Maximum 9999)"
az webapp create --resource-group $ResourceGroupName --plan cbbs-frontend-plan --name $FrontendAppName --deployment-container-image-name $RegistryLoginServer/cbbs-frontend:latest

# Configure Frontend Web App
az webapp config container set --name $FrontendAppName --resource-group $ResourceGroupName --docker-custom-image-name $RegistryLoginServer/cbbs-frontend:latest
az webapp config appsettings set --resource-group $ResourceGroupName --name $FrontendAppName --settings WEBSITES_ENABLE_APP_SERVICE_STORAGE=false

# Create Backend Web App
Write-Host "🚀 Creating Backend Web App..." -ForegroundColor Yellow
$BackendAppName = "cbbs-backend-$(Get-Random -Maximum 9999)"
az webapp create --resource-group $ResourceGroupName --plan cbbs-backend-plan --name $BackendAppName --deployment-container-image-name $RegistryLoginServer/cbbs-backend:latest

# Configure Backend Web App
az webapp config container set --name $BackendAppName --resource-group $ResourceGroupName --docker-custom-image-name $RegistryLoginServer/cbbs-backend:latest
az webapp config appsettings set --resource-group $ResourceGroupName --name $BackendAppName --settings `
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false `
    FUNCTIONS_WORKER_RUNTIME=node `
    WEBSITE_NODE_DEFAULT_VERSION=18

# Create SQL Database
Write-Host "🗄️ Creating SQL Database..." -ForegroundColor Yellow
$SqlServerName = "cbbs-sql-$(Get-Random -Maximum 9999)"
$SqlPassword = -join ((1..16) | ForEach {Get-Random -InputObject @('A'..'Z','a'..'z','0'..'9','!','@','#','$','%','^','&','*')})

az sql server create --name $SqlServerName --resource-group $ResourceGroupName --location $Location --admin-user cbbsadmin --admin-password $SqlPassword
az sql db create --resource-group $ResourceGroupName --server $SqlServerName --name cbbs-database --service-objective Basic

# Configure firewall to allow Azure services
az sql server firewall-rule create --resource-group $ResourceGroupName --server $SqlServerName --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

# Get application URLs
$FrontendUrl = "https://$FrontendAppName.azurewebsites.net"
$BackendUrl = "https://$BackendAppName.azurewebsites.net"

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "Frontend: $FrontendUrl" -ForegroundColor White
Write-Host "Backend: $BackendUrl" -ForegroundColor White
Write-Host ""
Write-Host "📊 Container Registry: $RegistryLoginServer" -ForegroundColor Cyan
Write-Host "🗄️ SQL Server: $SqlServerName" -ForegroundColor Cyan
Write-Host "🔑 SQL Password: $SqlPassword" -ForegroundColor Red
Write-Host ""
Write-Host "🎉 Your College Bus Booking System is now live!" -ForegroundColor Green
