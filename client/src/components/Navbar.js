import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUnreadCount } from '../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const isFacilities = user && ['facilities', 'staff', 'admin'].includes(user.role);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: scrolled ? '12px 40px' : '20px 40px',
      background: scrolled ? 'rgba(10, 35, 24, 0.98)' : 'transparent',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0, 255, 135, 0.1)' : 'none',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>

      <div
        onClick={() => navigate('/dashboard')}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          background: '#00ff87',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: '#080808', fontWeight: '900', fontSize: '16px' }}>R</span>
        </div>
        <span style={{
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '18px',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          Reficere
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px'
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: isActive('/dashboard') ? '#00ff87' : '#a0a0a0',
            fontSize: '14px',
            cursor: 'pointer',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontWeight: isActive('/dashboard') ? '600' : '400',
            transition: 'color 0.3s ease',
            borderBottom: isActive('/dashboard') ? '1px solid #00ff87' : 'none',
            paddingBottom: '2px'
          }}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate('/submit')}
          style={{
            background: 'none',
            border: 'none',
            color: isActive('/submit') ? '#00ff87' : '#a0a0a0',
            fontSize: '14px',
            cursor: 'pointer',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontWeight: isActive('/submit') ? '600' : '400',
            transition: 'color 0.3s ease',
            borderBottom: isActive('/submit') ? '1px solid #00ff87' : 'none',
            paddingBottom: '2px'
          }}
        >
          Report Issue
        </button>

        {isFacilities && (
          <button
            onClick={() => navigate('/facilities')}
            style={{
              background: 'none',
              border: 'none',
              color: isActive('/facilities') ? '#00ff87' : '#a0a0a0',
              fontSize: '14px',
              cursor: 'pointer',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: isActive('/facilities') ? '600' : '400',
              transition: 'color 0.3s ease',
              borderBottom: isActive('/facilities') ? '1px solid #00ff87' : 'none',
              paddingBottom: '2px'
            }}
          >
            Facilities
          </button>
        )}

        {isFacilities && (
          <button
            onClick={() => navigate('/analytics')}
            style={{
              background: 'none',
              border: 'none',
              color: isActive('/analytics') ? '#00ff87' : '#a0a0a0',
              fontSize: '14px',
              cursor: 'pointer',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              fontWeight: isActive('/analytics') ? '600' : '400',
              transition: 'color 0.3s ease',
              borderBottom: isActive('/analytics') ? '1px solid #00ff87' : 'none',
              paddingBottom: '2px'
            }}
          >
            Analytics
          </button>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            padding: '4px'
          }}
        >
          <span style={{ fontSize: '20px' }}>🔔</span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: '#00ff87',
              color: '#080808',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              fontSize: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            color: '#a0a0a0',
            fontSize: '13px'
          }}>
            {user && user.name}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0, 255, 135, 0.3)',
              color: '#00ff87',
              padding: '8px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => {
              e.target.style.background = '#00ff87';
              e.target.style.color = '#080808';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#00ff87';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};