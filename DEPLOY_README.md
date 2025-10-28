# ✅ Azure Deployment - Ready to Deploy!

## 🎯 Quick Start (Recommended)

Run this command to deploy to your existing Azure resources:

```powershell
.\deploy-to-existing.ps1
```

This script will:
1. ✅ Deploy backend to your existing `cbbs-node-web` app
2. ✅ Build the React frontend  
3. ✅ Create a new app for the frontend
4. ✅ Deploy everything automatically
5. ✅ Give you the URLs when done

**Time:** ~5-7 minutes

## 📁 Deployment Scripts Available

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `deploy-to-existing.ps1` | Uses your existing resources | **Recommended - Start here!** |
| `deploy-simple.ps1` | Creates all new resources | If you want fresh resources |
| `deploy-to-azure.ps1` | Full deployment with options | Advanced customization |

## 🔍 Your Current Azure Resources

I can see you have:
- ✅ Resource Group: `rg-cbbs` (Central India)
- ✅ App Service: `cbbs-node-web`
- ✅ App Service Plan: `cbbs-app-plan`
- ✅ SQL Database: `cbbs-sql-tamilini/CollegeBus`
- ✅ Application Insights

## 🚀 Deployment Steps

### Option 1: Automated (Easiest)

```powershell
# Just run this!
.\deploy-to-existing.ps1
```

### Option 2: Manual Commands

If you prefer to do it step by step, see `DEPLOY_NOW.md`

## 📊 What Happens During Deployment

1. **Backend Deployment** (~2 min)
   - Zips `simple-backend` folder
   - Uploads to `cbbs-node-web`
   - Configures PORT and NODE_ENV
   - Restarts the app

2. **Frontend Build** (~2 min)
   - Updates API URL to point to your backend
   - Runs `npm run build`
   - Creates server.js to serve the app
   - Updates package.json

3. **Frontend Deployment** (~2 min)
   - Creates new app service (random name)
   - Uploads built files
   - Configures settings
   - Restarts the app

4. **Done!**
   - Shows you the URLs
   - Saves info to `DEPLOYED.txt`
   - Opens browser

## 🌐 After Deployment

You'll get URLs like:
- **Frontend**: https://cbbs-frontend-XXXX.azurewebsites.net
- **Backend**: https://cbbs-node-web.azurewebsites.net

Login with:
- Student: `student` / `student`
- Admin: `admin` / `admin`
- Driver: `driver` / `driver`

## 🔧 Troubleshooting

### "az: command not found"
Azure CLI not in PATH. Restart PowerShell or run:
```powershell
az login
```

### "Resource already exists"
The app name is taken. The script uses random names to avoid this.

### "Application Error" in browser
Wait 2-3 minutes for the app to fully start, then refresh.

### Check logs
```powershell
# Backend logs
az webapp log tail --name cbbs-node-web --resource-group rg-cbbs

# Frontend logs  
az webapp log tail --name cbbs-frontend-XXXX --resource-group rg-cbbs
```

### Backend API not responding
```powershell
# Test directly
curl https://cbbs-node-web.azurewebsites.net/api/routes

# Restart
az webapp restart --name cbbs-node-web --resource-group rg-cbbs
```

## 💰 Cost

You're already paying for:
- App Service Plan: ~$13/month
- SQL Database: Free tier or ~$5/month

Adding the frontend app: **$0 extra** (runs on same plan!)

## 📝 Files Created

- `DEPLOYED.txt` - Your deployment info and URLs
- `backend.zip` - Temporary (auto-deleted)
- `frontend.zip` - Temporary (auto-deleted)

## 🔄 Updating After Deployment

To update your code after making changes:

```powershell
# Quick redeploy
.\deploy-to-existing.ps1

# Or update just backend:
cd simple-backend
Compress-Archive -Path ".\*" -DestinationPath "..\backend.zip" -Force
cd ..
az webapp deploy --name cbbs-node-web --resource-group rg-cbbs --src-path ".\backend.zip" --type zip
Remove-Item ".\backend.zip"
```

## 📚 Documentation

- `DEPLOY_NOW.md` - Detailed manual steps
- `AZURE_DEPLOY_GUIDE.md` - Complete deployment guide
- `TROUBLESHOOTING.md` - Common issues and fixes
- `README.md` - Application documentation

## ✨ Features Deployed

✅ Student booking system  
✅ Admin dashboard with analytics  
✅ Driver schedule view  
✅ 5 bus routes with multiple stops  
✅ Real-time seat availability  
✅ Auto-booking option  
✅ Route utilization statistics  

## 🎯 Next Steps

1. Run: `.\deploy-to-existing.ps1`
2. Wait ~5-7 minutes
3. Open the frontend URL
4. Test the booking system
5. Check admin dashboard
6. View driver schedules

## 🆘 Need Help?

1. Check `DEPLOY_NOW.md` for detailed steps
2. Check logs: `az webapp log tail --name [app-name] --resource-group rg-cbbs`
3. View Azure Portal: portal.azure.com
4. Restart the app: `az webapp restart --name [app-name] --resource-group rg-cbbs`

---

**Ready? Let's deploy! Run: `.\deploy-to-existing.ps1` 🚀**
