import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const FacilitiesHelp = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

const NAV = [
    { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/facilities' },
    { icon:'ti-list-check',       label:'All Issues',   path:'/allissues' },
    { icon:'ti-map-pin',          label:'Campus Map',   path:'/campusmap' },
    { icon:'ti-chart-bar',        label:'Analytics',    path:'/analytics' },
    { icon:'ti-bell',             label:'Notifications', path:'/notifications' },
    { icon:'ti-help',             label:'Help',         path:'/facilitieshelp' },
];
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
        <div style={{ background:'linear-gradient(135deg,#1a1a2e,#1e3a2e)', padding:'24px 28px' }}>
          <p style={{ color:'rgba(0,232,122,0.6)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', margin:'0 0 6px', fontWeight:'600' }}>Facilities Team · St Mary's University</p>
          <h1 style={{ color:'#fff', fontSize:'20px', fontWeight:'700', margin:'0 0 6px', letterSpacing:'-0.3px' }}>Help and Reference</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:0 }}>Everything you need to know about using Reficere day to day.</p>
        </div>

        <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

          <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px 18px', borderTop:'3px solid #00e87a' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className="ti ti-list-check" style={{ fontSize:'18px', color:'#16a34a' }} aria-hidden="true" />
              </div>
              <p style={{ color:'#111827', fontSize:'14px', fontWeight:'700', margin:0 }}>Managing issues</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                { num:'1', title:'Updating a status', body:'Click any issue, pick a new status on the right panel and hit Save. The student gets an email straight away. You do not need to contact them separately.' },
                { num:'2', title:'Assigning to someone', body:'Open the issue and scroll to Assign To. Tap a name. This is just for your own records and does not notify the student.' },
                { num:'3', title:'Internal notes', body:'Use the notes box to track parts ordered, engineer visits, anything useful. Students never see these.' },
              ].map((step, i) => (
                <div key={i} style={{ display:'flex', gap:'12px', padding:'10px 12px', background:'#f9fafb', borderRadius:'8px', border:'1px solid #f0f0f0', alignItems:'flex-start' }}>
                  <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'800', color:'#1a1a2e', flexShrink:0, marginTop:'1px' }}>
                    {step.num}
                  </div>
                  <div>
                    <p style={{ color:'#111827', fontSize:'12px', fontWeight:'600', margin:'0 0 2px' }}>{step.title}</p>
                    <p style={{ color:'#6b7280', fontSize:'11px', margin:0, lineHeight:'1.5' }}>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'14px 16px', borderTop:'3px solid #6366f1' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'#eef2ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className="ti ti-tags" style={{ fontSize:'16px', color:'#4f46e5' }} aria-hidden="true" />
                </div>
                <p style={{ color:'#111827', fontSize:'13px', fontWeight:'700', margin:0 }}>Status guide</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                {[
                  { label:'New', bg:'#dcfce7', color:'#166534', desc:'Just come in, nobody has looked yet' },
                  { label:'In Progress', bg:'#fef9c3', color:'#854d0e', desc:'Someone is actively working on it' },
                  { label:'Awaiting Parts', bg:'#ffedd5', color:'#9a3412', desc:'Waiting on a supplier or delivery' },
                  { label:'Resolved', bg:'#dbeafe', color:'#1e40af', desc:'Fixed, student gets an email' },
                  { label:'Closed', bg:'#f3f4f6', color:'#6b7280', desc:'Fully done, off the active list' },
                ].map((s, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 10px', background:'#f9fafb', borderRadius:'7px' }}>
                    <span style={{ padding:'2px 8px', borderRadius:'20px', background:s.bg, color:s.color, fontSize:'10px', fontWeight:'600', flexShrink:0 }}>{s.label}</span>
                    <p style={{ color:'#6b7280', fontSize:'11px', margin:0, flex:1 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'14px 16px', borderTop:'3px solid #f59e0b' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'#fffbeb', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className="ti ti-flag" style={{ fontSize:'16px', color:'#d97706' }} aria-hidden="true" />
                </div>
                <p style={{ color:'#111827', fontSize:'13px', fontWeight:'700', margin:0 }}>Priority guide</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                {[
                  { label:'Urgent', bg:'#fef2f2', color:'#991b1b', border:'#fecaca', rowBg:'#fef2f2', desc:'Safety risk', target:'Same day', targetColor:'#ef4444' },
                  { label:'High', bg:'#fff7ed', color:'#9a3412', border:'#fed7aa', rowBg:'#fff7ed', desc:'Affecting teaching', target:'24 hours', targetColor:'#f59e0b' },
                  { label:'Medium', bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', rowBg:'#eff6ff', desc:'Not critical', target:'3 days', targetColor:'#3b82f6' },
                  { label:'Low', bg:'#f0fdf4', color:'#166534', border:'#bbf7d0', rowBg:'#f0fdf4', desc:'Minor issue', target:'This week', targetColor:'#10b981' },
                ].map((p, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 10px', background:p.rowBg, borderRadius:'7px', border:'1px solid '+p.border }}>
                    <span style={{ padding:'2px 8px', borderRadius:'20px', background:p.bg, color:p.color, border:'1px solid '+p.border, fontSize:'10px', fontWeight:'600', flexShrink:0 }}>{p.label}</span>
                    <p style={{ color:'#6b7280', fontSize:'11px', margin:0, flex:1 }}>{p.desc}</p>
                    <span style={{ color:p.targetColor, fontSize:'10px', fontWeight:'700', flexShrink:0 }}>{p.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ gridColumn:'1/-1', background:'#1c2e22', borderRadius:'12px', padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <i className="ti ti-headset" style={{ fontSize:'20px', color:'#00e87a' }} aria-hidden="true" />
              </div>
              <div>
                <p style={{ color:'#fff', fontSize:'13px', fontWeight:'700', margin:'0 0 2px' }}>Something not working in Reficere?</p>
                <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'12px', margin:0 }}>Get in touch with the IT helpdesk and they will sort it out.</p>
              </div>
            </div>
            <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
              {[
                { icon:'ti-mail', value:'it@stmarys.ac.uk', color:'#00e87a' },
                { icon:'ti-phone', value:'020 8240 4100', color:'rgba(255,255,255,0.5)' },
                { icon:'ti-clock', value:'Mon to Fri, 9am to 5pm', color:'rgba(255,255,255,0.5)' },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                  <i className={'ti '+item.icon} style={{ fontSize:'15px', color:'#00e87a' }} aria-hidden="true" />
                  <p style={{ color:item.color, fontSize:'12px', fontWeight: i===0?'600':'400', margin:0 }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesHelp;