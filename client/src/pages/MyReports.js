import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getIssues } from '../services/api';

const TIMELINE_STEPS = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

const STATUS_STEP = {
  'New': 1,
  'In Progress': 3,
  'Awaiting Parts': 3,
  'Resolved': 4,
  'Closed': 4,
};

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

const CATEGORY_COLORS = {
  Electrical:    { bg:'#ede9fe', color:'#7c3aed' },
  Plumbing:      { bg:'#dbeafe', color:'#2563eb' },
  Heating:       { bg:'#fee2e2', color:'#dc2626' },
  'IT Equipment':{ bg:'#d1fae5', color:'#059669' },
  Structural:    { bg:'#f3f4f6', color:'#4b5563' },
  Lighting:      { bg:'#fef9c3', color:'#ca8a04' },
  Cleaning:      { bg:'#d1fae5', color:'#059669' },
  Other:         { bg:'#f3f4f6', color:'#6b7280' },
};

const STATUS_BADGE = {
  'New':            { background:'#ede9fe', color:'#7c3aed' },
  'In Progress':    { background:'#fef3c7', color:'#d97706' },
  'Awaiting Parts': { background:'#ffedd5', color:'#c2410c' },
  'Resolved':       { background:'#d1fae5', color:'#065f46' },
  'Closed':         { background:'#f3f4f6', color:'#6b7280' },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + ' days ago';
  return Math.floor(diff/604800) + ' weeks ago';
};

const NAV = [
  { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/dashboard' },
  { icon:'ti-plus',             label:'Report Issue',  path:'/submit' },
  { icon:'ti-list-check',       label:'My Reports',   path:'/myreports', active:true },
  { icon:'ti-bell',             label:'Notifications', path:'/notifications' },
  { icon:'ti-help',             label:'Help',         path:'/help' },
];

const MyReports = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('All');
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? '52px' : '200px';

  useEffect(() => {
    getIssues()
      .then(res => setIssues(res.data))
      .catch(console.log);
  }, []);

  const filters = ['All', 'New', 'In Progress', 'Awaiting Parts', 'Resolved'];
  const filtered = filter === 'All' ? issues : issues.filter(i => i.status === filter);
  const isResolved = (status) => status === 'Resolved' || status === 'Closed';

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
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h1 style={{ color:'#111827', fontSize:'20px', fontWeight:'700', margin:0, letterSpacing:'-0.4px' }}>My Reports</h1>
            <div style={{ display:'flex', gap:'8px' }}>
              <span style={{ padding:'5px 12px', borderRadius:'20px', background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#166534', fontSize:'11px', fontWeight:'600' }}>
                {issues.length} total
              </span>
              <button onClick={() => navigate('/submit')}
                style={{ padding:'7px 14px', background:'#00e87a', border:'none', borderRadius:'9px', color:'#1a1a2e', fontSize:'11px', fontWeight:'700', cursor:'pointer', fontFamily:"'Segoe UI',sans-serif", display:'flex', alignItems:'center', gap:'5px', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(0,232,122,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
              >
                <i className="ti ti-plus" style={{ fontSize:'13px' }} aria-hidden="true" />
                New Report
              </button>
            </div>
          </div>
        </div>

        <div style={{ background:'#f5f6f8', padding:'10px 20px', borderBottom:'1px solid #e5e7eb', display:'flex', gap:'6px' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
            style={{ padding:'4px 12px', borderRadius:'20px', background:filter===f?'#1a1a2e':'#fff', color:filter===f?'#fff':'#6b7280', fontSize:'10px', fontWeight:filter===f?'600':'400', cursor:'pointer', border:'1px solid', borderColor:filter===f?'#1a1a2e':'#e5e7eb', fontFamily:"'Segoe UI',sans-serif", transition:'all 0.15s' }}            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:'10px' }}>
          {filtered.length === 0 ? (
            <div style={{ background:'rgba(255,255,255,0.8)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.9)', padding:'60px 32px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
              <i className="ti ti-clipboard" style={{ fontSize:'32px', color:'#d1d5db', display:'block', marginBottom:'12px' }} aria-hidden="true" />
              <p style={{ color:'#374151', fontSize:'14px', fontWeight:'600', margin:'0 0 6px' }}>
                {filter === 'All' ? 'No reports yet' : 'No reports with status: '+filter}
              </p>
              <p style={{ color:'#9ca3af', fontSize:'12px', margin:'0 0 16px' }}>
                {filter === 'All' ? 'When you submit a report it will show up here' : ''}
              </p>
              {filter === 'All' && (
                <button onClick={() => navigate('/submit')}
                  style={{ padding:'10px 20px', background:'#00e87a', border:'none', borderRadius:'10px', color:'#1a1a2e', fontSize:'12px', cursor:'pointer', fontWeight:'700', fontFamily:"'Segoe UI',sans-serif" }}
                >
                  Submit your first report
                </button>
              )}
            </div>
          ) : (
            filtered.map(issue => {
              const cc = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS['Other'];
              const badge = STATUS_BADGE[issue.status] || STATUS_BADGE['Closed'];
              const step = STATUS_STEP[issue.status] || 1;
              const lastComment = issue.comments && issue.comments.length > 0
                ? issue.comments[issue.comments.length - 1]
                : null;
              const resolved = isResolved(issue.status);

              return (
                <div key={issue._id} style={{ background:'#fff', borderRadius:'14px', border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', opacity: resolved ? 0.7 : 1, transition:'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'}
                >
                  <div style={{ padding:'16px 18px', display:'flex', gap:'14px', alignItems:'flex-start', cursor:'pointer' }}
                    onClick={() => navigate('/issues/'+issue._id)}
                  >
                    <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:cc.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <i className={'ti '+getCategoryIcon(issue.category)} style={{ fontSize:'18px', color:cc.color }} aria-hidden="true" />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
                        <p style={{ color:'#111827', fontSize:'13px', fontWeight:'600', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1, paddingRight:'10px' }}>
                          {issue.title}
                        </p>
                        <span style={{ padding:'3px 10px', borderRadius:'20px', background:badge.background, color:badge.color, fontSize:'10px', fontWeight:'600', flexShrink:0 }}>
                          {issue.status}
                        </span>
                      </div>
                      <p style={{ color:'#9ca3af', fontSize:'11px', margin:'0 0 12px' }}>
                        {issue.location?.building}{issue.location?.room?' · Room '+issue.location.room:''} · {issue.category} · submitted {timeAgo(issue.createdAt)}
                      </p>

                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        {TIMELINE_STEPS.map((stepLabel, i) => {
                          const stepNum = i + 1;
                          const done = stepNum < step;
                          const active = stepNum === step;
                          return (
                            <React.Fragment key={stepLabel}>
                              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                                <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:done?'#dcfce7':active?'#fef9c3':'#f3f4f6', border:done?'2px solid #16a34a':active?'2px solid #ca8a04':'2px dashed #d1d5db', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                  {done && <i className="ti ti-check" style={{ fontSize:'10px', color:'#16a34a' }} aria-hidden="true" />}
                                  {active && !done && <i className="ti ti-loader" style={{ fontSize:'10px', color:'#ca8a04' }} aria-hidden="true" />}
                                </div>
                                <p style={{ color:done?'#16a34a':active?'#ca8a04':'#d1d5db', fontSize:'8px', fontWeight:done||active?'600':'400', margin:0, whiteSpace:'nowrap' }}>{stepLabel}</p>
                              </div>
                              {i < TIMELINE_STEPS.length - 1 && (
                                <div style={{ flex:1, height:'2px', background:done?'#16a34a':'#e5e7eb', marginBottom:'12px', transition:'background 0.3s' }} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {lastComment && (
                    <div style={{ padding:'10px 18px', background: resolved ? '#f0fdf4' : '#f9fafb', borderTop:'1px solid', borderTopColor: resolved ? '#bbf7d0' : '#f0f0f0', display:'flex', alignItems:'center', gap:'10px' }}>
                      {resolved ? (
                        <i className="ti ti-circle-check" style={{ fontSize:'15px', color:'#16a34a', flexShrink:0 }} aria-hidden="true" />
                      ) : (
                        <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'#fbbf24', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'700', color:'#1a1a2e', flexShrink:0 }}>
                          {(lastComment.user?.name || 'F').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <p style={{ color: resolved ? '#166534' : '#6b7280', fontSize:'11px', margin:0, lineHeight:'1.5' }}>
                        {resolved
                          ? 'This issue has been resolved. Thanks for your patience.'
                          : (lastComment.user?.name || 'Facilities') + ': ' + lastComment.text
                        }
                      </p>
                    </div>
                  )}

                  {!lastComment && !resolved && (
                    <div style={{ padding:'10px 18px', background:'#f9fafb', borderTop:'1px solid #f0f0f0', display:'flex', alignItems:'center', gap:'8px' }}>
                      <i className="ti ti-clock" style={{ fontSize:'14px', color:'#9ca3af', flexShrink:0 }} aria-hidden="true" />
                      <p style={{ color:'#9ca3af', fontSize:'11px', margin:0 }}>Waiting for the facilities team to pick this up</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;