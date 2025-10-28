# 🚌 College Bus Booking System

A complete web-based bus booking system for college students, administrators, and drivers.

## 🚀 Quick Start

### Option 1: Use the Startup Script (Recommended)
Simply double-click `start-local.bat` to start both backend and frontend servers.

### Option 2: Manual Start
1. **Start Backend:**
   ```bash
   cd simple-backend
   node server.js
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## 🌐 Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:7071

## 👥 Login Credentials

### Student Account
- **Username:** `student`
- **Password:** `student`
- **Features:** Book bus seats, view schedules, auto-book option

### Admin Account
- **Username:** `admin`
- **Password:** `admin`
- **Features:** View all bookings, analyze route utilization, monitor system performance

### Driver Account
- **Username:** `driver`
- **Password:** `driver`
- **Features:** View assigned routes, see passenger counts, check schedules

## 📱 How to Use

### For Students:

1. **Login** with student credentials
2. **Navigate** to "Booking" page
3. **Select Route** from the dropdown (5 routes available)
4. **Select Stop** from the available stops on that route
5. **Choose Date** for your journey
6. **View Schedules** - All available buses will be displayed with:
   - Bus number
   - Departure time
   - Available seats
   - Capacity
7. **Book a Seat:**
   - Click "Book" on your preferred schedule
   - OR enable "Auto-book" checkbox for recurring bookings
8. **Confirmation** - You'll see a success message when booking is confirmed

### For Admins:

1. **Login** with admin credentials
2. **View Dashboard** showing:
   - Total active routes
   - Today's schedules
   - Total bookings
   - Overall utilization percentage
3. **Analyze Data:**
   - Route-wise utilization
   - Booking trends
   - Capacity management
4. **Real-time Updates** - Dashboard automatically refreshes when new bookings are made

### For Drivers:

1. **Login** with driver credentials
2. **View Your Schedule:**
   - All assigned routes
   - Passenger counts for each schedule
   - Departure times
   - Route details
3. **Monitor** real-time passenger boarding information
4. **Track** total passengers for the day

## 🛣️ Available Routes

1. **Route 1** - Campus to Downtown
   - Stops: Main Campus Gate, Library Junction, City Center, Downtown Terminal

2. **Route 2** - Campus to Airport
   - Stops: Main Campus Gate, Highway Exit, Airport Road, Airport Terminal

3. **Route 3** - Campus to Mall
   - Stops: Main Campus Gate, Shopping District, Central Mall

4. **Route 4** - Campus to Station
   - Stops: Main Campus Gate, Park Avenue, Railway Station

5. **Route 5** - Campus to Hospital
   - Stops: Main Campus Gate, Medical District, City Hospital

## 🕐 Schedule Times

Buses run at the following times daily:
- 08:00 AM
- 09:00 AM
- 10:00 AM
- 12:00 PM
- 02:00 PM
- 04:00 PM
- 06:00 PM

## 🚍 Bus Fleet

- **BUS-101** - Capacity: 70 seats
- **BUS-102** - Capacity: 70 seats
- **BUS-103** - Capacity: 65 seats
- **BUS-104** - Capacity: 75 seats
- **BUS-105** - Capacity: 70 seats

## 🔄 How It Works

### Student Booking Flow:
1. Student selects route, stop, and date
2. Frontend fetches available schedules from backend
3. Student chooses a schedule and clicks "Book"
4. Frontend sends booking request to backend with:
   - Schedule ID
   - Stop ID
   - Auto-book preference
   - User ID (from login session)
5. Backend validates availability
6. Backend creates booking and updates seat count
7. Backend sends confirmation to frontend
8. Frontend displays success message
9. Other open tabs (admin/driver) automatically refresh

### Admin Dashboard Flow:
1. Admin views real-time statistics
2. Backend calculates:
   - Total bookings per route
   - Utilization percentages
   - Capacity analysis
3. Admin can filter by date
4. Dashboard auto-updates when new bookings occur

### Driver Dashboard Flow:
1. Driver views assigned schedules
2. Backend provides:
   - Route details
   - Passenger counts
   - Schedule timings
3. Driver can see real-time passenger updates
4. Grouped by routes for easy viewing

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Routes & Stops
- `GET /api/routes` - Get all routes
- `GET /api/routes/:routeId/stops` - Get stops for a route

### Schedules
- `GET /api/schedules?date=YYYY-MM-DD&routeId=X` - Get schedules

### Bookings
- `POST /api/bookings` - Create a booking
- `GET /api/bookings?date=YYYY-MM-DD` - Get all bookings

### Statistics
- `GET /api/stats/route-utilization?date=YYYY-MM-DD` - Get route utilization

## 🔧 Technical Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Data Storage:** In-memory (for demo)
- **Styling:** Inline CSS with gradients
- **API Communication:** Axios with proxying

## 📊 Features

✅ Role-based access (Student, Admin, Driver)  
✅ Real-time seat availability  
✅ Auto-booking for recurring trips  
✅ Multi-route and multi-stop support  
✅ Date-based scheduling  
✅ Capacity management  
✅ Real-time dashboard updates  
✅ Route utilization analytics  
✅ Responsive design  

## 🛑 Stopping the Servers

Press `Ctrl+C` in each terminal window or close the terminal windows.

## 📝 Notes

- This is a demo version using in-memory storage
- All data resets when backend server restarts
- For production, integrate with a real database (SQL Server, as per original design)
- Add proper authentication with JWT tokens
- Implement persistent storage

## 🎯 Next Steps for Production

1. Connect to SQL Server database (schema in `db/init.sql`)
2. Implement proper JWT authentication
3. Add email notifications for bookings
4. Create booking cancellation feature
5. Add payment integration
6. Deploy to Azure (scripts available in `scripts/` folder)

---

**Enjoy your College Bus Booking System! 🚌✨**
