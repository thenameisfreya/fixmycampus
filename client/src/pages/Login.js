import React, { useState, useContext, useEffect, useRef } from 'react';
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
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.3 ? '0, 255, 135' : '220, 30, 60'
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ', 0.8)';
        ctx.fill();

        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(' + p.color + ', 0.5)';
      });

      ctx.shadowBlur = 0;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(0, 255, 135, ' + opacity + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

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

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #020c08 0%, #050505 40%, #080c08 70%, #020808 100%)'
    }}>

      <canvas ref={canvasRef} style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1
      }} />

      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(220, 30, 60, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(0, 255, 135, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '48px',
        background: 'rgba(5, 12, 8, 0.82)',
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