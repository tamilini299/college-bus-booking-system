import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSessionContext } from '../App.jsx';
import { api } from '../utils/api.js';

export default function HomePage() {
  const { user } = useSessionContext();
  const [stats, setStats] = useState({ routes: 0, schedules: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [routesRes, schedulesRes, utilizationRes] = await Promise.all([
          api.get('/routes'),
          api.get('/schedules'),
          api.get('/stats/route-utilization')
        ]);
        
        setStats({
          routes: routesRes.data.routes?.length || 0,
          schedules: schedulesRes.data.schedules?.length || 0,
          bookings: utilizationRes.data.utilization?.reduce((sum, route) => sum + (route.total_booked || 0), 0) || 0
        });
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadStats();
  }, []);

  const getWelcomeMessage = () => {
    if (!user) return "Welcome to College Bus Booking System";
    
    const time = new Date().getHours();
    const greeting = time < 12 ? "Good Morning" : time < 18 ? "Good Afternoon" : "Good Evening";
    
    return `${greeting}, ${user.name}!`;
  };

  const getRoleBasedContent = () => {
    if (!user) {
      return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2rem',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
              🚌 Your Campus Transportation Solution
            </h2>
            <p style={{ margin: '0 0 1.5rem 0', opacity: 0.9 }}>
              Book your bus rides easily, track schedules, and manage your daily commute.
            </p>
            <Link to="/login" style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: 'white',
              color: '#667eea',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}>
              Get Started
            </Link>
          </div>
        </div>
      );
    }

    if (user.role === 'admin') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>📊 System Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={statItemStyle}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  {loading ? '...' : stats.routes}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Routes</div>
              </div>
              <div style={statItemStyle}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                  {loading ? '...' : stats.schedules}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Schedules</div>
              </div>
              <div style={statItemStyle}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {loading ? '...' : stats.bookings}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Bookings</div>
              </div>
            </div>
          </div>
          
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>🎯 Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/admin" style={actionButtonStyle}>
                📈 View Analytics
              </Link>
              <Link to="/booking" style={actionButtonStyle}>
                🚌 Manage Bookings
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (user.role === 'driver') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>🚌 Today's Schedule</h3>
            <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
              Check your assigned routes and schedules for today.
            </p>
            <Link to="/driver" style={actionButtonStyle}>
              View My Routes
            </Link>
          </div>
          
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>📱 Quick Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Status:</span>
                <span style={{ color: '#10b981', fontWeight: '500' }}>Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Role:</span>
                <span style={{ color: '#374151', fontWeight: '500' }}>Driver</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Student role
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>🚌 Book Your Ride</h3>
          <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0' }}>
            Find and book your bus for today or upcoming days.
          </p>
          <Link to="/booking" style={actionButtonStyle}>
            Book Now
          </Link>
        </div>
        
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>📊 System Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={statItemStyle}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#667eea' }}>
                {loading ? '...' : stats.routes}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Routes</div>
            </div>
            <div style={statItemStyle}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                {loading ? '...' : stats.schedules}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Schedules</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', fontWeight: 'bold' }}>
          {getWelcomeMessage()}
        </h1>
        <p style={{ margin: '0', fontSize: '1.1rem', opacity: 0.9 }}>
          {user ? 'Manage your bus bookings and schedules' : 'Your reliable campus transportation partner'}
        </p>
      </div>

      {getRoleBasedContent()}
    </div>
  );
}

const cardStyle = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  border: '1px solid rgba(0,0,0,0.05)'
};

const statItemStyle = {
  textAlign: 'center',
  padding: '0.75rem',
  background: 'rgba(102, 126, 234, 0.05)',
  borderRadius: '8px'
};

const actionButtonStyle = {
  display: 'block',
  padding: '0.75rem 1rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px',
  textAlign: 'center',
  fontWeight: '500',
  transition: 'all 0.2s ease'
};
