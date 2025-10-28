@echo off
REM Start local development environment
REM Usage: scripts\local-dev.bat

echo 🚀 Starting local development environment...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo 🏗️ Building and starting all services...
docker-compose up --build -d

echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🔍 Checking service health...

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if not errorlevel 1 (
    echo ✅ All services are running!
    echo.
    echo 🌐 Application URLs:
    echo Frontend: http://localhost:3000
    echo Backend API: http://localhost:7071
    echo Database: localhost:1433
    echo Azurite Storage: http://localhost:10000
    echo.
    echo 📊 Service Status:
    docker-compose ps
    echo.
    echo 📝 To view logs: docker-compose logs -f [service-name]
    echo 🛑 To stop: docker-compose down
) else (
    echo ❌ Some services failed to start. Check logs with: docker-compose logs
    exit /b 1
)
