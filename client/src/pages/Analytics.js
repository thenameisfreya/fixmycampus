import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getIssues } from '../services/api';

const Analytics = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const NAV = [
    { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/facilities' },
    { icon:'ti-list-check',       label:'All Issues',   path:'/allissues' },
    { icon:'ti-map-pin',          label:'Campus Map',   path:'/campusmap' },
    { icon:'ti-chart-bar',        label:'Analytics',    path:'/analytics' },
    { icon:'ti-bell',             label:'Notifications', path:'/notifications' },
    { icon:'ti-help',             label:'Help',         path:'/facilitieshelp' },
];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let id;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const cols = [
      {r:99,g:102,b:241},{r:0,g:184,b:94},{r:245,g:158,b:11},
      {r:59,g:130,b:246},{r:139,g:92,b:246},{r:16,g:185,b:129}
    ];
    const pts = Array.from({length:70}, () => {
      const c = cols[Math.floor(Math.random()*cols.length)];
      return { x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-.5)*.6, vy:(Math.random()-.5)*.6, r:Math.random()*1.8+.4, c, pulse:Math.random()*Math.PI*2 };
    });
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => {
        p.pulse+=.03; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>canvas.width) p.vx*=-1;
        if(p.y<0||p.y>canvas.height) p.vy*=-1;
        const s=p.r+Math.sin(p.pulse)*.4;
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,s*4);
        g.addColorStop(0,`rgba(${p.c.r},${p.c.g},${p.c.b},0.18)`);
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,s*4,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,s,0,Math.PI*2);
        ctx.fillStyle=`rgba(${p.c.r},${p.c.g},${p.c.b},0.5)`; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<110){
          const a=(1-d/110)*.09;
          const r=Math.floor((pts[i].c.r+pts[j].c.r)/2);
          const g=Math.floor((pts[i].c.g+pts[j].c.g)/2);
          const b=Math.floor((pts[i].c.b+pts[j].c.b)/2);
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(${r},${g},${b},${a})`; ctx.lineWidth=.5; ctx.stroke();
        }
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize',resize); };
  }, []);

  useEffect(() => {
    getIssues()
      .then(res => setIssues(res.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const last6 = Array.from({length:6}, (_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    return { label: MONTHS[d.getMonth()], month: d.getMonth(), year: d.getFullYear() };
  });

  const issuesByMonth = last6.map(m => ({
    ...m,
    count: issues.filter(i => {
      const d = new Date(i.createdAt);
      return d.getMonth() === m.month && d.getFullYear() === m.year;
    }).length
  }));

  const maxMonth = Math.max(...issuesByMonth.map(m => m.count), 1);

  const CATEGORIES = ['Electrical','Plumbing','Heating','IT Equipment','Structural','Lighting','Cleaning','Other'];
  const categoryData = CATEGORIES.map(cat => ({
    label: cat,
    count: issues.filter(i => i.category === cat).length
  })).filter(c => c.count > 0).sort((a,b) => b.count - a.count);
  const maxCat = Math.max(...categoryData.map(c => c.count), 1);

  const resolved = issues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;
  const resolutionPct = issues.length > 0 ? Math.round((resolved / issues.length) * 100) : 0;
  const circumference = 239;
  const offset = circumference - (resolutionPct / 100) * circumference;

  const urgentCount = issues.filter(i => i.priority === 'Urgent').length;
  const highCount = issues.filter(i => i.priority === 'High').length;
  const medCount = issues.filter(i => i.priority === 'Medium').length;
  const lowCount = issues.filter(i => i.priority === 'Low').length;

  const thisMonth = issues.filter(i => {
    const d = new Date(i.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthResolved = thisMonth.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;
  const peakMonth = issuesByMonth.reduce((a,b) => a.count > b.count ? a : b, issuesByMonth[0]);

  const PRIORITY_ROWS = [
    { label:'Urgent', count:urgentCount, color:'#f87171', bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.18)' },
    { label:'High',   count:highCount,   color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.18)' },
    { label:'Medium', count:medCount,    color:'#60a5fa', bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.18)' },
    { label:'Low',    count:lowCount,    color:'#00e87a', bg:'rgba(0,232,122,0.08)',  border:'rgba(0,232,122,0.15)' },
  ];

  const card = {
    background:'rgba(255,255,255,0.85)',
    backdropFilter:'blur(12px)',
    border:'1px solid rgba(255,255,255,0.9)',
    borderRadius:'14px',
    padding:'18px 20px',
    boxShadow:'0 2px 12px rgba(0,0,0,0.05)'
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f6f8', fontFamily:"'Segoe UI',sans-serif" }}>
      <p style={{ color:'#9ca3af', fontSize:'14px' }}>Loading analytics...</p>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'Segoe UI',sans-serif", background:'#f5f6f8', position:'relative' }}>
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none' }} />

      <div style={{ width:'200px', background:'#1a1a2e', display:'flex', flexDirection:'column', padding:'20px 0', flexShrink:0, zIndex:10, position:'relative' }}>
        <div style={{ padding:'0 16px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
            <div style={{ width:'30px', height:'30px', background:'linear-gradient(135deg,#00e87a,#00b85e)', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 10px rgba(0,232,122,0.3)' }}>
              <span style={{ color:'#1a1a2e', fontWeight:'900', fontSize:'13px' }}>R</span>
            </div>
            <span style={{ color:'#fff', fontWeight:'700', fontSize:'13px', letterSpacing:'2px' }}>REFICERE</span>
          </div>
          <div style={{ padding:'4px 10px', background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:'6px', display:'inline-flex', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#fbbf24' }} />
            <span style={{ color:'#fbbf24', fontSize:'10px', fontWeight:'600', letterSpacing:'1px' }}>FACILITIES TEAM</span>
          </div>
        </div>

        {NAV.map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)}
            style={{ padding:'9px 16px', margin:'0 8px 3px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', background:item.active?'rgba(0,232,122,0.12)':'transparent', border:item.active?'1px solid rgba(0,232,122,0.25)':'1px solid transparent', transition:'all 0.2s ease' }}
            onMouseEnter={e => { if(!item.active) e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if(!item.active) e.currentTarget.style.background='transparent'; }}
          >
            <i className={'ti '+item.icon} style={{ fontSize:'16px', color:item.active?'#00e87a':'rgba(255,255,255,0.35)' }} aria-hidden="true" />
            <span style={{ fontSize:'12px', color:item.active?'#00e87a':'rgba(255,255,255,0.35)', fontWeight:item.active?'600':'400' }}>{item.label}</span>
          </div>
        ))}

        <div style={{ marginTop:'auto', padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fbbf24', flexShrink:0 }}>
              {user && user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'#fff', fontSize:'11px', fontWeight:'500', margin:0 }}>{user && user.name.split(' ')[0]}</p>
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'10px', margin:0 }}>{user && user.role}</p>
            </div>
            <i className="ti ti-logout"
              onClick={() => { logout(); navigate('/login'); }}
              style={{ fontSize:'15px', color:'rgba(255,255,255,0.25)', cursor:'pointer', transition:'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='#fff'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:5, overflowY:'auto' }}>

        <div style={{ background:'linear-gradient(135deg,#1a1a2e,#1e3a2e)', padding:'28px 32px', flexShrink:0 }}>
          <p style={{ color:'rgba(0,232,122,0.6)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', margin:'0 0 6px', fontWeight:'600' }}>St Mary's University · Facilities Analytics</p>
          <h1 style={{ color:'#fff', fontSize:'22px', fontWeight:'700', margin:0, letterSpacing:'-0.4px' }}>Performance Overview</h1>
        </div>

        <div style={{ flex:1, display:'flex' }}>

          <div style={{ flex:1, padding:'24px 22px', display:'flex', flexDirection:'column', gap:'16px' }}>

            <div style={card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
                <p style={{ color:'#374151', fontSize:'13px', fontWeight:'700', margin:0 }}>Issues over time</p>
                <span style={{ color:'#9ca3af', fontSize:'11px' }}>Last 6 months</span>
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', height:'120px', gap:'10px', padding:'0 4px' }}>
                {issuesByMonth.map((m, i) => {
                  const isLast = i === issuesByMonth.length - 1;
                  const isPeak = m.count === maxMonth && m.count > 0;
                  const heightPct = maxMonth > 0 ? Math.max((m.count / maxMonth) * 100, m.count > 0 ? 8 : 0) : 0;
                  return (
                    <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', gap:'5px', flex:1, height:'100%' }}>
                      <span style={{ color:isPeak?'#1a1a2e':'#6b7280', fontSize:'10px', fontWeight:isPeak?'700':'600' }}>{m.count}</span>
                      <div style={{ width:'100%', height:heightPct+'%', background:isLast?'#1c2e22':isPeak?'#6b7280':'#d1d5db', borderRadius:'6px', transition:'all 0.3s ease', minHeight:m.count>0?'8px':'0' }} />
                      <span style={{ color:isLast?'#111827':'#9ca3af', fontSize:'10px', fontWeight:isLast?'600':'400' }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
              {peakMonth && peakMonth.count > 0 && (
                <p style={{ color:'#9ca3af', fontSize:'11px', margin:'12px 0 0', textAlign:'center' }}>
                  {peakMonth.label} had the highest number of reports this period
                </p>
              )}
            </div>

            <div style={card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <p style={{ color:'#374151', fontSize:'13px', fontWeight:'700', margin:0 }}>Issues by category</p>
                <span style={{ color:'#9ca3af', fontSize:'11px' }}>{issues.length} total</span>
              </div>
              {categoryData.length === 0 ? (
                <p style={{ color:'#9ca3af', fontSize:'13px', textAlign:'center', padding:'20px 0' }}>No data yet</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  {categoryData.map((cat, i) => {
                    const pct = issues.length > 0 ? Math.round((cat.count / issues.length) * 100) : 0;
                    const barW = Math.max((cat.count / maxCat) * 100, 4);
                    return (
                      <div key={i}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                          <span style={{ color:'#374151', fontSize:'12px', fontWeight:'500' }}>{cat.label}</span>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                            <span style={{ color:'#9ca3af', fontSize:'11px' }}>{pct}%</span>
                            <span style={{ color:'#374151', fontSize:'12px', fontWeight:'700', minWidth:'16px', textAlign:'right' }}>{cat.count}</span>
                          </div>
                        </div>
                        <div style={{ height:'8px', background:'#f3f4f6', borderRadius:'6px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:barW+'%', background:'#d1d5db', borderRadius:'6px', transition:'width 0.5s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ width:'230px', background:'#1c2e22', padding:'24px 20px', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto' }}>

            <div style={{ marginBottom:'22px' }}>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'9px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 14px', fontWeight:'600' }}>Resolution rate</p>
              <div style={{ position:'relative', width:'100px', height:'100px', margin:'0 auto 12px' }}>
                <svg viewBox="0 0 100 100" width="100" height="100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#00e87a" strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'#fff', fontSize:'20px', fontWeight:'800', lineHeight:1 }}>{resolutionPct}%</span>
                  <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'9px', marginTop:'3px', letterSpacing:'0.5px' }}>resolved</span>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-around' }}>
                <div style={{ textAlign:'center' }}>
                  <p style={{ color:'#00e87a', fontSize:'18px', fontWeight:'800', margin:0, letterSpacing:'-0.5px' }}>{resolved}</p>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'9px', margin:0, textTransform:'uppercase', letterSpacing:'0.5px' }}>Done</p>
                </div>
                <div style={{ width:'1px', background:'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign:'center' }}>
                  <p style={{ color:'#f59e0b', fontSize:'18px', fontWeight:'800', margin:0, letterSpacing:'-0.5px' }}>{issues.length - resolved}</p>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'9px', margin:0, textTransform:'uppercase', letterSpacing:'0.5px' }}>Open</p>
                </div>
              </div>
            </div>

            <div style={{ height:'1px', background:'rgba(255,255,255,0.07)', marginBottom:'22px' }} />

            <div style={{ marginBottom:'22px' }}>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'9px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 12px', fontWeight:'600' }}>Priority breakdown</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                {PRIORITY_ROWS.map((p, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'9px', padding:'9px 11px', background:p.bg, borderRadius:'9px', border:'1px solid '+p.border }}>
                    <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:p.color, display:'inline-block', flexShrink:0 }} />
                    <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'12px', flex:1 }}>{p.label}</span>
                    <span style={{ color:p.color, fontSize:'14px', fontWeight:'800' }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height:'1px', background:'rgba(255,255,255,0.07)', marginBottom:'22px' }} />

            <div style={{ marginBottom:'22px' }}>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'9px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 10px', fontWeight:'600' }}>Avg response time</p>
              <p style={{ color:'#fbbf24', fontSize:'28px', fontWeight:'800', margin:'0 0 3px', letterSpacing:'-1px' }}>
                2.4 <span style={{ fontSize:'14px', fontWeight:'500', color:'rgba(255,255,255,0.4)' }}>days</span>
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#00e87a', display:'inline-block' }} />
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'10px', margin:0 }}>Target under 5 days, on track</p>
              </div>
            </div>

            <div style={{ height:'1px', background:'rgba(255,255,255,0.07)', marginBottom:'22px' }} />

            <div>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'9px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 10px', fontWeight:'600' }}>This month</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'9px', padding:'10px', textAlign:'center' }}>
                  <p style={{ color:'#fff', fontSize:'18px', fontWeight:'800', margin:0, letterSpacing:'-0.5px' }}>{thisMonth.length}</p>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'9px', margin:'2px 0 0', textTransform:'uppercase', letterSpacing:'0.5px' }}>Submitted</p>
                </div>
                <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'9px', padding:'10px', textAlign:'center' }}>
                  <p style={{ color:'#00e87a', fontSize:'18px', fontWeight:'800', margin:0, letterSpacing:'-0.5px' }}>{thisMonthResolved}</p>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'9px', margin:'2px 0 0', textTransform:'uppercase', letterSpacing:'0.5px' }}>Resolved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;