# College Bus Booking System - Azure Deployment Script
# This script deploys both frontend and backend to Azure App Service

param(
    [string]$ResourceGroup = "rg-cbbs",
    [string]$Location = "centralindia",
    [string]$BackendAppName = "cbbs-backend-api",
    [string]$FrontendAppName = "cbbs-frontend-web"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  College Bus Booking System" -ForegroundColor Cyan
Write-Host "  Azure Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if logged in to Azure
Write-Host "Checking Azure CLI login status..." -ForegroundColor Yellow
$account = az account show 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Azure. Please login..." -ForegroundColor Red
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to login to Azure. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Azure CLI authenticated" -ForegroundColor Green
Write-Host ""

# Get subscription info
$subscription = az account show --query "{name:name, id:id}" -o json | ConvertFrom-Json
Write-Host "Subscription: $($subscription.name)" -ForegroundColor Cyan
Write-Host "Subscription ID: $($subscription.id)" -ForegroundColor Cyan
Write-Host ""

# Check if resource group exists, create if not
Write-Host "Checking resource group: $ResourceGroup..." -ForegroundColor Yellow
$rgExists = az group exists --name $ResourceGroup
if ($rgExists -eq "false") {
    Write-Host "Creating resource group: $ResourceGroup in $Location..." -ForegroundColor Yellow
    az group create --name $ResourceGroup --location $Location
    Write-Host "✓ Resource group created" -ForegroundColor Green
} else {
    Write-Host "✓ Resource group exists" -ForegroundColor Green
}
Write-Host ""

# Create App Service Plan for Backend (Linux)
Write-Host "Setting up App Service Plan for Backend..." -ForegroundColor Yellow
$backendPlanName = "cbbs-backend-plan"
$backendPlanExists = az appservice plan show --name $backendPlanName --resource-group $ResourceGroup 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating App Service Plan: $backendPlanName..." -ForegroundColor Yellow
    az appservice plan create `
        --name $backendPlanName `
        --resource-group $ResourceGroup `
        --location $Location `
        --is-linux `
        --sku B1
    Write-Host "✓ Backend App Service Plan created" -ForegroundColor Green
} else {
    Write-Host "✓ Backend App Service Plan exists" -ForegroundColor Green
}
Write-Host ""

# Create App Service Plan for Frontend (Linux)
Write-Host "Setting up App Service Plan for Frontend..." -ForegroundColor Yellow
$frontendPlanName = "cbbs-frontend-plan"
$frontendPlanExists = az appservice plan show --name $frontendPlanName --resource-group $ResourceGroup 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating App Service Plan: $frontendPlanName..." -ForegroundColor Yellow
    az appservice plan create `
        --name $frontendPlanName `
        --resource-group $ResourceGroup `
        --location $Location `
        --is-linux `
        --sku B1
    Write-Host "✓ Frontend App Service Plan created" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend App Service Plan exists" -ForegroundColor Green
}
Write-Host ""

# Create Backend Web App
Write-Host "Setting up Backend Web App..." -ForegroundColor Yellow
$backendExists = az webapp show --name $BackendAppName --resource-group $ResourceGroup 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating Backend Web App: $BackendAppName..." -ForegroundColor Yellow
    az webapp create `
        --name $BackendAppName `
        --resource-group $ResourceGroup `
        --plan $backendPlanName `
        --runtime "NODE:18-lts"
    Write-Host "✓ Backend Web App created" -ForegroundColor Green
} else {
    Write-Host "✓ Backend Web App exists" -ForegroundColor Green
}
Write-Host ""

# Create Frontend Web App
Write-Host "Setting up Frontend Web App..." -ForegroundColor Yellow
$frontendExists = az webapp show --name $FrontendAppName --resource-group $ResourceGroup 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating Frontend Web App: $FrontendAppName..." -ForegroundColor Yellow
    az webapp create `
        --name $FrontendAppName `
        --resource-group $ResourceGroup `
        --plan $frontendPlanName `
        --runtime "NODE:18-lts"
    Write-Host "✓ Frontend Web App created" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend Web App exists" -ForegroundColor Green
}
Write-Host ""

# Configure Backend App Settings
Write-Host "Configuring Backend settings..." -ForegroundColor Yellow
az webapp config appsettings set `
    --name $BackendAppName `
    --resource-group $ResourceGroup `
    --settings `
        PORT=8080 `
        NODE_ENV=production `
        WEBSITE_NODE_DEFAULT_VERSION="18-lts" `
        SCM_DO_BUILD_DURING_DEPLOYMENT=true
Write-Host "✓ Backend settings configured" -ForegroundColor Green
Write-Host ""

# Configure Frontend App Settings
Write-Host "Configuring Frontend settings..." -ForegroundColor Yellow
$backendUrl = "https://$BackendAppName.azurewebsites.net"
az webapp config appsettings set `
    --name $FrontendAppName `
    --resource-group $ResourceGroup `
    --settings `
        PORT=8080 `
        NODE_ENV=production `
        VITE_API_URL="$backendUrl/api" `
        WEBSITE_NODE_DEFAULT_VERSION="18-lts" `
        SCM_DO_BUILD_DURING_DEPLOYMENT=true
Write-Host "✓ Frontend settings configured" -ForegroundColor Green
Write-Host ""

# Prepare Backend for deployment
Write-Host "Preparing Backend files for deployment..." -ForegroundColor Yellow
$deployBackendPath = ".\deploy-backend-temp"
if (Test-Path $deployBackendPath) {
    Remove-Item -Recurse -Force $deployBackendPath
}
New-Item -ItemType Directory -Path $deployBackendPath | Out-Null

# Copy backend files
Copy-Item ".\simple-backend\*" -Destination $deployBackendPath -Recurse -Force

# Create web.config for Azure
$webConfigContent = @"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
"@
$webConfigContent | Out-File -FilePath "$deployBackendPath\web.config" -Encoding UTF8
Write-Host "✓ Backend files prepared" -ForegroundColor Green
Write-Host ""

# Deploy Backend
Write-Host "Deploying Backend to Azure..." -ForegroundColor Yellow
Push-Location $deployBackendPath
$backendZip = "..\backend-deploy.zip"
if (Test-Path $backendZip) {
    Remove-Item $backendZip -Force
}
Compress-Archive -Path ".\*" -DestinationPath $backendZip -Force
Pop-Location

az webapp deployment source config-zip `
    --name $BackendAppName `
    --resource-group $ResourceGroup `
    --src $backendZip

Write-Host "✓ Backend deployed successfully!" -ForegroundColor Green
Write-Host ""

# Prepare Frontend for deployment
Write-Host "Preparing Frontend files for deployment..." -ForegroundColor Yellow
Push-Location .\frontend

# Update API URL in production
$apiJsPath = ".\src\utils\api.js"
$apiContent = Get-Content $apiJsPath -Raw
$apiContent = $apiContent -replace "const baseURL = import\.meta\.env\.VITE_API_URL \|\| '/api';", "const baseURL = '$backendUrl/api';"
$apiContent | Out-File -FilePath $apiJsPath -Encoding UTF8 -NoNewline

Write-Host "Building Frontend for production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green

# Create server.js for serving frontend
$serverJsContent = @"
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Frontend server running on port \${PORT}\`);
});
"@
$serverJsContent | Out-File -FilePath ".\server.js" -Encoding UTF8

# Update package.json with start script
$packageJson = Get-Content ".\package.json" -Raw | ConvertFrom-Json
$packageJson.scripts.start = "node server.js"
$packageJson.dependencies | Add-Member -MemberType NoteProperty -Name "express" -Value "^4.18.2" -Force
$packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath ".\package.json" -Encoding UTF8

Pop-Location

$deployFrontendPath = ".\deploy-frontend-temp"
if (Test-Path $deployFrontendPath) {
    Remove-Item -Recurse -Force $deployFrontendPath
}
New-Item -ItemType Directory -Path $deployFrontendPath | Out-Null

# Copy necessary files
Copy-Item ".\frontend\dist" -Destination "$deployFrontendPath\dist" -Recurse -Force
Copy-Item ".\frontend\package.json" -Destination $deployFrontendPath -Force
Copy-Item ".\frontend\server.js" -Destination $deployFrontendPath -Force

# Create web.config for frontend
$webConfigContent | Out-File -FilePath "$deployFrontendPath\web.config" -Encoding UTF8
Write-Host "✓ Frontend files prepared" -ForegroundColor Green
Write-Host ""

# Deploy Frontend
Write-Host "Deploying Frontend to Azure..." -ForegroundColor Yellow
Push-Location $deployFrontendPath
$frontendZip = "..\frontend-deploy.zip"
if (Test-Path $frontendZip) {
    Remove-Item $frontendZip -Force
}
Compress-Archive -Path ".\*" -DestinationPath $frontendZip -Force
Pop-Location

az webapp deployment source config-zip `
    --name $FrontendAppName `
    --resource-group $ResourceGroup `
    --src $frontendZip

Write-Host "✓ Frontend deployed successfully!" -ForegroundColor Green
Write-Host ""

# Restart web apps
Write-Host "Restarting web apps..." -ForegroundColor Yellow
az webapp restart --name $BackendAppName --resource-group $ResourceGroup
az webapp restart --name $FrontendAppName --resource-group $ResourceGroup
Write-Host "✓ Web apps restarted" -ForegroundColor Green
Write-Host ""

# Clean up temp files
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
if (Test-Path $deployBackendPath) {
    Remove-Item -Recurse -Force $deployBackendPath
}
if (Test-Path $deployFrontendPath) {
    Remove-Item -Recurse -Force $deployFrontendPath
}
if (Test-Path $backendZip) {
    Remove-Item -Force $backendZip
}
if (Test-Path $frontendZip) {
    Remove-Item -Force $frontendZip
}
Write-Host "✓ Cleanup complete" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is now live at:" -ForegroundColor Cyan
Write-Host "   Frontend: https://$FrontendAppName.azurewebsites.net" -ForegroundColor White
Write-Host "   Backend:  https://$BackendAppName.azurewebsites.net" -ForegroundColor White
Write-Host ""
Write-Host "📝 Login Credentials:" -ForegroundColor Cyan
Write-Host "   Student: username=student, password=student" -ForegroundColor White
Write-Host "   Admin:   username=admin, password=admin" -ForegroundColor White
Write-Host "   Driver:  username=driver, password=driver" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Note: It may take 2-3 minutes for the apps to fully start." -ForegroundColor Yellow
Write-Host ""

# Open browser
$openBrowser = Read-Host "Open application in browser? (Y/N)"
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "https://$FrontendAppName.azurewebsites.net"
}
