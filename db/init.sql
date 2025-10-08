-- Azure SQL schema for College Bus Booking System
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('notifications', 'U') IS NOT NULL DROP TABLE notifications;
IF OBJECT_ID('bookings', 'U') IS NOT NULL DROP TABLE bookings;
IF OBJECT_ID('schedules', 'U') IS NOT NULL DROP TABLE schedules;
IF OBJECT_ID('buses', 'U') IS NOT NULL DROP TABLE buses;
IF OBJECT_ID('stops', 'U') IS NOT NULL DROP TABLE stops;
IF OBJECT_ID('routes', 'U') IS NOT NULL DROP TABLE routes;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
GO

CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  email NVARCHAR(200) NOT NULL UNIQUE,
  phone NVARCHAR(30) NULL,
  role NVARCHAR(20) NOT NULL CHECK (role IN ('student','admin','driver'))
);
GO

CREATE TABLE routes (
  id INT IDENTITY(1,1) PRIMARY KEY,
  code NVARCHAR(20) NOT NULL UNIQUE,
  display_name NVARCHAR(200) NOT NULL
);
GO

CREATE TABLE stops (
  id INT IDENTITY(1,1) PRIMARY KEY,
  route_id INT NOT NULL,
  name NVARCHAR(200) NOT NULL,
  seq INT NOT NULL,
  CONSTRAINT FK_stops_routes FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);
GO

CREATE TABLE buses (
  id INT IDENTITY(1,1) PRIMARY KEY,
  bus_number NVARCHAR(50) NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT(70)
);
GO

CREATE TABLE schedules (
  id INT IDENTITY(1,1) PRIMARY KEY,
  route_id INT NOT NULL,
  date DATE NOT NULL,
  bus_id INT NULL,
  departure_time TIME NOT NULL,
  status NVARCHAR(20) NOT NULL DEFAULT('scheduled'),
  CONSTRAINT FK_schedules_routes FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  CONSTRAINT FK_schedules_buses FOREIGN KEY (bus_id) REFERENCES buses(id)
);
GO

CREATE TABLE bookings (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  schedule_id INT NOT NULL,
  stop_id INT NOT NULL,
  status NVARCHAR(20) NOT NULL DEFAULT('confirmed'),
  created_at DATETIME2 NOT NULL DEFAULT(SYSDATETIME()),
  CONSTRAINT FK_bookings_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT FK_bookings_schedules FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
  CONSTRAINT FK_bookings_stops FOREIGN KEY (stop_id) REFERENCES stops(id)
);
GO

CREATE TABLE notifications (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  message NVARCHAR(500) NOT NULL,
  is_read BIT NOT NULL DEFAULT(0),
  created_at DATETIME2 NOT NULL DEFAULT(SYSDATETIME()),
  CONSTRAINT FK_notifications_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
GO

-- Sample seed data (optional)
INSERT INTO routes(code, display_name) VALUES
('RT1','Route 1 - Main Campus'),
('RT2','Route 2 - North Gate');

INSERT INTO stops(route_id, name, seq) VALUES
(1,'Stop A',1),(1,'Stop B',2),(1,'Stop C',3),
(2,'Stop D',1),(2,'Stop E',2);

INSERT INTO buses(bus_number, capacity) VALUES
('BUS-101',70),('BUS-102',70);

INSERT INTO schedules(route_id, date, bus_id, departure_time) VALUES
(1, CONVERT(date, GETDATE()), 1, '08:00'),
(1, CONVERT(date, GETDATE()), 2, '09:00'),
(2, CONVERT(date, GETDATE()), 1, '08:30');

-- Sample users for testing
INSERT INTO users(name, email, role) VALUES
('John Student', 'john@college.edu', 'student'),
('Admin User', 'admin@college.edu', 'admin'),
('Driver Mike', 'driver@college.edu', 'driver'),
('Sarah Student', 'sarah@college.edu', 'student');

