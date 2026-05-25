import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getIssue, addComment } from '../services/api';

const TIMELINE_STEPS = [
  { label:'Submitted', icon:'ti-check', key:'submitted' },
  { label:'Assigned', icon:'ti-user', key:'assigned' },
  { label:'In Progress', icon:'ti-tool', key:'progress' },
  { label:'Resolved', icon:'ti-circle-check', key:'resolved' },
];

const STATUS_STEP = {
  'New': 1,
  'In Progress': 2,
  'Awaiting Parts': 2,
  'Resolved': 4,
  'Closed': 4,
};

const PRIORITY_COLORS = {
  Urgent: '#ef4444', High: '#f59e0b', Medium: '#3b82f6', Low: '#10b981'
};

const STATUS_BADGE = {
  'New':            { bg:'rgba(220,252,231,0.15)', border:'rgba(134,239,172,0.3)', color:'#86efac' },
  'In Progress':    { bg:'rgba(254,249,195,0.15)', border:'rgba(253,230,138,0.3)', color:'#fde68a' },
  'Awaiting Parts': { bg:'rgba(255,237,213,0.15)', border:'rgba(253,186,116,0.3)', color:'#fdba74' },
  'Resolved':       { bg:'rgba(219,234,254,0.15)', border:'rgba(147,197,253,0.3)', color:'#93c5fd' },
  'Closed':         { bg:'rgba(243,244,246,0.15)', border:'rgba(209,213,219,0.3)', color:'#d1d5db' },
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

const StarRating = ({ onRate }) => {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const messages = {
    1: 'Really sorry to hear that. We\'ll look into how we can improve.',
    2: 'Thanks for the feedback. We\'ll try to do better.',
    3: 'Thanks for rating us. We\'ll keep working on it.',
    4: 'Great to hear — thanks for your feedback!',
    5: 'Amazing! Really glad we could sort this for you!'
  };

  const handleRate = (n) => {
    setSelected(n);
    setSubmitted(true);
    if (onRate) onRate(n);
  };

  if (submitted) return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
      <div style={{ display:'flex', gap:'4px' }}>
        {[1,2,3,4,5].map(n => (
          <span key={n} style={{ fontSize:'22px', color: n <= selected ? '#fbbf24' : '#e5e7eb' }}>★</span>
        ))}
      </div>
      <p style={{ color:'#16a34a', fontSize:'13px', fontWeight:'500', margin:0 }}>{messages[selected]}</p>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', gap:'6px', marginBottom:'8px' }}>
        {[1,2,3,4,5].map(n => (
          <span
            key={n}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleRate(n)}
            style={{ fontSize: hovered >= n || selected >= n ? '30px' : '26px', color: hovered >= n || selected >= n ? '#fbbf24' : '#d1d5db', cursor:'pointer', transition:'all 0.15s', lineHeight:1 }}
          >
            ★
          </span>
        ))}
      </div>
      {hovered > 0 && (
        <p style={{ color:'#9ca3af', fontSize:'11px', margin:0 }}>
          {hovered === 1 ? 'Very poor' : hovered === 2 ? 'Poor' : hovered === 3 ? 'Okay' : hovered === 4 ? 'Good' : 'Excellent'}
        </p>
      )}
    </div>
  );
};

const IssueDetail = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const canvasRef = useRef(null);
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
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
    const pts = Array.from({length:80}, () => {
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
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize',resize); };
  }, []);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await getIssue(id);
        setIssue(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await addComment(id, { text: comment });
      setIssue(res.data);
      setComment('');
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#eef0f5', fontFamily:"'Segoe UI',sans-serif" }}>
      <p style={{ color:'#9ca3af', fontSize:'14px' }}>Loading issue...</p>
    </div>
  );

  if (!issue) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#eef0f5', fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <p style={{ color:'#374151', fontSize:'16px', fontWeight:'600', margin:'0 0 8px' }}>Issue not found</p>
        <button onClick={() => navigate('/dashboard')} style={{ padding:'10px 20px', background:'linear-gradient(135deg,#00e87a,#00b85e)', border:'none', borderRadius:'10px', color:'#1a1a2e', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const currentStep = STATUS_STEP[issue.status] || 1;
  const progressPct = ((currentStep - 1) / 3) * 100;
  const sb = STATUS_BADGE[issue.status] || STATUS_BADGE['New'];
  const priorityColor = PRIORITY_COLORS[issue.priority] || '#3b82f6';
  const isResolved = issue.status === 'Resolved' || issue.status === 'Closed';

  return (
    <div style={{ minHeight:'100vh', fontFamily:"'Segoe UI',sans-serif", background:'#eef0f5', position:'relative' }}>
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:5, maxWidth:'760px', margin:'0 auto', padding:'32px 24px 60px' }}>

        <div style={{ background:'linear-gradient(135deg,#1a1a2e,#1e3a2e)', borderRadius:'20px', padding:'24px 26px 30px', marginBottom:'16px', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ display:'flex', alignItems:'center', gap:'5px', padding:'7px 14px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.7)', fontSize:'12px', cursor:'pointer', fontFamily:"'Segoe UI',sans-serif", transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
            >
              <i className="ti ti-arrow-left" style={{ fontSize:'13px' }} aria-hidden="true" />
              My Reports
            </button>
            <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'14px' }}>›</span>
            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {issue.title}
            </span>
          </div>

          <p style={{ color:'rgba(0,232,122,0.6)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', margin:'0 0 7px', fontWeight:'600' }}>
            {issue.category} · {issue.location?.building}{issue.location?.room ? ' · Room '+issue.location.room : ''}
          </p>
          <h1 style={{ color:'#fff', fontSize:'22px', fontWeight:'700', margin:'0 0 12px', letterSpacing:'-0.4px', lineHeight:1.3 }}>
            {issue.title}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', background:sb.bg, border:'1px solid '+sb.border, borderRadius:'20px', padding:'4px 12px' }}>
              <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:sb.color, display:'inline-block', animation:'pulse 2s ease-in-out infinite' }} />
              <span style={{ color:sb.color, fontSize:'11px', fontWeight:'600' }}>{issue.status}</span>
            </div>
            <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:priorityColor, display:'inline-block' }} />
              <span style={{ color:priorityColor, fontSize:'11px', fontWeight:'600' }}>{issue.priority || 'Medium'}</span>
            </span>
            <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'11px' }}>Opened {timeAgo(issue.createdAt)}</span>
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', padding:'20px 22px', marginBottom:'14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'16px' }}>
            {[
              { label:'Building', value: issue.location?.building || '—' },
              { label:'Room', value: issue.location?.room || 'Not specified' },
              { label:'Category', value: issue.category },
              { label:'Priority', value: issue.priority || 'Medium', color: priorityColor },
            ].map((item, i) => (
              <div key={i} style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'12px 13px' }}>
                <p style={{ color:'#9ca3af', fontSize:'9px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 4px' }}>{item.label}</p>
                <p style={{ color: item.color || '#111827', fontSize:'13px', fontWeight:'600', margin:0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          {issue.description && (
            <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'14px' }}>
              <p style={{ color:'#9ca3af', fontSize:'9px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 7px' }}>Description</p>
              <p style={{ color:'#374151', fontSize:'13px', lineHeight:'1.7', margin:0 }}>{issue.description}</p>
            </div>
          )}
        </div>

        <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', padding:'20px 22px', marginBottom:'14px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <p style={{ color:'#9ca3af', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', margin:0, fontWeight:'600' }}>Status timeline</p>
            <span style={{ color:'#6b7280', fontSize:'11px', fontWeight:'500' }}>Step {currentStep} of 4</span>
          </div>

          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'8px', padding:'11px 14px', marginBottom:'18px', display:'flex', alignItems:'center', gap:'10px' }}>
            <i className="ti ti-clock" style={{ fontSize:'16px', color:'#16a34a', flexShrink:0 }} aria-hidden="true" />
            <div>
              <p style={{ color:'#166534', fontSize:'12px', fontWeight:'600', margin:'0 0 1px' }}>
                {isResolved ? 'This issue has been resolved' : 'Engineer visit scheduled'}
              </p>
              <p style={{ color:'#16a34a', fontSize:'11px', margin:0, opacity:0.8 }}>
                {isResolved ? 'Thank you for your patience' : 'The facilities team will update you with a time soon'}
              </p>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative', padding:'0 4px' }}>
            <div style={{ position:'absolute', top:'13px', left:'18px', right:'18px', height:'3px', background:'#e5e7eb', borderRadius:'2px', zIndex:0 }} />
            <div style={{ position:'absolute', top:'13px', left:'18px', width: progressPct+'%', height:'3px', background:'linear-gradient(90deg,#16a34a,#22c55e)', borderRadius:'2px', zIndex:1, transition:'width 0.5s ease' }} />

            {TIMELINE_STEPS.map((step, i) => {
              const stepNum = i + 1;
              const done = stepNum < currentStep;
              const active = stepNum === currentStep;
              return (
                <div key={step.key} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', zIndex:2, width:'25%' }}>
                  <div style={{ width:'26px', height:'26px', borderRadius:'50%', background: done ? '#dcfce7' : active ? '#fef9c3' : '#f3f4f6', border: done ? '2px solid #16a34a' : active ? '2px solid #ca8a04' : '2px dashed #d1d5db', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className={step.icon} style={{ fontSize:'12px', color: done ? '#16a34a' : active ? '#ca8a04' : '#d1d5db' }} aria-hidden="true" />
                  </div>
                  <p style={{ color: done ? '#16a34a' : active ? '#ca8a04' : '#d1d5db', fontSize:'10px', fontWeight: done||active ? '600' : '400', textAlign:'center', margin:0 }}>{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', padding:'18px 22px', marginBottom:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <p style={{ color:'#111827', fontSize:'13px', fontWeight:'600', margin:'0 0 2px' }}>Email notifications</p>
              <p style={{ color:'#9ca3af', fontSize:'11px', margin:0 }}>Get notified when your issue status changes</p>
            </div>
            <div
              onClick={() => setEmailNotif(!emailNotif)}
              style={{ width:'38px', height:'22px', borderRadius:'11px', background: emailNotif ? '#00e87a' : '#e5e7eb', position:'relative', cursor:'pointer', transition:'background 0.2s ease', flexShrink:0 }}
            >
              <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'#fff', position:'absolute', top:'2px', left: emailNotif ? '18px' : '2px', transition:'left 0.2s ease', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>

        <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', overflow:'hidden', marginBottom:'14px' }}>
          <div style={{ padding:'16px 22px', borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
            <p style={{ color:'#9ca3af', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', margin:0, fontWeight:'600' }}>Comments from facilities team</p>
          </div>

          {(!issue.comments || issue.comments.length === 0) ? (
            <div style={{ padding:'32px 22px', textAlign:'center' }}>
              <i className="ti ti-message-circle" style={{ fontSize:'28px', color:'#d1d5db', display:'block', marginBottom:'8px' }} aria-hidden="true" />
              <p style={{ color:'#9ca3af', fontSize:'13px', margin:0 }}>No comments yet — the facilities team will update you here</p>
            </div>
          ) : (
            issue.comments.map((c, i) => (
              <div key={i} style={{ padding:'16px 22px', borderBottom: i < issue.comments.length-1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'50%', background:'#fbbf24', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#1a1a2e', flexShrink:0 }}>
                    {(c.user?.name || 'F').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ color:'#111827', fontSize:'12px', fontWeight:'600', margin:0 }}>{c.user?.name || 'Facilities Team'}</p>
                    <p style={{ color:'#9ca3af', fontSize:'10px', margin:0 }}>Facilities Team · {timeAgo(c.createdAt)}</p>
                  </div>
                </div>
                <p style={{ color:'#374151', fontSize:'13px', lineHeight:'1.7', margin:'0 0 0 40px' }}>{c.text}</p>
              </div>
            ))
          )}

          <div style={{ padding:'14px 22px', background:'rgba(0,0,0,0.02)', borderTop:'1px solid rgba(0,0,0,0.04)', display:'flex', gap:'10px', alignItems:'center' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#1a1a2e', flexShrink:0 }}>
              {user && user.name.charAt(0).toUpperCase()}
            </div>
            <input
              type="text"
              placeholder="Ask the facilities team a question..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if(e.key === 'Enter') handleComment(); }}
              style={{ flex:1, padding:'9px 12px', border:'1px solid #e5e7eb', borderRadius:'8px', fontSize:'12px', color:'#111827', outline:'none', fontFamily:"'Segoe UI',sans-serif", background:'#fff' }}
            />
            <button
              onClick={handleComment}
              disabled={submitting || !comment.trim()}
              style={{ padding:'9px 18px', background: comment.trim() ? 'linear-gradient(135deg,#00e87a,#00b85e)' : '#f3f4f6', border:'none', borderRadius:'8px', color: comment.trim() ? '#1a1a2e' : '#9ca3af', fontSize:'12px', fontWeight:'700', cursor: comment.trim() ? 'pointer' : 'not-allowed', fontFamily:"'Segoe UI',sans-serif", transition:'all 0.2s', flexShrink:0 }}
            >
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>

        {isResolved && !rated && (
          <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', padding:'20px 22px' }}>
            <p style={{ color:'#9ca3af', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase', margin:'0 0 5px', fontWeight:'600' }}>Rate your experience</p>
            <p style={{ color:'#6b7280', fontSize:'13px', margin:'0 0 14px', lineHeight:'1.5' }}>
              Your issue has been resolved. How would you rate the facilities team response?
            </p>
            <StarRating onRate={() => setRated(true)} />
          </div>
        )}

        {isResolved && rated && (
          <div style={{ background:'rgba(240,253,244,0.9)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid #bbf7d0', padding:'16px 22px', textAlign:'center' }}>
            <p style={{ color:'#16a34a', fontSize:'13px', fontWeight:'600', margin:0 }}>Thanks for your feedback — it helps us improve!</p>
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default IssueDetail;