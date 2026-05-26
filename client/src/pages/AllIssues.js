import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getIssues, updateIssue } from '../services/api';

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
  Electrical: { bg:'#fef3c7', color:'#d97706' },
  Plumbing: { bg:'#dbeafe', color:'#2563eb' },
  Heating: { bg:'#fee2e2', color:'#dc2626' },
  'IT Equipment': { bg:'#ede9fe', color:'#7c3aed' },
  Structural: { bg:'#f3f4f6', color:'#4b5563' },
  Lighting: { bg:'#fef9c3', color:'#ca8a04' },
  Cleaning: { bg:'#d1fae5', color:'#059669' },
  Other: { bg:'#f3f4f6', color:'#6b7280' },
};

const STATUS_BADGE = {
  'New':             { bg:'#dcfce7', color:'#166534' },
  'In Progress':     { bg:'#fef9c3', color:'#854d0e' },
  'Awaiting Parts':  { bg:'#ffedd5', color:'#9a3412' },
  'Resolved':        { bg:'#dbeafe', color:'#1e40af' },
  'Closed':          { bg:'#f3f4f6', color:'#6b7280' },
};

const PRIORITY_COLORS = {
  Urgent: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#10b981'
};

const STATUS_OPTIONS = ['New','In Progress','Awaiting Parts','Resolved','Closed'];

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return Math.floor(diff/604800) + 'w ago';
};

const getWorstPriority = (issues) => {
  if (issues.some(i => i.priority === 'Urgent')) return 'Urgent';
  if (issues.some(i => i.priority === 'High')) return 'High';
  if (issues.some(i => i.priority === 'Medium')) return 'Medium';
  return 'Low';
};

const NAV = [
    { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/facilities' },
    { icon:'ti-list-check',       label:'All Issues',   path:'/allissues' },
    { icon:'ti-map-pin',          label:'Campus Map',   path:'/campusmap' },
    { icon:'ti-chart-bar',        label:'Analytics',    path:'/analytics' },
    { icon:'ti-bell',             label:'Notifications', path:'/notifications' },
    { icon:'ti-help',             label:'Help',         path:'/facilitieshelp' },
];

const AllIssues = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [priorityFilter, setPriorityFilter] = useState('All priorities');
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getIssues().then(res => setIssues(res.data)).catch(console.log);
  }, []);

  const exportCSV = () => {
    const headers = ['Title','Category','Building','Room','Priority','Status','Reported By','Date'];
    const rows = issues.map(i => [
      '"' + (i.title || '').replace(/"/g, '""') + '"',
      '"' + (i.category || '') + '"',
      '"' + (i.location?.building || '') + '"',
      '"' + (i.location?.room || '') + '"',
      '"' + (i.priority || '') + '"',
      '"' + (i.status || '') + '"',
      '"' + (i.user?.name || 'Student') + '"',
      '"' + new Date(i.createdAt).toLocaleDateString('en-GB') + '"',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reficere-issues-' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !selected || newStatus === selected.status) return;
    setUpdating(true);
    try {
      await updateIssue(selected._id, { status: newStatus });
      setIssues(prev => prev.map(i => i._id === selected._id ? {...i, status: newStatus} : i));
      setSelected(prev => ({...prev, status: newStatus}));
    } catch (err) { console.log(err); }
    finally { setUpdating(false); }
  };

  const filtered = issues.filter(i => {
    const matchSearch = search === '' ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (i.location?.building || '').toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All statuses' || i.status === statusFilter;
    const matchPriority = priorityFilter === 'All priorities' || i.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const buildings = [...new Set(filtered.map(i => i.location?.building).filter(Boolean))];

  const urgentCount = issues.filter(i => i.priority === 'Urgent').length;
  const totalCount = issues.length;

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'Segoe UI',sans-serif", background:'#f5f6f8' }}>

      <div style={{ width:'200px', background:'#1a1a2e', display:'flex', flexDirection:'column', padding:'20px 0', flexShrink:0, zIndex:10, position:'fixed', top:0, left:0, bottom:0 }}>
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

      <div style={{ flex:1, marginLeft:'200px' }}>
        <div style={{ background:'linear-gradient(135deg,#1a1a2e,#1e3a2e)', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ color:'rgba(0,232,122,0.6)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', margin:'0 0 4px', fontWeight:'600' }}>Facilities Portal</p>
            <h1 style={{ color:'#fff', fontSize:'20px', fontWeight:'700', margin:0, letterSpacing:'-0.3px' }}>All Issues</h1>
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            {urgentCount > 0 && (
              <span style={{ padding:'5px 12px', borderRadius:'20px', background:'rgba(248,113,113,0.15)', color:'#f87171', border:'1px solid rgba(248,113,113,0.25)', fontSize:'11px', fontWeight:'600' }}>
                {urgentCount} urgent
              </span>
            )}
            <span style={{ padding:'5px 12px', borderRadius:'20px', background:'rgba(0,232,122,0.12)', color:'#00e87a', border:'1px solid rgba(0,232,122,0.25)', fontSize:'11px', fontWeight:'600' }}>
              {totalCount} total
            </span>
            <button
              onClick={exportCSV}
              style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', color:'#fff', fontSize:'11px', fontWeight:'600', cursor:'pointer', fontFamily:"'Segoe UI',sans-serif", transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            >
              <i className="ti ti-download" style={{ fontSize:'14px' }} aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>

        <div style={{ padding:'20px 24px' }}>
          <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
              <i className="ti ti-search" style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'13px', color:'#9ca3af' }} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by title, building or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width:'100%', padding:'9px 12px 9px 30px', border:'1px solid #e5e7eb', borderRadius:'9px', fontSize:'12px', outline:'none', background:'#fff', fontFamily:"'Segoe UI',sans-serif", boxSizing:'border-box' }}
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:'9px', fontSize:'12px', outline:'none', fontFamily:"'Segoe UI',sans-serif", background:'#fff', color:'#374151', cursor:'pointer' }}
            >
              <option>All statuses</option>
              {['New','In Progress','Awaiting Parts','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
              style={{ padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:'9px', fontSize:'12px', outline:'none', fontFamily:"'Segoe UI',sans-serif", background:'#fff', color:'#374151', cursor:'pointer' }}
            >
              <option>All priorities</option>
              {['Urgent','High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          {buildings.length === 0 ? (
            <div style={{ background:'rgba(255,255,255,0.8)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.9)', padding:'60px 32px', textAlign:'center' }}>
              <i className="ti ti-clipboard" style={{ fontSize:'32px', color:'#d1d5db', display:'block', marginBottom:'12px' }} aria-hidden="true" />
              <p style={{ color:'#9ca3af', fontSize:'14px', margin:0 }}>No issues found</p>
            </div>
          ) : (
            buildings.map(building => {
              const buildingIssues = filtered.filter(i => i.location?.building === building);
              const worstPriority = getWorstPriority(buildingIssues);
              const dotColor = PRIORITY_COLORS[worstPriority] || '#10b981';
              const allResolved = buildingIssues.every(i => i.status === 'Resolved' || i.status === 'Closed');
              const urgentInBuilding = buildingIssues.filter(i => i.priority === 'Urgent').length;
              const highInBuilding = buildingIssues.filter(i => i.priority === 'High').length;

              return (
                <div key={building} style={{ marginBottom:'24px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                    <div style={{ width:'9px', height:'9px', borderRadius:'50%', background:dotColor, boxShadow:`0 0 0 3px ${dotColor}26` }} />
                    <p style={{ color:'#374151', fontSize:'13px', fontWeight:'700', margin:0 }}>{building}</p>
                    <span style={{ color:'#9ca3af', fontSize:'11px' }}>{buildingIssues.length} {buildingIssues.length === 1 ? 'issue' : 'issues'}</span>
                    {allResolved ? (
                      <span style={{ padding:'2px 8px', borderRadius:'20px', background:'#f0fdf4', color:'#166534', fontSize:'9px', fontWeight:'700', border:'1px solid #bbf7d0' }}>all resolved</span>
                    ) : urgentInBuilding > 0 ? (
                      <span style={{ padding:'2px 8px', borderRadius:'20px', background:'#fef2f2', color:'#991b1b', fontSize:'9px', fontWeight:'700', border:'1px solid #fecaca' }}>{urgentInBuilding} urgent</span>
                    ) : highInBuilding > 0 ? (
                      <span style={{ padding:'2px 8px', borderRadius:'20px', background:'#fff7ed', color:'#9a3412', fontSize:'9px', fontWeight:'700', border:'1px solid #fed7aa' }}>{highInBuilding} high</span>
                    ) : null}
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'10px' }}>
                    {buildingIssues.map(issue => {
                      const sb = STATUS_BADGE[issue.status] || STATUS_BADGE['Closed'];
                      const pc = PRIORITY_COLORS[issue.priority] || '#3b82f6';
                      const cc = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS['Other'];
                      const isResolved = issue.status === 'Resolved' || issue.status === 'Closed';
                      return (
                        <div
                          key={issue._id}
                          onClick={() => { setSelected(issue); setNewStatus(issue.status); }}
                          style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'14px 16px', cursor:'pointer', transition:'all 0.2s', borderLeft:`4px solid ${pc}`, opacity: isResolved ? 0.75 : 1, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}
                          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 20px rgba(0,0,0,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'; }}
                        >
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                            <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:cc.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <i className={'ti '+getCategoryIcon(issue.category)} style={{ fontSize:'15px', color:cc.color }} aria-hidden="true" />
                            </div>
                            <span style={{ padding:'2px 8px', borderRadius:'20px', background:sb.bg, color:sb.color, fontSize:'9px', fontWeight:'600' }}>{issue.status}</span>
                          </div>
                          <p style={{ color:'#111827', fontSize:'12px', fontWeight:'600', margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{issue.title}</p>
                          <p style={{ color:'#9ca3af', fontSize:'10px', margin:'0 0 8px' }}>{issue.category}{issue.location?.room ? ' · Room '+issue.location.room : ''}</p>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'8px', borderTop:'1px solid #f3f4f6' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                              <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:'700', color:'#1a1a2e', flexShrink:0 }}>
                                {(issue.user?.name || 'S').charAt(0).toUpperCase()}
                              </div>
                              <span style={{ color:'#9ca3af', fontSize:'10px' }}>{timeAgo(issue.createdAt)}</span>
                            </div>
                            <span style={{ color:pc, fontSize:'9px', fontWeight:'700' }}>● {issue.priority || 'Medium'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {selected && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}
          onClick={e => { if(e.target === e.currentTarget) setSelected(null); }}
        >
          <div style={{ background:'#fff', borderRadius:'20px', border:'1px solid rgba(0,0,0,0.08)', padding:'24px', width:'460px', maxWidth:'90vw', boxShadow:'0 24px 60px rgba(0,0,0,0.15)', maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
              <div>
                <p style={{ color:'#9ca3af', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 4px' }}>{selected.category} · {selected.location?.building}</p>
                <h3 style={{ color:'#111827', fontSize:'16px', fontWeight:'700', margin:0 }}>{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'#f3f4f6', border:'none', borderRadius:'8px', cursor:'pointer', padding:'6px 8px', fontSize:'12px', color:'#6b7280', fontFamily:"'Segoe UI',sans-serif" }}>Close</button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'14px' }}>
              {[
                { label:'Building', value: selected.location?.building || '—' },
                { label:'Room', value: selected.location?.room || 'Not specified' },
                { label:'Priority', value: selected.priority || 'Medium', color: PRIORITY_COLORS[selected.priority] },
                { label:'Reported by', value: selected.user?.name || 'Student' },
              ].map((item, i) => (
                <div key={i} style={{ background:'#f9fafb', borderRadius:'8px', padding:'10px 12px', border:'1px solid #e5e7eb' }}>
                  <p style={{ color:'#9ca3af', fontSize:'9px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 3px' }}>{item.label}</p>
                  <p style={{ color: item.color || '#111827', fontSize:'12px', fontWeight:'600', margin:0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {selected.description && (
              <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'12px', marginBottom:'14px' }}>
                <p style={{ color:'#9ca3af', fontSize:'9px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 6px' }}>Description</p>
                <p style={{ color:'#374151', fontSize:'12px', lineHeight:'1.7', margin:0 }}>{selected.description}</p>
              </div>
            )}

            <div style={{ marginBottom:'14px' }}>
              <p style={{ color:'#374151', fontSize:'11px', fontWeight:'600', letterSpacing:'0.5px', textTransform:'uppercase', margin:'0 0 8px' }}>Update Status</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {STATUS_OPTIONS.map(s => {
                  const sb = STATUS_BADGE[s] || STATUS_BADGE['Closed'];
                  return (
                    <div key={s} onClick={() => setNewStatus(s)}
                      style={{ padding:'9px 12px', borderRadius:'9px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', border: newStatus === s ? '2px solid '+sb.color : '1px solid #e5e7eb', background: newStatus === s ? sb.bg : '#f9fafb', transition:'all 0.15s' }}
                    >
                      <span style={{ color: newStatus === s ? sb.color : '#6b7280', fontSize:'12px', fontWeight: newStatus === s ? '600' : '400' }}>{s}</span>
                      {newStatus === s && <i className="ti ti-check" style={{ fontSize:'13px', color:sb.color }} aria-hidden="true" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setSelected(null)} style={{ flex:1, padding:'11px', background:'#f3f4f6', border:'none', borderRadius:'10px', color:'#6b7280', fontSize:'12px', fontWeight:'600', cursor:'pointer', fontFamily:"'Segoe UI',sans-serif" }}>
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === selected.status}
                style={{ flex:2, padding:'11px', background:(updating||newStatus===selected.status)?'rgba(0,232,122,0.3)':'linear-gradient(135deg,#00e87a,#00b85e)', border:'none', borderRadius:'10px', color:'#1a1a2e', fontSize:'12px', fontWeight:'700', cursor:(updating||newStatus===selected.status)?'not-allowed':'pointer', fontFamily:"'Segoe UI',sans-serif", transition:'all 0.2s' }}
              >
                {updating ? 'Saving...' : newStatus === selected.status ? 'No changes' : 'Update to ' + newStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllIssues;