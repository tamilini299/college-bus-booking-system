# Deploy frontend to Azure App Service
Write-Host "Building frontend..."
cd frontend
npm run build

Write-Host "Creating deployment package..."
cd dist
Compress-Archive -Path "*" -DestinationPath "../frontend-deploy.zip" -Force
cd ..

Write-Host "Deploying to Azure..."
az webapp deploy --resource-group cbbs-rg --name cbbs-frontend-1234 --src-path frontend-deploy.zip --type zip

Write-Host "Deployment complete!"
