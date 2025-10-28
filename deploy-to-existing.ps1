# Deploy to YOUR Existing Azure Resources
# This uses the resources already in your rg-cbbs resource group

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Deploying to YOUR Azure Resources" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$ResourceGroup = "rg-cbbs"
$BackendApp = "cbbs-node-web"  # Your existing app service
$FrontendApp = "cbbs-frontend-$(Get-Random -Minimum 1000 -Maximum 9999)"  # New app for frontend

Write-Host "Using resource group: $ResourceGroup" -ForegroundColor White
Write-Host "Backend app: $BackendApp (existing)" -ForegroundColor White
Write-Host "Frontend app: $FrontendApp (new)" -ForegroundColor White
Write-Host ""

# Step 1: Deploy Backend
Write-Host "[1/4] Deploying Backend..." -ForegroundColor Yellow
Push-Location .\simple-backend
if (Test-Path "..\backend.zip") { Remove-Item "..\backend.zip" }
Compress-Archive -Path ".\*" -DestinationPath "..\backend.zip" -Force
Pop-Location

Write-Host "  Uploading to $BackendApp..." -ForegroundColor Cyan
az webapp deploy `
    --name $BackendApp `
    --resource-group $ResourceGroup `
    --src-path ".\backend.zip" `
    --type zip

az webapp config appsettings set `
    --name $BackendApp `
    --resource-group $ResourceGroup `
    --settings PORT=8080 NODE_ENV=production `
    --output none

az webapp restart --name $BackendApp --resource-group $ResourceGroup --output none
Remove-Item ".\backend.zip"
Write-Host "  ✓ Backend deployed!" -ForegroundColor Green
Write-Host ""

# Step 2: Build Frontend
Write-Host "[2/4] Building Frontend..." -ForegroundColor Yellow
$backendUrl = "https://$BackendApp.azurewebsites.net"
Write-Host "  Backend URL: $backendUrl" -ForegroundColor Cyan

Push-Location .\frontend

# Update API
if (Test-Path ".\src\utils\api.production.js") {
    Copy-Item ".\src\utils\api.production.js" ".\src\utils\api.js" -Force
    (Get-Content ".\src\utils\api.js") -replace 'BACKEND_URL_PLACEHOLDER', "$backendUrl/api" | Set-Content ".\src\utils\api.js"
}

npm run build

# Create server
$serverContent = @'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log('Frontend on', PORT));
'@
$serverContent | Out-File -FilePath "server.js" -Encoding UTF8

# Update package.json
$pkg = Get-Content "package.json" | ConvertFrom-Json
if (-not $pkg.PSObject.Properties['dependencies']) {
    $pkg | Add-Member -NotePropertyName 'dependencies' -NotePropertyValue @{} -Force
}
$pkg.dependencies.PSObject.Properties.Remove('express')
$pkg.dependencies | Add-Member -NotePropertyName 'express' -NotePropertyValue '^4.18.2' -Force
$pkg.scripts.PSObject.Properties.Remove('start')
$pkg.scripts | Add-Member -NotePropertyName 'start' -NotePropertyValue 'node server.js' -Force
$pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"

Pop-Location
Write-Host "  ✓ Frontend built!" -ForegroundColor Green
Write-Host ""

# Step 3: Create Frontend App
Write-Host "[3/4] Creating Frontend App Service..." -ForegroundColor Yellow
az webapp create `
    --name $FrontendApp `
    --resource-group $ResourceGroup `
    --plan cbbs-app-plan `
    --runtime "NODE:20-lts"

if ($LASTEXITCODE -ne 0) {
    Write-Host "  Failed! Try a different name." -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Frontend app created!" -ForegroundColor Green
Write-Host ""

# Step 4: Deploy Frontend
Write-Host "[4/4] Deploying Frontend..." -ForegroundColor Yellow
Push-Location .\frontend
if (Test-Path "..\frontend.zip") { Remove-Item "..\frontend.zip" }
Compress-Archive -Path ".\dist", ".\package.json", ".\server.js" -DestinationPath "..\frontend.zip" -Force
Pop-Location

az webapp deploy `
    --name $FrontendApp `
    --resource-group $ResourceGroup `
    --src-path ".\frontend.zip" `
    --type zip

az webapp config appsettings set `
    --name $FrontendApp `
    --resource-group $ResourceGroup `
    --settings PORT=8080 NODE_ENV=production `
    --output none

az webapp restart --name $FrontendApp --resource-group $ResourceGroup --output none
Remove-Item ".\frontend.zip"
Write-Host "  ✓ Frontend deployed!" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "  ✓ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 YOUR APPLICATION:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Frontend: https://$FrontendApp.azurewebsites.net" -ForegroundColor White
Write-Host "   Backend:  https://$BackendApp.azurewebsites.net" -ForegroundColor White
Write-Host ""
Write-Host "📝 Login: student/student, admin/admin, driver/driver" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Wait 2-3 minutes for apps to start" -ForegroundColor Yellow
Write-Host ""

# Save info
@"
DEPLOYED: $(Get-Date)

Frontend: https://$FrontendApp.azurewebsites.net
Backend: https://$BackendApp.azurewebsites.net

Resource Group: $ResourceGroup

Test backend: https://$BackendApp.azurewebsites.net/api/routes
"@ | Out-File -FilePath "DEPLOYED.txt"

Write-Host "Info saved to DEPLOYED.txt" -ForegroundColor Gray
Write-Host ""

Start-Sleep -Seconds 2
$open = Read-Host "Open app in browser? (Y/N)"
if ($open -match "^[Yy]") {
    Start-Process "https://$FrontendApp.azurewebsites.net"
}
