import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import DriverPage from './pages/DriverPage.jsx';
import Chatbot from './Chatbot.jsx';

function useSession() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('cbbs_user');
    return raw ? JSON.parse(raw) : null;
  });
  
  useEffect(() => {
    if (user) {
      localStorage.setItem('cbbs_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cbbs_user');
    }
  }, [user]);
  
  const setUserWithLogging = (newUser) => {
    console.log('Setting user:', newUser);
    setUser(newUser);
  };
  
  return { user, setUser: setUserWithLogging };
}

function ProtectedRoute({ children, roles }) {
  const { user } = useSessionContext();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

const SessionContext = React.createContext(null);
function useSessionContext() {
  return React.useContext(SessionContext);
}

function Layout({ children }) {
  const { user, setUser } = useSessionContext();
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🚌 College Bus Booking
            </h1>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/" style={navLinkStyle}>Home</Link>
              {user?.role === 'student' && (
                <Link to="/booking" style={navLinkStyle}>Booking</Link>
              )}
              {user?.role === 'admin' && (
                <>
                  <Link to="/booking" style={navLinkStyle}>Booking</Link>
                  <Link to="/admin" style={navLinkStyle}>Admin</Link>
                </>
              )}
              {user?.role === 'driver' && (
                <Link to="/driver" style={navLinkStyle}>Driver</Link>
              )}
              <Link to="/chatbot" style={navLinkStyle}>Chatbot</Link>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(102, 126, 234, 0.2)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: user.role === 'admin' ? '#f59e0b' : 
                               user.role === 'driver' ? '#10b981' : '#3b82f6'
                  }}></div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>
                    {user.name} ({user.role})
                  </span>
                </div>
                <button 
                  onClick={() => setUser(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}

const navLinkStyle = {
  color: '#374151',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: '500',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  ':hover': {
    background: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea'
  }
};

export default function App() {
  const session = useSession();
  const sessionValue = useMemo(() => session, [session.user]);

  return (
    <SessionContext.Provider value={sessionValue}>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route path="/login" element={<LoginPage onLogin={sessionValue.setUser} />} />
        <Route
          path="/booking"
          element={
            <ProtectedRoute roles={["student", "admin"]}>
              <Layout>
                <BookingPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <ProtectedRoute roles={["driver", "admin"]}>
              <Layout>
                <DriverPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <Layout>
              <Chatbot />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SessionContext.Provider>
  );
}

export { useSessionContext };

