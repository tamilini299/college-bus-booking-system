# 🚀 Azure Deployment Guide

## Quick Deploy (Recommended)

Simply run this command in PowerShell:

```powershell
.\quick-deploy-azure.ps1
```

This will:
1. ✅ Check Azure login
2. ✅ Create/verify resource group
3. ✅ Deploy backend Node.js app
4. ✅ Build and deploy frontend React app
5. ✅ Configure all settings automatically
6. ✅ Start both applications

**Time:** ~5-10 minutes

## What Gets Deployed

### Resources Created:
- **Resource Group:** `rg-cbbs` (Central India)
- **App Service Plan:** `cbbs-plan` (B1 tier - Basic)
- **Backend App:** `cbbs-node-backend` (Node.js 18 LTS)
- **Frontend App:** `cbbs-react-frontend` (Node.js 18 LTS)

### URLs After Deployment:
- **Frontend:** https://cbbs-react-frontend.azurewebsites.net
- **Backend API:** https://cbbs-node-backend.azurewebsites.net

## Prerequisites

1. **Azure CLI** - Already installed ✅
2. **Node.js** - Already installed ✅
3. **Azure Account** with active subscription ✅

## Step-by-Step Deployment

### Option 1: Quick Deploy (Easiest)

```powershell
# Run from project root
.\quick-deploy-azure.ps1
```

### Option 2: Full Deploy (More Control)

```powershell
# Run from project root
.\deploy-to-azure.ps1
```

This allows you to specify custom names:
```powershell
.\deploy-to-azure.ps1 `
    -ResourceGroup "my-custom-rg" `
    -BackendAppName "my-backend" `
    -FrontendAppName "my-frontend"
```

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Login to Azure
```powershell
az login
```

### 2. Create Resource Group
```powershell
az group create --name rg-cbbs --location centralindia
```

### 3. Create App Service Plan
```powershell
az appservice plan create `
    --name cbbs-plan `
    --resource-group rg-cbbs `
    --location centralindia `
    --is-linux `
    --sku B1
```

### 4. Deploy Backend

```powershell
# Create web app
az webapp create `
    --name cbbs-node-backend `
    --resource-group rg-cbbs `
    --plan cbbs-plan `
    --runtime "NODE:18-lts"

# Configure settings
az webapp config appsettings set `
    --name cbbs-node-backend `
    --resource-group rg-cbbs `
    --settings PORT=8080 NODE_ENV=production

# Deploy code
cd simple-backend
Compress-Archive -Path ".\*" -DestinationPath "..\backend.zip" -Force
cd ..
az webapp deployment source config-zip `
    --name cbbs-node-backend `
    --resource-group rg-cbbs `
    --src backend.zip
```

### 5. Deploy Frontend

```powershell
# Build frontend
cd frontend
npm run build

# Create server.js
# (See quick-deploy-azure.ps1 for server.js content)

# Update package.json to include express and start script

# Deploy
Compress-Archive -Path ".\dist\*", ".\package.json", ".\server.js" -DestinationPath "..\frontend.zip" -Force
cd ..

# Create web app
az webapp create `
    --name cbbs-react-frontend `
    --resource-group rg-cbbs `
    --plan cbbs-plan `
    --runtime "NODE:18-lts"

# Deploy code
az webapp deployment source config-zip `
    --name cbbs-react-frontend `
    --resource-group rg-cbbs `
    --src frontend.zip
```

## Troubleshooting Deployment

### Issue: App shows "Application Error"

**Solution:**
```powershell
# Check logs
az webapp log tail --name cbbs-react-frontend --resource-group rg-cbbs

# Or backend logs
az webapp log tail --name cbbs-node-backend --resource-group rg-cbbs
```

### Issue: Frontend can't connect to backend

**Solution:**
1. Check backend is running: https://cbbs-node-backend.azurewebsites.net/api/routes
2. Verify CORS is enabled in backend (already configured)
3. Check API URL in frontend build

### Issue: "Port already in use" during deployment

**Solution:**
This shouldn't happen in Azure. If it does, restart the app:
```powershell
az webapp restart --name cbbs-node-backend --resource-group rg-cbbs
```

### Issue: Deployment hangs or times out

**Solution:**
```powershell
# Cancel and retry
# Make sure files aren't too large
# Check your internet connection
```

## Post-Deployment

### View Live Apps
```powershell
# Open frontend
start https://cbbs-react-frontend.azurewebsites.net

# Open backend API
start https://cbbs-node-backend.azurewebsites.net/api/routes
```

### View Logs
```powershell
# Frontend logs
az webapp log tail --name cbbs-react-frontend --resource-group rg-cbbs

# Backend logs
az webapp log tail --name cbbs-node-backend --resource-group rg-cbbs
```

### Enable Application Insights (Optional)
```powershell
# For better monitoring
az monitor app-insights component create `
    --app cbbs-insights `
    --location centralindia `
    --resource-group rg-cbbs
```

## Updating the Deployed App

To update after making changes:

```powershell
# Quick update
.\quick-deploy-azure.ps1

# Or update just backend
cd simple-backend
Compress-Archive -Path ".\*" -DestinationPath "..\backend.zip" -Force
cd ..
az webapp deployment source config-zip `
    --name cbbs-node-backend `
    --resource-group rg-cbbs `
    --src backend.zip

# Or update just frontend
cd frontend
npm run build
# ... (same as deployment)
```

## Cost Estimation

**B1 App Service Plan:**
- ~$13 USD/month per plan
- We use 1 plan for both apps
- Total: ~$13 USD/month

**To reduce costs:**
- Use F1 (Free tier) for testing: `--sku F1`
- Stop apps when not in use: `az webapp stop --name [app-name] --resource-group rg-cbbs`

## Deleting Everything

To remove all Azure resources:

```powershell
az group delete --name rg-cbbs --yes --no-wait
```

## Next Steps After Deployment

1. ✅ Test the application at the frontend URL
2. ✅ Login with test credentials
3. ✅ Create some bookings
4. ✅ Check admin and driver dashboards
5. 🔒 Set up custom domain (optional)
6. 🔐 Configure proper authentication (optional)
7. 💾 Connect to Azure SQL Database (optional)
8. 📊 Enable Application Insights (optional)

## Support

If deployment fails:
1. Check the error message
2. View logs: `az webapp log tail --name [app-name] --resource-group rg-cbbs`
3. Restart the app: `az webapp restart --name [app-name] --resource-group rg-cbbs`
4. Try manual deployment steps above

---

**Ready to deploy? Run `.\quick-deploy-azure.ps1` now! 🚀**
