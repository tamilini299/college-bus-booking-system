# FINAL WORKING DEPLOYMENT

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Final Azure Deployment - Simplified" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$RG = "rg-cbbs"
$Backend = "cbbs-node-web"
$Frontend = "cbbs-frontend-3651"
$BackendURL = "https://cbbs-node-web-ecfvdwhjchdchbfp.centralindia-01.azurewebsites.net"

# Deploy Backend
Write-Host "[1/2] Deploying Backend..." -ForegroundColor Yellow

# Make sure backend has startup command
az webapp config set --name $Backend --resource-group $RG --startup-file "node server.js" --output none

# Deploy backend
Push-Location .\simple-backend
if (Test-Path "..\backend-final.zip") { Remove-Item "..\backend-final.zip" }
Compress-Archive -Path ".\*" -DestinationPath "..\backend-final.zip" -Force
Pop-Location

az webapp deployment source config-zip `
    --name $Backend `
    --resource-group $RG `
    --src ".\backend-final.zip"

Remove-Item ".\backend-final.zip"
az webapp restart --name $Backend --resource-group $RG --output none
Write-Host "✓ Backend deployed and restarted" -ForegroundColor Green
Write-Host ""

# Deploy Frontend
Write-Host "[2/2] Deploying Frontend..." -ForegroundColor Yellow

# Update API URL
Push-Location .\frontend
Copy-Item ".\src\utils\api.production.js" ".\src\utils\api.js" -Force
(Get-Content ".\src\utils\api.js") -replace 'BACKEND_URL_PLACEHOLDER', "$BackendURL/api" | Set-Content ".\src\utils\api.js"

# Build
npm run build

# Create startup file
$serverContent = @'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log('Running on ' + PORT));
'@
$serverContent | Out-File -FilePath "server.js" -Encoding UTF8

# Ensure express is in dependencies
$pkg = Get-Content "package.json" | ConvertFrom-Json
if (-not $pkg.dependencies) {
    $pkg | Add-Member -NotePropertyName "dependencies" -NotePropertyValue @{} -Force
}
if (-not $pkg.dependencies.express) {
    $pkg.dependencies | Add-Member -NotePropertyName "express" -NotePropertyValue "^4.18.2" -Force
}
$pkg.scripts.start = "node server.js"
$pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"

Pop-Location

# Set startup command for frontend
az webapp config set --name $Frontend --resource-group $RG --startup-file "node server.js" --output none

# Create deployment package with correct structure
$tempDir = ".\frontend-package"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null
New-Item -ItemType Directory -Path "$tempDir\dist" | Out-Null

Copy-Item ".\frontend\dist\*" -Destination "$tempDir\dist" -Recurse -Force
Copy-Item ".\frontend\package.json" -Destination $tempDir -Force
Copy-Item ".\frontend\server.js" -Destination $tempDir -Force

Push-Location $tempDir
Compress-Archive -Path ".\*" -DestinationPath "..\frontend-package.zip" -Force
Pop-Location

az webapp deployment source config-zip `
    --name $Frontend `
    --resource-group $RG `
    --src ".\frontend-package.zip"

Remove-Item ".\frontend-package.zip"
Remove-Item -Recurse -Force $tempDir
az webapp restart --name $Frontend --resource-group $RG --output none
Write-Host "✓ Frontend deployed and restarted" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "  ✓ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: https://$Frontend.azurewebsites.net" -ForegroundColor White
Write-Host "   Backend:  $BackendURL" -ForegroundColor White
Write-Host ""
Write-Host "⏱️  Wait 3-5 minutes for apps to start completely" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Test backend: $BackendURL/api/routes" -ForegroundColor Gray
Write-Host ""
