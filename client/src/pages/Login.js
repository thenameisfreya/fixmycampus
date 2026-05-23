import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      login(res.data);
      if (['facilities', 'staff', 'admin'].includes(res.data.role)) {
        navigate('/facilities');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const lightStreaks = [];
  for (let i = 0; i < 60; i++) {
    const rand = Math.random();
    let color;
    if (rand > 0.6) {
      color = '0, 255, 135';
    } else if (rand > 0.3) {
      color = '220, 30, 60';
    } else {
      color = '255, 60, 80';
    }
    lightStreaks.push({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 3 + 1,
      height: Math.random() * 80 + 20,
      color: color,
      opacity: Math.random() * 0.15 + 0.05,
      rotation: Math.random() * 10 - 5
    });
  }

  const buildings = [];
  for (let i = 0; i < 40; i++) {
    const height = Math.random() * 60 + 20;
    const windowCount = Math.floor(Math.random() * 4 + 2);
    const windows = [];
    for (let j = 0; j < windowCount; j++) {
      const isGreen = Math.random() > 0.5;
      const isRed = !isGreen && Math.random() > 0.5;
      windows.push({
        left: Math.random() * 70 + 10,
        top: Math.random() * 70 + 10,
        isGreen: isGreen,
        isRed: isRed,
        opacity: Math.random() * 0.6 + 0.3
      });
    }
    buildings.push({ height, windows, hasLights: Math.random() > 0.3 });
  }

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      overflow: 'hidden'
    }}>

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #050505 0%, #0d0505 25%, #080808 50%, #050d05 75%, #050505 100%)',
        zIndex: 0
      }} />

      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(220, 30, 60, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(0, 255, 135, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        top: '30%',
        left: '30%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(180, 20, 40, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        overflow: 'hidden'
      }}>
        {lightStreaks.map((streak, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: streak.left + '%',
            top: streak.top + '%',
            width: streak.width + 'px',
            height: streak.height + 'px',
            background: 'rgba(' + streak.color + ', ' + streak.opacity + ')',
            borderRadius: '2px',
            transform: 'rotate(' + streak.rotation + 'deg)',
            filter: 'blur(0.5px)'
          }} />
        ))}
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '35%',
        zIndex: 3,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '3px',
        padding: '0 20px'
      }}>
        {buildings.map((building, i) => (
          <div key={i} style={{
            flex: 1,
            height: building.height + '%',
            background: 'linear-gradient(180deg, rgba(15, 8, 8, 0.95) 0%, rgba(8, 5, 5, 0.98) 100%)',
            borderRadius: '2px 2px 0 0',
            position: 'relative',
            border: '1px solid rgba(220, 30, 60, 0.04)',
            borderBottom: 'none'
          }}>
            {building.hasLights && building.windows.map((win, j) => (
              <div key={j} style={{
                position: 'absolute',
                left: win.left + '%',
                top: win.top + '%',
                width: '3px',
                height: '3px',
                background: win.isGreen
                  ? 'rgba(0, 255, 135, ' + win.opacity + ')'
                  : win.isRed
                  ? 'rgba(220, 30, 60, ' + win.opacity + ')'
                  : 'rgba(255, 220, 100, ' + win.opacity + ')',
                borderRadius: '50%',
                boxShadow: win.isGreen
                  ? '0 0 4px rgba(0, 255, 135, 0.8)'
                  : win.isRed
                  ? '0 0 4px rgba(220, 30, 60, 0.8)'
                  : '0 0 4px rgba(255, 220, 100, 0.8)'
              }} />
            ))}
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute',
        bottom: '32%',
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent, rgba(220, 30, 60, 0.2), rgba(0, 255, 135, 0.15), rgba(220, 30, 60, 0.2), transparent)',
        zIndex: 4,
        filter: 'blur(1px)'
      }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(5,5,5,0.4) 0%, transparent 30%, transparent 60%, rgba(5,5,5,0.6) 100%)',
        zIndex: 5
      }} />

      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(220, 30, 60, 0.025)',
        fontSize: '280px',
        fontWeight: '900',
        letterSpacing: '-10px',
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 6,
        whiteSpace: 'nowrap'
      }}>
        REFICERE
      </div>

      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '48px',
        background: 'rgba(8, 10, 8, 0.80)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(0, 255, 135, 0.12)',
        boxShadow: '0 0 60px rgba(0, 255, 135, 0.05), 0 0 120px rgba(220, 30, 60, 0.03), 0 40px 80px rgba(0, 0, 0, 0.7)',
        position: 'relative',
        zIndex: 10
      }}>

        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, #00ff87, #00cc6a)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 20px rgba(0, 255, 135, 0.3)'
          }}>
            <span style={{ color: '#080808', fontWeight: '900', fontSize: '24px' }}>R</span>
          </div>
          <h1 style={{
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            margin: '0 0 6px 0'
          }}>
            Reficere
          </h1>
          <p style={{
            color: 'rgba(160, 160, 160, 0.8)',
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            margin: 0
          }}>
            St Mary's University, Twickenham
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              color: 'rgba(160, 160, 160, 0.7)',
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@stmarys.ac.uk"
              style={{
                width: '100%',
                padding: '13px 16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={e => {
                e.target.style.border = '1px solid rgba(0, 255, 135, 0.4)';
                e.target.style.background = 'rgba(0, 255, 135, 0.04)';
                e.target.style.boxShadow = '0 0 15px rgba(0, 255, 135, 0.05)';
              }}
              onBlur={e => {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: 'rgba(160, 160, 160, 0.7)',
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '13px 16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={e => {
                e.target.style.border = '1px solid rgba(0, 255, 135, 0.4)';
                e.target.style.background = 'rgba(0, 255, 135, 0.04)';
                e.target.style.boxShadow = '0 0 15px rgba(0, 255, 135, 0.05)';
              }}
              onBlur={e => {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 50, 50, 0.08)',
              border: '1px solid rgba(255, 50, 50, 0.2)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              color: '#ff6b6b',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: loading
                ? 'rgba(0, 255, 135, 0.4)'
                : 'linear-gradient(135deg, #00ff87, #00cc6a)',
              border: 'none',
              borderRadius: '10px',
              color: '#080808',
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '20px',
              boxShadow: loading ? 'none' : '0 0 20px rgba(0, 255, 135, 0.2)'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0, 255, 135, 0.3)';
              }
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 0 20px rgba(0, 255, 135, 0.2)';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p style={{
            textAlign: 'center',
            color: 'rgba(160, 160, 160, 0.7)',
            fontSize: '13px',
            margin: 0
          }}>
            No account?{' '}
            <Link to="/register" style={{
              color: '#00ff87',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;