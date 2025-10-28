# Quick Azure Deployment Script
# Simplified version for faster deployment

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  College Bus Booking - Quick Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ResourceGroup = "rg-cbbs"
$Location = "centralindia"
$BackendApp = "cbbs-node-backend"
$FrontendApp = "cbbs-react-frontend"

# Login check
Write-Host "[1/6] Checking Azure login..." -ForegroundColor Yellow
az account show >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Azure..." -ForegroundColor Red
    az login
}
Write-Host "✓ Logged in" -ForegroundColor Green
Write-Host ""

# Ensure resource group exists
Write-Host "[2/6] Checking resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none
Write-Host "✓ Resource group ready: $ResourceGroup" -ForegroundColor Green
Write-Host ""

# Deploy Backend
Write-Host "[3/6] Deploying Backend..." -ForegroundColor Yellow
Write-Host "Creating/updating App Service: $BackendApp..." -ForegroundColor Cyan

# Create app service plan if needed
az appservice plan create `
    --name "cbbs-plan" `
    --resource-group $ResourceGroup `
    --location $Location `
    --is-linux `
    --sku B1 `
    --output none 2>$null

# Create web app
az webapp create `
    --name $BackendApp `
    --resource-group $ResourceGroup `
    --plan "cbbs-plan" `
    --runtime "NODE:18-lts" `
    --output none 2>$null

# Configure backend
az webapp config appsettings set `
    --name $BackendApp `
    --resource-group $ResourceGroup `
    --settings PORT=8080 NODE_ENV=production `
    --output none

Write-Host "Deploying backend code..." -ForegroundColor Cyan
Push-Location .\simple-backend
Compress-Archive -Path ".\*" -DestinationPath "..\backend.zip" -Force
Pop-Location

az webapp deployment source config-zip `
    --name $BackendApp `
    --resource-group $ResourceGroup `
    --src ".\backend.zip" `
    --output none

Remove-Item ".\backend.zip" -Force
Write-Host "✓ Backend deployed!" -ForegroundColor Green
Write-Host ""

# Build Frontend
Write-Host "[4/6] Building Frontend..." -ForegroundColor Yellow
Push-Location .\frontend

# Update API endpoint for production
$backendUrl = "https://$BackendApp.azurewebsites.net"
Write-Host "Setting API URL to: $backendUrl/api" -ForegroundColor Cyan

# Use production api.js template
Copy-Item ".\src\utils\api.production.js" ".\src\utils\api.js" -Force
(Get-Content ".\src\utils\api.js") -replace 'BACKEND_URL_PLACEHOLDER', "$backendUrl/api" | Set-Content ".\src\utils\api.js"

# Build
Write-Host "Building React app..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Create server.js to serve the built files
$serverJsContent = @'
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
$serverJsContent | Out-File -FilePath "server.js" -Encoding UTF8

# Update package.json
$pkg = Get-Content "package.json" | ConvertFrom-Json
$pkg.scripts | Add-Member -MemberType NoteProperty -Name "start" -Value "node server.js" -Force
if (-not $pkg.dependencies) {
    $pkg | Add-Member -MemberType NoteProperty -Name "dependencies" -Value @{} -Force
}
$pkg.dependencies | Add-Member -MemberType NoteProperty -Name "express" -Value "^4.18.2" -Force
$pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"

Pop-Location
Write-Host "✓ Frontend built!" -ForegroundColor Green
Write-Host ""

# Deploy Frontend
Write-Host "[5/6] Deploying Frontend..." -ForegroundColor Yellow

# Create web app
az webapp create `
    --name $FrontendApp `
    --resource-group $ResourceGroup `
    --plan "cbbs-plan" `
    --runtime "NODE:18-lts" `
    --output none 2>$null

# Configure
az webapp config appsettings set `
    --name $FrontendApp `
    --resource-group $ResourceGroup `
    --settings PORT=8080 NODE_ENV=production `
    --output none

Write-Host "Deploying frontend code..." -ForegroundColor Cyan

# Zip and deploy
Push-Location .\frontend
Compress-Archive -Path ".\dist\*", ".\package.json", ".\server.js" -DestinationPath "..\frontend.zip" -Force
Pop-Location

az webapp deployment source config-zip `
    --name $FrontendApp `
    --resource-group $ResourceGroup `
    --src ".\frontend.zip" `
    --output none

Remove-Item ".\frontend.zip" -Force
Write-Host "✓ Frontend deployed!" -ForegroundColor Green
Write-Host ""

# Restart apps
Write-Host "[6/6] Starting services..." -ForegroundColor Yellow
az webapp restart --name $BackendApp --resource-group $ResourceGroup --output none
az webapp restart --name $FrontendApp --resource-group $ResourceGroup --output none
Write-Host "✓ Services started!" -ForegroundColor Green
Write-Host ""

# Success!
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your Application URLs:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Frontend: https://$FrontendApp.azurewebsites.net" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "   Backend:  https://$BackendApp.azurewebsites.net" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host ""
Write-Host "📝 Login Credentials:" -ForegroundColor Cyan
Write-Host "   Student: student / student" -ForegroundColor White
Write-Host "   Admin:   admin / admin" -ForegroundColor White
Write-Host "   Driver:  driver / driver" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Note: Apps may take 2-3 minutes to start completely." -ForegroundColor Yellow
Write-Host ""

# Open browser
Start-Sleep -Seconds 2
$open = Read-Host "Open in browser now? (Y/N)"
if ($open -eq "Y" -or $open -eq "y") {
    Start-Process "https://$FrontendApp.azurewebsites.net"
}

Write-Host ""
Write-Host "To view logs: az webapp log tail --name $FrontendApp --resource-group $ResourceGroup" -ForegroundColor Gray
Write-Host ""
