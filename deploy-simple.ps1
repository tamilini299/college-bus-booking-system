# Simple Azure Deployment - College Bus Booking System
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host " Azure Deployment Starting..." -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$ResourceGroup = "rg-cbbs"
$Location = "centralindia"
$BackendApp = "cbbs-node-backend-$(Get-Random -Minimum 1000 -Maximum 9999)"
$FrontendApp = "cbbs-react-frontend-$(Get-Random -Minimum 1000 -Maximum 9999)"

Write-Host "Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "Backend App: $BackendApp" -ForegroundColor White
Write-Host "Frontend App: $FrontendApp" -ForegroundColor White
Write-Host ""

# Check login
Write-Host "[Step 1/7] Verifying Azure login..." -ForegroundColor Yellow
az account show | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Starting login..." -ForegroundColor Red
    az login
}
Write-Host "✓ Logged in successfully" -ForegroundColor Green
Write-Host ""

# Create resource group
Write-Host "[Step 2/7] Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location
Write-Host "✓ Resource group ready" -ForegroundColor Green
Write-Host ""

# Create App Service Plan
Write-Host "[Step 3/7] Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --name "cbbs-plan" `
    --resource-group $ResourceGroup `
    --location $Location `
    --is-linux `
    --sku B1

if ($LASTEXITCODE -ne 0) {
    Write-Host "App Service Plan might already exist, continuing..." -ForegroundColor Yellow
}
Write-Host "✓ App Service Plan ready" -ForegroundColor Green
Write-Host ""

# Create Backend Web App
Write-Host "[Step 4/7] Creating Backend Web App..." -ForegroundColor Yellow
az webapp create `
    --name $BackendApp `
    --resource-group $ResourceGroup `
    --plan "cbbs-plan" `
    --runtime "NODE:20-lts"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create backend app!" -ForegroundColor Red
    exit 1
}

# Configure backend
az webapp config appsettings set `
    --name $BackendApp `
    --resource-group $ResourceGroup `
    --settings PORT=8080 NODE_ENV=production

# Deploy backend
Write-Host "Deploying backend code..." -ForegroundColor Cyan
Push-Location .\simple-backend
if (Test-Path "..\backend.zip") { Remove-Item "..\backend.zip" -Force }
Compress-Archive -Path ".\*" -DestinationPath "..\backend.zip" -Force
Pop-Location

az webapp deploy `
    --name $BackendApp `
    --resource-group $ResourceGroup `
    --src-path ".\backend.zip" `
    --type zip

Remove-Item ".\backend.zip" -Force
Write-Host "✓ Backend deployed" -ForegroundColor Green
Write-Host ""

# Build Frontend
Write-Host "[Step 5/7] Building Frontend..." -ForegroundColor Yellow
Push-Location .\frontend

$backendUrl = "https://$BackendApp.azurewebsites.net"
Write-Host "Backend URL: $backendUrl" -ForegroundColor Cyan

# Update API URL
if (Test-Path ".\src\utils\api.production.js") {
    Copy-Item ".\src\utils\api.production.js" ".\src\utils\api.js" -Force
    (Get-Content ".\src\utils\api.js") -replace 'BACKEND_URL_PLACEHOLDER', "$backendUrl/api" | Set-Content ".\src\utils\api.js"
}

# Build
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Create server.js
$serverJs = @'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Frontend running on port ' + PORT);
});
'@
$serverJs | Out-File -FilePath "server.js" -Encoding UTF8

# Update package.json
$pkg = Get-Content "package.json" | ConvertFrom-Json
if (-not $pkg.dependencies) {
    $pkg | Add-Member -MemberType NoteProperty -Name "dependencies" -Value @{} -Force
}
$pkg.dependencies | Add-Member -MemberType NoteProperty -Name "express" -Value "^4.18.2" -Force
$pkg.scripts | Add-Member -MemberType NoteProperty -Name "start" -Value "node server.js" -Force
$pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"

Pop-Location
Write-Host "✓ Frontend built" -ForegroundColor Green
Write-Host ""

# Create Frontend Web App
Write-Host "[Step 6/7] Creating Frontend Web App..." -ForegroundColor Yellow
az webapp create `
    --name $FrontendApp `
    --resource-group $ResourceGroup `
    --plan "cbbs-plan" `
    --runtime "NODE:20-lts"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create frontend app!" -ForegroundColor Red
    exit 1
}

# Configure frontend
az webapp config appsettings set `
    --name $FrontendApp `
    --resource-group $ResourceGroup `
    --settings PORT=8080 NODE_ENV=production

# Deploy frontend
Write-Host "Deploying frontend code..." -ForegroundColor Cyan
Push-Location .\frontend
if (Test-Path "..\frontend.zip") { Remove-Item "..\frontend.zip" -Force }
Compress-Archive -Path ".\dist", ".\package.json", ".\server.js" -DestinationPath "..\frontend.zip" -Force
Pop-Location

az webapp deploy `
    --name $FrontendApp `
    --resource-group $ResourceGroup `
    --src-path ".\frontend.zip" `
    --type zip

Remove-Item ".\frontend.zip" -Force
Write-Host "✓ Frontend deployed" -ForegroundColor Green
Write-Host ""

# Restart apps
Write-Host "[Step 7/7] Restarting applications..." -ForegroundColor Yellow
az webapp restart --name $BackendApp --resource-group $ResourceGroup
az webapp restart --name $FrontendApp --resource-group $ResourceGroup
Write-Host "✓ Applications restarted" -ForegroundColor Green
Write-Host ""

Write-Host "====================================" -ForegroundColor Green
Write-Host " ✓ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green  
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Frontend: https://$FrontendApp.azurewebsites.net" -ForegroundColor White
Write-Host "   Backend:  https://$BackendApp.azurewebsites.net" -ForegroundColor White
Write-Host ""
Write-Host "📝 Logins: student/student, admin/admin, driver/driver" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Apps may take 2-3 minutes to fully start" -ForegroundColor Yellow
Write-Host ""

# Save URLs to file
@"
DEPLOYMENT SUCCESSFUL
=====================

Frontend: https://$FrontendApp.azurewebsites.net
Backend: https://$BackendApp.azurewebsites.net

Login Credentials:
- Student: student / student
- Admin: admin / admin
- Driver: driver / driver

Resource Group: $ResourceGroup
Location: $Location

Deployed: $(Get-Date)
"@ | Out-File -FilePath "DEPLOYMENT_URLS.txt" -Encoding UTF8

Write-Host "URLs saved to DEPLOYMENT_URLS.txt" -ForegroundColor Gray
Write-Host ""

$open = Read-Host "Open application in browser? (Y/N)"
if ($open -eq "Y" -or $open -eq "y") {
    Start-Sleep -Seconds 3
    Start-Process "https://$FrontendApp.azurewebsites.net"
}
