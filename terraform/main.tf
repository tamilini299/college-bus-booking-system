# Variables
variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "cbbs-rg"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "Central India"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

# Resource Group
resource "azurerm_resource_group" "cbbs_rg" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    Environment = var.environment
    Project     = "College Bus Booking System"
  }
}

# Container Registry
resource "azurerm_container_registry" "cbbs_acr" {
  name                = "cbbsacr${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.cbbs_rg.name
  location            = azurerm_resource_group.cbbs_rg.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = {
    Environment = var.environment
    Project     = "College Bus Booking System"
  }
}

# Random string for unique naming
resource "random_string" "suffix" {
  length  = 4
  special = false
  upper   = false
}

# App Service Plan for Frontend
resource "azurerm_service_plan" "cbbs_frontend_plan" {
  name                = "cbbs-frontend-plan"
  resource_group_name = azurerm_resource_group.cbbs_rg.name
  location            = azurerm_resource_group.cbbs_rg.location
  os_type             = "Linux"
  sku_name            = "B1"

  tags = {
    Environment = var.environment
    Project     = "College Bus Booking System"
    Component   = "Frontend"
  }
}

# App Service Plan for Backend API
resource "azurerm_service_plan" "cbbs_backend_plan" {
  name                = "cbbs-backend-plan"
  resource_group_name = azurerm_resource_group.cbbs_rg.name
  location            = azurerm_resource_group.cbbs_rg.location
  os_type             = "Linux"
  sku_name            = "B1"

  tags = {
    Environment = var.environment
    Project     = "College Bus Booking System"
    Component   = "Backend"
  }
}

# Frontend Web App
resource "azurerm_linux_web_app" "cbbs_frontend" {
  name                = "cbbs-frontend-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.cbbs_rg.name
  location            = azurerm_service_plan.cbbs_frontend_plan.location
  service_plan_id     = azurerm_service_plan.cbbs_frontend_plan.id

  site_config {
    always_on = false
    application_stack {
      docker_image     = "${azurerm_container_registry.cbbs_acr.login_server}/cbbs-frontend:latest"
      docker_image_tag = "latest"
    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "DOCKER_REGISTRY_SERVER_URL"          = "https://${azurerm_container_registry.cbbs_acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME"     = azurerm_container_registry.cbbs_acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD"     = azurerm_container_registry.cbbs_acr.admin_password
  }

  tags = {
    Environment = var.environment
    Project     = "College Bus Booking System"
    Component   = "Frontend"
  }
}

# Backend API Web App
resource "azurerm_linux_web_app" "cbbs_backend" {
  name                = "cbbs-backend-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.cbbs_rg.name
  location            = azurerm_service_plan.cbbs_backend_plan.location
  service_plan_id     = azurerm_service_plan.cbbs_backend_plan.id

  site_config {
    always_on = false
    application_stack {
      docker_image     = "${azurerm_container_registry.cbbs_acr.login_server}/cbbs-backend:latest"
      docker_image_tag = "latest"
    }
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    "DOCKER_REGISTRY_SERVER_URL"          = "https://${azurerm_container_registry.cbbs_acr.login_server}"
    "DOCKER_REGISTRY_SERVER_USERNAME"     = azurerm_container_registry.cbbs_acr.admin_username
    "DOCKER_REGISTRY_SERVER_PASSWORD"     = azurerm_container_registry.cbbs_acr.admin_password
    "FUNCTIONS_WORKER_RUNTIME"            = "node"
    "WEBSITE_NODE_DEFAULT_VERSION"        = "18"
  }

  tags = {
    Environment = var.environment
    Project     = "College Bus Booking System"
    Component   = "Backend"
  }
}

# SQL Database Server
resource "azurerm_mssql_server" "cbbs_sql_server" {
  name                         = "cbbs-sql-server-${random_string.suffix.result}"
  resource_group_name          = azurerm_resource_group.cbbs_rg.name
  location                     = azurerm_resource_group.cbbs_rg.location
  version                      = "12.0"
  administrator_login          = "cbbsadmin"
  administrator_login_password = random_password.sql_password.result

  tags = {
    Environment = var.environment
    Project     = "College Bus Booking System"
    Component   = "Database"
  }
}

# SQL Database
resource "azurerm_mssql_database" "cbbs_database" {
  name           = "cbbs-database"
  server_id      = azurerm_mssql_server.cbbs_sql_server.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  license_type   = "LicenseIncluded"
  max_size_gb    = 2
  sku_name       = "Basic"

  tags = {
    Environment = var.environment
    Project     = "College Bus Booking System"
    Component   = "Database"
  }
}

# Random password for SQL Server
resource "random_password" "sql_password" {
  length  = 16
  special = true
}

# Outputs
output "frontend_url" {
  description = "Frontend application URL"
  value       = "https://${azurerm_linux_web_app.cbbs_frontend.default_hostname}"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "https://${azurerm_linux_web_app.cbbs_backend.default_hostname}"
}

output "container_registry_url" {
  description = "Container Registry URL"
  value       = azurerm_container_registry.cbbs_acr.login_server
}

output "sql_server_name" {
  description = "SQL Server name"
  value       = azurerm_mssql_server.cbbs_sql_server.name
}

output "sql_database_name" {
  description = "SQL Database name"
  value       = azurerm_mssql_database.cbbs_database.name
}

