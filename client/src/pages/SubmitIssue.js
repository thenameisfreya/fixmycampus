import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { createIssue } from '../services/api';

const CATEGORIES = [
  { value:'Electrical', icon:'ti-bolt', color:'#f59e0b' },
  { value:'Plumbing', icon:'ti-tool', color:'#3b82f6' },
  { value:'Heating', icon:'ti-temperature', color:'#ef4444' },
  { value:'IT Equipment', icon:'ti-device-desktop', color:'#8b5cf6' },
  { value:'Structural', icon:'ti-building', color:'#6b7280' },
  { value:'Lighting', icon:'ti-bulb', color:'#f59e0b' },
  { value:'Cleaning', icon:'ti-wash', color:'#10b981' },
  { value:'Other', icon:'ti-dots', color:'#9ca3af' }
];

const BUILDINGS = [
  'K Block', 'Main Building', 'Waldegrave Suite', 'Block B', 'Block C',
  'Block D', 'Block E', 'Block F', 'Block G', '1850 Theatre',
  'Sports Centre', 'Library', 'Student Union', 'Chaplaincy', 'Car Park',
  'The Pub', 'Other'
];

const PRIORITIES = [
  { value:'Low', color:'#10b981', border:'rgba(16,185,129,0.4)', bg:'rgba(16,185,129,0.06)', sub:'Not urgent' },
  { value:'Medium', color:'#f59e0b', border:'rgba(245,158,11,0.4)', bg:'rgba(245,158,11,0.06)', sub:'Needs attention' },
  { value:'High', color:'#ef4444', border:'rgba(239,68,68,0.4)', bg:'rgba(239,68,68,0.06)', sub:'Urgent' }
];

const PLACEHOLDERS = {
  Electrical: 'e.g. Lights flickering in room 204 since Monday, making it hard to work...',
  Plumbing: 'e.g. Leak under the sink in the ground floor bathroom, water pooling on floor...',
  Heating: 'e.g. Radiator in office has not been working since last Thursday...',
  'IT Equipment': 'e.g. Projector not connecting to laptop, tried restarting with no success...',
  Structural: 'e.g. Ceiling tile loose and dropping in corridor near room 12...',
  Lighting: 'e.g. Three bulbs blown in the stairwell, area is very dark...',
  Cleaning: 'e.g. Spillage in the canteen not cleaned up since this morning...',
  Other: 'Describe the issue in as much detail as possible...'
};

const S = {
  page: { minHeight:'100vh', fontFamily:"'Segoe UI',sans-serif", background:'#eef0f5', position:'relative' },
  canvas: { position:'fixed', inset:0, zIndex:1, pointerEvents:'none' },
  content: { maxWidth:'680px', margin:'0 auto', padding:'40px 24px', position:'relative', zIndex:5 },
  glass: { background:'rgba(255,255,255,0.75)', backdropFilter:'blur(16px)', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', padding:'28px' },
  label: { display:'block', color:'#374151', fontSize:'12px', fontWeight:'600', letterSpacing:'0.5px', marginBottom:'5px' },
  input: { width:'100%', padding:'11px 13px', background:'rgba(255,255,255,0.85)', border:'1px solid rgba(0,0,0,0.1)', borderRadius:'10px', color:'#1a1a2e', fontSize:'13px', outline:'none', transition:'all 0.2s ease', boxSizing:'border-box', fontFamily:"'Segoe UI',sans-serif" },
  select: { width:'100%', padding:'11px 13px', background:'rgba(255,255,255,0.85)', border:'1px solid rgba(0,0,0,0.1)', borderRadius:'10px', color:'#1a1a2e', fontSize:'13px', outline:'none', transition:'all 0.2s ease', boxSizing:'border-box', appearance:'none', cursor:'pointer' },
  textarea: { width:'100%', padding:'11px 13px', background:'rgba(255,255,255,0.85)', border:'1px solid rgba(0,0,0,0.1)', borderRadius:'10px', color:'#1a1a2e', fontSize:'13px', outline:'none', transition:'all 0.2s ease', boxSizing:'border-box', resize:'vertical', minHeight:'100px', fontFamily:"'Segoe UI',sans-serif" },
  fieldWrap: { marginBottom:'18px' },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' },
  progressTrack: { height:'4px', background:'rgba(0,0,0,0.08)', borderRadius:'4px', marginBottom:'20px', overflow:'hidden' },
};

const focus = e => { e.target.style.border='1px solid rgba(0,232,122,0.5)'; e.target.style.boxShadow='0 0 0 3px rgba(0,232,122,0.1)'; };
const blur = e => { e.target.style.border='1px solid rgba(0,0,0,0.1)'; e.target.style.boxShadow='none'; };

const SubmitIssue = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ category:'Electrical', building:'', room:'', title:'', description:'', priority:'Medium', photo:null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let id;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const cols = [
      {r:99,g:102,b:241},{r:0,g:184,b:94},{r:245,g:158,b:11},
      {r:59,g:130,b:246},{r:139,g:92,b:246},{r:16,g:185,b:129}
    ];
    const pts = Array.from({length:120}, () => {
      const c = cols[Math.floor(Math.random()*cols.length)];
      return { x:Math.random()*canvas.width, y:Math.random()*canvas.height, vx:(Math.random()-.5)*1.2, vy:(Math.random()-.5)*1.2, r:Math.random()*2.5+.8, c, pulse:Math.random()*Math.PI*2 };
    });
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.forEach(p => {
        p.pulse+=.04; p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>canvas.width) p.vx*=-1;
        if(p.y<0||p.y>canvas.height) p.vy*=-1;
        const s=p.r+Math.sin(p.pulse)*.5;
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,s*4);
        g.addColorStop(0,`rgba(${p.c.r},${p.c.g},${p.c.b},0.3)`);
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,s*4,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,s,0,Math.PI*2);
        ctx.fillStyle=`rgba(${p.c.r},${p.c.g},${p.c.b},0.85)`; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<100){
          const a=(1-d/100)*.4;
          const r=Math.floor((pts[i].c.r+pts[j].c.r)/2);
          const g=Math.floor((pts[i].c.g+pts[j].c.g)/2);
          const b=Math.floor((pts[i].c.b+pts[j].c.b)/2);
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(${r},${g},${b},${a})`; ctx.lineWidth=.8; ctx.stroke();
        }
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize',resize); };
  }, []);

  const update = (field, val) => setForm(prev => ({...prev, [field]: val}));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => update('photo', { name: file.name, data: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.title.trim()) return setError('Please enter a title');
    if (!form.description.trim()) return setError('Please describe the issue');
    setLoading(true);
    try {
      await createIssue({
        title: form.title,
        category: form.category,
        location: { building: form.building, room: form.room },
        description: form.description,
        priority: form.priority
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit, please try again');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div style={S.page}>
      <canvas ref={canvasRef} style={S.canvas} />
      <div style={S.content}>
        <div style={{...S.glass, textAlign:'center', padding:'48px 32px'}}>
          <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 8px 24px rgba(0,184,94,0.3)' }}>
            <i className="ti ti-check" style={{ fontSize:'30px', color:'#1a1a2e' }} aria-hidden="true" />
          </div>
          <h2 style={{ color:'#1a1a2e', fontSize:'22px', fontWeight:'700', margin:'0 0 8px' }}>Report submitted!</h2>
          <p style={{ color:'#6b7280', fontSize:'13px', margin:'0 0 24px' }}>
            The facilities team has been notified and will respond shortly.
          </p>
          <div style={{ background:'rgba(0,232,122,0.06)', border:'1px solid rgba(0,232,122,0.2)', borderRadius:'12px', padding:'16px', marginBottom:'24px', textAlign:'left' }}>
            <p style={{ color:'#9ca3af', fontSize:'9px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 8px' }}>Your report</p>
            <p style={{ color:'#1a1a2e', fontSize:'14px', fontWeight:'600', margin:'0 0 4px' }}>{form.title}</p>
            <p style={{ color:'#6b7280', fontSize:'12px', margin:0 }}>
              {form.category} · {form.building || 'Location not specified'} · {form.priority} priority
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,#00e87a,#00b85e)', border:'none', borderRadius:'12px', color:'#1a1a2e', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <canvas ref={canvasRef} style={S.canvas} />

      <div style={S.content}>
        <div style={{ marginBottom:'24px' }}>
          <p style={{ color:'#00b85e', fontSize:'10px', letterSpacing:'2.5px', textTransform:'uppercase', margin:'0 0 5px', fontWeight:'600' }}>
            St Mary's University, Twickenham
          </p>
          <h1 style={{ color:'#1a1a2e', fontSize:'22px', fontWeight:'700', margin:'0 0 4px', letterSpacing:'-0.5px' }}>
            {greeting}, {user && user.name.split(' ')[0]}
          </h1>
          <p style={{ color:'#6b7280', fontSize:'13px', margin:0 }}>
            Report a maintenance issue below. We'll notify the team immediately.
          </p>
        </div>

        <div style={S.progressTrack}>
          <div style={{ height:'100%', width: step === 1 ? '50%' : '100%', background:'linear-gradient(90deg,#00e87a,#00b85e)', borderRadius:'4px', transition:'width 0.4s ease' }} />
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'24px', height:'24px', borderRadius:'50%', background: step > 1 ? '#00e87a' : '#1a1a2e', color: step > 1 ? '#1a1a2e' : '#fff', fontSize:'10px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {step > 1 ? <i className="ti ti-check" style={{ fontSize:'12px' }} aria-hidden="true" /> : '1'}
            </div>
            <span style={{ fontSize:'11px', fontWeight:'600', color: step > 1 ? '#059669' : '#1a1a2e' }}>What & Where</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'11px', fontWeight:'600', color: step === 2 ? '#1a1a2e' : '#9ca3af' }}>Details & Photo</span>
            <div style={{ width:'24px', height:'24px', borderRadius:'50%', background: step === 2 ? '#1a1a2e' : 'rgba(0,0,0,0.08)', color: step === 2 ? '#fff' : '#9ca3af', fontSize:'10px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center' }}>
              2
            </div>
          </div>
        </div>

        {step === 1 && (
          <div style={S.glass}>
            <p style={{ color:'#6b7280', fontSize:'12px', fontWeight:'500', margin:'0 0 14px' }}>What type of issue is it?</p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'22px' }}>
              {CATEGORIES.map(cat => (
                <div
                  key={cat.value}
                  onClick={() => update('category', cat.value)}
                  style={{
                    padding:'20px 10px', borderRadius:'14px', textAlign:'center', cursor:'pointer',
                    border: form.category === cat.value ? '1.5px solid rgba(0,232,122,0.5)' : '1.5px solid rgba(0,0,0,0.08)',
                    background: form.category === cat.value ? 'rgba(0,232,122,0.07)' : 'rgba(255,255,255,0.8)',
                    transform: form.category === cat.value ? 'scale(1.06)' : 'scale(1)',
                    transition:'all 0.2s cubic-bezier(0.34,1.56,0.64,1)'
                  }}
                >
                  <i className={'ti '+cat.icon} style={{ fontSize:'28px', color: form.category === cat.value ? '#059669' : cat.color, display:'block', marginBottom:'8px' }} aria-hidden="true" />
                  <span style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.5px', textTransform:'uppercase', color: form.category === cat.value ? '#059669' : '#6b7280' }}>
                    {cat.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={S.grid2}>
              <div style={S.fieldWrap}>
                <label style={S.label}>Building <span style={{ color:'#ef4444' }}>*</span></label>
                <div style={{ position:'relative' }}>
                  <select value={form.building} onChange={e => update('building', e.target.value)} style={S.select} onFocus={focus} onBlur={blur}>
                    <option value="">Select a building</option>
                    {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <i className="ti ti-chevron-down" style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:'14px', pointerEvents:'none' }} aria-hidden="true" />
                </div>
              </div>
              <div style={S.fieldWrap}>
                <label style={S.label}>Room <span style={{ color:'#9ca3af', fontWeight:'400' }}>(optional)</span></label>
                <input type="text" placeholder="e.g. 204, Lab 3" value={form.room} onChange={e => update('room', e.target.value)} style={S.input} onFocus={focus} onBlur={blur} />
              </div>
            </div>

            <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
              <button onClick={() => navigate('/dashboard')} style={{ flex:1, padding:'12px', background:'rgba(0,0,0,0.05)', border:'none', borderRadius:'10px', color:'#6b7280', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => { if (!form.building) { setError('Please select a building'); return; } setError(''); setStep(2); }}
                style={{ flex:2, padding:'12px', background:'linear-gradient(135deg,#00e87a,#00b85e)', border:'none', borderRadius:'10px', color:'#1a1a2e', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}
              >
                Add details! <i className="ti ti-arrow-right" style={{ fontSize:'13px' }} aria-hidden="true" />
              </button>
            </div>
            {error && <p style={{ color:'#dc2626', fontSize:'12px', marginTop:'10px', textAlign:'center' }}>{error}</p>}
          </div>
        )}

        {step === 2 && (
          <div style={S.glass}>

            <div style={S.fieldWrap}>
              <label style={S.label}>Issue title <span style={{ color:'#ef4444' }}>*</span></label>
              <input type="text" placeholder="e.g. Flickering lights in lecture room" value={form.title} onChange={e => update('title', e.target.value)} style={S.input} onFocus={focus} onBlur={blur} />
            </div>

            <div style={S.fieldWrap}>
              <label style={S.label}>Description <span style={{ color:'#ef4444' }}>*</span></label>
              <textarea
                placeholder={PLACEHOLDERS[form.category] || 'Describe the issue...'}
                value={form.description}
                onChange={e => update('description', e.target.value)}
                style={S.textarea}
                onFocus={focus}
                onBlur={blur}
              />
            </div>

            <div style={S.fieldWrap}>
              <label style={S.label}>Priority</label>
              <div style={{ display:'flex', gap:'10px' }}>
                {PRIORITIES.map(p => (
                  <div
                    key={p.value}
                    onClick={() => update('priority', p.value)}
                    style={{
                      flex:1, padding:'10px', borderRadius:'10px', cursor:'pointer', textAlign:'center',
                      border: form.priority === p.value ? '1.5px solid '+p.border : '1.5px solid rgba(0,0,0,0.08)',
                      background: form.priority === p.value ? p.bg : 'rgba(255,255,255,0.8)',
                      transition:'all 0.2s ease'
                    }}
                  >
                    <p style={{ color: form.priority === p.value ? p.color : '#9ca3af', fontSize:'10px', fontWeight:'700', margin:'0 0 2px', textTransform:'uppercase', letterSpacing:'0.5px' }}>{p.value}</p>
                    <p style={{ color: form.priority === p.value ? p.color : '#9ca3af', fontSize:'10px', margin:0, opacity:0.8 }}>{p.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={S.fieldWrap}>
              <label style={S.label}>Photo <span style={{ color:'#9ca3af', fontWeight:'400' }}>(optional)</span></label>
              <label style={{
                display:'block',
                border: form.photo ? '1.5px solid rgba(0,232,122,0.5)' : '1.5px dashed rgba(0,0,0,0.12)',
                borderRadius:'10px', padding:'18px', textAlign:'center',
                background: form.photo ? 'rgba(0,232,122,0.05)' : 'rgba(255,255,255,0.5)',
                cursor:'pointer', transition:'all 0.2s ease'
              }}>
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display:'none' }} />
                <i className={'ti '+(form.photo ? 'ti-circle-check' : 'ti-camera')} style={{ fontSize:'24px', color: form.photo ? '#059669' : '#9ca3af', display:'block', marginBottom:'6px' }} aria-hidden="true" />
                <p style={{ color: form.photo ? '#059669' : '#6b7280', fontSize:'12px', fontWeight:'500', margin:'0 0 2px' }}>
                  {form.photo ? form.photo.name : 'Tap to upload a photo'}
                </p>
                <p style={{ color:'#9ca3af', fontSize:'10px', margin:0 }}>
                  {form.photo ? 'Tap to change' : 'JPG or PNG — max 5MB'}
                </p>
              </label>
            </div>

            {error && (
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', color:'#dc2626', fontSize:'12px' }}>
                {error}
              </div>
            )}

            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => { setError(''); setStep(1); }} style={{ flex:1, padding:'12px', background:'rgba(0,0,0,0.05)', border:'none', borderRadius:'10px', color:'#6b7280', fontSize:'12px', fontWeight:'600', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                <i className="ti ti-arrow-left" style={{ fontSize:'13px' }} aria-hidden="true" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ flex:2, padding:'12px', background: loading ? 'rgba(0,232,122,0.5)' : 'linear-gradient(135deg,#00e87a,#00b85e)', border:'none', borderRadius:'10px', color:'#1a1a2e', fontSize:'12px', fontWeight:'700', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.2s ease' }}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitIssue;