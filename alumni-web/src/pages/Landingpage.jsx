import React from 'react';
import Navbar from '../components/Navbar';
import capBg from '../assets/cap_bg.png';
import AlumnAILogo from '../assets/AlumnAI Logo.png';


const LandingPage = () => {
  return (
    <div style={{ width: '100%', background: '#FFFFFF', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />

      {/* ============ HERO SECTION ============ */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: '900px',
          backgroundImage: `url(${capBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(70.71% 70.71% at 50% 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.7) 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            paddingTop: '64px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'Impact, Arial, sans-serif',
                fontSize: '24px',
                letterSpacing: '2.4px',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                textShadow: '0px 2.5px 4px rgba(0, 0, 0, 0.7)',
                marginBottom: '8px',
                fontWeight: 400,
              }}
            >
              OFFICE OF THE
            </p>
            <h1
              style={{
                fontFamily: 'Impact, Arial, sans-serif',
                fontSize: '96px',
                lineHeight: '120px',
                letterSpacing: '4.8px',
                color: '#FFFFFF',
                textShadow: '0px 4px 4px rgba(0, 0, 0, 0.7)',
                margin: 0,
                fontWeight: 400,
              }}
            >
              ALUMNI AFFAIRS
            </h1>
          </div>

          {/* Explore More - positioned lower */}
          <div
            style={{
              position: 'absolute',
              bottom: '150px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <p
              style={{
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#FFFFFF',
                letterSpacing: '0.4px',
                marginBottom: '8px',
              }}
            >
              Explore More
            </p>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </section>

      {/* ============ STATS SECTION (Gold Background) ============ */}
      <section
        style={{
          width: '100%',
          padding: '64px 32px',
          background: '#DAA520',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
        }}
      >
        {[
          { number: '4,009', label: 'Alumni' },
          { number: '44', label: 'Undergraduate and Postgraduate Programmes' },
          { number: '99.99%', label: 'Employment Rate' },
          { number: '#1201-1300', label: 'Asia University Ranking' },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              width: '280px',
            }}
          >
            <h2
              style={{
                fontFamily: 'Arial',
                fontWeight: 700,
                fontSize: '45px',
                lineHeight: '48px',
                color: '#002263',
                margin: 0,
                textAlign: 'center',
              }}
            >
              {stat.number}
            </h2>
            <p
              style={{
                fontFamily: 'Arial',
                fontSize: '16px',
                lineHeight: '24px',
                color: '#0B3D91',
                margin: 0,
                textAlign: 'center',
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      {/* ============ UPCOMING EVENTS SECTION ============ */}
      <section
        style={{
          width: '100%',
          padding: '96px 32px 48px',
          background: '#FFFFFF',
        }}
      >
        <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: 'Arial',
                fontWeight: 700,
                fontSize: '48px',
                lineHeight: '48px',
                color: '#101828',
                margin: '0 0 16px 0',
              }}
            >
              Upcoming Events
            </h2>
            <p
              style={{
                fontFamily: 'Arial',
                fontSize: '20px',
                lineHeight: '28px',
                color: '#4A5565',
                margin: 0,
                maxWidth: '768px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Stay updated with upcoming activities and gatherings
            </p>
          </div>

          {/* Event Cards */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '48px', justifyContent: 'center' }}>
            {['[Event Name]', '[Event Name]', '[Event Name]'].map((title, index) => (
              <div
                key={index}
                style={{
                  flex: '0 0 389px',
                  background: '#FFFFFF',
                  border: '0.8px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '14px',
                  padding: '24px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Arial',
                    fontWeight: 700,
                    fontSize: '20px',
                    lineHeight: '28px',
                    color: '#0A0A0A',
                    margin: '0 0 8px 0',
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#4A5565',
                    margin: '0 0 8px 0',
                  }}
                >
                  [Description]
                </p>
                <p
                  style={{
                    fontFamily: 'Arial',
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#35408E',
                    margin: 0,
                  }}
                >
                  [Date]
                </p>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              style={{
                padding: '8px 32px',
                background: '#002263',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontFamily: 'Lexend, Arial',
                fontSize: '16px',
                lineHeight: '24px',
                cursor: 'pointer',
                fontWeight: 400,
              }}
            >
              View All
            </button>
          </div>
        </div>
      </section>

      {/* ============ JOB OPPORTUNITIES SECTION ============ */}
      <section
        style={{
          width: '100%',
          padding: '96px 32px',
          background: '#F9FAFB',
        }}
      >
        <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: 'Arial',
                fontWeight: 700,
                fontSize: '48px',
                lineHeight: '48px',
                color: '#101828',
                margin: '0 0 16px 0',
              }}
            >
              Job Opportunities
            </h2>
            <p
              style={{
                fontFamily: 'Arial',
                fontSize: '20px',
                lineHeight: '28px',
                color: '#4A5565',
                margin: 0,
              }}
            >
              [Description]
            </p>
          </div>

          {/* Job Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '0.8px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '14px',
              padding: '24px',
              marginBottom: '48px',
            }}
          >
            <h3
              style={{
                fontFamily: 'Arial',
                fontWeight: 700,
                fontSize: '20px',
                lineHeight: '28px',
                color: '#0A0A0A',
                margin: '0 0 8px 0',
              }}
            >
              No job postings available
            </h3>
            <p
              style={{
                fontFamily: 'Arial',
                fontSize: '16px',
                lineHeight: '24px',
                color: '#4A5565',
                margin: 0,
              }}
            >
              Check back soon for exciting career opportunities
            </p>
          </div>

          {/* View All Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              style={{
                padding: '8px 32px',
                background: '#002263',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontFamily: 'Lexend, Arial',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              View All
            </button>
          </div>
        </div>
      </section>

      {/* ============ ALUMNI DISCOUNTS SECTION ============ */}
      <section
        style={{
          width: '100%',
          padding: '96px 32px 48px',
          background: '#FFFFFF',
        }}
      >
        <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontFamily: 'Arial',
                fontWeight: 700,
                fontSize: '48px',
                lineHeight: '48px',
                color: '#101828',
                margin: '0 0 16px 0',
              }}
            >
              Alumni Discounts
            </h2>
            <p
              style={{
                fontFamily: 'Arial',
                fontSize: '20px',
                lineHeight: '28px',
                color: '#4A5565',
                margin: 0,
              }}
            >
              Enjoy exclusive discounts and benefits from our partners
            </p>
          </div>

          {/* Discount Cards */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '48px', justifyContent: 'center' }}>
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                style={{
                  flex: '0 0 389px',
                  background: '#FFFFFF',
                  border: '0.8px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '14px',
                  padding: '24px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Arial',
                    fontWeight: 700,
                    fontSize: '20px',
                    lineHeight: '28px',
                    color: '#0A0A0A',
                    margin: '0 0 8px 0',
                  }}
                >
                  [Partner Establishments]
                </h3>
                <p
                  style={{
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#4A5565',
                    margin: 0,
                  }}
                >
                  [Description]
                </p>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              style={{
                padding: '8px 32px',
                background: '#002263',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontFamily: 'Lexend, Arial',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              View All
            </button>
          </div>
        </div>
      </section>

      {/* ============ WHY JOIN SECTION ============ */}
      <section
        style={{
          width: '100%',
          padding: '96px 32px',
          background: '#F9FAFB',
        }}
      >
        <div style={{ maxWidth: '1216px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '48px', fontWeight: 700, margin: '0 0 16px 0', lineHeight: '48px' }}>
              <span style={{ color: '#101828' }}>Why Join </span>
              <span style={{ color: '#002263' }}>Alumn</span>
              <span style={{ color: 'rgba(201, 167, 0, 0.85)' }}>AI</span>
              <span style={{ color: '#101828' }}>?</span>
            </h2>

            <p
              style={{
                fontFamily: 'Arial',
                fontSize: '20px',
                lineHeight: '28px',
                color: '#4A5565',
                margin: 0,
                maxWidth: '768px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Connecting National University—Dasmariñas alumni to opportunities and community
            </p>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
            {/* Left Column - Mission & Vision */}
            <div style={{ flex: 1 }}>
              {/* Mission */}
              <div style={{ marginBottom: '48px' }}>
                <h3
                  style={{
                    fontFamily: 'Arial',
                    fontWeight: 700,
                    fontSize: '24px',
                    lineHeight: '32px',
                    color: '#101828',
                    margin: '0 0 12px 0',
                  }}
                >
                  Mission
                </h3>
                <p
                  style={{
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#364153',
                    margin: '0 0 12px 0',
                  }}
                >
                  Guided by the core values and characterized by our cultural heritage of Dynamic Filipinism, National University is committed to providing relevant, innovative, and accessible quality education and other development programs.
                </p>
                <p
                  style={{
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#364153',
                    margin: '0 0 10px 0',
                  }}
                >
                  We are committed to our:
                </p>
                {[
                  { label: 'STUDENTS', desc: 'by molding them into ethical, spiritual and responsible citizens.' },
                  { label: 'FACULTY and EMPLOYEES', desc: 'by enhancing their competencies, cultivating their commitment and providing a just and fulfilling work environment.' },
                  { label: 'ALUMNI', desc: 'by instilling in them a sense of pride, commitment, and loyalty to their alma mater.' },
                  { label: 'INDUSTRY PARTNERS and EMPLOYERS', desc: 'by providing them Nationalians who will contribute to their growth and development.' },
                  { label: 'COMMUNITY', desc: "by contributing to the improvement of life's conditions." },
                ].map((item, index) => (
                  <p key={index} style={{ fontFamily: 'Arial', fontSize: '16px', lineHeight: '24px', color: '#364153', margin: '0 0 6px 0' }}>
                    <span style={{ fontWeight: 700, color: '#DAA520' }}>{item.label}</span>, {item.desc}
                  </p>
                ))}
              </div>

              {/* Vision */}
              <div>
                <h3
                  style={{
                    fontFamily: 'Arial',
                    fontWeight: 700,
                    fontSize: '24px',
                    lineHeight: '32px',
                    color: '#101828',
                    margin: '0 0 12px 0',
                  }}
                >
                  Vision
                </h3>
                <p
                  style={{
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    lineHeight: '24px',
                    color: '#364153',
                    margin: 0,
                  }}
                >
                  We are National University, a dynamic private institution committed to nation building, recognized internationally in teaching and research.
                </p>
              </div>
            </div>

            {/* Right Column - Benefits Cards */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['Header', 'Header', 'Header'].map((title, index) => (
                <div
                  key={index}
                  style={{
                    background: '#FFFFFF',
                    border: '0.8px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '14px',
                    padding: '24px',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'Arial',
                      fontWeight: 700,
                      fontSize: '20px',
                      lineHeight: '28px',
                      color: '#0A0A0A',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Arial',
                      fontSize: '16px',
                      lineHeight: '24px',
                      color: '#4A5565',
                      margin: 0,
                    }}
                  >
                    Build lasting relationships with fellow alumni and expand your professional network
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
        <footer
          style={{
            width: '100%',
            background: '#002263',
          }}
        >
          {/* Main Footer Content */}
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '48px 32px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '48px',
            }}
          >
            {/* Left Side - AlumnAI Logo */}
            <img
              src={AlumnAILogo}
              alt="AlumnAI Logo"
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'contain',
                flexShrink: 0,
                marginLeft: '80px', 
              }}
            />

            {/* Right Side - Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {/* Contact Us Header */}
              <h3
                style={{
                  fontFamily: 'Arial',
                  fontWeight: 700,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#FFFFFF',
                  marginBottom: '24px',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  margin: '0 0 24px 0',
                }}
              >
                CONTACT US
              </h3>

              {/* Contact Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <path
                      d="M8.5 0C5.87 0 3.75 2.12 3.75 4.75C3.75 8.31 8.5 14 8.5 14C8.5 14 13.25 8.31 13.25 4.75C13.25 2.12 11.13 0 8.5 0ZM8.5 6.5C7.67 6.5 7 5.83 7 5C7 4.17 7.67 3.5 8.5 3.5C9.33 3.5 10 4.17 10 5C10 5.83 9.33 6.5 8.5 6.5Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                  <p style={{ fontFamily: 'Arial', fontSize: '16px', lineHeight: '24px', color: '#FFFFFF', margin: 0 }}>
                    Governor's Drive, Sampaloc 1, City of Dasmariñas, Cavite 4114
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <path
                      d="M13.5 10.5C12.9 10.5 12.3 10.4 11.8 10.2C11.6 10.1 11.4 10.1 11.2 10.2L9.8 11.6C7.9 10.6 6.4 9.1 5.4 7.2L6.8 5.8C7 5.6 7 5.3 6.9 5.1C6.7 4.6 6.6 4 6.6 3.4C6.6 3 6.3 2.7 5.9 2.7H3.7C3.3 2.7 3 3 3 3.4C3 8.8 7.3 13 12.6 13C13 13 13.3 12.7 13.3 12.3V10.1C13.3 9.7 13 9.4 12.6 9.4L13.5 10.5Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                  <p style={{ fontFamily: 'Arial', fontSize: '16px', lineHeight: '24px', color: '#FFFFFF', margin: 0 }}>
                    0912-345-6789
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <path
                      d="M14.5 3H2.5C1.95 3 1.5 3.45 1.5 4V12C1.5 12.55 1.95 13 2.5 13H14.5C15.05 13 15.5 12.55 15.5 12V4C15.5 3.45 15.05 3 14.5 3ZM14.5 12H2.5V5.5L8.5 8.5L14.5 5.5V12ZM8.5 7.5L2.5 4.5H14.5L8.5 7.5Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                  <p style={{ fontFamily: 'Arial', fontSize: '16px', lineHeight: '24px', color: '#FFFFFF', margin: 0 }}>
                    nudaao@nu-dasma.edu.ph
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <path
                      d="M8.5 1C4.64 1 1.5 4.14 1.5 8C1.5 11.86 4.64 15 8.5 15C12.36 15 15.5 11.86 15.5 8C15.5 4.14 12.36 1 8.5 1ZM8.5 13.5C5.47 13.5 3 11.03 3 8C3 4.97 5.47 2.5 8.5 2.5C11.53 2.5 14 4.97 14 8C14 11.03 11.53 13.5 8.5 13.5ZM9 5H8V8.5L11.25 10.5L11.75 9.75L9 8.25V5Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                  <p style={{ fontFamily: 'Arial', fontSize: '16px', lineHeight: '24px', color: '#FFFFFF', margin: 0 }}>
                    Monday to Friday (8:30AM - 5:30PM); Saturday (8:30AM - 12:30PM)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider + Copyright */}
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
            }}
          >
            <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.5)' }} />
            <p
              style={{
                fontFamily: 'Arial',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '24px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '35px 0',
                margin: 0,
              }}
            >
              © 2026 AlumnAI. All rights reserved.
            </p>
          </div>
        </footer>
    </div>
  );
};

export default LandingPage;