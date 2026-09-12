import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/layout.css'
import '../styles/components.css'
import '../styles/responsive.css'

const DEFAULT_SCHEME = {
  name: 'Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM-AJAY)',
  categoryLabel: 'Business & Entrepreneurship',
  subsidyPercent: 50,
  subsidyAmountText: 'Up to ₹50,000 direct subsidy',
  loanAmountText: '₹50,000 - ₹50 Lakhs',
  matchScore: 95,
  summary: 'Comprehensive scheme supporting income generation, skill development, and infrastructure for SC beneficiaries.',
  keyBenefits: [
    'Up to 50% subsidy support for low-income beneficiaries',
    'Direct grant assistance for income-generating micro-projects',
    'Skill training & capacity building included',
    'Simplified loan processing via state channelizing agencies'
  ]
}

const DEFAULT_PARTNER = {
  name: 'Gujarat Scheduled Castes Development Corporation (GSCDC)',
  type: 'State Channelizing Agency',
  district: 'Rajkot',
  state: 'Gujarat',
  address: 'District Panchayat Compound, Near Collector Office, Rajkot, Gujarat 360001',
  pincode: '360001',
  phone: '+91 281 2471092',
  email: 'gscdc.rajkot@gujarat.gov.in',
  hours: 'Mon - Fri: 10:30 AM - 05:30 PM (2nd & 4th Sat closed)',
  verified: true,
  latitude: 22.3039,
  longitude: 70.8022
}

const DEFAULT_PROFILE = {
  annual_income: '300000',
  purpose: 'business',
  project_cost: '380000',
  activity_type: 'small_business',
  state: 'Gujarat',
  district: 'Rajkot',
  has_sc_certificate: 'true'
}

const REQUIRED_DOCUMENTS = [
  {
    title: 'SC Caste Certificate',
    detail: 'Valid Scheduled Caste certificate issued by District Magistrate / Sub-Divisional Magistrate.',
    required: true
  },
  {
    title: 'Income Certificate',
    detail: 'Family income certificate for current financial year issued by competent Revenue Authority.',
    required: true
  },
  {
    title: 'Identity Proof',
    detail: 'Aadhaar Card, Voter ID, or Driving License (original + self-attested copy).',
    required: true
  },
  {
    title: 'Residence / Domicile Proof',
    detail: 'Ration Card, Electricity Bill, or State Domicile Certificate.',
    required: true
  },
  {
    title: 'Project Proposal / Fee Receipt',
    detail: 'Detailed project estimate for business OR admission letter / fee structure for education.',
    required: true
  },
  {
    title: 'Aadhaar-Linked Bank Passbook',
    detail: 'Copy of bank passbook with clear IFSC code and Aadhaar seed status for DBT transfer.',
    required: true
  }
]

function Summary() {
  const navigate = useNavigate()

  const [scheme, setScheme] = useState(DEFAULT_SCHEME)
  const [partner, setPartner] = useState(DEFAULT_PARTNER)
  const [profile, setProfile] = useState(DEFAULT_PROFILE)

  useEffect(() => {
    const storedScheme = sessionStorage.getItem('sahay_selected_scheme')
    if (storedScheme) {
      try {
        setScheme(JSON.parse(storedScheme))
      } catch (err) {
        console.error('Error parsing sahay_selected_scheme', err)
      }
    }

    const storedPartner = sessionStorage.getItem('sahay_selected_partner')
    if (storedPartner) {
      try {
        setPartner(JSON.parse(storedPartner))
      } catch (err) {
        console.error('Error parsing sahay_selected_partner', err)
      }
    }

    const storedProfile = sessionStorage.getItem('sahay_profile')
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile))
      } catch (err) {
        console.error('Error parsing sahay_profile', err)
      }
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const directionsUrl = partner.latitude && partner.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(partner.name + ' ' + partner.district)}`

  return (
    <div className="profile-page">
      {/* ================= NAVBAR ================= */}
      <nav className="site-navbar">
        <div className="navbar-inner">
          <button
            className="profile-brand-button"
            onClick={() => navigate('/')}
            aria-label="Sahay Home"
          >
            <div className="site-brand">
              <div className="brand-logo">S</div>
              <div className="brand-text">
                <div className="brand-name">Sahay</div>
                <div className="brand-subtitle">
                  Scheme Guidance Platform
                </div>
              </div>
            </div>
          </button>

          <div className="navbar-links">
            <a href="/#how-it-works">How it works</a>
            <a href="/#why-sahay">Why Sahay?</a>
            <button className="language-selector">
              EN <span>⌄</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main className="profile-main">
        {/* Heading */}
        <div className="profile-heading">
          <div>
            <span className="small-label">
              STEP 04 OF 04 • GUIDANCE DOSSIER
            </span>
            <h1>
              Your Application
              <br />
              <span>Guidance Summary.</span>
            </h1>
            <p>
              Review your completed scheme selection, profile details, verified partner branch, and required document checklist before visiting the office.
            </p>
          </div>

          <div className="progress-indicator">
            <span>STEP 04</span>
            <strong>of 04</strong>
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="profile-layout">
          {/* Left Column: Dossier Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. Selected Scheme Summary Card */}
            <div className="profile-form-card">
              <div className="form-section">
                <div className="field-number">01</div>
                <div className="field-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="pl-scheme-chip">
                        {scheme.categoryLabel || 'Scheme'}
                      </span>
                      {scheme.subsidyPercent && (
                        <span className="pl-scheme-chip" style={{ background: '#e5f0e9', color: 'var(--green-dark)' }}>
                          {scheme.subsidyPercent}% Subsidy Support
                        </span>
                      )}
                    </div>
                    <span className="eyebrow" style={{ margin: 0, padding: '4px 10px', fontSize: '11px' }}>
                      <span className="eyebrow-dot"></span>
                      Matched Scheme
                    </span>
                  </div>

                  <label style={{ fontSize: '20px', lineHeight: '1.3' }}>
                    {scheme.name}
                  </label>

                  <p className="field-help" style={{ marginBottom: '16px', marginTop: '6px' }}>
                    {scheme.summary}
                  </p>

                  {/* Financial Highlights */}
                  <div className="choice-grid" style={{ maxWidth: '100%', marginBottom: '16px' }}>
                    <div className="choice-button" style={{ cursor: 'default' }}>
                      <span className="choice-icon" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>
                        ₹
                      </span>
                      <div>
                        <div style={{ fontSize: '9px', color: '#68736d', textTransform: 'uppercase' }}>Loan Range</div>
                        <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{scheme.loanAmountText || 'Standard Loan Terms'}</strong>
                      </div>
                    </div>

                    <div className="choice-button" style={{ cursor: 'default' }}>
                      <span className="choice-icon" style={{ background: '#fef3f2', color: '#b42318' }}>
                        ✦
                      </span>
                      <div>
                        <div style={{ fontSize: '9px', color: '#68736d', textTransform: 'uppercase' }}>Capital Subsidy</div>
                        <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{scheme.subsidyAmountText || 'Direct Assistance'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div className="form-section">
                <div className="field-number">02</div>
                <div className="field-content">
                  <label style={{ fontSize: '16px', marginBottom: '4px' }}>
                    Required Documents Checklist
                  </label>
                  <p className="field-help" style={{ marginBottom: '16px' }}>
                    Please carry the following physical documents (original + 2 self-attested photocopies) when visiting the partner office:
                  </p>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {REQUIRED_DOCUMENTS.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px 14px',
                          background: '#fbfcfb',
                          border: '1px solid var(--line)',
                          borderRadius: '10px'
                        }}
                      >
                        <span className="secure-mark" style={{ fontSize: '14px', marginTop: '2px' }}>✓</span>
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--ink)', display: 'block', marginBottom: '2px' }}>
                            {doc.title}
                          </strong>
                          <span style={{ fontSize: '11px', color: '#68736d', lineHeight: '1.45' }}>
                            {doc.detail}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Selected Partner Office Summary Card */}
            <div className="profile-form-card">
              <div className="form-section">
                <div className="field-number">03</div>
                <div className="field-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <span className="small-label" style={{ margin: 0 }}>DESTINATION PARTNER OFFICE</span>
                    {partner.verified && <span className="pl-verified">✓ Authorized Channel Partner</span>}
                  </div>

                  <label style={{ fontSize: '19px', lineHeight: '1.3' }}>
                    {partner.name}
                  </label>
                  <p style={{ color: 'var(--green)', fontSize: '12px', fontWeight: '700', marginTop: '4px', marginBottom: '16px' }}>
                    {partner.type}
                  </p>

                  <div style={{ display: 'grid', gap: '12px', fontSize: '13px', color: '#48554d' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>📍</span>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '12px' }}>Office Address:</strong>
                        <span>{partner.address || `${partner.district}, ${partner.state}`}</span>
                      </div>
                    </div>

                    {partner.hours && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>🕒</span>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '12px' }}>Working Hours:</strong>
                          <span>{partner.hours}</span>
                        </div>
                      </div>
                    )}

                    {partner.phone && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>📞</span>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '12px' }}>Contact Number:</strong>
                          <span>{partner.phone}</span>
                        </div>
                      </div>
                    )}

                    {partner.email && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>✉️</span>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '12px' }}>Email Address:</strong>
                          <span>{partner.email}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <div>
                  <span className="secure-mark">✓</span>
                  <span>Verified Office • Prioritized Application Intake</span>
                </div>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-btn"
                  style={{ padding: '9px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  🗺️ Get Directions in Maps
                </a>
              </div>
            </div>

            {/* 3. Actionable Next Steps Card */}
            <div className="profile-form-card">
              <div className="form-section">
                <div className="field-number">04</div>
                <div className="field-content">
                  <label style={{ fontSize: '16px', marginBottom: '4px' }}>
                    Actionable Next Steps
                  </label>
                  <p className="field-help" style={{ marginBottom: '16px' }}>
                    Follow these 3 simple steps to complete your application submission:
                  </p>

                  <div className="journey-steps" style={{ paddingTop: 0 }}>
                    <div className="journey-step active">
                      <div className="step-number">01</div>
                      <div className="step-icon">📋</div>
                      <div>
                        <h4>Gather Physical Documents</h4>
                        <p>Collect original certificates along with 2 self-attested sets of photocopies from the checklist above.</p>
                      </div>
                    </div>

                    <div className="journey-line"></div>

                    <div className="journey-step active">
                      <div className="step-number">02</div>
                      <div className="step-icon">📍</div>
                      <div>
                        <h4>Visit Partner Office</h4>
                        <p>Visit {partner.name} during official working hours ({partner.hours || 'Working Hours'}).</p>
                      </div>
                    </div>

                    <div className="journey-line"></div>

                    <div className="journey-step active">
                      <div className="step-number">03</div>
                      <div className="step-icon">📄</div>
                      <div>
                        <h4>Submit Guidance Dossier</h4>
                        <p>Present your printed Sahay Dossier to the desk officer for priority scheme intake & processing.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar & Actions */}
          <aside className="profile-sidebar">
            {/* Dossier Quick Actions */}
            <div className="profile-tip-card" style={{ background: 'var(--green-dark)' }}>
              <span className="tip-label">DOSSIER ACTIONS</span>
              <h4 style={{ color: '#fff', marginBottom: '12px' }}>
                Ready to visit office?
              </h4>
              <p style={{ color: '#c5d4cc', marginBottom: '18px' }}>
                Save or print your complete Sahay Guidance Dossier to carry with your physical documents.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="cta-btn"
                  style={{ width: '100%', justifyContent: 'center', textAlign: 'center', background: '#fff', color: 'var(--green-dark)', fontWeight: '800' }}
                  onClick={handlePrint}
                >
                  Print / Save PDF 🖨️
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  style={{ width: '100%', justifyContent: 'center', textAlign: 'center', fontSize: '12px' }}
                  onClick={() => navigate('/partners')}
                >
                  Change Partner Office
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  style={{ width: '100%', justifyContent: 'center', textAlign: 'center', fontSize: '12px' }}
                  onClick={() => navigate('/')}
                >
                  Back to Home
                </button>
              </div>
            </div>

            {/* User Profile Overview */}
            <div className="profile-journey-card">
              <div className="journey-header">
                <div>
                  <span className="small-label">PROFILE DETAILS</span>
                  <h3>Applicant Summary</h3>
                </div>
                <div className="journey-badge">Verified</div>
              </div>

              <div style={{ paddingTop: '16px', display: 'grid', gap: '10px', fontSize: '12px', color: '#48554d' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Annual Income:</span>
                  <strong>₹{Number(profile.annual_income || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Purpose:</span>
                  <strong style={{ textTransform: 'capitalize' }}>{profile.purpose || 'Business'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Project Cost:</span>
                  <strong>₹{Number(profile.project_cost || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Location:</span>
                  <strong>{profile.district || 'Rajkot'}, {profile.state || 'Gujarat'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SC Certificate:</span>
                  <strong style={{ color: 'var(--green)' }}>
                    {profile.has_sc_certificate === 'true' ? 'Yes (Verified)' : 'No'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Journey Card */}
            <div className="profile-journey-card">
              <div className="journey-header">
                <div>
                  <span className="small-label">YOUR JOURNEY</span>
                  <h3>From need to next step</h3>
                </div>
                <div className="journey-badge">04 / 04</div>
              </div>

              <div className="profile-steps">
                <div className="profile-step">
                  <div className="profile-step-icon" style={{ background: '#e5f0e9', color: 'var(--green)' }}>✓</div>
                  <div>
                    <strong>Tell us your need</strong>
                    <span>Completed</span>
                  </div>
                </div>

                <div className="profile-step-line"></div>

                <div className="profile-step">
                  <div className="profile-step-icon" style={{ background: '#e5f0e9', color: 'var(--green)' }}>✓</div>
                  <div>
                    <strong>Find a suitable scheme</strong>
                    <span>Completed</span>
                  </div>
                </div>

                <div className="profile-step-line"></div>

                <div className="profile-step">
                  <div className="profile-step-icon" style={{ background: '#e5f0e9', color: 'var(--green)' }}>✓</div>
                  <div>
                    <strong>Find a suitable partner</strong>
                    <span>Completed</span>
                  </div>
                </div>

                <div className="profile-step-line"></div>

                <div className="profile-step current">
                  <div className="profile-step-icon">📋</div>
                  <div>
                    <strong>Final Dossier Summary</strong>
                    <span>You're here</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="footer-brand">
          <div className="brand-logo small">S</div>
          <div>
            <strong>Sahay</strong>
            <span>Scheme Guidance Platform</span>
          </div>
        </div>
        <div className="footer-note">
          Guidance platform • Prototype
        </div>
      </footer>
    </div>
  )
}

export default Summary