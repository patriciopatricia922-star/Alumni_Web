import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import email_icn    from '../assets/email_icn.svg';
import phone_icn    from '../assets/phone_icn.svg';
import location_icn from '../assets/location_icn.svg';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const ContactSupport = () => {
  const navigate     = useNavigate();
  const width        = useWindowWidth();
  const bellRef      = useRef(null);
  const isMobile     = width < 768;
  const isTablet     = width >= 768 && width < 1024;
  const sidebarWidth = isTablet ? 200 : 229;

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from('announcements').select('id,title,content,published_at,is_active').eq('is_active',true).order('published_at',{ascending:false}).limit(20);
      if (error||!data) return;
      const readIds = JSON.parse(localStorage.getItem('read_notifs')||'[]');
      const mapped  = data.map(n=>({id:n.id,title:n.title,body:n.content,time:n.published_at,read:readIds.includes(n.id)}));
      setNotifs(mapped); setUnreadCount(mapped.filter(n=>!n.read).length);
    };
    fetch();
  }, []);

  useEffect(() => {
    const h = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markAllRead = useCallback(() => {
    localStorage.setItem('read_notifs', JSON.stringify(notifs.map(n=>n.id)));
    setNotifs(prev=>prev.map(n=>({...n,read:true}))); setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const ids = JSON.parse(localStorage.getItem('read_notifs')||'[]');
    if (!ids.includes(id)) { ids.push(id); localStorage.setItem('read_notifs', JSON.stringify(ids)); }
    setNotifs(prev=>prev.map(n=>n.id===id?{...n,read:true}:n));
    setUnreadCount(prev=>Math.max(0,prev-1));
  }, []);

  const formatTime = (iso) => {
    if (!iso) return '';
    const d=new Date(iso),now=new Date(),diff=Math.floor((now-d)/1000);
    if (diff<60) return 'Just now';
    if (diff<3600) return Math.floor(diff/60)+'m ago';
    if (diff<86400) return Math.floor(diff/3600)+'h ago';
    if (diff<604800) return Math.floor(diff/86400)+'d ago';
    return d.toLocaleDateString('en-PH',{month:'short',day:'numeric'});
  };

  const groupByDate = (list) => {
    const today=new Date();today.setHours(0,0,0,0);
    const yesterday=new Date(today);yesterday.setDate(today.getDate()-1);
    const weekAgo=new Date(today);weekAgo.setDate(today.getDate()-7);
    const groups={Today:[],Yesterday:[],'This Week':[],Earlier:[]};
    list.forEach(n=>{const d=new Date(n.time);d.setHours(0,0,0,0);if(d>=today)groups['Today'].push(n);else if(d>=yesterday)groups['Yesterday'].push(n);else if(d>=weekAgo)groups['This Week'].push(n);else groups['Earlier'].push(n);});
    return groups;
  };

  const contactItems = [
    { icon: <img src={email_icn}    alt="Email"    style={{width:'24px',height:'24px',filter:'brightness(0) invert(1)',display:'block',margin:'auto'}}/>, label:'Email',    value:'nudaao@nu-dasma.edu.ph',                                       underline:true,  multiline:false },
    { icon: <img src={phone_icn}    alt="Phone"    style={{width:'24px',height:'24px',filter:'brightness(0) invert(1)',display:'block',margin:'auto'}}/>, label:'Phone',    value:'0912-345-6789',                                                underline:false, multiline:false },
    { icon: <img src={location_icn} alt="Location" style={{width:'24px',height:'24px',filter:'brightness(0) invert(1)',display:'block',margin:'auto'}}/>, label:'Location', value:"Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114", underline:false, multiline:true  },
  ];

  const supportHours = [
    { day:'Monday - Friday', time:'8:30 AM - 5:00 PM' },
    { day:'Saturday',        time:'8:30 AM - 12:30 PM' },
  ];

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#002263', position:'relative' }}>
      <Sidebar />

      <div style={{
        marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        padding: isMobile ? '20px 16px 80px' : isTablet ? '28px 28px' : '37px 51px',
        boxSizing: 'border-box',
        position: 'relative',
      }}>

        {/* ── Notification Bell ─────────────────────────────────────────────── */}
        <div ref={bellRef} style={{position:'fixed',top:isMobile?'20px':isTablet?'28px':'37px',right:isMobile?'16px':isTablet?'28px':'51px',zIndex:200}}>
          <button onClick={()=>setShowDropdown(v=>!v)} style={{width:'46px',height:'46px',background:showDropdown?'rgba(43,114,251,0.2)':'rgba(0,62,166,0.35)',border:showDropdown?'1.24px solid rgba(43,114,251,0.5)':'1.24px solid rgba(255,255,255,0.2)',boxShadow:'0px 10px 15px -3px rgba(0,0,0,0.1)',borderRadius:'14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',transition:'all 0.15s'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z" stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {unreadCount>0&&(<div style={{position:'absolute',top:'-5px',right:'-5px',minWidth:'20px',height:'20px',background:'#2B72FB',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px'}}><span style={{fontFamily:'Arimo',fontSize:'10px',color:'#FFFFFF',fontWeight:700}}>{unreadCount>99?'99+':unreadCount}</span></div>)}
          </button>

          {showDropdown && (
            <div style={{position:'absolute',top:'54px',right:0,width:isMobile?'90vw':'380px',maxHeight:'520px',background:'rgba(13,19,56,0.97)',backdropFilter:'blur(16px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'16px',boxShadow:'0 20px 60px rgba(0,0,0,0.5)',display:'flex',flexDirection:'column',overflow:'hidden',zIndex:300}}>
              <div style={{padding:'16px 18px 12px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
                <span style={{fontFamily:'Arimo',fontWeight:700,fontSize:'16px',color:'#FFFFFF'}}>Notifications</span>
                {unreadCount>0&&<button onClick={markAllRead} style={{background:'none',border:'none',fontFamily:'Arimo',fontSize:'12px',color:'#2B72FB',cursor:'pointer',padding:0}}>Mark all read</button>}
              </div>
              <div style={{display:'flex',padding:'10px 18px 0',gap:'4px',flexShrink:0}}>
                {['all','unread'].map(t=>(<button key={t} onClick={()=>setNotifTab(t)} style={{height:'32px',padding:'0 16px',background:notifTab===t?'#2B72FB':'transparent',border:notifTab===t?'none':'1px solid rgba(255,255,255,0.12)',borderRadius:'20px',cursor:'pointer',fontFamily:'Arimo',fontSize:'13px',fontWeight:notifTab===t?700:400,color:'#FFFFFF',transition:'all 0.15s',textTransform:'capitalize'}}>{t==='all'?'All':`Unread${unreadCount>0?` (${unreadCount})`:''}`}</button>))}
              </div>
              <div style={{overflowY:'auto',flex:1,padding:'8px 0'}}>
                {(()=>{
                  const list=notifTab==='unread'?notifs.filter(n=>!n.read):notifs;
                  if (!list.length) return (<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',gap:'10px'}}><svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/></svg><p style={{fontFamily:'Arimo',fontSize:'13px',color:'rgba(255,255,255,0.3)',margin:0}}>{notifTab==='unread'?'No unread notifications':'No notifications yet'}</p></div>);
                  return Object.entries(groupByDate(list)).map(([label,items])=>{
                    if (!items.length) return null;
                    return (<div key={label}><p style={{fontFamily:'Arimo',fontWeight:700,fontSize:'11px',color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.8px',margin:'10px 18px 4px'}}>{label}</p>{items.map(n=>(<div key={n.id} onClick={()=>markOneRead(n.id)} style={{display:'flex',alignItems:'flex-start',gap:'12px',padding:'10px 18px',background:n.read?'transparent':'rgba(43,114,251,0.07)',cursor:'pointer',transition:'background 0.12s',borderLeft:n.read?'3px solid transparent':'3px solid #2B72FB'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseLeave={e=>e.currentTarget.style.background=n.read?'transparent':'rgba(43,114,251,0.07)'}><div style={{width:'38px',height:'38px',borderRadius:'50%',background:'rgba(43,114,251,0.15)',border:'1px solid rgba(43,114,251,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'2px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="#2B72FB" strokeWidth="1.67" strokeLinecap="round"/></svg></div><div style={{flex:1,minWidth:0}}><p style={{fontFamily:'Arimo',fontWeight:n.read?400:700,fontSize:'13px',color:'#FFFFFF',margin:'0 0 2px 0',lineHeight:'1.4'}}>{n.title}</p><p style={{fontFamily:'Arimo',fontSize:'12px',color:'rgba(255,255,255,0.45)',margin:'0 0 4px 0',lineHeight:'1.4',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{n.body}</p><span style={{fontFamily:'Arimo',fontSize:'11px',color:'rgba(255,255,255,0.25)'}}>{formatTime(n.time)}</span></div>{!n.read&&<div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#2B72FB',flexShrink:0,marginTop:'6px'}}/>}</div>))}</div>);
                  });
                })()}
              </div>
              <div style={{padding:'10px 18px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
                <button onClick={()=>{setShowDropdown(false);navigate('/notifications');}} style={{width:'100%',height:'36px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',fontFamily:'Arimo',fontSize:'13px',color:'rgba(255,255,255,0.7)',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>See all notifications →</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Centred card ─────────────────────────────────────────────────── */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', minHeight:0 }}>
          <div style={{
            display:'flex', flexDirection:'column', gap:'16px',
            width:'100%', maxWidth: isMobile?'100%':isTablet?'480px':'545px',
            maxHeight:'100%',
            background:'rgba(13,19,56,0.4)',
            border:'0.8px solid rgba(255,255,255,0.1)',
            borderRadius:'14px',
            padding: isMobile?'24px 20px':'34px 37px',
            boxSizing:'border-box',
            overflowY:'auto',
          }}>

            {/* Back */}
            <button onClick={()=>navigate('/about')} style={{display:'flex',alignItems:'center',gap:'8px',background:'none',border:'none',cursor:'pointer',padding:0}}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{fontFamily:'Arimo',fontWeight:700,fontSize:'14px',color:'#FFFFFF'}}>Back</span>
            </button>

            {/* Title */}
            <div style={{textAlign:'center'}}>
              <h2 style={{fontFamily:'Arimo',fontWeight:700,fontSize:isMobile?'17px':'19px',color:'#FFFFFF',margin:'0 0 6px 0'}}>Contact Support</h2>
              <p style={{fontFamily:'Arimo',fontWeight:400,fontSize:isMobile?'13px':'15px',color:'rgba(255,255,255,0.5)',margin:0}}>Support and assistance for your alumni needs</p>
            </div>

            {/* Contact items */}
            <div style={{background:'rgba(13,19,56,0.4)',border:'0.8px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:isMobile?'18px 16px':'28px 24px',display:'flex',flexDirection:'column',gap:isMobile?'14px':'20px'}}>
              {contactItems.map((item,i)=>(
                <div key={i} style={{background:'rgba(13,19,56,0.4)',border:'0.8px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:'14px 16px',display:'flex',flexDirection:'row',alignItems:'center',gap:'14px'}}>
                  <div style={{width:'44px',height:'44px',flexShrink:0,background:'linear-gradient(180deg,rgba(30,37,85,0.8) 0%,rgba(15,19,56,0.8) 100%)',boxShadow:'0px 10px 15px rgba(97,95,255,0.3),0px 4px 6px rgba(43,114,251,0.15)',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {item.icon}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'4px',flex:1,minWidth:0}}>
                    <h3 style={{fontFamily:'Arimo',fontWeight:600,fontSize:'14px',color:'#FFFFFF',margin:0}}>{item.label}</h3>
                    <p style={{fontFamily:'Arimo',fontWeight:400,fontSize:'13px',color:'#2B72FB',margin:0,textDecoration:item.underline?'underline':'none',wordBreak:'break-word'}}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Support hours */}
            <div style={{background:'rgba(13,19,56,0.4)',border:'0.8px solid rgba(255,255,255,0.1)',borderRadius:'14px',padding:isMobile?'18px 16px':'22px 24px'}}>
              <h3 style={{fontFamily:'Arimo',fontWeight:600,fontSize:'16px',color:'#FFFFFF',margin:'0 0 14px 0'}}>Support Hours</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {supportHours.map((row,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'4px'}}>
                    <span style={{fontFamily:'Arimo',fontWeight:400,fontSize:isMobile?'13px':'15px',color:'rgba(255,255,255,0.7)'}}>{row.day}</span>
                    <span style={{fontFamily:'Arimo',fontWeight:500,fontSize:isMobile?'13px':'15px',color:'#FFFFFF'}}>{row.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;