import React, { useState, useContext, useEffect, useRef } from 'react';
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

const STATUS_BADGE = {
  'New':             { bg:'#dcfce7', color:'#166534', label:'New' },
  'In Progress':     { bg:'#fef9c3', color:'#854d0e', label:'Active' },
  'Awaiting Parts':  { bg:'#ffedd5', color:'#9a3412', label:'Waiting' },
  'Resolved':        { bg:'#dbeafe', color:'#1e40af', label:'Resolved' },
  'Closed':          { bg:'#f3f4f6', color:'#6b7280', label:'Closed' },
};

const PRIORITY_STRIP = {
  Urgent:'#ef4444', High:'#f59e0b', Medium:'#3b82f6', Low:'#10b981'
};

const STATUS_OPTIONS = ['New','In Progress','Awaiting Parts','Resolved','Closed'];

const TEAM_MEMBERS = [
  { name:'Mark Johnson',   initials:'MJ', color:'#00e87a', textColor:'#1a1a2e' },
  { name:'Sarah Williams', initials:'SW', color:'#818cf8', textColor:'#fff' },
  { name:'Tom Davies',     initials:'TD', color:'#fbbf24', textColor:'#1a1a2e' },
  { name:'Lisa Chen',      initials:'LC', color:'#fb923c', textColor:'#fff' },
];

const SORT_OPTIONS = ['Date — Newest','Date — Oldest','Urgency','Building'];
const FILTERS = ['All','New','In Progress','Awaiting Parts','Resolved'];

const NAV = [
    { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/facilities' },
    { icon:'ti-list-check',       label:'All Issues',   path:'/allissues' },
    { icon:'ti-map-pin',          label:'Campus Map',   path:'/campusmap' },
    { icon:'ti-chart-bar',        label:'Analytics',    path:'/analytics' },
    { icon:'ti-bell',             label:'Notifications', path:'/notifications' },
     { icon:'ti-help',             label:'Help',         path:'/facilitieshelp' },
];
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return Math.floor(diff/604800) + 'w ago';
};

const FacilitiesDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Date — Newest');
  const [showSort, setShowSort] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState({});
  const [updating, setUpdating] = useState(false);

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
      return { x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight, vx:(Math.random()-.5)*.6, vy:(Math.random()-.5)*.6, r:Math.random()*1.8+.4, c, pulse:Math.random()*Math.PI*2 };
    });
    const draw = () => {
      if(canvas.width===0||canvas.height===0){ id=requestAnimationFrame(draw); return; }
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => {
        p.pulse+=.04; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>canvas.width) p.vx*=-1;
        if(p.y<0||p.y>canvas.height) p.vy*=-1;
        const s=p.r+Math.sin(p.pulse)*.5;
        const radius=Math.max(s*4,0.1);
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius);
        g.addColorStop(0,`rgba(${p.c.r},${p.c.g},${p.c.b},0.18)`);
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,radius,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(s,0.1),0,Math.PI*2);
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
      id=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize',resize); };
  }, []);

  useEffect(() => {
    getIssues().then(res => setIssues(res.data)).catch(console.log);
  }, []);

  const handleStatusUpdate = async () => {
    if(!newStatus||!selected||newStatus===selected.status) return;
    setUpdating(true);
    try {
      await updateIssue(selected._id, { status:newStatus });
      setIssues(prev => prev.map(i => i._id===selected._id ? {...i,status:newStatus} : i));
      setSelected(prev => ({...prev,status:newStatus}));
    } catch(err){ console.log(err); }
    finally { setUpdating(false); }
  };

  const addNote = () => {
    if(!note.trim()||!selected) return;
    const newNote = { text:note.trim(), author:user?.name||'Staff', time:new Date().toISOString() };
    setNotes(prev => ({ ...prev, [selected._id]:[...(prev[selected._id]||[]),newNote] }));
    setNote('');
  };

  const sortedFiltered = issues
    .filter(i => {
      const matchFilter = filter==='All'||i.status===filter;
      const matchSearch = search===''||
        i.title.toLowerCase().includes(search.toLowerCase())||
        (i.location?.building||'').toLowerCase().includes(search.toLowerCase())||
        i.category.toLowerCase().includes(search.toLowerCase());
      return matchFilter&&matchSearch;
    })
    .sort((a,b) => {
      if(sort==='Urgency'){ const o={Urgent:0,High:1,Medium:2,Low:3}; return (o[a.priority]??2)-(o[b.priority]??2); }
      if(sort==='Building') return (a.location?.building||'').localeCompare(b.location?.building||'');
      if(sort==='Date — Oldest') return new Date(a.createdAt)-new Date(b.createdAt);
      return new Date(b.createdAt)-new Date(a.createdAt);
    });

  const counts = {
    total:   issues.length,
    new:     issues.filter(i=>i.status==='New').length,
    active:  issues.filter(i=>i.status==='In Progress').length,
    waiting: issues.filter(i=>i.status==='Awaiting Parts').length,
    urgent:  issues.filter(i=>i.priority==='Urgent'||i.priority==='High').length,
  };

  const STAT_CARDS = [
    { label:'Total',   value:counts.total,   bg:'#f0fdf4', border:'#bbf7d0', color:'#166534' },
    { label:'New',     value:counts.new,     bg:'#f0fdf4', border:'#bbf7d0', color:'#166534' },
    { label:'Active',  value:counts.active,  bg:'#fefce8', border:'#fde68a', color:'#854d0e' },
    { label:'Waiting', value:counts.waiting, bg:'#fff7ed', border:'#fed7aa', color:'#9a3412' },
    { label:'Urgent',  value:counts.urgent,  bg:'#fef2f2', border:'#fecaca', color:'#991b1b' },
  ];

  const issueNotes = selected ? (notes[selected._id]||[]) : [];
  const priorityStrip = selected ? (PRIORITY_STRIP[selected.priority]||'#3b82f6') : '#3b82f6';

  return (
    <div style={{ height:'100vh', display:'flex', fontFamily:"'Segoe UI',sans-serif", background:'#f9fafb', position:'relative', overflow:'hidden' }}>
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
          <div key={i}
            onClick={() => navigate(item.path)}
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
            <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#fbbf24', flexShrink:0 }}>
              {user && user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'#fff', fontSize:'11px', fontWeight:'500', margin:0 }}>{user && user.name.split(' ')[0]}</p>
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'10px', margin:0, textTransform:'capitalize' }}>{user && user.role}</p>
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

      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative', zIndex:5 }}>

        <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#fff', borderRight:'1px solid #e5e7eb', overflow:'hidden' }}>

          <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid #f0f0f0', flexShrink:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
              <div>
                <p style={{ color:'#6b7280', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 3px', fontWeight:'500' }}>Facilities Portal</p>
                <h1 style={{ color:'#111827', fontSize:'17px', fontWeight:'700', margin:0, letterSpacing:'-0.3px' }}>Open Issues</h1>
              </div>
              <div style={{ padding:'4px 10px', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:'6px' }}>
                <span style={{ color:'#92400e', fontSize:'10px', fontWeight:'600' }}>FACILITIES</span>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'6px', marginBottom:'12px' }}>
              {STAT_CARDS.map((card,i) => (
                <div key={i}
                  style={{ background:card.bg, border:'1px solid '+card.border, borderRadius:'8px', padding:'7px 4px', textAlign:'center', cursor:'pointer', transition:'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                  onClick={() => setFilter(
                    card.label==='Total'?'All':
                    card.label==='Active'?'In Progress':
                    card.label==='Waiting'?'Awaiting Parts':
                    card.label==='Urgent'?filter:card.label
                  )}
                >
                  <p style={{ color:card.color, fontSize:'18px', fontWeight:'800', margin:0, lineHeight:1 }}>{card.value}</p>
                  <p style={{ color:card.color, fontSize:'8px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px', margin:'3px 0 0', opacity:0.8 }}>{card.label}</p>
                </div>
              ))}
            </div>

            <div style={{ position:'relative', marginBottom:'10px' }}>
              <i className="ti ti-search" style={{ position:'absolute', left:'9px', top:'50%', transform:'translateY(-50%)', fontSize:'13px', color:'#9ca3af' }} aria-hidden="true" />
              <input type="text" placeholder="Search title, building, category..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:'100%', padding:'8px 10px 8px 28px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#111827', outline:'none', background:'#f9fafb', fontFamily:"'Segoe UI',sans-serif", boxSizing:'border-box' }}
              />
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'6px' }}>
              <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', flex:1 }}>
                {FILTERS.map(f => {
                  const label = f==='In Progress'?'Active':f==='Awaiting Parts'?'Waiting':f;
                  const count = f==='New'?counts.new:f==='In Progress'?counts.active:f==='Awaiting Parts'?counts.waiting:f==='Resolved'?issues.filter(i=>i.status==='Resolved').length:null;
                  return (
                    <button key={f} onClick={() => setFilter(f)}
                      style={{ padding:'4px 8px', borderRadius:'20px', border:filter===f?'none':'1px solid #e5e7eb', background:filter===f?'#111827':'transparent', color:filter===f?'#fff':'#6b7280', fontSize:'10px', fontWeight:filter===f?'600':'400', cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:'3px', fontFamily:"'Segoe UI',sans-serif" }}
                    >
                      {label}
                      {count!==null&&<span style={{ background:filter===f?'rgba(255,255,255,0.2)':'#f3f4f6', borderRadius:'10px', padding:'0 4px', fontSize:'9px', color:filter===f?'#fff':'#9ca3af' }}>{count}</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{ position:'relative', flexShrink:0 }}>
                <button onClick={() => setShowSort(!showSort)}
                  style={{ display:'flex', alignItems:'center', gap:'4px', padding:'5px 8px', border:'1px solid #e5e7eb', borderRadius:'7px', background:'#f9fafb', color:'#374151', fontSize:'10px', cursor:'pointer', fontFamily:"'Segoe UI',sans-serif" }}
                >
                  <i className="ti ti-arrows-sort" style={{ fontSize:'12px', color:'#6b7280' }} aria-hidden="true" />
                  <i className="ti ti-chevron-down" style={{ fontSize:'10px', color:'#9ca3af' }} aria-hidden="true" />
                </button>
                {showSort && (
                  <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.1)', zIndex:20, minWidth:'150px', overflow:'hidden' }}>
                    {SORT_OPTIONS.map(s => (
                      <button key={s} onClick={() => { setSort(s); setShowSort(false); }}
                        style={{ display:'block', width:'100%', padding:'9px 14px', background:sort===s?'#f0fdf4':'transparent', border:'none', textAlign:'left', color:sort===s?'#166534':'#374151', fontSize:'12px', cursor:'pointer', fontFamily:"'Segoe UI',sans-serif", fontWeight:sort===s?'600':'400' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex:1, overflowY:'auto' }}>
            {sortedFiltered.length===0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center' }}>
                <i className="ti ti-clipboard" style={{ fontSize:'28px', color:'#d1d5db', display:'block', marginBottom:'10px' }} aria-hidden="true" />
                <p style={{ color:'#9ca3af', fontSize:'13px', margin:0 }}>No issues found</p>
              </div>
            ) : (
              sortedFiltered.map(issue => {
                const isSelected = selected&&selected._id===issue._id;
                const sb = STATUS_BADGE[issue.status]||STATUS_BADGE['Closed'];
                const strip = PRIORITY_STRIP[issue.priority]||'#3b82f6';
                return (
                  <div key={issue._id}
                    onClick={() => { setSelected(issue); setNewStatus(issue.status); setAssignedTo('');  }}
                    style={{ padding:'13px 14px 13px 12px', borderBottom:'1px solid #f0f0f0', cursor:'pointer', transition:'background 0.15s', background:isSelected?'#f0fdf4':'transparent', borderLeft:`4px solid ${isSelected?'#16a34a':strip}` }}
                    onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background='#f9fafb'; }}
                    onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background='transparent'; }}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px', marginBottom:'5px' }}>
                      <p style={{ color:'#111827', fontSize:'13px', fontWeight:'600', margin:0, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{issue.title}</p>
                      <span style={{ padding:'2px 8px', borderRadius:'20px', background:sb.bg, color:sb.color, fontSize:'10px', fontWeight:'600', flexShrink:0 }}>{sb.label}</span>
                    </div>
                    <p style={{ color:'#9ca3af', fontSize:'11px', margin:'0 0 5px' }}>
                      {issue.location?.building}{issue.location?.room?' · Room '+issue.location.room:''} · {issue.category}
                    </p>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <p style={{ color:'#9ca3af', fontSize:'11px', margin:0 }}>
                        {issue.user?.name?'by '+issue.user.name:'Student'} · {timeAgo(issue.createdAt)}
                      </p>
                      <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                        <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:strip, display:'inline-block' }} />
                        <span style={{ fontSize:'10px', color:strip, fontWeight:'600' }}>{issue.priority||'Medium'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ flex:1, background:'#1c2e22', display:'flex', flexDirection:'column', overflowY:'auto' }}>
          {!selected ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px', minHeight:'100%' }}>
              <i className="ti ti-hand-click" style={{ fontSize:'36px', color:'rgba(255,255,255,0.15)', display:'block', marginBottom:'14px' }} aria-hidden="true" />
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'14px', fontWeight:'500', margin:'0 0 6px' }}>No issue selected</p>
              <p style={{ color:'rgba(255,255,255,0.2)', fontSize:'12px', margin:0 }}>Click any issue on the left to view details</p>
            </div>
          ) : (
            <>
              <div style={{ borderLeft:`4px solid ${priorityStrip}`, padding:'20px 22px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 5px' }}>Selected Issue</p>
                    <h2 style={{ color:'#fff', fontSize:'17px', fontWeight:'700', margin:'0 0 4px', letterSpacing:'-0.3px' }}>{selected.title}</h2>
                    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', margin:0 }}>
                      <i className={'ti '+getCategoryIcon(selected.category)} style={{ fontSize:'12px', marginRight:'4px' }} aria-hidden="true" />
                      {selected.category} · {selected.location?.building}{selected.location?.room?' · Room '+selected.location.room:''}
                    </p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' }}>
                    <span style={{ padding:'4px 12px', borderRadius:'20px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', color:'#fff', fontSize:'11px', fontWeight:'600' }}>
                      {STATUS_BADGE[selected.status]?.label||selected.status}
                    </span>
                    <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:priorityStrip, display:'inline-block' }} />
                      <span style={{ color:priorityStrip, fontSize:'11px', fontWeight:'600' }}>{selected.priority||'Medium'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  {[
                    { label:'Building', value:selected.location?.building||'—' },
                    { label:'Room', value:selected.location?.room||'Not specified' },
                    { label:'Reported by', value:selected.user?.name||'Student', isUser:true },
                    { label:'Opened', value:timeAgo(selected.createdAt) },
                  ].map((item,i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 13px' }}>
                      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'9px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 4px' }}>{item.label}</p>
                      {item.isUser ? (
                        <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                          <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'#00e87a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'700', color:'#1a1a2e', flexShrink:0 }}>
                            {(selected.user?.name||'S').charAt(0).toUpperCase()}
                          </div>
                          <p style={{ color:'#fff', fontSize:'12px', fontWeight:'500', margin:0 }}>{item.value}</p>
                        </div>
                      ) : (
                        <p style={{ color:'#fff', fontSize:'12px', fontWeight:'500', margin:0 }}>{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selected.description && (
                <div style={{ padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 8px' }}>Description</p>
                  <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px', lineHeight:'1.7', margin:0, background:'rgba(255,255,255,0.04)', padding:'12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.07)' }}>
                    {selected.description}
                  </p>
                </div>
              )}

              <div style={{ padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 10px', fontWeight:'600' }}>Update Status</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px' }}>
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => setNewStatus(s)}
                      style={{ padding:'9px 12px', borderRadius:'9px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', border:newStatus===s?'1px solid rgba(255,255,255,0.3)':'1px solid rgba(255,255,255,0.08)', background:newStatus===s?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.04)', color:newStatus===s?'#fff':'rgba(255,255,255,0.5)', fontSize:'12px', fontWeight:newStatus===s?'600':'400', fontFamily:"'Segoe UI',sans-serif", transition:'all 0.15s' }}
                    >
                      {s}
                      {newStatus===s&&<i className="ti ti-check" style={{ fontSize:'13px', color:'#00e87a' }} aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 10px', fontWeight:'600' }}>Assign to</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  {TEAM_MEMBERS.map(member => (
                    <div key={member.name}
                      onClick={() => setAssignedTo(assignedTo===member.name?'':member.name)}
                      style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'9px', cursor:'pointer', border:assignedTo===member.name?'1px solid rgba(0,232,122,0.4)':'1px solid rgba(255,255,255,0.08)', background:assignedTo===member.name?'rgba(0,232,122,0.1)':'rgba(255,255,255,0.04)', transition:'all 0.15s' }}
                    >
                      <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:member.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', color:member.textColor, flexShrink:0 }}>
                        {member.initials}
                      </div>
                      <span style={{ color:assignedTo===member.name?'#fff':'rgba(255,255,255,0.55)', fontSize:'12px', fontWeight:assignedTo===member.name?'600':'400', flex:1 }}>{member.name}</span>
                      {assignedTo===member.name&&<i className="ti ti-check" style={{ fontSize:'13px', color:'#00e87a' }} aria-hidden="true" />}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 10px', fontWeight:'600' }}>Internal Notes</p>
                {issueNotes.length===0&&(
                  <p style={{ color:'rgba(255,255,255,0.2)', fontSize:'12px', margin:'0 0 10px' }}>No notes yet</p>
                )}
                {issueNotes.map((n,i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'10px 12px', marginBottom:'8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'5px' }}>
                      <div style={{ width:'20px', height:'20px', borderRadius:'50%', background:'#fbbf24', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'700', color:'#1a1a2e' }}>
                        {n.author.charAt(0)}
                      </div>
                      <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>{n.author} · {timeAgo(n.time)}</span>
                    </div>
                    <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'12px', margin:0, lineHeight:'1.5' }}>{n.text}</p>
                  </div>
                ))}
                <textarea placeholder="Add an internal note — only visible to facilities staff..."
                  value={note} onChange={e => setNote(e.target.value)}
                  style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 12px', color:'rgba(255,255,255,0.7)', fontSize:'12px', resize:'none', height:'70px', outline:'none', fontFamily:"'Segoe UI',sans-serif", boxSizing:'border-box', lineHeight:'1.5' }}
                />
                <button onClick={addNote} disabled={!note.trim()}
                  style={{ marginTop:'7px', padding:'8px 16px', background:note.trim()?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', color:note.trim()?'rgba(255,255,255,0.8)':'rgba(255,255,255,0.25)', fontSize:'11px', cursor:note.trim()?'pointer':'not-allowed', fontFamily:"'Segoe UI',sans-serif", transition:'all 0.15s' }}
                >
                  Add note
                </button>
              </div>

              <div style={{ padding:'16px 22px', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'11px', margin:0 }}>
                    {assignedTo
                      ? <span>Assigned to <span style={{ color:'#00e87a', fontWeight:'600' }}>{assignedTo}</span></span>
                      : <span>Unassigned</span>
                    }
                  </p>
                  <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', margin:0 }}>Opened {timeAgo(selected.createdAt)}</p>
                </div>
                <button onClick={handleStatusUpdate}
                  disabled={updating||newStatus===selected.status}
                  style={{ width:'100%', padding:'13px', background:(updating||newStatus===selected.status)?'rgba(0,232,122,0.35)':'#00e87a', border:'none', borderRadius:'10px', color:'#1a1a2e', fontSize:'13px', fontWeight:'700', cursor:(updating||newStatus===selected.status)?'not-allowed':'pointer', fontFamily:"'Segoe UI',sans-serif", transition:'all 0.2s' }}
                >
                  {updating?'Saving...':newStatus===selected.status?'No changes':'Save — Update to '+newStatus}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilitiesDashboard;