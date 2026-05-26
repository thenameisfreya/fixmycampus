import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getNotifications, markAllRead, markAsRead } from '../services/api';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + ' days ago';
  return Math.floor(diff/604800) + ' weeks ago';
};

const Notifications = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

const NAV = user?.role === 'student' ? [
    { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/dashboard' },
    { icon:'ti-plus',             label:'Report Issue',  path:'/submit' },
    { icon:'ti-list-check',       label:'My Reports',   path:'/myreports' },
    { icon:'ti-bell',             label:'Notifications', path:'/notifications', active:true },
    { icon:'ti-chart-bar',        label:'Analytics',    path:'/studentanalytics' },
    { icon:'ti-help',             label:'Help',         path:'/help' },
] : [
    { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/facilities' },
    { icon:'ti-list-check',       label:'All Issues',   path:'/allissues' },
    { icon:'ti-map-pin',          label:'Campus Map',   path:'/campusmap' },
    { icon:'ti-chart-bar',        label:'Analytics',    path:'/analytics' },
    { icon:'ti-bell',             label:'Notifications', path:'/notifications', active:true },
    { icon:'ti-help',             label:'Help',         path:'/facilitieshelp' },
];

  useEffect(() => {
    getNotifications()
      .then(res => setNotifications(res.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({...n, read: true})));
    } catch (err) {
      console.log(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? {...n, read: true} : n));
    } catch (err) {
      console.log(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'Segoe UI',sans-serif", background:'#eef0f5', position:'relative' }}>

      <div style={{ width:'200px', background:'#1a1a2e', display:'flex', flexDirection:'column', padding:'20px 0', flexShrink:0, zIndex:10, position:'fixed', top:0, left:0, bottom:0 }}>
        <div style={{ padding:'0 16px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(0,232,122,0.35)' }}>
              <span style={{ color:'#1a1a2e', fontWeight:'900', fontSize:'14px' }}>R</span>
            </div>
            <span style={{ color:'#fff', fontWeight:'700', fontSize:'13px', letterSpacing:'2px' }}>REFICERE</span>
          </div>
        </div>

        {NAV.map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)}
            style={{ padding:'9px 16px', margin:'0 8px 3px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', background:item.active?'rgba(0,232,122,0.12)':'transparent', border:item.active?'1px solid rgba(0,232,122,0.25)':'1px solid transparent', transition:'all 0.2s ease' }}
            onMouseEnter={e => { if(!item.active) e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if(!item.active) e.currentTarget.style.background='transparent'; }}
          >
            <i className={'ti '+item.icon} style={{ fontSize:'16px', color:item.active?'#00e87a':'rgba(255,255,255,0.35)' }} aria-hidden="true" />
            <span style={{ fontSize:'12px', color:item.active?'#00e87a':'rgba(255,255,255,0.35)', fontWeight:item.active?'600':'400' }}>
              {item.label}
            </span>
          </div>
        ))}

        <div style={{ marginTop:'auto', padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#1a1a2e', flexShrink:0 }}>
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
        <div style={{ background:'linear-gradient(135deg,#1a1a2e,#1e3a2e)', padding:'28px 32px' }}>
          <p style={{ color:'rgba(0,232,122,0.6)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', margin:'0 0 6px', fontWeight:'600' }}>St Mary's University</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            <div>
              <h1 style={{ color:'#fff', fontSize:'22px', fontWeight:'700', margin:'0 0 4px', letterSpacing:'-0.4px' }}>Notifications</h1>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:0 }}>
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : "You're all caught up"
                }
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ padding:'8px 16px', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)', fontSize:'12px', cursor:'pointer', fontFamily:"'Segoe UI',sans-serif", transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div style={{ maxWidth:'680px', margin:'0 auto', padding:'24px' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <p style={{ color:'#9ca3af', fontSize:'14px' }}>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', padding:'60px 32px', textAlign:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              <i className="ti ti-bell-off" style={{ fontSize:'36px', color:'#d1d5db', display:'block', marginBottom:'12px' }} aria-hidden="true" />
              <p style={{ color:'#374151', fontSize:'15px', fontWeight:'600', margin:'0 0 6px' }}>Nothing here yet</p>
              <p style={{ color:'#9ca3af', fontSize:'13px', margin:0 }}>
                When the facilities team updates one of your reports, you will see it here. No need to keep checking your email.
              </p>
            </div>
          ) : (
            <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              {notifications.map((n, i) => (
                <div
                  key={n._id}
                  onClick={() => { handleMarkRead(n._id); if(n.issue) navigate('/issues/'+n.issue._id); }}
                  style={{ padding:'16px 20px', borderBottom:i<notifications.length-1?'1px solid rgba(0,0,0,0.05)':'none', display:'flex', gap:'14px', alignItems:'flex-start', cursor:'pointer', background:n.read?'transparent':'rgba(0,232,122,0.04)', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background=n.read?'transparent':'rgba(0,232,122,0.04)'}
                >
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:n.read?'#d1d5db':'#00e87a', flexShrink:0, marginTop:'6px' }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:n.read?'#6b7280':'#111827', fontSize:'13px', fontWeight:n.read?'400':'600', margin:'0 0 4px', lineHeight:1.5 }}>
                      {n.message}
                    </p>
                    {n.issue && (
                      <p style={{ color:'#9ca3af', fontSize:'11px', margin:'0 0 4px' }}>
                        {n.issue.title} in {n.issue.location?.building}
                      </p>
                    )}
                    <p style={{ color:'#9ca3af', fontSize:'11px', margin:0 }}>{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span style={{ padding:'2px 8px', borderRadius:'20px', background:'#dcfce7', color:'#166534', fontSize:'9px', fontWeight:'600', flexShrink:0 }}>New</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;