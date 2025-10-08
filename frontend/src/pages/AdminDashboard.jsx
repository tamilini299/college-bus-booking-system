import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';

export default function AdminDashboard() {
  const [utilization, setUtilization] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function loadData() {
      try {
        const [utilRes, schedRes] = await Promise.all([
          api.get('/stats/route-utilization', { params: { date: selectedDate } }),
          api.get('/schedules', { params: { date: selectedDate } })
        ]);
        setUtilization(utilRes.data.utilization || []);
        setSchedules(schedRes.data.schedules || []);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [selectedDate]);

  // Listen for bookings from other tabs and refresh
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'cbbs_booking_event') {
        (async () => {
          try {
            const [utilRes, schedRes] = await Promise.all([
              api.get('/stats/route-utilization', { params: { date: selectedDate } }),
              api.get('/schedules', { params: { date: selectedDate } })
            ]);
            setUtilization(utilRes.data.utilization || []);
            setSchedules(schedRes.data.schedules || []);
          } catch {}
        })();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [selectedDate]);

  const totalBookings = utilization.reduce((sum, route) => sum + (route.total_booked || 0), 0);
  const totalCapacity = utilization.reduce((sum, route) => sum + (route.total_capacity || 0), 0);
  const overallUtilization = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        padding: '2rem',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
          📊 Admin Dashboard
        </h2>
        <p style={{ margin: '0', opacity: 0.9 }}>
          Monitor system performance and manage operations
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {loading ? '...' : utilization.length}
          </div>
          <div style={{ color: '#6b7280' }}>Active Routes</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {loading ? '...' : schedules.length}
          </div>
          <div style={{ color: '#6b7280' }}>Today's Schedules</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {loading ? '...' : totalBookings}
          </div>
          <div style={{ color: '#6b7280' }}>Total Bookings</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {loading ? '...' : overallUtilization}%
          </div>
          <div style={{ color: '#6b7280' }}>Utilization</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
        <label style={{ fontWeight: '600', color: '#374151' }}>Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '6px',
            border: '2px solid #e5e7eb',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Loading route data...
          </div>
        ) : (
          utilization.map(route => (
            <div key={route.route_id} style={routeCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#374151', fontSize: '1.25rem' }}>
                  {route.display_name}
                </h3>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  background: route.total_booked > route.total_capacity * 0.8 ? '#fef3c7' : '#d1fae5',
                  color: route.total_booked > route.total_capacity * 0.8 ? '#92400e' : '#065f46',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {route.num_buses} buses
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div style={metricStyle}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {route.total_capacity || 0}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total Capacity</div>
                </div>
                <div style={metricStyle}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {route.total_booked || 0}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Booked</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Utilization</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>
                    {route.total_capacity > 0 ? Math.round((route.total_booked / route.total_capacity) * 100) : 0}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${route.total_capacity > 0 ? (route.total_booked / route.total_capacity) * 100 : 0}%`,
                    height: '100%',
                    background: route.total_booked > route.total_capacity * 0.8 ? 
                      'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' : 
                      'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              {route.removable_buses > 0 && (
                <div style={{
                  padding: '0.75rem',
                  background: '#fef3c7',
                  color: '#92400e',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  💡 Can optimize by removing {route.removable_buses} bus
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const statCardStyle = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  textAlign: 'center',
  border: '1px solid rgba(0,0,0,0.05)'
};

const routeCardStyle = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  border: '1px solid rgba(0,0,0,0.05)'
};

const metricStyle = {
  textAlign: 'center',
  padding: '0.75rem',
  background: 'rgba(102, 126, 234, 0.05)',
  borderRadius: '8px'
};