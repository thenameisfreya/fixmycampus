import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getIssues } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const BUILDINGS = [
  { name:'Main Building',      lat:51.4441, lng:-0.3325, description:'Main academic building' },
  { name:'K Block',            lat:51.4445, lng:-0.3318, description:'Lecture theatres and seminar rooms' },
  { name:'Block B',            lat:51.4438, lng:-0.3330, description:'Student services and admin' },
  { name:'Block C',            lat:51.4436, lng:-0.3322, description:'Science and computing labs' },
  { name:'Waldegrave Suite',   lat:51.4443, lng:-0.3310, description:'Events and conference space' },
  { name:'Library',            lat:51.4440, lng:-0.3315, description:'Library and learning resources' },
  { name:'Sports Centre',      lat:51.4433, lng:-0.3340, description:'Sports and recreation facilities' },
  { name:'Student Union',      lat:51.4448, lng:-0.3328, description:'Student union and social spaces' },
];

const PRIORITY_COLORS = {
  Urgent: '#ef4444',
  High:   '#f59e0b',
  Medium: '#3b82f6',
  Low:    '#10b981',
};

const NAV = [
  { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/facilities' },
  { icon:'ti-list-check',       label:'All Issues',   path:'/allissues' },
  { icon:'ti-map-pin',          label:'Campus Map',   path:'/campusmap', active:true },
  { icon:'ti-chart-bar',        label:'Analytics',    path:'/analytics' },
  { icon:'ti-bell',             label:'Notifications', path:'/notifications' },
  { icon:'ti-help',             label:'Help',         path:'/facilitieshelp' },
];

const CampusMap = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    getIssues().then(res => setIssues(res.data)).catch(console.log);
  }, []);

  const getIssuesForBuilding = (buildingName) =>
    issues.filter(i => i.location?.building === buildingName);

  const getWorstPriority = (buildingIssues) => {
    if (buildingIssues.some(i => i.priority === 'Urgent')) return 'Urgent';
    if (buildingIssues.some(i => i.priority === 'High')) return 'High';
    if (buildingIssues.some(i => i.priority === 'Medium')) return 'Medium';
    if (buildingIssues.length > 0) return 'Low';
    return null;
  };

  const STATUS_BADGE = {
    'New':            { background:'#ede9fe', color:'#7c3aed' },
    'In Progress':    { background:'#fef3c7', color:'#d97706' },
    'Awaiting Parts': { background:'#ffedd5', color:'#c2410c' },
    'Resolved':       { background:'#d1fae5', color:'#065f46' },
    'Closed':         { background:'#f3f4f6', color:'#6b7280' },
  };

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
        <div style={{ background:'linear-gradient(135deg,#1a1a2e,#1e3a2e)', padding:'20px 28px', borderBottom:'3px solid #00e87a' }}>
          <p style={{ color:'rgba(0,232,122,0.6)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', margin:'0 0 4px', fontWeight:'600' }}>St Mary's University · Facilities Portal</p>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h1 style={{ color:'#fff', fontSize:'20px', fontWeight:'700', margin:0, letterSpacing:'-0.3px' }}>Campus Map</h1>
            <div style={{ display:'flex', gap:'6px' }}>
              {['All','New','In Progress','Resolved'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding:'5px 12px', borderRadius:'20px', border:'none', background:filter===f?'#00e87a':'rgba(255,255,255,0.1)', color:filter===f?'#1a1a2e':'rgba(255,255,255,0.6)', fontSize:'10px', fontWeight:filter===f?'700':'400', cursor:'pointer', fontFamily:"'Segoe UI',sans-serif", transition:'all 0.2s' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', height:'calc(100vh - 89px)' }}>

          <div style={{ flex:1, position:'relative' }}>
            <MapContainer
              center={[51.4441, -0.3325]}
              zoom={17}
              style={{ height:'100%', width:'100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {BUILDINGS.map(building => {
                const buildingIssues = getIssuesForBuilding(building.name);
                const filteredBuildingIssues = filter === 'All'
                  ? buildingIssues
                  : buildingIssues.filter(i => i.status === filter);
                const worstPriority = getWorstPriority(filteredBuildingIssues);
                const color = worstPriority ? PRIORITY_COLORS[worstPriority] : '#00e87a';
                const hasIssues = filteredBuildingIssues.length > 0;

                return (
                  <React.Fragment key={building.name}>
                    {hasIssues && (
                      <Circle
                        center={[building.lat, building.lng]}
                        radius={30}
                        pathOptions={{ color, fillColor:color, fillOpacity:0.2, weight:2 }}
                      />
                    )}
                    <Marker
                      position={[building.lat, building.lng]}
                      eventHandlers={{ click: () => setSelected(building) }}
                    >
                      <Popup>
                        <div style={{ fontFamily:"'Segoe UI',sans-serif", minWidth:'160px' }}>
                          <p style={{ fontWeight:'700', fontSize:'13px', margin:'0 0 4px', color:'#111827' }}>{building.name}</p>
                          <p style={{ fontSize:'11px', color:'#6b7280', margin:'0 0 8px' }}>{building.description}</p>
                          {filteredBuildingIssues.length === 0 ? (
                            <p style={{ fontSize:'11px', color:'#9ca3af', margin:0 }}>No active issues</p>
                          ) : (
                            <div>
                              <p style={{ fontSize:'10px', fontWeight:'600', color:'#374151', margin:'0 0 4px' }}>{filteredBuildingIssues.length} issue{filteredBuildingIssues.length>1?'s':''}</p>
                              {filteredBuildingIssues.slice(0,3).map(issue => (
                                <div key={issue._id} style={{ fontSize:'10px', color:'#6b7280', padding:'3px 0', borderTop:'1px solid #f3f4f6' }}>
                                  {issue.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>

            <div style={{ position:'absolute', bottom:'16px', left:'16px', zIndex:1000, background:'#fff', borderRadius:'10px', padding:'10px 14px', boxShadow:'0 4px 20px rgba(0,0,0,0.12)', border:'1px solid #e5e7eb' }}>
              <p style={{ fontSize:'10px', fontWeight:'700', color:'#374151', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'1px' }}>Priority</p>
              {Object.entries(PRIORITY_COLORS).map(([label, color]) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
                  <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:color }} />
                  <span style={{ fontSize:'11px', color:'#6b7280' }}>{label}</span>
                </div>
              ))}
              <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'4px', paddingTop:'4px', borderTop:'1px solid #f3f4f6' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#00e87a' }} />
                <span style={{ fontSize:'11px', color:'#6b7280' }}>No issues</span>
              </div>
            </div>
          </div>

          <div style={{ width:'280px', background:'#fff', borderLeft:'1px solid #e5e7eb', overflowY:'auto', flexShrink:0 }}>
            {!selected ? (
              <div style={{ padding:'24px 20px', textAlign:'center', marginTop:'40px' }}>
                <i className="ti ti-map-pin" style={{ fontSize:'32px', color:'#d1d5db', display:'block', marginBottom:'12px' }} aria-hidden="true" />
                <p style={{ color:'#374151', fontSize:'13px', fontWeight:'600', margin:'0 0 6px' }}>Click a building</p>
                <p style={{ color:'#9ca3af', fontSize:'12px', margin:0 }}>Select any marker on the map to see its issues</p>
              </div>
            ) : (
              <div>
                <div style={{ background:'#1c2e22', padding:'16px 18px' }}>
                  <p style={{ color:'rgba(0,232,122,0.6)', fontSize:'9px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 3px', fontWeight:'600' }}>Selected Building</p>
                  <p style={{ color:'#fff', fontSize:'15px', fontWeight:'700', margin:'0 0 2px' }}>{selected.name}</p>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px', margin:0 }}>{selected.description}</p>
                </div>
                <div style={{ padding:'14px' }}>
                  {(() => {
                    const buildingIssues = filter === 'All'
                      ? getIssuesForBuilding(selected.name)
                      : getIssuesForBuilding(selected.name).filter(i => i.status === filter);
                    if (buildingIssues.length === 0) return (
                      <div style={{ textAlign:'center', padding:'30px 0' }}>
                        <i className="ti ti-circle-check" style={{ fontSize:'28px', color:'#00e87a', display:'block', marginBottom:'8px' }} aria-hidden="true" />
                        <p style={{ color:'#6b7280', fontSize:'12px', margin:0 }}>No issues for this filter</p>
                      </div>
                    );
                    return buildingIssues.map(issue => {
                      const badge = STATUS_BADGE[issue.status] || STATUS_BADGE['Closed'];
                      const pc = PRIORITY_COLORS[issue.priority] || '#3b82f6';
                      return (
                        <div key={issue._id}
                          onClick={() => navigate('/issues/'+issue._id)}
                          style={{ background:'#f9fafb', borderRadius:'10px', border:'1px solid #e5e7eb', borderLeft:'3px solid '+pc, padding:'11px 13px', marginBottom:'8px', cursor:'pointer', transition:'box-shadow 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                        >
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                            <p style={{ color:'#111827', fontSize:'12px', fontWeight:'600', margin:0, flex:1, paddingRight:'8px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{issue.title}</p>
                            <span style={{ padding:'2px 7px', borderRadius:'20px', background:badge.background, color:badge.color, fontSize:'9px', fontWeight:'600', flexShrink:0 }}>{issue.status}</span>
                          </div>
                          <p style={{ color:'#9ca3af', fontSize:'10px', margin:'0 0 4px' }}>{issue.category}</p>
                          <span style={{ color:pc, fontSize:'10px', fontWeight:'600' }}>● {issue.priority}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusMap;