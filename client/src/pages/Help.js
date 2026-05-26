import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const FAQS = [
  {
    q: 'How long does it usually take to fix something?',
    a: 'Most issues get looked at within 2 to 3 working days. Anything urgent like a safety issue or a flood gets picked up the same day. If you mark something as Urgent when you submit it, it goes straight to the top of the queue.'
  },
  {
    q: 'Can I report something on behalf of someone else?',
    a: 'Yes, just submit the report as normal. You do not need to be the person who spotted the issue. Just make sure you include as much detail as possible so the team knows exactly where to go.'
  },
  {
    q: 'Can I add more info after I have already submitted?',
    a: 'Yep. Open the report from your dashboard and leave a comment. The facilities team will see it straight away. If you forgot to attach a photo you can mention it in the comments too.'
  },
  {
    q: 'What if it has been a week and nothing has happened?',
    a: 'Check the status of your report first. If it is still showing as New, it may not have been picked up yet. Drop us an email at facilities@stmarys.ac.uk with your report reference and we will look into it.'
  },
  {
    q: 'What if it is a real emergency like a gas leak or flooding?',
    a: 'Do not wait for Reficere. Call the facilities team directly on 020 8240 4000 or contact security. Submit a report here as well so there is a record of it, but get someone on the phone first.'
  },
  {
    q: 'Who can see my reports?',
    a: 'Your reports are visible to you and to the facilities team at St Mary\'s. Other students cannot see them. The facilities team uses Reficere to manage and track all maintenance requests across campus.'
  },
];

const Help = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const NAV = user?.role === 'student' ? [
    { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/dashboard' },
    { icon:'ti-plus',             label:'Report Issue',  path:'/submit' },
    { icon:'ti-list-check',       label:'My Reports',   path:'/dashboard' },
    { icon:'ti-bell',             label:'Notifications', path:'/notifications' },
    { icon:'ti-help',             label:'Help',         path:'/help', active:true },
  ] : [
    { icon:'ti-layout-dashboard', label:'Dashboard',     path:'/facilities' },
    { icon:'ti-list-check',       label:'All Issues',   path:'/facilities' },
    { icon:'ti-chart-bar',        label:'Analytics',    path:'/analytics' },
    { icon:'ti-bell',             label:'Notifications', path:'/notifications' },
    { icon:'ti-help',             label:'Help',         path:'/help', active:true },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'Segoe UI',sans-serif", background:'#eef0f5' }}>

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
          <h1 style={{ color:'#fff', fontSize:'22px', fontWeight:'700', margin:'0 0 6px', letterSpacing:'-0.4px' }}>Help and Support</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', margin:0 }}>
            Everything you need to know about reporting and tracking maintenance issues at St Mary's.
          </p>
        </div>

        <div style={{ maxWidth:'820px', margin:'0 auto', padding:'28px 24px' }}>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>

            <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ background:'#1c2e22', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ color:'#00e87a', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 2px', fontWeight:'600' }}>How it works</p>
                <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', margin:0 }}>Three steps from spotted to sorted</p>
              </div>
              {[
                { num:'1', title:'Report it', body:'Hit Report Issue, fill in the form and that is it. Takes about a minute. Attach a photo if it helps as it makes a big difference.' },
                { num:'2', title:'We get to work', body:'Your report goes straight to the facilities team. They assign someone, order any parts needed and get on with it.' },
                { num:'3', title:'You stay in the loop', body:'Track your report from the dashboard. We will also email you whenever the status changes so you are never left wondering.' },
              ].map((step, i) => (
                <div key={i} style={{ padding:'16px 20px', borderBottom:i<2?'1px solid rgba(0,0,0,0.05)':'none', display:'flex', gap:'14px', alignItems:'flex-start' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#00e87a,#00b85e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'800', color:'#1a1a2e', flexShrink:0 }}>
                    {step.num}
                  </div>
                  <div>
                    <p style={{ color:'#111827', fontSize:'13px', fontWeight:'600', margin:'0 0 4px' }}>{step.title}</p>
                    <p style={{ color:'#6b7280', fontSize:'12px', lineHeight:'1.6', margin:0 }}>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', overflow:'hidden' }}>
                <div style={{ background:'#1c2e22', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ color:'#00e87a', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 2px', fontWeight:'600' }}>Priorities explained</p>
                  <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', margin:0 }}>How to choose the right one</p>
                </div>
                {[
                  { label:'Urgent', color:'#ef4444', bg:'#fef2f2', border:'#fecaca', desc:'Safety risk that needs sorting today. Gas leak, flooding, broken lock.' },
                  { label:'High', color:'#f59e0b', bg:'#fff7ed', border:'#fed7aa', desc:'Affecting your work or studies. Heating out, no hot water.' },
                  { label:'Medium', color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe', desc:'Annoying but manageable. Flickering light, broken drawer.' },
                  { label:'Low', color:'#10b981', bg:'#f0fdf4', border:'#bbf7d0', desc:'Minor and can wait. Scuffed paint, stiff door handle.' },
                ].map((p, i) => (
                  <div key={i} style={{ padding:'10px 16px', borderBottom:i<3?'1px solid rgba(0,0,0,0.04)':'none', display:'flex', alignItems:'flex-start', gap:'10px' }}>
                    <span style={{ padding:'2px 8px', borderRadius:'20px', background:p.bg, border:'1px solid '+p.border, color:p.color, fontSize:'10px', fontWeight:'700', flexShrink:0, marginTop:'2px' }}>{p.label}</span>
                    <p style={{ color:'#6b7280', fontSize:'12px', margin:0, lineHeight:'1.5' }}>{p.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', overflow:'hidden' }}>
                <div style={{ background:'#1c2e22', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ color:'#00e87a', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 2px', fontWeight:'600' }}>Still stuck?</p>
                  <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', margin:0 }}>Get in touch with the team directly</p>
                </div>
                <div style={{ padding:'16px 20px' }}>
                  {[
                    { icon:'ti-mail', label:'Email', value:'facilities@stmarys.ac.uk', color:'#00b85e' },
                    { icon:'ti-phone', label:'Phone', value:'020 8240 4000', color:'#6b7280' },
                    { icon:'ti-clock', label:'Hours', value:'Mon to Fri, 8am to 6pm', color:'#6b7280' },
                  ].map((item, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:i<2?'12px':0 }}>
                      <i className={'ti '+item.icon} style={{ fontSize:'18px', color:'#00b85e' }} aria-hidden="true" />
                      <div>
                        <p style={{ color:'#111827', fontSize:'12px', fontWeight:'600', margin:'0 0 1px' }}>{item.label}</p>
                        <p style={{ color:item.color, fontSize:'12px', margin:0 }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background:'rgba(255,255,255,0.8)', backdropFilter:'blur(16px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.9)', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ background:'#1c2e22', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ color:'#00e87a', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', margin:'0 0 2px', fontWeight:'600' }}>Common questions</p>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', margin:0 }}>Tap a question to see the answer</p>
            </div>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom:i<FAQS.length-1?'1px solid rgba(0,0,0,0.05)':'none' }}>
                <div
                  onClick={() => setOpenFaq(openFaq===i?null:i)}
                  style={{ padding:'14px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <p style={{ color:'#111827', fontSize:'13px', fontWeight:'500', margin:0, flex:1, paddingRight:'16px' }}>{faq.q}</p>
                  <i className={openFaq===i?'ti ti-chevron-up':'ti ti-chevron-down'} style={{ fontSize:'16px', color:'#9ca3af', flexShrink:0 }} aria-hidden="true" />
                </div>
                {openFaq===i && (
                  <div style={{ padding:'0 20px 16px' }}>
                    <p style={{ color:'#6b7280', fontSize:'13px', lineHeight:'1.7', margin:0, background:'#f9fafb', padding:'12px 14px', borderRadius:'8px', border:'1px solid #e5e7eb' }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;