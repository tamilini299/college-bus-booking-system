import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api.js';

export default function BookingPage() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [schedules, setSchedules] = useState([]);
  const [autoBook, setAutoBook] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    api.get('/routes').then((res) => setRoutes(res.data.routes || [])).catch(() => setRoutes([]));
  }, []);

  useEffect(() => {
    if (!selectedRoute) { setStops([]); setSelectedStop(''); return; }
    api.get(`/routes/${selectedRoute}/stops`).then((res) => setStops(res.data.stops || [])).catch(() => setStops([]));
  }, [selectedRoute]);

  // Auto-select first stop to make booking CTA available
  useEffect(() => {
    if (stops.length && !selectedStop) {
      setSelectedStop(String(stops[0].id));
    }
  }, [stops, selectedStop]);

  useEffect(() => {
    if (!selectedRoute || !date) { setSchedules([]); return; }
    api.get('/schedules', { params: { routeId: selectedRoute, date }})
      .then((res) => setSchedules(res.data.schedules || []))
      .catch(() => setSchedules([]));
  }, [selectedRoute, date]);

  async function book(scheduleId) {
    setLoading(true);
    setMessage('');
    setMessageType('');
    try {
      const res = await api.post('/bookings', { scheduleId, stopId: selectedStop, autoBook });
      setMessage(res.data.message || 'Booking confirmed!');
      setMessageType('success');
      // refresh schedules
      const s = await api.get('/schedules', { params: { routeId: selectedRoute, date }});
      setSchedules(s.data.schedules || []);
      // Notify other open tabs/pages (admin/driver) to refresh
      try { localStorage.setItem('cbbs_booking_event', String(Date.now())); } catch {}
    } catch (e) {
      setMessage(e.response?.data?.error || 'Booking failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  const routeOptions = useMemo(() => routes.map(r => ({ value: r.id, label: r.display_name || r.code })), [routes]);
  const stopOptions = useMemo(() => stops.map(s => ({ value: s.id, label: s.name })), [stops]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '2rem', 
        borderRadius: '12px', 
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Book Your Bus</h2>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Select your route, stop, and preferred time</p>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Route
            </label>
            <select 
              value={selectedRoute} 
              onChange={(e) => setSelectedRoute(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem',
                background: 'white'
              }}
            >
              <option value="">Select route</option>
              {routeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Stop
            </label>
            <select 
              value={selectedStop} 
              onChange={(e) => setSelectedStop(e.target.value)} 
              disabled={!stops.length}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem',
                background: stops.length ? 'white' : '#f9fafb',
                color: stops.length ? '#374151' : '#9ca3af'
              }}
            >
              <option value="">Select stop</option>
              {stopOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Date
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
            <input 
              type="checkbox" 
              checked={autoBook} 
              onChange={(e) => setAutoBook(e.target.checked)}
              style={{ marginRight: '0.5rem', transform: 'scale(1.2)' }}
            />
            <label style={{ fontWeight: '600', color: '#374151' }}>
              Auto-book (allow soft overbooking)
            </label>
          </div>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          background: messageType === 'success' ? '#d1fae5' : '#fee2e2',
          color: messageType === 'success' ? '#065f46' : '#dc2626',
          border: `1px solid ${messageType === 'success' ? '#a7f3d0' : '#fecaca'}`
        }}>
          {message}
        </div>
      )}

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#374151' }}>
          Available Schedules
        </h3>
        
        {!schedules.length && selectedRoute && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#6b7280',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>No schedules found for the selected route and date.</p>
          </div>
        )}
        
        {!selectedRoute && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#6b7280',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>Please select a route to view available schedules.</p>
          </div>
        )}
        
        {schedules.map(s => (
          <div key={s.id} style={{ 
            border: '2px solid #e5e7eb', 
            padding: '1.5rem', 
            marginBottom: '1rem', 
            borderRadius: '12px',
            background: 'white',
            transition: 'all 0.2s ease',
            ':hover': { borderColor: '#667eea' }
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem' }}>
                  {s.departure_time}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  Bus: {s.bus_number || `#${s.bus_id}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151' }}>
                  {s.booked_count} / {s.capacity}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  {s.booked_count >= s.capacity ? 'Full' : `${s.capacity - s.booked_count} seats available`}
                </div>
              </div>
            </div>
            
            {s.soft_overbook && (
              <div style={{ 
                background: '#fef3c7', 
                color: '#92400e', 
                padding: '0.5rem', 
                borderRadius: '6px', 
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                ⚠️ Soft overbooking enabled (up to {s.capacity + 5} passengers)
              </div>
            )}
            
            <button 
              disabled={!selectedStop || loading || s.booked_count >= s.capacity + (autoBook ? 5 : 0)}
              onClick={() => book(s.id)}
              style={{
                background: !selectedStop || loading || s.booked_count >= s.capacity + (autoBook ? 5 : 0) 
                  ? '#e5e7eb' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: !selectedStop || loading || s.booked_count >= s.capacity + (autoBook ? 5 : 0) 
                  ? '#9ca3af' 
                  : 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: !selectedStop || loading || s.booked_count >= s.capacity + (autoBook ? 5 : 0) 
                  ? 'not-allowed' 
                  : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Booking...' : 
               !selectedStop ? 'Select a stop first' :
               s.booked_count >= s.capacity + (autoBook ? 5 : 0) ? 'Fully booked' : 'Book Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

