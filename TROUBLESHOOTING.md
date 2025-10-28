# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Routes/Stops Not Showing in Dropdown

**Symptoms:** The route or stop dropdown is empty

**Solutions:**
1. Open browser console (F12) and check for API errors
2. Verify backend is running on http://localhost:7071
3. Test backend directly: Open http://localhost:7071/api/routes in browser
4. Check if CORS is enabled in backend
5. Restart both servers

**Quick Test:**
```bash
# Test routes endpoint
curl http://localhost:7071/api/routes

# Test stops endpoint
curl http://localhost:7071/api/routes/1/stops
```

### Issue 2: Schedules Not Loading

**Symptoms:** No bus schedules appear after selecting route and date

**Solutions:**
1. Make sure you selected a route first
2. Check browser console for errors
3. Verify date is in correct format (YYYY-MM-DD)
4. Test endpoint:
   ```bash
   curl "http://localhost:7071/api/schedules?date=2025-10-28&routeId=1"
   ```

### Issue 3: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::7071` or `:::5173`

**Solutions:**
1. Stop all Node.js processes:
   ```powershell
   Stop-Process -Name node -Force
   ```
2. Or kill specific port:
   ```powershell
   # Find process on port 7071
   netstat -ano | findstr :7071
   # Kill it (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

### Issue 4: Frontend Can't Connect to Backend

**Symptoms:** API calls fail, CORS errors, or "Network Error"

**Solutions:**
1. Verify backend is running: http://localhost:7071
2. Check Vite proxy configuration in `frontend/vite.config.js`
3. Verify API base URL in `frontend/src/utils/api.js`
4. Check browser console for specific error messages
5. Restart both servers

### Issue 5: Bookings Not Saving

**Symptoms:** Booking appears successful but doesn't persist

**Solution:**
- This is expected! The current version uses in-memory storage
- Data resets when backend restarts
- For persistence, connect to SQL Server database

### Issue 6: Admin/Driver Dashboards Empty

**Symptoms:** No data shows on admin or driver pages

**Solutions:**
1. Make sure you're logged in with correct role
2. Create some bookings first as a student
3. Check if backend is returning data:
   ```bash
   curl "http://localhost:7071/api/stats/route-utilization?date=2025-10-28"
   curl "http://localhost:7071/api/schedules?date=2025-10-28"
   ```

### Issue 7: npm/node Commands Not Found

**Symptoms:** `'npm' is not recognized` or `'node' is not recognized`

**Solutions:**
1. Install Node.js from https://nodejs.org/
2. Restart terminal/PowerShell after installation
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Issue 8: Dependencies Not Installed

**Symptoms:** `Cannot find module 'express'` or similar errors

**Solutions:**
1. Install backend dependencies:
   ```bash
   cd simple-backend
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## 🔍 Debugging Tips

### Check Backend Logs
The backend terminal will show:
- Incoming requests
- API endpoints accessed
- Any errors or warnings

### Check Browser Console
Press F12 in browser to see:
- API requests and responses
- JavaScript errors
- Network errors

### Test API Directly
Use curl or browser to test endpoints:
```bash
# Get routes
curl http://localhost:7071/api/routes

# Get stops for route 1
curl http://localhost:7071/api/routes/1/stops

# Get schedules
curl "http://localhost:7071/api/schedules?date=2025-10-28"

# Test login
curl -X POST http://localhost:7071/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"student\",\"password\":\"student\"}"
```

### Enable Verbose Logging
Edit `simple-backend/server.js` and add logging middleware:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});
```

## 📞 Still Having Issues?

1. **Check the README.md** for setup instructions
2. **Verify all prerequisites** are installed
3. **Restart everything** (both servers)
4. **Clear browser cache** and try again
5. **Check file permissions** in project directory

## 🚀 Quick Reset

If nothing works, try a complete reset:

```bash
# Stop all processes
Stop-Process -Name node -Force

# Reinstall dependencies
cd simple-backend
npm install

cd ../frontend
npm install

# Start fresh
cd ..
start-local.bat
```

---

**Most issues are solved by restarting the servers! 🔄**
