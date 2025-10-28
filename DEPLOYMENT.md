# 🚌 College Bus Booking System - Deployment Guide

This guide covers deploying the College Bus Booking System using Docker and Terraform on Azure.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- [Terraform](https://www.terraform.io/downloads.html) installed
- Azure subscription with appropriate permissions

## 🏗️ Architecture

The system consists of:
- **Frontend**: React app served by Nginx
- **Backend**: Azure Functions API
- **Database**: SQL Server
- **Storage**: Azurite (local) / Azure Storage (production)
- **Container Registry**: Azure Container Registry
- **Hosting**: Azure App Service

## 🚀 Quick Start

### Local Development

1. **Start local environment:**
   ```bash
   chmod +x scripts/local-dev.sh
   ./scripts/local-dev.sh
   ```

2. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:7071
   - Database: localhost:1433

3. **Stop the environment:**
   ```bash
   docker-compose down
   ```

### Production Deployment

1. **Login to Azure:**
   ```bash
   az login
   ```

2. **Deploy infrastructure and application:**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

## 📁 Project Structure

```
CollegeBusBookingWebsite/
├── api/                    # Backend API (Azure Functions)
│   ├── Dockerfile         # Backend container configuration
│   ├── package.json       # Backend dependencies
│   └── ...                # API source code
├── frontend/              # React frontend
│   ├── Dockerfile         # Frontend container configuration
│   ├── nginx.conf         # Nginx configuration
│   ├── package.json       # Frontend dependencies
│   └── ...                # Frontend source code
├── terraform/             # Infrastructure as Code
│   ├── main.tf           # Main Terraform configuration
│   └── provider.tf       # Provider configuration
├── scripts/               # Deployment scripts
│   ├── build-and-push.sh # Build and push Docker images
│   ├── deploy.sh         # Full deployment script
│   └── local-dev.sh      # Local development script
├── docker-compose.yml     # Local development setup
└── DEPLOYMENT.md         # This file
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_OPENAI_KEY=your-openai-api-key-here
```

#### Backend (App Settings)
- `FUNCTIONS_WORKER_RUNTIME=node`
- `WEBSITE_NODE_DEFAULT_VERSION=18`
- Database connection strings
- Storage account keys

### Terraform Variables

You can customize the deployment by creating a `terraform/terraform.tfvars` file:

```hcl
resource_group_name = "my-cbbs-rg"
location           = "East US"
environment        = "prod"
```

## 🐳 Docker Images

### Frontend Image
- **Base**: nginx:alpine
- **Features**: Multi-stage build, security hardening, gzip compression
- **Port**: 80

### Backend Image
- **Base**: node:22-alpine
- **Features**: Azure Functions Core Tools, health checks
- **Port**: 7071

## ☁️ Azure Resources

The Terraform configuration creates:

- **Resource Group**: Container for all resources
- **Container Registry**: Store Docker images
- **App Service Plans**: Hosting plans for frontend and backend
- **Web Apps**: Containerized applications
- **SQL Server**: Database server
- **SQL Database**: Application database

## 🔒 Security Features

- Non-root containers
- Security headers in Nginx
- Encrypted connections
- Resource tagging
- Access controls

## 📊 Monitoring

### Health Checks
- Frontend: `/health` endpoint
- Backend: Built-in Azure Functions health checks

### Logs
- Application logs via Azure App Service
- Container logs via Azure Container Registry
- Database logs via SQL Server

## 🛠️ Troubleshooting

### Common Issues

1. **Container won't start:**
   ```bash
   docker-compose logs [service-name]
   ```

2. **Terraform deployment fails:**
   ```bash
   terraform plan -detailed-exitcode
   ```

3. **Azure CLI not authenticated:**
   ```bash
   az login
   az account set --subscription "your-subscription-id"
   ```

### Useful Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build [service-name]

# Clean up
docker-compose down -v
docker system prune -a
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Azure
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Azure
        run: ./scripts/deploy.sh
```

## 📈 Scaling

### Horizontal Scaling
- Increase App Service Plan SKU
- Add multiple instances
- Use Azure Load Balancer

### Vertical Scaling
- Upgrade to higher SKU tiers
- Add more memory/CPU
- Use Premium plans for better performance

## 💰 Cost Optimization

- Use Basic SKUs for development
- Implement auto-scaling
- Use Azure Reserved Instances
- Monitor usage with Azure Cost Management

## 🆘 Support

For issues and questions:
1. Check the logs first
2. Review this documentation
3. Check Azure service health
4. Contact your system administrator

---

**Happy Deploying! 🚀**
