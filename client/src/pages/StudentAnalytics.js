import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getIssues } from '../services/api';

const NAV = [
  { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/dashboard' },
  { icon:'ti-plus',             label:'Report Issue',  path:'/submit' },
  { icon:'ti-list-check',       label:'My Reports',   path:'/myreports' },
  { icon:'ti-bell',             label:'Notifications', path:'/notifications' },
  { icon:'ti-chart-bar',        label:'Analytics',    path:'/studentanalytics', active:true },
  { icon:'ti-help',             label:'Help',         path:'/help' },
];

const CATEGORIES = ['Electrical','Plumbing','Heating','IT Equipment','Structural','Lighting','Cleaning','Other'];

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + ' days ago';
  return Math.floor(diff/604800) + ' weeks ago';
};

const STATUS_BADGE = {
  'New':            { background:'#ede9fe', color:'#7c3aed' },
  'In Progress':    { background:'#fef3c7', color:'#d97706' },
  'Awaiting Parts': { background:'#ffedd5', color:'#c2410c' },
  'Resolved':       { background:'#d1fae5', color:'#065f46' },
  'Closed':         { background:'#f3f4f6', color:'#6b7280' },
};

const StudentAnalytics = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? '52px' : '200px';

  useEffect(() => {
    getIssues().then(res => setIssues(res.data)).catch(console.log);
  }, []);

  const resolved = issues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;
  const resolutionPct = issues.length > 0 ? Math.round((resolved / issues.length) * 100) : 0;
  const circumference = 201;
  const offset = circumference - (resolutionPct / 100) * circumference;

  const categoryData = CATEGORIES.map(cat => ({
    label: cat,
    count: issues.filter(i => i.category === cat).length
  })).filter(c => c.count > 0).sort((a,b) => b.count - a.count);

  const maxCat = Math.max(...categoryData.map(c => c.count), 1);

  const GREEN_SHADES = ['#00e87a','#00d170','#00ba66','#00a35c','#008c52','#007548','#005f3e'];

  const sortedIssues = [...issues].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'Segoe UI',sans-serif", background:'#eef0f5' }}>

      <div style={{ width:sidebarWidth, background:'#1a1a2e', display:'flex', flexDirection:'column', padding:'20px 0', flexShrink:0, zIndex:10, position:'fixed', top:0, left:0, bottom:0, transition:'width 0.3s ease', overflow:'hidden' }}>
        <div style={{ padding:'0 12px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'14px', display:'flex', alignItems:'center', justifyContent:'space-between', minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', overflow:'hidden', flex:1, minWidth:0 }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'#1a1a2e', fontWeight:'900', fontSize:'12px' }}>R</span>
            </div>
            <span style={{ color:'#fff', fontWeight:'700', fontSize:'12px', letterSpacing:'2px', whiteSpace:'nowrap', opacity:collapsed?0:1, transition:'opacity 0.2s' }}>REFICERE</span>
          </div>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'6px', width:'22px', height:'22px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, marginLeft:'4px' }}>
            <i className="ti ti-chevron-left" style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', transform:collapsed?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.3s', display:'block' }} aria-hidden="true" />
          </button>
        </div>

        {NAV.map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} title={collapsed ? item.label : ''}
            style={{ padding:'9px 12px', margin:'0 6px 3px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', background:item.active?'rgba(0,232,122,0.12)':'transparent', border:item.active?'1px solid rgba(0,232,122,0.25)':'1px solid transparent', transition:'all 0.2s ease', minWidth:0 }}
            onMouseEnter={e => { if(!item.active) e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if(!item.active) e.currentTarget.style.background='transparent'; }}
          >
            <i className={'ti '+item.icon} style={{ fontSize:'16px', color:item.active?'#00e87a':'rgba(255,255,255,0.35)', flexShrink:0 }} aria-hidden="true" />
            <span style={{ fontSize:'12px', color:item.active?'#00e87a':'rgba(255,255,255,0.35)', fontWeight:item.active?'600':'400', whiteSpace:'nowrap', opacity:collapsed?0:1, transition:'opacity 0.15s' }}>
              {item.label}
            </span>
          </div>
        ))}

        <div style={{ marginTop:'auto', padding:'14px 12px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:0 }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#1a1a2e', flexShrink:0 }}>
              {user && user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0, opacity:collapsed?0:1, transition:'opacity 0.15s' }}>
              <p style={{ color:'#fff', fontSize:'11px', fontWeight:'500', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user && user.name.split(' ')[0]}</p>
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'10px', margin:0 }}>{user && user.role}</p>
            </div>
            {!collapsed && (
              <i className="ti ti-logout" onClick={() => { logout(); navigate('/login'); }}
                style={{ fontSize:'14px', color:'rgba(255,255,255,0.25)', cursor:'pointer', transition:'color 0.2s', flexShrink:0 }}
                onMouseEnter={e => e.currentTarget.style.color='#fff'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>

      <div style={{ flex:1, marginLeft:sidebarWidth, transition:'margin-left 0.3s ease' }}>
        <div style={{ background:'#fff', padding:'18px 28px', borderBottom:'1px solid #e5e7eb' }}>
          <p style={{ color:'#00b85e', fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase', margin:'0 0 4px', fontWeight:'600' }}>St Mary's University</p>
          <h1 style={{ color:'#111827', fontSize:'20px', fontWeight:'700', margin:0, letterSpacing:'-0.4px' }}>Your Activity</h1>
        </div>

        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:'14px' }}>

          <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e5e7eb', padding:'18px 20px', display:'flex', alignItems:'center', gap:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ position:'relative', width:'90px', height:'90px', flexShrink:0 }}>
              <svg viewBox="0 0 90 90" width="90" height="90">
                <circle cx="45" cy="45" r="32" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="45" cy="45" r="32" fill="none" stroke="#00e87a" strokeWidth="8"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" transform="rotate(-90 45 45)"
                />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'#1a1a2e', fontSize:'18px', fontWeight:'800', lineHeight:1 }}>{resolutionPct}%</span>
                <span style={{ color:'#9ca3af', fontSize:'8px', marginTop:'2px' }}>resolved</span>
              </div>
            </div>
            <div style={{ flex:1, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }}>
              {[
                { label:'Reports submitted', value:issues.length, color:'#111827' },
                { label:'Resolved so far', value:resolved, color:'#00b85e' },
                { label:'Still open', value:issues.length - resolved, color:'#d97706' },
              ].map((stat, i) => (
                <div key={i} style={{ borderLeft: i > 0 ? '1px solid #f3f4f6' : 'none', paddingLeft: i > 0 ? '16px' : 0 }}>
                  <p style={{ color:stat.color, fontSize:'28px', fontWeight:'800', margin:0, letterSpacing:'-1px', lineHeight:1 }}>{stat.value}</p>
                  <p style={{ color:'#9ca3af', fontSize:'10px', margin:'4px 0 0' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e5e7eb', padding:'16px 18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ color:'#374151', fontSize:'13px', fontWeight:'700', margin:'0 0 14px' }}>Issues by category</p>
              {categoryData.length === 0 ? (
                <p style={{ color:'#9ca3af', fontSize:'12px', margin:0 }}>No data yet</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {categoryData.map((cat, i) => (
                    <div key={i}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                        <span style={{ color:'#6b7280', fontSize:'11px' }}>{cat.label}</span>
                        <span style={{ color:'#374151', fontSize:'11px', fontWeight:'700' }}>{cat.count}</span>
                      </div>
                      <div style={{ height:'6px', background:'#f3f4f6', borderRadius:'4px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:((cat.count/maxCat)*100)+'%', background: GREEN_SHADES[i % GREEN_SHADES.length], borderRadius:'4px', transition:'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e5e7eb', padding:'16px 18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ color:'#374151', fontSize:'13px', fontWeight:'700', margin:'0 0 14px' }}>Report history</p>
              {sortedIssues.length === 0 ? (
                <p style={{ color:'#9ca3af', fontSize:'12px', margin:0 }}>No reports yet</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                  {sortedIssues.map((issue, i) => {
                    const badge = STATUS_BADGE[issue.status] || STATUS_BADGE['Closed'];
                    const isLast = i === sortedIssues.length - 1;
                    return (
                      <div key={issue._id} onClick={() => navigate('/issues/'+issue._id)}
                        style={{ display:'flex', gap:'10px', paddingBottom: isLast ? 0 : '12px', cursor:'pointer' }}
                      >
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                          <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#00e87a', marginTop:'2px', flexShrink:0 }} />
                          {!isLast && <div style={{ width:'2px', flex:1, background:'#e5e7eb', minHeight:'16px' }} />}
                        </div>
                        <div style={{ flex:1, minWidth:0, paddingBottom: isLast ? 0 : '0' }}>
                          <p style={{ color:'#111827', fontSize:'12px', fontWeight:'600', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {issue.title}
                          </p>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <p style={{ color:'#9ca3af', fontSize:'10px', margin:0 }}>{timeAgo(issue.createdAt)}</p>
                            <span style={{ padding:'1px 7px', borderRadius:'20px', background:badge.background, color:badge.color, fontSize:'9px', fontWeight:'600' }}>
                              {issue.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;