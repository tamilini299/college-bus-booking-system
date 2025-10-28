# Azure Deployment Setup with GitHub Actions

## ✅ What's Done

1. **App Service Plan Upgraded** to B1 tier ✓
2. **GitHub Actions Workflows** created for both backend and frontend ✓
3. **Publish Profiles** downloaded ✓

## 🔧 Next Steps (DO THIS NOW)

### 1. Push Your Code to GitHub

```powershell
git add .
git commit -m "Add Azure deployment workflows"
git push origin main
```

### 2. Add GitHub Secrets

Go to your GitHub repository: https://github.com/tamilini299/college-bus-booking-system

1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these two secrets:

**Secret 1:**
- Name: `AZURE_BACKEND_PUBLISH_PROFILE`
- Value: Copy **entire content** from `backend-publish-profile.xml`

**Secret 2:**
- Name: `AZURE_FRONTEND_PUBLISH_PROFILE`  
- Value: Copy **entire content** from `frontend-publish-profile.xml`

### 3. Trigger Deployment

Go to **Actions** tab in your GitHub repo, select the workflow, and click **Run workflow**

OR just push any change to trigger automatic deployment!

## 🌐 Your Application URLs

- **Frontend**: https://cbbs-frontend-3651.azurewebsites.net
- **Backend API**: https://cbbs-node-web-ecfvdwhjchdchbfp.centralindia-01.azurewebsites.net/api/routes

## ⏱️ Deployment Time

- First deployment: ~3-5 minutes
- Future deployments: ~2-3 minutes

## 💰 Cost

- **B1 Tier**: ~₹1,000/month per app service (₹2,000 total)
- Covered by your Azure for Students credits! 

## 🔍 Monitor Deployment

1. Go to GitHub → Actions tab
2. Watch the deployment progress in real-time
3. Both workflows will deploy automatically on code changes

## 🎯 Why GitHub Actions?

Direct Azure CLI deployment was failing due to build process issues. GitHub Actions:
- ✅ More reliable
- ✅ Proper build environment
- ✅ Better error handling  
- ✅ Automatic deployments on git push
- ✅ Full control over build process

## 📝 Important Files

- `.github/workflows/deploy-backend.yml` - Backend deployment workflow
- `.github/workflows/deploy-frontend.yml` - Frontend deployment workflow  
- `backend-publish-profile.xml` - Backend credentials (DO NOT commit!)
- `frontend-publish-profile.xml` - Frontend credentials (DO NOT commit!)

## 🚀 Quick Start Commands

```powershell
# 1. Commit and push
git add .
git commit -m "Setup Azure deployment"
git push

# 2. Add secrets on GitHub (see step 2 above)

# 3. Manually trigger workflow:
# Go to Actions → Select workflow → Run workflow

# 4. Wait 3-5 minutes and visit:
# https://cbbs-frontend-3651.azurewebsites.net
```

## ❓ Troubleshooting

If deployment fails:
1. Check GitHub Actions logs
2. Verify secrets are set correctly
3. Make sure both publish profile secrets are added
4. Check Azure portal for app status

---

**Next:** Add the secrets to GitHub and run the workflows!
