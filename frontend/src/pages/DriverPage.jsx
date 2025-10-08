import React, { useEffect, useState } from 'react';
import { api } from '../utils/api.js';

export default function DriverPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function loadSchedules() {
      try {
        const response = await api.get('/schedules', { params: { date: selectedDate } });
        setSchedules(response.data.schedules || []);
      } catch (err) {
        console.error('Error loading driver schedules:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadSchedules();
  }, [selectedDate]);

  // Listen for bookings from other tabs and refresh
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'cbbs_booking_event') {
        (async () => {
          try {
            const response = await api.get('/schedules', { params: { date: selectedDate } });
            setSchedules(response.data.schedules || []);
          } catch {}
        })();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [selectedDate]);

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const routeId = schedule.route_id;
    if (!acc[routeId]) {
      acc[routeId] = {
        route_id: routeId,
        route_name: schedule.route_name || `Route ${routeId}`,
        schedules: []
      };
    }
    acc[routeId].schedules.push(schedule);
    return acc;
  }, {});

  const totalPassengers = schedules.reduce((sum, schedule) => sum + (schedule.booked_count || 0), 0);

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '2rem',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
          🚌 Driver Dashboard
        </h2>
        <p style={{ margin: '0', opacity: 0.9 }}>
          Manage your routes and track passenger information
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {loading ? '...' : schedules.length}
          </div>
          <div style={{ color: '#6b7280' }}>Total Schedules</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {loading ? '...' : Object.keys(groupedSchedules).length}
          </div>
          <div style={{ color: '#6b7280' }}>Routes Assigned</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {loading ? '...' : totalPassengers}
          </div>
          <div style={{ color: '#6b7280' }}>Total Passengers</div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {loading ? '...' : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ color: '#6b7280' }}>Current Time</div>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Loading your schedules...
          </div>
        ) : Object.keys(groupedSchedules).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No schedules assigned for this date.
          </div>
        ) : (
          Object.values(groupedSchedules).map(route => (
            <div key={route.route_id} style={routeCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#374151', fontSize: '1.25rem' }}>
                  🚌 {route.route_name}
                </h3>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  background: '#d1fae5',
                  color: '#065f46',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {route.schedules.length} trips
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {route.schedules.map(schedule => (
                  <div key={schedule.id} style={scheduleItemStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>
                          {schedule.departure_time}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                          Bus: {schedule.bus_number || `#${schedule.bus_id}`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#10b981' }}>
                          {schedule.booked_count || 0} / {schedule.capacity || 70}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          passengers
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Capacity</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#374151' }}>
                          {schedule.capacity > 0 ? Math.round(((schedule.booked_count || 0) / schedule.capacity) * 100) : 0}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: '#e5e7eb',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${schedule.capacity > 0 ? ((schedule.booked_count || 0) / schedule.capacity) * 100 : 0}%`,
                          height: '100%',
                          background: (schedule.booked_count || 0) > schedule.capacity * 0.8 ? 
                            'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' : 
                            'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>

                    {schedule.soft_overbook && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        fontWeight: '500'
                      }}>
                        ⚠️ Overbooked
                      </div>
                    )}
                  </div>
                ))}
              </div>
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

const scheduleItemStyle = {
  padding: '1rem',
  background: 'rgba(16, 185, 129, 0.05)',
  borderRadius: '8px',
  border: '1px solid rgba(16, 185, 129, 0.1)'
};