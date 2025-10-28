# 🚀 Complete Azure Deployment Guide

## Your Azure Resources

I can see you already have these resources in `rg-cbbs`:
- ✅ SQL Database: `cbbs-sql-tamilini/CollegeBus`
- ✅ App Service Plan: `cbbs-app-plan`
- ✅ App Service: `cbbs-node-web`
- ✅ Application Insights

## Option 1: Use Existing App Service (Fastest)

Since you already have `cbbs-node-web`, let's deploy there:

### Deploy Backend:
```powershell
# 1. Zip the backend
cd simple-backend
Compress-Archive -Path ".\*" -DestinationPath "..\backend.zip" -Force
cd ..

# 2. Deploy to existing app service
az webapp deploy `
    --name cbbs-node-web `
    --resource-group rg-cbbs `
    --src-path ".\backend.zip" `
    --type zip

# 3. Configure settings
az webapp config appsettings set `
    --name cbbs-node-web `
    --resource-group rg-cbbs `
    --settings PORT=8080 NODE_ENV=production

# 4. Restart
az webapp restart --name cbbs-node-web --resource-group rg-cbbs
```

### Deploy Frontend:
```powershell
# 1. Create frontend app (choose a unique name)
az webapp create `
    --name cbbs-frontend-web `
    --resource-group rg-cbbs `
    --plan cbbs-app-plan `
    --runtime "NODE:18-lts"

# 2. Build frontend
cd frontend

# Update API URL to point to your backend
$backendUrl = "https://cbbs-node-web.azurewebsites.net"
Copy-Item ".\src\utils\api.production.js" ".\src\utils\api.js" -Force
(Get-Content ".\src\utils\api.js") -replace 'BACKEND_URL_PLACEHOLDER', "$backendUrl/api" | Set-Content ".\src\utils\api.js"

# Build
npm run build

# Create server.js
@'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.listen(PORT, '0.0.0.0', () => {
  console.log('Frontend server running on port', PORT);
});
'@ | Out-File -FilePath "server.js" -Encoding UTF8

# Update package.json
$pkg = Get-Content "package.json" | ConvertFrom-Json
$pkg.dependencies | Add-Member -Name "express" -Value "^4.18.2" -Force
$pkg.scripts | Add-Member -Name "start" -Value "node server.js" -Force
$pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"

# 3. Zip and deploy
Compress-Archive -Path ".\dist", ".\package.json", ".\server.js" -DestinationPath "..\frontend.zip" -Force
cd ..

az webapp deploy `
    --name cbbs-frontend-web `
    --resource-group rg-cbbs `
    --src-path ".\frontend.zip" `
    --type zip

# 4. Restart
az webapp restart --name cbbs-frontend-web --resource-group rg-cbbs
```

### Access Your App:
- **Backend**: https://cbbs-node-web.azurewebsites.net
- **Frontend**: https://cbbs-frontend-web.azurewebsites.net

## Option 2: Automated Script

Run the deployment script I created:

```powershell
.\deploy-simple.ps1
```

This will:
1. Create new app services with unique names
2. Deploy backend and frontend
3. Configure everything automatically
4. Give you the URLs at the end

## Option 3: Manual Step-by-Step

### Step 1: Login
```powershell
az login
```

### Step 2: Check your subscription
```powershell
az account show
az account list --output table
# If needed, set the correct subscription:
# az account set --subscription "Azure for Students"
```

### Step 3: Deploy Backend Only

```powershell
# Zip backend
cd simple-backend
Compress-Archive -Path ".\*" -DestinationPath "..\backend.zip" -Force
cd ..

# Deploy to existing cbbs-node-web
az webapp deploy --name cbbs-node-web --resource-group rg-cbbs --src-path ".\backend.zip" --type zip

# Configure
az webapp config appsettings set --name cbbs-node-web --resource-group rg-cbbs --settings PORT=8080

# Restart
az webapp restart --name cbbs-node-web --resource-group rg-cbbs

# Test
curl https://cbbs-node-web.azurewebsites.net/api/routes
```

### Step 4: Create Frontend App

```powershell
#Create app (use a unique name if this fails)
az webapp create `
    --name cbbs-react-app `
    --resource-group rg-cbbs `
    --plan cbbs-app-plan `
    --runtime "NODE:18-lts"
```

### Step 5: Build Frontend

```powershell
cd frontend

# Set backend URL
$backendUrl = "https://cbbs-node-web.azurewebsites.net"

# Create production api.js
@"
import axios from 'axios';
const baseURL = '$backendUrl/api';
console.log('API Base URL:', baseURL);
export const api = axios.create({ 
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('cbbs_user');
  if (raw) {
    const user = JSON.parse(raw);
    config.headers['x-user-id'] = user.id;
    config.headers['x-user-role'] = user.role;
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
"@ | Out-File -FilePath ".\src\utils\api.js" -Encoding UTF8

# Build
npm run build
```

### Step 6: Create Server File

```powershell
@'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.listen(PORT, '0.0.0.0', () => console.log('Running on', PORT));
'@ | Out-File -FilePath "server.js" -Encoding UTF8
```

### Step 7: Update package.json

```powershell
$pkg = Get-Content "package.json" | ConvertFrom-Json
$pkg.dependencies | Add-Member -Name "express" -Value "^4.18.2" -Force
$pkg.scripts | Add-Member -Name "start" -Value "node server.js" -Force
$pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"
```

### Step 8: Deploy Frontend

```powershell
# Zip it
Compress-Archive -Path ".\dist", ".\package.json", ".\server.js" -DestinationPath "..\frontend.zip" -Force
cd ..

# Deploy
az webapp deploy --name cbbs-react-app --resource-group rg-cbbs --src-path ".\frontend.zip" --type zip

# Restart
az webapp restart --name cbbs-react-app --resource-group rg-cbbs
```

### Step 9: Test!

Open in browser:
- https://cbbs-react-app.azurewebsites.net

## Troubleshooting

### Error: "The Resource ... was not found"
- The app service doesn't exist yet
- Run the `az webapp create` command first

### Error: "Name already exists"
- Someone else is using that name
- Change the name to something unique like `cbbs-yourname-frontend`

### App shows "Application Error"
```powershell
# View logs
az webapp log tail --name cbbs-node-web --resource-group rg-cbbs
```

### Frontend can't connect to backend
1. Check backend is running: https://cbbs-node-web.azurewebsites.net/api/routes
2. Check frontend has correct URL in api.js
3. Rebuild frontend with correct backend URL

### "az: command not found"
- Azure CLI not in PATH
- Restart terminal after installing Azure CLI

## Quick Test Commands

```powershell
# Test backend
curl https://cbbs-node-web.azurewebsites.net/api/routes

# Test backend login
curl -X POST https://cbbs-node-web.azurewebsites.net/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"student","password":"student"}'

# View backend logs
az webapp log tail --name cbbs-node-web --resource-group rg-cbbs

# View frontend logs
az webapp log tail --name cbbs-react-app --resource-group rg-cbbs

# Restart backend
az webapp restart --name cbbs-node-web --resource-group rg-cbbs

# Restart frontend
az webapp restart --name cbbs-react-app --resource-group rg-cbbs
```

## What to Do After Deployment

1. ✅ Open frontend URL in browser
2. ✅ Login with: student/student
3. ✅ Test booking a bus
4. ✅ Login as admin to see bookings
5. ✅ Login as driver to see schedules

## Cost Information

Using existing resources, you're only paying for:
- App Service Plan (already have: `cbbs-app-plan`)
- Additional app instances run on same plan = NO extra cost
- SQL Database (already have)

**Estimated**: ~$0-5/month extra for the frontend app

## Need Help?

If any step fails:
1. Read the error message carefully
2. Check the logs: `az webapp log tail --name [app-name] --resource-group rg-cbbs`
3. Verify all files are correct
4. Try restarting the app
5. Check Azure Portal to see resource status

---

**Recommended: Start with Option 1 (Use Existing App Service)**

It's the fastest and uses resources you already have!
