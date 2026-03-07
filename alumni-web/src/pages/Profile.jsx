import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import prfdeets_icn from '../assets/prfdeets_icn.svg';
import about_icn from '../assets/about_icn.svg';
import logout_icn from '../assets/logout_icn.svg';
import profile_icn from '../assets/profile_icn.svg';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data } = await supabase
        .from('users')
        .select('first_name, last_name, avatar_url')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setUser(data);
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      }
    };
    fetchUser();
  }, []);

  const fullName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
    : 'Loading...';

  const initials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : '?';

  const menuItems = [
    {
      icon: prfdeets_icn,
      label: 'Personal Information',
      color: '#FFFFFF',
      action: () => navigate('/personal-information'),
    },
    {
      icon: about_icn,
      label: 'About',
      color: '#FFFFFF',
      action: () => navigate('/about'),
    },
    {
      icon: logout_icn,
      label: 'Log out',
      color: '#FF0000',
      action: async () => {
        await supabase.auth.signOut();
        navigate('/login');
      },
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263' }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: '229px', flex: 1, padding: '37px 51px', position: 'relative' }}>

        {/* Notification Bell — top right */}
        <div style={{ position: 'absolute', top: '37px', right: '51px', zIndex: 50 }}>
          <button style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, rgba(15,22,66,0.1) 0%, rgba(10,15,46,0.05) 100%)',
            border: '1.24px solid rgba(255,255,255,0.1)',
            boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '20px', height: '20px',
              background: '#2B72FB', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '10px', color: '#FFFFFF' }}>3</span>
            </div>
          </button>
        </div>

        {/* Centered Profile Card */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: 'calc(100vh - 74px)',
          paddingTop: '107px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 23px',
            gap: '31px',
            width: '599px',
            background: 'rgba(13, 19, 56, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
            borderRadius: '14px',
          }}>

            {/* Avatar */}
            <div
              style={{ width: '220px', height: '220px', position: 'relative', cursor: 'pointer' }}
              onClick={() => document.getElementById('avatar-upload').click()}
              onMouseEnter={e => e.currentTarget.querySelector('.avatar-overlay').style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.querySelector('.avatar-overlay').style.opacity = '0'}
            >
              {/* Hidden file input */}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const { data: { user: authUser } } = await supabase.auth.getUser();
                  if (!authUser) return;
                  const ext = file.name.split('.').pop();
                  const filePath = `avatars/${authUser.id}.${ext}`;
                  const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file, { upsert: true });
                  if (uploadError) { console.error(uploadError); return; }
                  const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);
                  await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', authUser.id);
                  setAvatarUrl(publicUrl);
                }}
              />

              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  style={{
                    width: '220px', height: '220px',
                    borderRadius: '50%', objectFit: 'cover',
                    border: '3px solid rgba(255,255,255,0.15)',
                    display: 'block',
                  }}
                />
              ) : user ? (
                <div style={{
                  width: '220px', height: '220px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #51A2FF 0%, #155DFC 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid rgba(255,255,255,0.15)',
                }}>
                  <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '72px', color: '#FFFFFF' }}>
                    {initials}
                  </span>
                </div>
              ) : (
                <div style={{
                  width: '220px', height: '220px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={profile_icn} alt="Profile" style={{ width: '220px', height: '220px', filter: 'brightness(0) invert(1)' }} />
                </div>
              )}

              {/* Camera hover overlay */}
              <div
                className="avatar-overlay"
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '220px', height: '220px', borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: 0, transition: 'opacity 0.2s ease',
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2"/>
                </svg>
                <span style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                  Change Photo
                </span>
              </div>
            </div>

            {/* Full Name */}
            <div style={{ width: '543px', textAlign: 'center' }}>
              <h2 style={{
                fontFamily: 'Montserrat', fontWeight: 700,
                fontSize: '36px', lineHeight: '36px',
                textAlign: 'center', color: '#FFFFFF',
                margin: 0,
              }}>
                {fullName}
              </h2>
            </div>

            {/* Settings Card */}
            <div style={{
              width: '533px',
              background: 'rgba(13, 19, 56, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              overflow: 'hidden',
            }}>
              {/* Settings title */}
              <div style={{ padding: '25px 34px 16px' }}>
                <h3 style={{
                  fontFamily: 'Montserrat', fontWeight: 700,
                  fontSize: '24px', lineHeight: '36px',
                  color: '#FFFFFF', margin: 0,
                }}>
                  Settings
                </h3>
              </div>

              {/* Menu Items */}
              <div style={{ padding: '0 0 16px' }}>
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '14px 34px',
                      background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{
                      width: '29px', height: '29px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src={item.icon}
                        alt={item.label}
                        style={{
                          width: '23px', height: '23px',
                          filter: item.color === '#FF0000'
                            ? 'brightness(0) saturate(100%) invert(17%) sepia(96%) saturate(7472%) hue-rotate(0deg) brightness(105%) contrast(115%)'
                            : 'brightness(0) invert(1)',
                        }}
                      />
                    </div>
                    <span style={{
                      fontFamily: 'Montserrat', fontWeight: 600,
                      fontSize: '18px', lineHeight: '20px',
                      color: item.color,
                    }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;