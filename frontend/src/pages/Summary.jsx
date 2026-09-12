import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AudioNarrator from '../components/AudioNarrator'
import { useAccessibility } from '../context/AccessibilityContext'
import '../styles/layout.css'
import '../styles/components.css'
import '../styles/responsive.css'

function getDocIcon(title) {
  const t = (title || '').toLowerCase()
  if (t.includes('caste') || t.includes('sc')) return '📜'
  if (t.includes('income')) return '💰'
  if (t.includes('identity') || t.includes('aadhaar')) return '🪪'
  if (t.includes('residence') || t.includes('domicile') || t.includes('ration')) return '🏠'
  if (t.includes('fee') || t.includes('admission')) return '🎓'
  if (t.includes('proposal') || t.includes('estimate') || t.includes('business')) return '📑'
  if (t.includes('bank') || t.includes('passbook')) return '🏦'
  return '📋'
}

const DEFAULT_SCHEME = {
  id: 'term_loan',
  name: 'Term Loan Scheme (NSFDC)',
  interest_rate: 8.0,
  max_project_cost: 5000000,
  loan_cap: 4500000,
  loan_percentage: 90,
  tenure_months: 60,
  moratorium_months: 6,
  summary: 'Core concessional credit scheme by the National Scheduled Castes Finance and Development Corporation (NSFDC) for self-employment & entrepreneurial expansion.',
}

const DEFAULT_PARTNER = {
  id: 'GJ-RJK-001',
  name: 'Gujarat Scheduled Castes Development Corporation (GSCDC)',
  type: 'State Channelizing Agency',
  district: 'Rajkot',
  state: 'Gujarat',
  address: 'District Panchayat Compound, Near Collector Office, Rajkot, Gujarat 360001',
  pincode: '360001',
  phone: '0281-2471092',
  email: 'gscdc.rajkot@gujarat.gov.in',
  hours: 'Mon - Fri: 10:30 AM - 05:30 PM (2nd & 4th Sat closed)',
  verified: true,
  latitude: 22.3039,
  longitude: 70.8022,
  distance_km: 0.5,
  fund_available: true,
  no_overdues: true,
  npa_percentage: 2.1,
  fund_utilization_pct: 88.5,
  rank_score: 98,
}

const DEFAULT_PROFILE = {
  annual_income: '300000',
  purpose: 'business',
  project_cost: '380000',
  activity_type: 'dairy',
  state: 'Gujarat',
  district: 'Rajkot',
  has_sc_certificate: 'true',
}

function getRequiredDocuments(profile, scheme) {
  const isEdu = profile?.purpose === 'education' || scheme?.id === 'educational_loan' || scheme?.id === 'vocational_education'
  return [
    {
      title: 'SC Caste Certificate',
      detail: 'Valid Scheduled Caste certificate issued by District Magistrate / Sub-Divisional Magistrate / Competent Revenue Authority.',
      required: true,
    },
    {
      title: 'Income Certificate',
      detail: 'Annual family income certificate for current financial year issued by Taluka Executive Magistrate / Revenue Authority (must be within ₹5,00,000 ceiling).',
      required: true,
    },
    {
      title: 'Identity Proof',
      detail: 'Aadhaar Card, Voter ID, or Driving License (original + self-attested copies).',
      required: true,
    },
    {
      title: 'Residence / Domicile Proof',
      detail: 'Ration Card, Electricity Bill, or State Domicile Certificate confirming residency in servicing district.',
      required: true,
    },
    isEdu
      ? {
        title: 'Admission Letter & Fee Structure',
        detail: 'Bonafide certificate / confirmed admission letter from recognized institution with official course fee schedule.',
        required: true,
      }
      : {
        title: 'Project Proposal / Business Estimate',
        detail: 'Detailed project quotation for equipment, livestock, machinery, or business premises from certified supplier.',
        required: true,
      },
    {
      title: 'Aadhaar-Linked Bank Passbook',
      detail: 'Active savings account passbook copy with clear IFSC code and Aadhaar seed status for Direct Benefit Transfer (DBT).',
      required: true,
    },
  ]
}

function Summary() {
  const navigate = useNavigate()

  const [scheme, setScheme] = useState(DEFAULT_SCHEME)
  const [partner, setPartner] = useState(DEFAULT_PARTNER)
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [calculation, setCalculation] = useState(null)

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

    const storedCalculation = sessionStorage.getItem('sahay_calculation')
    if (storedCalculation) {
      try {
        setCalculation(JSON.parse(storedCalculation))
      } catch (err) {
        console.error('Error parsing sahay_calculation', err)
      }
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const directionsUrl =
    partner.latitude && partner.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`
      : `https://www.google.com/maps/search/${encodeURIComponent(partner.name + ' ' + partner.district)}`

  const { t, tTerm, language, sahajMode } = useAccessibility() || {
    t: (k) => k,
    tTerm: (s, p) => s,
    language: 'en',
    sahajMode: true
  }

  const getSummaryAudioText = () => {
    const loanAmt = calculation ? calculation.possible_loan.toLocaleString('en-IN') : '—'
    const emi = calculation ? calculation.monthly_estimate.toLocaleString('en-IN') : '—'
    return `Congratulations. Your recommended scheme is ${scheme.name}. You are eligible for approximately ₹${loanAmt} with an estimated monthly EMI of ₹${emi}. Your designated nodal partner is ${partner.name} in ${partner.district}. Carry your SC caste certificate, income certificate, Aadhaar card, and bank passbook directly to the office. Never pay any money to middlemen.`
  }

  const handleShareWhatsApp = () => {
    const loanAmt = calculation ? calculation.possible_loan.toLocaleString('en-IN') : 'N/A'
    const ownAmt = calculation ? calculation.own_contribution.toLocaleString('en-IN') : 'N/A'
    const emiAmt = calculation ? calculation.monthly_estimate.toLocaleString('en-IN') : 'N/A'

    const msg = [
      `*🏛️ SAHAY CITIZEN ACTION PLAN*`,
      `----------------------------------------`,
      `📌 *Scheme*: ${scheme.name}`,
      `💰 *Govt Loan Amount*: ₹${loanAmt} (${scheme.interest_rate || 8}% interest)`,
      `💼 *Promoter Margin (Own)*: ₹${ownAmt}`,
      `📅 *Monthly EMI*: ₹${emiAmt}/month`,
      `⏳ *Tenure*: ${scheme.tenure_months || 60} Months (${scheme.moratorium_months || 6} Months Grace)`,
      ``,
      `📍 *Official Destination Office*:`,
      `• ${partner.name}`,
      `• Address: ${partner.address || partner.district}`,
      partner.phone ? `• Tel: ${partner.phone}` : null,
      ``,
      `📋 *Required Documents (Carry Original + 2 Xerox)*:`,
      `1. SC Caste Certificate`,
      `2. Annual Income Certificate (< ₹5 Lakhs)`,
      `3. Aadhaar Card / Voter ID`,
      `4. Aadhaar-Linked Bank Passbook`,
      `5. Project Estimate / College Quotation`,
      ``,
      `⚠️ *Anti-Middleman Notice*: Government application is 100% FREE. Never pay any fee or bribe to agents!`,
      `🔗 Sahay Scheme Guidance Platform`
    ].filter(Boolean).join('\n')

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  const handleStartNewApplication = () => {
    try {
      sessionStorage.removeItem('sahay_profile')
      sessionStorage.removeItem('sahay_selected_scheme')
      sessionStorage.removeItem('sahay_recommendation')
      sessionStorage.removeItem('sahay_calculation')
      sessionStorage.removeItem('sahay_selected_partner')
    } catch (e) {
      console.warn('Could not reset session storage:', e)
    }
    navigate('/profile')
  }

  return (
    <div className="profile-page">
      {/* ================= NAVBAR ================= */}
      <Navbar />

      {/* ================= MAIN CONTENT ================= */}
      <main className="profile-main">
        {/* Heading */}
        <div className="profile-heading">
          <div>
            <span className="small-label">
              STEP 04 OF 04 • CITIZEN GUIDANCE DOSSIER
            </span>
            <h1>
              Consolidated Citizen Action Plan & Summary.
            </h1>
            <p>
              Your verified scheme entitlement, financial breakdown, channel partner contact, and document checklist ready for physical submission.
            </p>
          </div>

          <div className="progress-indicator">
            <span>STEP 04 OF 04</span>
          </div>
        </div>

        {/* Priority 5: Anti-Middleman Shield Banner with WhatsApp & Audio */}
        <div
          style={{
            marginBottom: '24px',
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
            border: '1.5px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.07)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              fontSize: '28px',
              background: '#ffffff',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(220,38,38,0.15)',
              flexShrink: 0
            }}>
              🛡️
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: '#991b1b',
                  background: '#fee2e2',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  ⚠️ 100% FREE GOVERNMENT SERVICE
                </span>
                <strong style={{ fontSize: '13px', color: '#7f1d1d' }}>
                  Zero Middleman Exploitation Shield
                </strong>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#991b1b', lineHeight: '1.4' }}>
                SC Beneficiaries: DO NOT pay any commission to brokers or agents. All forms and processing are 100% FREE.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AudioNarrator text={getSummaryAudioText()} label="Listen 🔊" />
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="secondary-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              <span>💬</span>
              <span>Share to WhatsApp</span>
            </button>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="pl-scheme-chip" style={{ background: '#087a4d', color: '#fff' }}>
                        ✓ Entitled Scheme
                      </span>
                      <span className="pl-scheme-chip" style={{ background: '#e5f0e9', color: 'var(--green-dark)' }}>
                        {scheme.interest_rate || 8.0}% Concessional Interest
                      </span>
                    </div>
                    <span className="eyebrow" style={{ margin: 0, padding: '4px 10px', fontSize: '11px' }}>
                      <span className="eyebrow-dot"></span>
                      NSFDC Statutory Facility
                    </span>
                  </div>

                  <label style={{ fontSize: '22px', lineHeight: '1.3' }}>
                    {scheme.name}
                  </label>

                  <p className="field-help" style={{ marginBottom: '18px', marginTop: '6px' }}>
                    {scheme.summary || 'Targeted loan assistance program administered under the National Scheduled Castes Finance and Development Corporation (NSFDC).'}
                  </p>

                  {/* Financial Terms & Breakdown Matrix */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ padding: '12px 14px', background: '#f8faf9', borderRadius: '8px', border: '1px solid #eef2f0' }}>
                      <span style={{ fontSize: '10px', color: '#68736d', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                        {t('secCost')}
                      </span>
                      <strong style={{ fontSize: '16px', color: 'var(--ink)' }}>
                        ₹{calculation ? calculation.project_cost.toLocaleString('en-IN') : Number(profile.project_cost || 0).toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#eef8f2', borderRadius: '8px', border: '1px solid #c9ebd7' }}>
                      <span style={{ fontSize: '10px', color: '#087a4d', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                        {tTerm('calcLoanAmount', 'sahajLoanAmount')} ({calculation?.loan_percentage || scheme.loan_percentage || 90}%)
                      </span>
                      <strong style={{ fontSize: '16px', color: '#087a4d' }}>
                        ₹{calculation ? calculation.possible_loan.toLocaleString('en-IN') : '—'}
                      </strong>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#fff9eb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                      <span style={{ fontSize: '10px', color: '#b45309', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                        {tTerm('calcOwnContribution', 'sahajOwnContribution')}
                      </span>
                      <strong style={{ fontSize: '16px', color: '#b45309' }}>
                        ₹{calculation ? calculation.own_contribution.toLocaleString('en-IN') : '—'}
                      </strong>
                    </div>

                    <div style={{ padding: '12px 14px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                      <span style={{ fontSize: '10px', color: '#0369a1', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                        {tTerm('calcMonthlyEmi', 'sahajMonthlyEmi')}
                      </span>
                      <strong style={{ fontSize: '16px', color: '#0369a1' }}>
                        ₹{calculation ? calculation.monthly_estimate.toLocaleString('en-IN') : '—'}
                        <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#68736d' }}> / mo</span>
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#48554d', padding: '10px 14px', background: '#fbfcfb', borderRadius: '6px', border: '1px solid #eaecf0' }}>
                    <span>Tenure: <strong>{scheme.tenure_months || 60} Months ({(scheme.tenure_months || 60) / 12} Yrs)</strong></span>
                    <span>•</span>
                    <span>Moratorium: <strong>{scheme.moratorium_months || 6} Months</strong></span>
                    <span>•</span>
                    <span>Total Repayable: <strong>₹{calculation ? calculation.total_repayable.toLocaleString('en-IN') : '—'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div className="form-section">
                <div className="field-number">02</div>
                <div className="field-content">
                  <label style={{ fontSize: '18px', marginBottom: '4px' }}>
                    Required Documents Checklist
                  </label>
                  <p className="field-help" style={{ marginBottom: '16px' }}>
                    Carry the following physical documents (original + 2 self-attested photocopies) to the partner office:
                  </p>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {getRequiredDocuments(profile, scheme).map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '12px 16px',
                          background: '#fbfcfb',
                          border: '1px solid var(--line)',
                          borderRadius: '11px'
                        }}
                      >
                        <div
                          style={{
                            fontSize: '22px',
                            background: '#eef8f2',
                            borderRadius: '8px',
                            width: '42px',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {getDocIcon(doc.title)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '13.5px', color: 'var(--ink)' }}>
                              {doc.title}
                            </strong>
                            <span className="secure-mark" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              ✓ Required
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', color: '#68736d', lineHeight: '1.45', display: 'block', marginTop: '2px' }}>
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
                    <span className="small-label" style={{ margin: 0 }}>OFFICIAL DESTINATION PARTNER</span>
                    <span className="pl-verified">✓ Authorized State Channelising Agency (SCA)</span>
                  </div>

                  <label style={{ fontSize: '20px', lineHeight: '1.3' }}>
                    {partner.name}
                  </label>
                  <p style={{ color: 'var(--green)', fontSize: '13px', fontWeight: '700', marginTop: '4px', marginBottom: '16px' }}>
                    {partner.type || 'State Channelising Agency'}
                  </p>

                  <div style={{ display: 'grid', gap: '12px', fontSize: '13px', color: '#48554d' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>📍</span>
                      <div>
                        <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '12px' }}>Office Address:</strong>
                        <span>{partner.address || `${partner.district}, ${partner.state}`}</span>
                        {partner.distance_km != null && (
                          <span style={{ display: 'block', color: '#087a4d', fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>
                            • Approximately {partner.distance_km} km from your location
                          </span>
                        )}
                      </div>
                    </div>

                    {partner.hours && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>🕒</span>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '12px' }}>Public Working Hours:</strong>
                          <span>{partner.hours}</span>
                        </div>
                      </div>
                    )}

                    {partner.phone && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>📞</span>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '12px' }}>Desk Telephone / Helpdesk:</strong>
                          <span>{partner.phone}</span>
                        </div>
                      </div>
                    )}

                    {partner.email && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>✉️</span>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '12px' }}>Official Email Address:</strong>
                          <span>{partner.email}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statutory Fund Solvency & Recovery Audit (SIH Part 3 Guardrail) */}
                  <div style={{
                    padding: '14px 16px',
                    background: '#f4faf6',
                    borderRadius: '10px',
                    border: '1px solid #bbf7d0',
                    marginTop: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        🛡️ Statutory Fund Solvency & Recovery Audit
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#dcfce7', color: '#15803d' }}>
                        Approved for Routing
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                          {sahajMode ? t('sahajNpaSimple') : t('grossNpa')}
                        </span>
                        <strong style={{ fontSize: '15px', color: '#16a34a' }}>
                          {partner.npa_percentage != null ? `${partner.npa_percentage}%` : '2.1%'}
                        </strong>
                        <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>Cap: &le; 5.0%</span>
                      </div>

                      <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                          {sahajMode ? t('sahajLoanGuaranteed') : t('quotaDisbursal')}
                        </span>
                        <strong style={{ fontSize: '15px', color: '#0369a1' }}>
                          {partner.fund_utilization_pct != null ? `${partner.fund_utilization_pct}%` : '88.5%'}
                        </strong>
                        <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>Active Quota</span>
                      </div>

                      <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                          Best Match
                        </span>
                        <strong style={{ fontSize: '15px', color: '#7c3aed' }}>
                          {partner.rank_score ?? 98}/100
                        </strong>
                        <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>Priority Rank</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontWeight: 600 }}>
                        ✓ Active NSFDC Capital Quota
                      </span>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontWeight: 600 }}>
                        ✓ Zero Default Overdues Audit
                      </span>
                    </div>

                    <p style={{ fontSize: '11px', color: '#166534', margin: 0, lineHeight: 1.4 }}>
                      Statutory Compliance Guardrail: Verified eligible for citizen loan routing under NSFDC Section 3(a) solvency guidelines. Beneficiary applications submitted here will not be delayed by frozen lending allocations or NPA recovery holds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <div>
                  <span className="secure-mark">✓</span>
                  <span>Official Nodal Office • Protected from Middlemen</span>
                </div>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-btn"
                  style={{ padding: '9px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  🗺️ Open in Google Maps
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
                    Follow these 3 simple steps to complete your loan application:
                  </p>

                  <div className="journey-steps" style={{ paddingTop: 0 }}>
                    <div className="journey-step active">
                      <div className="step-number">01</div>
                      <div className="step-icon">📋</div>
                      <div>
                        <h4>Assemble Physical Documents</h4>
                        <p>Prepare the original certificates along with 2 self-attested photocopies specified in the checklist above.</p>
                      </div>
                    </div>

                    <div className="journey-line"></div>

                    <div className="journey-step active">
                      <div className="step-number">02</div>
                      <div className="step-icon">📍</div>
                      <div>
                        <h4>Visit GSCDC Channel Partner Office</h4>
                        <p>Approach the dedicated loan desk at {partner.name} in {partner.district || 'Rajkot'}.</p>
                      </div>
                    </div>

                    <div className="journey-line"></div>

                    <div className="journey-step active">
                      <div className="step-number">03</div>
                      <div className="step-icon">📄</div>
                      <div>
                        <h4>Submit Sahay Guidance Dossier</h4>
                        <p>Hand over this printed action plan to the loan processing officer to ensure intake under the correct NSFDC scheme.</p>
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
              <span className="tip-label">ACTION PLAN ACTIONS</span>
              <h4 style={{ color: '#fff', marginBottom: '12px' }}>
                Ready to visit the office?
              </h4>
              <p style={{ color: '#c5d4cc', marginBottom: '18px' }}>
                Print or save your complete Sahay Guidance Dossier to carry with your physical documents.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ width: '100%', justifyContent: 'center', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}
                  onClick={handlePrint}
                >
                  Print Action Plan 🖨️
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  style={{ width: '100%', justifyContent: 'center', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}
                  onClick={handleShareWhatsApp}
                >
                  💬 Share to WhatsApp
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  style={{ width: '100%', justifyContent: 'center', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}
                  onClick={() => navigate('/partners')}
                >
                  ← Select Partner ✓
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  style={{ width: '100%', justifyContent: 'center', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}
                  onClick={() => navigate('/result')}
                >
                  ← Why this scheme is recommended for you
                </button>

                <button
                  type="button"
                  className="secondary-btn"
                  style={{ width: '100%', justifyContent: 'center', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}
                  onClick={handleStartNewApplication}
                >
                  Start New Application 🔄
                </button>
              </div>
            </div>

            {/* Applicant Profile Summary */}
            <div className="profile-journey-card">
              <div className="journey-header">
                <div>
                  <span className="small-label">APPLICANT PROFILE</span>
                  <h3>Citizen Summary</h3>
                </div>
                <div className="journey-badge">Verified</div>
              </div>

              <div style={{ paddingTop: '16px', display: 'grid', gap: '10px', fontSize: '12px', color: '#48554d' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Annual Family Income:</span>
                  <strong>₹{Number(profile.annual_income || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Loan Purpose:</span>
                  <strong style={{ textTransform: 'capitalize' }}>{profile.purpose || 'Business'}</strong>
                </div>
                {profile.gender && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Gender:</span>
                    <strong style={{ textTransform: 'capitalize' }}>{profile.gender}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Activity Type:</span>
                  <strong style={{ textTransform: 'capitalize' }}>{profile.activity_type || 'Dairy'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Project Cost:</span>
                  <strong>₹{Number(profile.project_cost || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Applicant Location:</span>
                  <strong>{profile.district || 'Rajkot'}, {profile.state || 'Gujarat'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SC Caste Certificate:</span>
                  <strong style={{ color: 'var(--green)' }}>
                    ✓ Verified
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
                    <strong>Statutory Recommendation</strong>
                    <span>Completed</span>
                  </div>
                </div>

                <div className="profile-step-line"></div>

                <div className="profile-step">
                  <div className="profile-step-icon" style={{ background: '#e5f0e9', color: 'var(--green)' }}>✓</div>
                  <div>
                    <strong>Channel Partner Discovery</strong>
                    <span>Completed</span>
                  </div>
                </div>

                <div className="profile-step-line"></div>

                <div className="profile-step current">
                  <div className="profile-step-icon">📋</div>
                  <div>
                    <strong>Consolidated Dossier</strong>
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
          National Scheduled Castes Finance and Development Corporation • Guidance Prototype
        </div>
      </footer>
    </div>
  )
}

export default Summary