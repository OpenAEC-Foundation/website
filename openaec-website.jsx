import React, { useState } from 'react';

const OpenAECWebsite = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const colors = {
    dawn: '#E07B3C',
    horizon: '#C45A20',
    sky: '#4A90B8',
    mist: '#6BB8D4',
    stone: '#3A3A3A',
    sand: '#F5F0EB',
    cloud: '#FFFFFF',
    earth: '#2D2D2D',
    growth: '#5AAD58',
  };

  // Logo Component
  const Logo = ({ size = 'medium', darkMode = false }) => {
    const sizes = { small: 0.6, medium: 1, large: 1.4 };
    const scale = sizes[size];
    const textColor = darkMode ? colors.sand : colors.stone;
    
    return (
      <svg width={280 * scale} height={80 * scale} viewBox="0 0 280 80" fill="none">
        <path 
          d="M10 70 L10 35 L50 10 L90 35 L90 70" 
          stroke={colors.dawn}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path 
          d="M30 70 L30 45 L50 30 L70 45 L70 70" 
          stroke={colors.sky}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <text x="108" y="42" fontFamily="'DM Sans', sans-serif" fontSize="26" fontWeight="700" fill={textColor}>Open</text>
        <text x="175" y="42" fontFamily="'DM Sans', sans-serif" fontSize="26" fontWeight="700" fill={colors.dawn}>AEC</text>
        <text x="108" y="62" fontFamily="'DM Sans', sans-serif" fontSize="11" fontWeight="500" fill={textColor} letterSpacing="2.5">FOUNDATION</text>
      </svg>
    );
  };

  const LogoCompact = ({ darkMode = false }) => {
    const textColor = darkMode ? colors.sand : colors.stone;
    return (
      <svg width="180" height="45" viewBox="0 0 200 50" fill="none">
        <path d="M8 45 L8 22 L30 5 L52 22 L52 45" stroke={colors.dawn} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M20 45 L20 30 L30 22 L40 30 L40 45" stroke={colors.sky} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <text x="65" y="30" fontFamily="'DM Sans', sans-serif" fontSize="18" fontWeight="700" fill={textColor}>Open</text>
        <text x="118" y="30" fontFamily="'DM Sans', sans-serif" fontSize="18" fontWeight="700" fill={colors.dawn}>AEC</text>
      </svg>
    );
  };

  const LogoIcon = () => (
    <svg width="50" height="50" viewBox="0 0 100 100" fill="none">
      <path d="M10 85 L10 40 L50 10 L90 40 L90 85" stroke={colors.dawn} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M30 85 L30 55 L50 38 L70 55 L70 85" stroke={colors.sky} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );

  // Smooth scroll
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.sand,
      fontFamily: "'DM Sans', sans-serif",
      color: colors.stone,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
      
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        borderBottom: `1px solid ${colors.mist}40`,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ cursor: 'pointer' }} onClick={() => scrollTo('hero')}>
            <LogoCompact />
          </div>
          
          {/* Desktop Menu */}
          <div style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
          }} className="desktop-menu">
            {['Over ons', 'Missie', 'Bestuur', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase().replace(' ', '-'))}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '15px',
                  color: colors.stone,
                  cursor: 'pointer',
                  fontWeight: '500',
                  padding: '8px 0',
                  position: 'relative',
                }}
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => scrollTo('contact')}
              style={{
                backgroundColor: colors.dawn,
                color: colors.cloud,
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Word bestuurslid
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        background: `linear-gradient(135deg, ${colors.sand} 0%, ${colors.cloud} 50%, ${colors.mist}20 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.mist}30 0%, transparent 70%)`,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.dawn}15 0%, transparent 70%)`,
        }} />
        
        <div style={{
          maxWidth: '900px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: colors.dawn + '15',
            color: colors.horizon,
            padding: '8px 16px',
            borderRadius: '50px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '32px',
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: colors.dawn, 
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
            }} />
            Stichting in oprichting
          </div>
          
          <div style={{ marginBottom: '32px' }}>
            <Logo size="large" />
          </div>
          
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: '400',
            fontStyle: 'italic',
            color: colors.stone,
            marginBottom: '24px',
            lineHeight: '1.3',
          }}>
            Open source voor een open bouwsector
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: colors.stone,
            opacity: 0.8,
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.7',
          }}>
            Wij ontwikkelen, ondersteunen en promoten open source software voor de volledige bouwketen — van ontwerp tot oplevering en beheer.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollTo('bestuur')}
              style={{
                backgroundColor: colors.dawn,
                color: colors.cloud,
                border: 'none',
                padding: '16px 32px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Word bestuurslid
              <span style={{ fontSize: '20px' }}>→</span>
            </button>
            <button
              onClick={() => scrollTo('over-ons')}
              style={{
                backgroundColor: 'transparent',
                color: colors.stone,
                border: `2px solid ${colors.stone}30`,
                padding: '14px 32px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Lees meer
            </button>
          </div>
          
          {/* Launch date */}
          <div style={{
            marginTop: '64px',
            padding: '20px 32px',
            backgroundColor: colors.cloud,
            borderRadius: '12px',
            display: 'inline-block',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '13px', color: colors.stone, opacity: 0.6, margin: '0 0 4px 0' }}>
              Geplande oprichting
            </p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: colors.dawn, margin: 0 }}>
              1 maart 2026
            </p>
          </div>
        </div>
      </section>

      {/* Over Ons Section */}
      <section id="over-ons" style={{
        padding: '120px 24px',
        backgroundColor: colors.cloud,
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: colors.dawn, 
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              marginBottom: '16px',
            }}>Over ons</p>
            <h2 style={{ fontSize: '36px', fontWeight: '600', marginBottom: '24px' }}>
              Waarom Open AEC Foundation?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.8, maxWidth: '700px', margin: '0 auto', lineHeight: '1.7' }}>
              De bouwsector verdient software die transparant, toekomstbestendig en door de gebruikers zelf vormgegeven wordt.
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {[
              { 
                icon: '💰', 
                title: 'Kostenreductie', 
                desc: 'Geen licentiekosten, lagere advieskosten. Bouwen wordt voordeliger voor iedereen.' 
              },
              { 
                icon: '🔓', 
                title: 'Geen vendor lock-in', 
                desc: 'Open data formaten zorgen dat bestanden voor altijd leesbaar blijven.' 
              },
              { 
                icon: '🤖', 
                title: 'AI-gereed', 
                desc: 'Open source code is beter te integreren met AI en automatisering.' 
              },
              { 
                icon: '🌍', 
                title: 'Toekomstbestendig', 
                desc: 'Community kan software blijven onderhouden, onafhankelijk van leveranciers.' 
              },
              { 
                icon: '👥', 
                title: 'Door gebruikers gestuurd', 
                desc: 'Ontwikkeling wordt bepaald door wat gebruikers nodig hebben, niet door sales.' 
              },
              { 
                icon: '🎓', 
                title: 'Educatie', 
                desc: 'Stage- en opleidingsmogelijkheden voor studenten wereldwijd.' 
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '32px',
                backgroundColor: colors.sand,
                borderRadius: '16px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '16px' }}>{item.icon}</span>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Missie Section */}
      <section id="missie" style={{
        padding: '120px 24px',
        backgroundColor: colors.earth,
        color: colors.sand,
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ 
            fontSize: '13px', 
            fontWeight: '600', 
            color: colors.dawn, 
            textTransform: 'uppercase', 
            letterSpacing: '2px',
            marginBottom: '16px',
          }}>Onze missie</p>
          
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: '400',
            fontStyle: 'italic',
            lineHeight: '1.4',
            marginBottom: '48px',
          }}>
            "Het ontwikkelen, ondersteunen en promoten van open source software voor de volledige bouwketen."
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px',
            textAlign: 'left',
          }}>
            {[
              { title: 'Ontwikkeling', desc: 'Coördineren en financieren van open source softwareontwikkeling' },
              { title: 'Ondersteuning', desc: 'Beheren van licenties, API-koppelingen en integraties' },
              { title: 'Educatie', desc: 'Stage- en opleidingsmogelijkheden voor studenten' },
              { title: 'Advocacy', desc: 'Promoten van open source en open standaarden' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '24px',
                borderLeft: `3px solid ${colors.dawn}`,
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: colors.cloud }}>{item.title}</h3>
                <p style={{ fontSize: '14px', opacity: 0.7, lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestuur Section */}
      <section id="bestuur" style={{
        padding: '120px 24px',
        backgroundColor: colors.cloud,
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: colors.dawn, 
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              marginBottom: '16px',
            }}>Word onderdeel</p>
            <h2 style={{ fontSize: '36px', fontWeight: '600', marginBottom: '24px' }}>
              Bestuursleden gezocht
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.8, maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
              We zoeken gedreven mensen uit de bouwsector die willen bijdragen aan een open toekomst.
            </p>
          </div>
          
          {/* Call to action box */}
          <div style={{
            background: `linear-gradient(135deg, ${colors.dawn}15 0%, ${colors.sky}15 100%)`,
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            border: `2px solid ${colors.dawn}30`,
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: colors.dawn,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <span style={{ fontSize: '36px' }}>🏗️</span>
            </div>
            
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
              Bouw mee aan de toekomst
            </h3>
            
            <p style={{ fontSize: '16px', opacity: 0.8, maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.7' }}>
              Het bestuur bestaat uit invloedrijke personen uit de bouwsector: architecten, aannemers, adviseurs en vertegenwoordigers van brancheorganisaties.
            </p>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '32px',
            }}>
              {['Architecten', 'Aannemers', 'Adviseurs', 'IT-specialisten', 'Beleidsmakers'].map((role, i) => (
                <span key={i} style={{
                  padding: '8px 16px',
                  backgroundColor: colors.cloud,
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}>
                  {role}
                </span>
              ))}
            </div>
            
            <button
              onClick={() => scrollTo('contact')}
              style={{
                backgroundColor: colors.dawn,
                color: colors.cloud,
                border: 'none',
                padding: '16px 40px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Neem contact op
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{
        padding: '120px 24px',
        backgroundColor: colors.sand,
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: colors.dawn, 
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              marginBottom: '16px',
            }}>Contact</p>
            <h2 style={{ fontSize: '36px', fontWeight: '600', marginBottom: '24px' }}>
              Neem contact op
            </h2>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
          }}>
            {/* Contact Info */}
            <div>
              <div style={{
                backgroundColor: colors.cloud,
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
                  Contactpersoon
                </h3>
                
                <div style={{ marginBottom: '32px' }}>
                  <p style={{ fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
                    Maarten Vroegindeweij
                  </p>
                  <p style={{ fontSize: '14px', opacity: 0.7 }}>
                    Initiatiefnemer Open AEC Foundation
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: colors.dawn + '15', 
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                    }}>📍</span>
                    <div>
                      <p style={{ fontSize: '14px', opacity: 0.6, margin: '0 0 4px 0' }}>Adres</p>
                      <p style={{ fontSize: '15px', margin: 0, lineHeight: '1.5' }}>
                        Burgemeester de Raadtsingel 31<br/>
                        Dordrecht
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ 
                      width: '40px', 
                      height: '40px', 
                      backgroundColor: colors.sky + '15', 
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                    }}>📅</span>
                    <div>
                      <p style={{ fontSize: '14px', opacity: 0.6, margin: '0 0 4px 0' }}>Oprichting</p>
                      <p style={{ fontSize: '15px', margin: 0, fontWeight: '600', color: colors.dawn }}>
                        1 maart 2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <div style={{
                backgroundColor: colors.cloud,
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
                  Stuur een bericht
                </h3>
                
                <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                      Naam
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${colors.mist}50`,
                        borderRadius: '10px',
                        fontSize: '15px',
                        backgroundColor: colors.sand,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      placeholder="Uw naam"
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${colors.mist}50`,
                        borderRadius: '10px',
                        fontSize: '15px',
                        backgroundColor: colors.sand,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      placeholder="uw@email.nl"
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '8px' }}>
                      Bericht
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${colors.mist}50`,
                        borderRadius: '10px',
                        fontSize: '15px',
                        backgroundColor: colors.sand,
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                      placeholder="Ik ben geïnteresseerd in..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    style={{
                      backgroundColor: colors.dawn,
                      color: colors.cloud,
                      border: 'none',
                      padding: '16px 32px',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '8px',
                    }}
                  >
                    Verstuur bericht
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: colors.earth,
        color: colors.sand,
        padding: '64px 24px 32px',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '48px',
            marginBottom: '48px',
          }}>
            <div>
              <LogoCompact darkMode />
              <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '16px', maxWidth: '300px', lineHeight: '1.6' }}>
                Open source software voor de volledige bouwketen — van ontwerp tot oplevering en beheer.
              </p>
            </div>
            
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Stichting i.o.</p>
              <p style={{ fontSize: '14px', opacity: 0.7, lineHeight: '1.8' }}>
                Burgemeester de Raadtsingel 31<br/>
                Dordrecht<br/>
                Nederland
              </p>
            </div>
            
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Oprichting</p>
              <p style={{ fontSize: '20px', fontWeight: '700', color: colors.dawn }}>
                1 maart 2026
              </p>
            </div>
          </div>
          
          <div style={{
            borderTop: `1px solid ${colors.sand}20`,
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <p style={{ fontSize: '13px', opacity: 0.5 }}>
              © 2026 Open AEC Foundation i.o. — Open source voor een open bouwsector
            </p>
            <p style={{ fontSize: '13px', opacity: 0.5 }}>
              Geïnspireerd door de Blender Foundation
            </p>
          </div>
        </div>
      </footer>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default OpenAECWebsite;
