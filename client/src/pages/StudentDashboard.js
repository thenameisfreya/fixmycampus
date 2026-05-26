import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getIssues } from '../services/api';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('All');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const colors = [
      { r:99,  g:102, b:241 },
      { r:0,   g:184, b:94  },
      { r:245, g:158, b:11  },
      { r:59,  g:130, b:246 },
      { r:139, g:92,  b:246 },
      { r:16,  g:185, b:129 }
    ];
    const particles = [];
    for (let i = 0; i < 120; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        r: Math.random() * 2.5 + 0.8,
        col,
        pulse: Math.random() * Math.PI * 2
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.pulse += 0.04;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        const pSize = p.r + Math.sin(p.pulse) * 0.5;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pSize * 4);
        glow.addColorStop(0, `rgba(${p.col.r},${p.col.g},${p.col.b},0.3)`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pSize * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, p.y, pSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.col.r},${p.col.g},${p.col.b},0.85)`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            const alpha = (1 - d / 100) * 0.4;
            const r = Math.floor((particles[i].col.r + particles[j].col.r) / 2);
            const g = Math.floor((particles[i].col.g + particles[j].col.g) / 2);
            const b = Math.floor((particles[i].col.b + particles[j].col.b) / 2);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = 0.8;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getIssues();
        setIssues(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const newCount = issues.filter(i => i.status === 'New').length;
  const inProgressCount = issues.filter(i => i.status === 'In Progress').length;
  const resolvedCount = issues.filter(i => i.status === 'Resolved').length;
  const highCount = issues.filter(i => i.priority === 'High' || i.priority === 'Urgent').length;
  const medCount = issues.filter(i => i.priority === 'Medium').length;
  const lowCount = issues.filter(i => i.priority === 'Low').length;

  const filteredIssues = filter === 'All'
    ? issues
    : issues.filter(i => i.status === filter);

  const getCategoryIcon = (category) => {
    if (category === 'Electrical') return 'ti-bolt';
    if (category === 'Plumbing') return 'ti-tool';
    if (category === 'Heating') return 'ti-temperature';
    if (category === 'IT Equipment') return 'ti-device-desktop';
    if (category === 'Structural') return 'ti-building';
    if (category === 'Lighting') return 'ti-bulb';
    if (category === 'Cleaning') return 'ti-wash';
    return 'ti-tool';
  };

  const getCategoryColors = (status) => {
    if (status === 'New') return { bg:'#ede9fe', color:'#7c3aed' };
    if (status === 'In Progress') return { bg:'#fef3c7', color:'#d97706' };
    if (status === 'Awaiting Parts') return { bg:'#ffedd5', color:'#c2410c' };
    if (status === 'Resolved') return { bg:'#d1fae5', color:'#065f46' };
    return { bg:'#f3f4f6', color:'#6b7280' };
  };

  const getBadgeStyle = (status) => {
    const map = {
      'New':            { background:'#ede9fe', color:'#7c3aed' },
      'In Progress':    { background:'#fef3c7', color:'#d97706' },
      'Awaiting Parts': { background:'#ffedd5', color:'#c2410c' },
      'Resolved':       { background:'#d1fae5', color:'#065f46' },
      'Closed':         { background:'#f3f4f6', color:'#6b7280' }
    };
    return map[status] || { background:'#f3f4f6', color:'#6b7280' };
  };

  const resolutionPct = issues.length > 0
    ? Math.round((resolvedCount / issues.length) * 100)
    : 0;
  const circumference = 163;
  const offset = circumference - (resolutionPct / 100) * circumference;
  const filters = ['All', 'New', 'In Progress', 'Awaiting Parts', 'Resolved'];

  const NAV = [
    { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/dashboard',        active:true },
    { icon:'ti-plus',             label:'Report Issue',  path:'/submit' },
    { icon:'ti-list-check',       label:'My Reports',   path:'/myreports',        badge: issues.length },
    { icon:'ti-bell',             label:'Notifications', path:'/notifications' },
    { icon:'ti-chart-bar',        label:'Analytics',    path:'/studentanalytics' },
    { icon:'ti-help',             label:'Help',         path:'/help' },
];
  const sidebarWidth = collapsed ? '52px' : '200px';

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'Segoe UI',sans-serif", background:'#eef0f5', position:'relative' }}>
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none' }} />

      <div style={{ width:sidebarWidth, background:'#1a1a2e', display:'flex', flexDirection:'column', padding:'20px 0', flexShrink:0, zIndex:10, position:'fixed', top:0, left:0, bottom:0, transition:'width 0.3s ease', overflow:'hidden' }}>
        <div style={{ padding:'0 12px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', overflow:'hidden', flex:1, minWidth:0 }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 10px rgba(0,232,122,0.3)', flexShrink:0 }}>
              <span style={{ color:'#1a1a2e', fontWeight:'900', fontSize:'12px' }}>R</span>
            </div>
            <span style={{ color:'#fff', fontWeight:'700', fontSize:'12px', letterSpacing:'2px', whiteSpace:'nowrap', opacity: collapsed ? 0 : 1, transition:'opacity 0.2s' }}>REFICERE</span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'6px', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, marginLeft:'4px' }}
          >
            <i className="ti ti-chevron-left" style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.3s', display:'block' }} aria-hidden="true" />
          </button>
        </div>

        {NAV.map((item, index) => (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            title={collapsed ? item.label : ''}
            style={{ padding:'9px 12px', margin:'0 6px 3px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', background:item.active?'rgba(0,232,122,0.12)':'transparent', border:item.active?'1px solid rgba(0,232,122,0.25)':'1px solid transparent', transition:'all 0.2s ease', minWidth:0 }}
            onMouseEnter={e => { if(!item.active) e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if(!item.active) e.currentTarget.style.background='transparent'; }}
          >
            <i className={'ti '+item.icon} style={{ fontSize:'16px', color:item.active?'#00e87a':'rgba(255,255,255,0.35)', flexShrink:0 }} aria-hidden="true" />
            <span style={{ fontSize:'12px', color:item.active?'#00e87a':'rgba(255,255,255,0.35)', fontWeight:item.active?'600':'400', whiteSpace:'nowrap', opacity: collapsed ? 0 : 1, transition:'opacity 0.15s', overflow:'hidden' }}>
              {item.label}
            </span>
            {item.badge > 0 && !collapsed && (
              <span style={{ marginLeft:'auto', background:'#00e87a', color:'#1a1a2e', borderRadius:'10px', padding:'1px 6px', fontSize:'9px', fontWeight:'700', whiteSpace:'nowrap' }}>
                {item.badge}
              </span>
            )}
          </div>
        ))}

        <div style={{ marginTop:'auto', padding:'14px 12px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:0 }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#1a1a2e', flexShrink:0 }}>
              {user && user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0, opacity: collapsed ? 0 : 1, transition:'opacity 0.15s' }}>
              <p style={{ color:'#fff', fontSize:'11px', fontWeight:'500', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user && user.name.split(' ')[0]}
              </p>
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'10px', margin:0 }}>
                {user && user.role}
              </p>
            </div>
            {!collapsed && (
              <i
                className="ti ti-logout"
                onClick={() => { logout(); navigate('/login'); }}
                style={{ fontSize:'14px', color:'rgba(255,255,255,0.25)', cursor:'pointer', transition:'color 0.2s', flexShrink:0 }}
                onMouseEnter={e => e.currentTarget.style.color='#fff'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>

      <div style={{ flex:1, marginLeft:sidebarWidth, position:'relative', zIndex:5, transition:'margin-left 0.3s ease' }}>

        <div style={{ background:'#1a1a2e', padding:'22px 28px', borderBottom:'1px solid rgba(0,232,122,0.25)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:'linear-gradient(90deg,transparent,#00e87a,#00b85e,transparent)' }} />
          <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(0,232,122,0.05)' }} />
          <div style={{ position:'absolute', top:'10px', right:'100px', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(0,232,122,0.04)' }} />
          <p style={{ color:'rgba(0,232,122,0.55)', fontSize:'10px', letterSpacing:'2.5px', textTransform:'uppercase', margin:'0 0 5px', fontWeight:'600', position:'relative' }}>
            St Mary's University, Twickenham
          </p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative' }}>
            <div>
              <h1 style={{ color:'#fff', fontSize:'22px', fontWeight:'700', margin:'0 0 4px', letterSpacing:'-0.5px' }}>
                {greeting}, {user && user.name.split(' ')[0]}
              </h1>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'12px', margin:0 }}>
                {issues.length === 0
                  ? 'No reports submitted yet'
                  : `You have ${newCount > 0 ? newCount + ' new update' + (newCount > 1 ? 's' : '') : 'no new updates'} and ${inProgressCount} issue${inProgressCount !== 1 ? 's' : ''} in progress`
                }
              </p>
            </div>
            <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
              <button
                onClick={() => navigate('/submit')}
                style={{ padding:'10px 20px', background:'#00e87a', border:'none', borderRadius:'12px', color:'#1a1a2e', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', transition:'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,232,122,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
              >
                <i className="ti ti-plus" style={{ fontSize:'14px' }} aria-hidden="true" />
                Report Issue
              </button>
              <div
                onClick={() => navigate('/notifications')}
                style={{ width:'38px', height:'38px', borderRadius:'10px', background:'rgba(0,232,122,0.1)', border:'1px solid rgba(0,232,122,0.25)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(0,232,122,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(0,232,122,0.1)'}
              >
                <i className="ti ti-bell" style={{ fontSize:'18px', color:'rgba(255,255,255,0.8)' }} aria-hidden="true" />
                {newCount > 0 && (
                  <span style={{ position:'absolute', top:'-2px', right:'-2px', width:'9px', height:'9px', background:'#00e87a', borderRadius:'50%', border:'2px solid #1a1a2e' }} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:'24px 28px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
            {[
              { label:'Total Reports', value:issues.length, icon:'ti-files', borderColor:'#4f46e5', iconColor:'#4f46e5', labelColor:'#4f46e5', badge:'ALL', badgeBg:'#eef2ff' },
              { label:'New', value:newCount, icon:'ti-circle-plus', borderColor:'#2563eb', iconColor:'#2563eb', labelColor:'#2563eb', badge:'NEW', badgeBg:'#dbeafe' },
              { label:'In Progress', value:inProgressCount, icon:'ti-loader', borderColor:'#d97706', iconColor:'#d97706', labelColor:'#d97706', badge:'WIP', badgeBg:'#fef3c7' },
              { label:'Resolved', value:resolvedCount, icon:'ti-circle-check', borderColor:'#059669', iconColor:'#059669', labelColor:'#059669', badge:'DONE', badgeBg:'#d1fae5' }
            ].map((card, index) => (
              <div key={index}
                style={{ background:'#fff', borderRadius:'16px', padding:'16px', borderTop:'3px solid '+card.borderColor, boxShadow:'0 2px 10px rgba(0,0,0,0.06)', transition:'transform 0.2s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <i className={'ti '+card.icon} style={{ fontSize:'20px', color:card.iconColor }} aria-hidden="true" />
                  <span style={{ fontSize:'9px', color:card.iconColor, fontWeight:'700', background:card.badgeBg, padding:'2px 7px', borderRadius:'20px' }}>
                    {card.badge}
                  </span>
                </div>
                <p style={{ color:'#1a1a2e', fontSize:'32px', fontWeight:'800', margin:'0 0 3px', lineHeight:1, letterSpacing:'-1px' }}>{card.value}</p>
                <p style={{ color:card.labelColor, fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', fontWeight:'600', margin:0 }}>{card.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 200px', gap:'16px' }}>
            <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'18px', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid rgba(255,255,255,0.9)' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(0,0,0,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h2 style={{ color:'#1a1a2e', fontSize:'14px', fontWeight:'700', margin:0 }}>My Reports</h2>
                <div style={{ display:'flex', gap:'6px' }}>
                  {filters.map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      style={{ padding:'4px 10px', borderRadius:'20px', border:'none', background:filter===f?'#1a1a2e':'rgba(0,0,0,0.06)', color:filter===f?'#fff':'#6b7280', fontSize:'10px', fontWeight:filter===f?'600':'400', cursor:'pointer', transition:'all 0.2s ease' }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {filteredIssues.length === 0 ? (
                <div style={{ padding:'50px 20px', textAlign:'center' }}>
                  <i className="ti ti-clipboard" style={{ fontSize:'32px', color:'#d1d5db', display:'block', marginBottom:'12px' }} aria-hidden="true" />
                  <p style={{ color:'#9ca3af', fontSize:'13px', margin:'0 0 16px' }}>
                    {filter === 'All' ? 'No reports submitted yet' : 'No reports with status: '+filter}
                  </p>
                  {filter === 'All' && (
                    <button onClick={() => navigate('/submit')}
                      style={{ padding:'10px 20px', background:'#f3f4f6', border:'none', borderRadius:'10px', color:'#374151', fontSize:'12px', cursor:'pointer', fontWeight:'600' }}
                    >
                      Submit your first report
                    </button>
                  )}
                </div>
              ) : (
                filteredIssues.map((issue, index) => {
                  const iconName = getCategoryIcon(issue.category);
                  const colors = getCategoryColors(issue.status);
                  const badge = getBadgeStyle(issue.status);
                  return (
                    <div key={issue._id}
                      onClick={() => navigate('/issues/'+issue._id)}
                      style={{ padding:'14px 20px', borderBottom:index<filteredIssues.length-1?'1px solid rgba(0,0,0,0.04)':'none', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    >
                      <div style={{ display:'flex', alignItems:'center', gap:'12px', flex:1, minWidth:0 }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:colors.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <i className={'ti '+iconName} style={{ fontSize:'16px', color:colors.color }} aria-hidden="true" />
                        </div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ color:'#1a1a2e', fontSize:'13px', fontWeight:'600', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {issue.title}
                          </p>
                          <p style={{ color:'#9ca3af', fontSize:'11px', margin:0 }}>
                            {issue.location.building}{issue.location.room?' · Room '+issue.location.room:''} · {issue.category}
                          </p>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                        <span style={{ padding:'4px 10px', borderRadius:'20px', background:badge.background, color:badge.color, fontSize:'10px', fontWeight:'700', letterSpacing:'0.5px' }}>
                          {issue.status}
                        </span>
                        <i className="ti ti-chevron-right" style={{ fontSize:'14px', color:'#d1d5db' }} aria-hidden="true" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'18px', padding:'18px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid rgba(255,255,255,0.9)', textAlign:'center' }}>
                <p style={{ color:'#9ca3af', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 14px', fontWeight:'600' }}>Resolution Rate</p>
                <div style={{ position:'relative', width:'80px', height:'80px', margin:'0 auto 12px' }}>
                  <svg viewBox="0 0 80 80" width="80" height="80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#f3f4f6" strokeWidth="7" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="url(#greenGrad)" strokeWidth="7"
                      strokeDasharray={circumference} strokeDashoffset={offset}
                      strokeLinecap="round" transform="rotate(-90 40 40)"
                    />
                    <defs>
                      <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00e87a" />
                        <stop offset="100%" stopColor="#00b85e" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:'#1a1a2e', fontSize:'16px', fontWeight:'800' }}>{resolutionPct}%</span>
                  </div>
                </div>
                <p style={{ color:'#9ca3af', fontSize:'10px', margin:0 }}>{resolvedCount} of {issues.length} resolved</p>
              </div>

              <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'18px', padding:'16px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid rgba(255,255,255,0.9)' }}>
                <p style={{ color:'#9ca3af', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 12px', fontWeight:'600' }}>Priority</p>
                {[
                  { label:'High', value:highCount, color:'#ef4444', bg:'#fee2e2' },
                  { label:'Medium', value:medCount, color:'#f59e0b', bg:'#fef3c7' },
                  { label:'Low', value:lowCount, color:'#10b981', bg:'#d1fae5' }
                ].map((p, i) => (
                  <div key={i} style={{ marginBottom:i<2?'10px':0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ color:'#6b7280', fontSize:'10px' }}>{p.label}</span>
                      <span style={{ color:p.color, fontSize:'10px', fontWeight:'700' }}>{p.value}</span>
                    </div>
                    <div style={{ height:'4px', background:p.bg, borderRadius:'4px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:issues.length>0?((p.value/issues.length)*100)+'%':'0%', background:p.color, borderRadius:'4px', transition:'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'18px', padding:'16px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', border:'1px solid rgba(255,255,255,0.9)' }}>
                <p style={{ color:'#9ca3af', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 10px', fontWeight:'600' }}>Quick Actions</p>
                <button onClick={() => navigate('/submit')}
                  style={{ width:'100%', padding:'9px', background:'linear-gradient(135deg,#00e87a,#00b85e)', border:'none', borderRadius:'10px', color:'#1a1a2e', fontSize:'11px', fontWeight:'700', cursor:'pointer', marginBottom:'8px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', transition:'all 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}
                >
                  <i className="ti ti-plus" style={{ fontSize:'13px' }} aria-hidden="true" />
                  New Report
                </button>
                <button onClick={() => { logout(); navigate('/login'); }}
                  style={{ width:'100%', padding:'9px', background:'rgba(0,0,0,0.05)', border:'none', borderRadius:'10px', color:'#374151', fontSize:'11px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', transition:'all 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(0,0,0,0.05)'}
                >
                  <i className="ti ti-logout" style={{ fontSize:'13px' }} aria-hidden="true" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;