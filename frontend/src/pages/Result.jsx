import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecommendation, getCalculation } from '../services/api'
import Navbar from '../components/Navbar'
import AudioNarrator from '../components/AudioNarrator'
import { useAccessibility } from '../context/AccessibilityContext'
import '../styles/layout.css'
import '../styles/components.css'
import '../styles/responsive.css'

function Result() {
    const navigate = useNavigate()
    const { t, tTerm, language, sahajMode } = useAccessibility()

    const [profileData, setProfileData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [calculating, setCalculating] = useState(false)
    const [error, setError] = useState('')
    
    // Core API data
    const [recommendation, setRecommendation] = useState(null)
    const [calculation, setCalculation] = useState(null)
    const [activeScheme, setActiveScheme] = useState(null)

    // Load stored profile from sessionStorage and execute statutory evaluation
    useEffect(() => {
        const storedProfile = sessionStorage.getItem('sahay_profile')
        if (!storedProfile) {
            setLoading(false)
            return
        }

        let parsed = null
        try {
            parsed = JSON.parse(storedProfile)
            setProfileData(parsed)
        } catch (err) {
            console.error('Failed to parse sahay_profile', err)
            setError('Could not read your saved profile. Please start over.')
            setLoading(false)
            return
        }

        // Fetch recommendation from deterministic backend
        async function fetchEvaluation() {
            setLoading(true)
            setError('')
            try {
                const recData = await getRecommendation(parsed)
                setRecommendation(recData)

                if (recData.eligible && recData.recommended_scheme) {
                    const primaryScheme = recData.recommended_scheme
                    setActiveScheme(primaryScheme)

                    // Persist recommended scheme initially
                    sessionStorage.setItem('sahay_selected_scheme', JSON.stringify(primaryScheme))
                    sessionStorage.setItem('sahay_recommendation', JSON.stringify(recData))

                    // Calculate financial schedule
                    const calcData = await getCalculation(primaryScheme.id, parsed.project_cost)
                    setCalculation(calcData)
                    sessionStorage.setItem('sahay_calculation', JSON.stringify(calcData))
                }
            } catch (err) {
                console.error('API recommendation call failed:', err)
                setError(err.message || 'Failed to connect to recommendation service. Please verify backend is running.')
            } finally {
                setLoading(false)
            }
        }

        fetchEvaluation()
    }, [])

    // Switch between primary and alternative scheme
    const handleSwitchScheme = async (scheme) => {
        if (!scheme || !profileData) return
        setActiveScheme(scheme)
        sessionStorage.setItem('sahay_selected_scheme', JSON.stringify(scheme))

        setCalculating(true)
        try {
            const calcData = await getCalculation(scheme.id, profileData.project_cost)
            setCalculation(calcData)
            sessionStorage.setItem('sahay_calculation', JSON.stringify(calcData))
        } catch (err) {
            console.error('Failed to recalculate for scheme:', scheme.id, err)
        } finally {
            setCalculating(false)
        }
    }

    const handleProceedToPartners = () => {
        if (activeScheme) {
            sessionStorage.setItem('sahay_selected_scheme', JSON.stringify(activeScheme))
        }
        if (calculation) {
            sessionStorage.setItem('sahay_calculation', JSON.stringify(calculation))
        }
        navigate('/partners')
    }

    const handleEditProfile = () => {
        navigate('/profile')
    }

    const resultNarration = !activeScheme ? '' : (
        `Congratulations! ${activeScheme.name} has been recommended for you at ${activeScheme.interest_rate}% interest rate. ${calculation ? `Sanctionable loan is ₹${calculation.possible_loan.toLocaleString('en-IN')} with an estimated monthly EMI of ₹${calculation.monthly_estimate.toLocaleString('en-IN')}.` : ''}`
    )

    return (
        <div className="profile-page">
            <Navbar />

            {/* ================= MAIN CONTENT ================= */}
            <main className="profile-main">
                {/* Heading */}
                <div className="profile-heading">
                    <div>
                        <span className="small-label">
                            {t('recommendedBadge')}
                        </span>
                        <h1>
                            Government Scheme Guidance
                        </h1>
                        <p>
                            {t('resultSubtitle')}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div className="progress-indicator">
                            <span>STEP 02</span>
                            <strong>of 04</strong>
                        </div>
                        {resultNarration && <AudioNarrator text={resultNarration} />}
                    </div>
                </div>

                {/* Profile Summary Context Banner */}
                {profileData && (
                    <div
                        className="profile-form-card"
                        style={{
                            marginBottom: '25px',
                            padding: '18px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '15px',
                            background: '#fbfcfb'
                        }}
                    >
                        <div>
                            <span className="small-label" style={{ marginBottom: '4px' }}>CITIZEN PROFILE DETAILS</span>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#17231d', fontWeight: '600', marginTop: '4px' }}>
                                <span>Annual Income: <strong>₹{Number(profileData.annual_income || 0).toLocaleString('en-IN')}</strong></span>
                                <span>•</span>
                                <span>Purpose: <strong style={{ textTransform: 'capitalize' }}>{profileData.purpose || 'Business'}</strong></span>
                                <span>•</span>
                                <span>Activity: <strong style={{ textTransform: 'capitalize' }}>{profileData.activity_type || 'Dairy'}</strong></span>
                                <span>•</span>
                                <span>Project Cost: <strong>₹{Number(profileData.project_cost || 0).toLocaleString('en-IN')}</strong></span>
                                <span>•</span>
                                <span>Location: <strong>{profileData.district || 'Rajkot'}, {profileData.state || 'Gujarat'}</strong></span>
                                {profileData.gender && (
                                    <>
                                        <span>•</span>
                                        <span>Gender: <strong style={{ textTransform: 'capitalize' }}>{profileData.gender}</strong></span>
                                    </>
                                )}
                                {Boolean(profileData.has_sc_certificate) && (
                                    <>
                                        <span>•</span>
                                        <span className="pl-verified">✓ SC Certificate Verified</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="secondary-btn"
                            style={{ padding: '8px 14px', fontSize: '12px' }}
                            onClick={handleEditProfile}
                        >
                            Modify Profile
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="profile-form-card" style={{ padding: '60px 30px', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', marginBottom: '14px', animation: 'spin 1.5s linear infinite' }}>⏳</div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>Evaluating Statutory Eligibility...</h3>
                        <p style={{ color: '#68736d', fontSize: '14px', margin: 0 }}>
                            Consulting NSFDC charter guidelines and computing financial amortization schedules.
                        </p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="profile-form-card" style={{ padding: '30px', borderColor: '#fda29b', background: '#fef3f2' }}>
                        <h3 style={{ color: '#b42318', margin: '0 0 8px' }}>Unable to Complete Evaluation</h3>
                        <p style={{ color: '#7a271a', margin: '0 0 16px', fontSize: '13px' }}>{error}</p>
                        <button type="button" className="primary-btn" onClick={handleEditProfile}>
                            Back to Profile Form
                        </button>
                    </div>
                )}

                {/* Missing Profile State */}
                {!loading && !profileData && !error && (
                    <div className="profile-form-card pl-empty" style={{ padding: '50px 30px', textAlign: 'center' }}>
                        <span style={{ fontSize: '36px' }}>📋</span>
                        <h3 style={{ margin: '12px 0 8px' }}>No Profile Found</h3>
                        <p style={{ color: '#68736d', marginBottom: '18px' }}>
                            Please provide your basic applicant details to determine scheme eligibility.
                        </p>
                        <button type="button" className="primary-btn" onClick={() => navigate('/profile')}>
                            Go to Profile Intake →
                        </button>
                    </div>
                )}

                {/* Ineligible State */}
                {!loading && recommendation && !recommendation.eligible && (
                    <div className="profile-form-card" style={{ padding: '35px', borderColor: '#fecdca', background: '#fffbfa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                            <span style={{ background: '#fee4e2', color: '#d92d20', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px' }}>
                                STATUTORY DISQUALIFICATION
                            </span>
                            <span style={{ fontSize: '13px', color: '#68736d' }}>Under NSFDC Scheme Charter</span>
                        </div>

                        <h2 style={{ color: '#17231d', fontSize: '22px', margin: '0 0 12px' }}>
                            Application Ineligible for Concessional Lending
                        </h2>

                        <div style={{ padding: '16px 20px', background: '#ffffff', borderRadius: '8px', border: '1px solid #fecdca', marginBottom: '20px' }}>
                            <strong style={{ color: '#b42318', display: 'block', marginBottom: '6px', fontSize: '14px' }}>
                                Ground for Ineligibility:
                            </strong>
                            <p style={{ margin: 0, color: '#48554d', fontSize: '13px', lineHeight: '1.6' }}>
                                {recommendation.ineligibility_reason || 'Does not meet NSFDC statutory eligibility criteria.'}
                            </p>
                        </div>

                        <p style={{ color: '#68736d', fontSize: '13px', marginBottom: '24px' }}>
                            NSFDC schemes are reserved exclusively for Scheduled Caste citizens with an annual family income not exceeding ₹5,00,000. If your income was entered incorrectly, please update your profile.
                        </p>

                        <button type="button" className="primary-btn" onClick={handleEditProfile}>
                            Revise Profile Details
                        </button>
                    </div>
                )}

                {/* Eligible State - Main Content Grid */}
                {!loading && recommendation && recommendation.eligible && activeScheme && (
                    <div className="profile-layout">
                        {/* Left Main Column: Scheme & Financial Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
                            {/* 1. PRIMARY RECOMMENDATION CARD */}
                            <div
                                className="profile-form-card"
                                style={{
                                    borderColor: 'var(--green)',
                                    boxShadow: '0 12px 35px rgba(23, 107, 77, 0.12)',
                                    padding: '28px',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span className="pl-scheme-chip" style={{ background: '#087a4d', color: '#ffffff', fontWeight: 700 }}>
                                            ✓ RECOMMENDED SCHEME
                                        </span>
                                        <span className="pl-scheme-chip" style={{ background: '#e5f0e9', color: 'var(--green-dark)' }}>
                                            {activeScheme.loan_percentage}% NSFDC Concessional Loan
                                        </span>
                                    </div>
                                    <span className="eyebrow" style={{ margin: 0, padding: '4px 10px', fontSize: '11px' }}>
                                        <span className="eyebrow-dot"></span>
                                        Deterministic Statutory Fit
                                    </span>
                                </div>

                                <h2 style={{ fontSize: '24px', margin: '0 0 10px', color: 'var(--ink)' }}>
                                    {activeScheme.name}
                                </h2>

                                <p style={{ color: '#48554d', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                                    Targeted credit facility under the National Scheduled Castes Finance and Development Corporation (NSFDC). Specifically evaluated for your {profileData?.activity_type || 'business'} venture.
                                </p>

                                {/* Key Terms Grid */}
                                <div className="choice-grid" style={{ maxWidth: '100%', marginBottom: '22px' }}>
                                    <div className="choice-button" style={{ cursor: 'default' }}>
                                        <span className="choice-icon" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>
                                            %
                                        </span>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#68736d', textTransform: 'uppercase', fontWeight: 700 }}>{t('concessionalInterest')}</div>
                                            <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>{activeScheme.interest_rate}% p.a.</strong>
                                        </div>
                                    </div>

                                    <div className="choice-button" style={{ cursor: 'default' }}>
                                        <span className="choice-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                            ₹
                                        </span>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#68736d', textTransform: 'uppercase', fontWeight: 700 }}>{t('maxLimit')}</div>
                                            <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>₹{(activeScheme.max_project_cost / 100000).toFixed(1)} Lakhs</strong>
                                        </div>
                                    </div>

                                    <div className="choice-button" style={{ cursor: 'default' }}>
                                        <span className="choice-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                                            ⏱
                                        </span>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#68736d', textTransform: 'uppercase', fontWeight: 700 }}>{tTerm('statutoryTenure', 'sahajTenureMonths')}</div>
                                            <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>{activeScheme.tenure_months} Months ({activeScheme.tenure_months / 12} Yrs)</strong>
                                        </div>
                                    </div>

                                    <div className="choice-button" style={{ cursor: 'default' }}>
                                        <span className="choice-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
                                            ⏸
                                        </span>
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#68736d', textTransform: 'uppercase', fontWeight: 700 }}>{tTerm('moratorium', 'sahajMoratoriumMonths')}</div>
                                            <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>{activeScheme.moratorium_months} Months</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Statutory Reasoning Section */}
                                <div style={{ background: '#fbfcfb', padding: '16px 20px', borderRadius: '10px', border: '1px solid #eaecf0', marginBottom: '20px' }}>
                                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '10px', color: '#17231d' }}>
                                        {t('whyRecommended')}:
                                    </strong>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                                        {recommendation.reasons.map((reason, idx) => (
                                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#344054' }}>
                                                <span className="secure-mark" style={{ marginTop: '2px' }}>✓</span>
                                                <span>{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {activeScheme.id !== recommendation.recommended_scheme.id && (
                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        style={{ padding: '8px 14px', fontSize: '12px' }}
                                        onClick={() => handleSwitchScheme(recommendation.recommended_scheme)}
                                    >
                                        ← Switch back to {recommendation.recommended_scheme.name} (Primary)
                                    </button>
                                )}
                            </div>

                            {/* 2. INDICATIVE FINANCIAL REPAYMENT SCHEDULE */}
                            {calculation && (
                                <div
                                    className="profile-form-card"
                                    style={{
                                        padding: '28px',
                                        background: '#ffffff',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <span className="small-label">
                                                {sahajMode ? 'SIMPLE LOAN BREAKDOWN' : 'FINANCIAL ESTIMATION'}
                                            </span>
                                            <h3 style={{ margin: '4px 0 0', fontSize: '19px' }}>
                                                {sahajMode ? 'What You Pay & What Government Gives' : 'Indicative Repayment & Margin Breakdown'}
                                            </h3>
                                        </div>
                                        <span className="pl-verified">
                                            {calculation.loan_percentage}% Loan • {100 - calculation.loan_percentage}% Margin
                                        </span>
                                    </div>

                                    {calculating ? (
                                        <div style={{ padding: '30px', textAlign: 'center', color: '#68736d' }}>
                                            Recalculating amortization schedule...
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                                                <div style={{ padding: '16px', background: '#f8faf9', borderRadius: '8px', border: '1px solid #eef2f0' }}>
                                                    <span style={{ fontSize: '11px', color: '#68736d', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                                        Total Project Cost
                                                    </span>
                                                    <strong style={{ fontSize: '20px', color: 'var(--ink)' }}>
                                                        ₹{calculation.project_cost.toLocaleString('en-IN')}
                                                    </strong>
                                                </div>

                                                <div style={{ padding: '16px', background: '#eef8f2', borderRadius: '8px', border: '1px solid #c9ebd7' }}>
                                                    <span style={{ fontSize: '11px', color: '#087a4d', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                                        {tTerm('calcLoanAmount', 'sahajLoanAmount')} ({calculation.loan_percentage}%)
                                                    </span>
                                                    <strong style={{ fontSize: '20px', color: '#087a4d' }}>
                                                        ₹{calculation.possible_loan.toLocaleString('en-IN')}
                                                    </strong>
                                                </div>

                                                <div style={{ padding: '16px', background: '#fff9eb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                                    <span style={{ fontSize: '11px', color: '#b45309', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                                        {tTerm('calcOwnContribution', 'sahajOwnContribution')}
                                                    </span>
                                                    <strong style={{ fontSize: '20px', color: '#b45309' }}>
                                                        ₹{calculation.own_contribution.toLocaleString('en-IN')}
                                                    </strong>
                                                </div>

                                                <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                                    <span style={{ fontSize: '11px', color: '#0369a1', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                                                        {tTerm('calcMonthlyEmi', 'sahajMonthlyEmi')}
                                                    </span>
                                                    <strong style={{ fontSize: '20px', color: '#0369a1' }}>
                                                        ₹{calculation.monthly_estimate.toLocaleString('en-IN')}
                                                        <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#68736d' }}> / mo</span>
                                                    </strong>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#f8faf9', borderRadius: '8px', fontSize: '12px', color: '#48554d', flexWrap: 'wrap', gap: '8px' }}>
                                                <span>{tTerm('calcTotalRepayable', 'sahajTotalRepayable')}: <strong>₹{calculation.total_repayable.toLocaleString('en-IN')}</strong></span>
                                                <span>{t('concessionalInterest')}: <strong>{calculation.interest_rate}% p.a.</strong></span>
                                                <span>{tTerm('moratorium', 'sahajMoratoriumMonths')}: <strong>{calculation.moratorium_months} Months</strong></span>
                                            </div>

                                            <p style={{ color: '#68736d', fontSize: '11px', marginTop: '12px', marginBottom: 0, fontStyle: 'italic' }}>
                                                ℹ {calculation.note}
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 3. "NO WRONG DOOR" ALTERNATIVE SCHEME */}
                            {recommendation.alternative_scheme && (
                                <div
                                    className="profile-form-card"
                                    style={{
                                        padding: '24px',
                                        borderColor: '#d0d5dd',
                                        background: '#fafbfc',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ background: '#f2f4f7', color: '#344054', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                                                "NO WRONG DOOR" SECONDARY ALTERNATIVE
                                            </span>
                                            {activeScheme.id === recommendation.alternative_scheme.id && (
                                                <span className="pl-verified">Currently Selected</span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>
                                        {recommendation.alternative_scheme.name}
                                    </h3>

                                    <p style={{ color: '#68736d', fontSize: '13px', lineHeight: '1.5', margin: '0 0 16px' }}>
                                        If your application encounters channel partner capacity constraints or processing bottlenecks under the primary scheme, this secondary NSFDC scheme provides immediate alternative coverage.
                                    </p>

                                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#344054', marginBottom: '16px' }}>
                                        <span>Interest Rate: <strong>{recommendation.alternative_scheme.interest_rate}% p.a.</strong></span>
                                        <span>•</span>
                                        <span>Limit: <strong>Up to ₹{(recommendation.alternative_scheme.max_project_cost / 100000).toFixed(1)} Lakhs</strong></span>
                                        <span>•</span>
                                        <span>Tenure: <strong>{recommendation.alternative_scheme.tenure_months} Months</strong></span>
                                    </div>

                                    {activeScheme.id !== recommendation.alternative_scheme.id ? (
                                        <button
                                            type="button"
                                            className="secondary-btn"
                                            style={{ padding: '8px 16px', fontSize: '12px' }}
                                            onClick={() => handleSwitchScheme(recommendation.alternative_scheme)}
                                        >
                                            Switch Active Scheme to {recommendation.alternative_scheme.name}
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: '#087a4d', fontWeight: 600 }}>
                                            ✓ Active scheme selected for partner routing
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* 4. RIGHT TO INFORMATION (RTI) TRANSPARENCY: REJECTED SCHEMES */}
                            {recommendation.rejected_schemes && recommendation.rejected_schemes.length > 0 && (
                                <div
                                    className="profile-form-card"
                                    style={{
                                        padding: '24px',
                                        background: '#ffffff',
                                    }}
                                >
                                    <div style={{ marginBottom: '14px' }}>
                                        <span className="small-label">RTI & PUBLIC AUDIT TRANSPARENCY</span>
                                        <h3 style={{ margin: '4px 0 2px', fontSize: '17px' }}>
                                            Other NSFDC Schemes Evaluated
                                        </h3>
                                        <p style={{ color: '#68736d', fontSize: '12px', margin: 0 }}>
                                            Every disqualified government scheme must record a deterministic, legally auditable statutory reason.
                                        </p>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {recommendation.rejected_schemes.map((item, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '8px',
                                                    background: '#f8faf9',
                                                    border: '1px solid #eaecf0',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                                    <strong style={{ fontSize: '13px', color: '#344054' }}>
                                                        {item.scheme_name}
                                                    </strong>
                                                    <span style={{ fontSize: '11px', color: '#b42318', background: '#fef3f2', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                                        Disqualified
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#68736d' }}>
                                                    {item.rejection_reason}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action CTA Bar */}
                            <div
                                className="profile-form-card"
                                style={{
                                    padding: '20px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '15px',
                                    background: '#f4faf6',
                                    borderColor: 'var(--green)',
                                }}
                            >
                                <div>
                                    <strong style={{ fontSize: '15px', color: '#17231d', display: 'block' }}>
                                        Ready to locate nearest Channel Partners?
                                    </strong>
                                    <span style={{ fontSize: '12px', color: '#68736d' }}>
                                        Selected: <strong>{activeScheme.name}</strong> • Servicing District: <strong>{profileData?.district || 'Rajkot'}</strong>
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="primary-btn profile-submit"
                                    onClick={handleProceedToPartners}
                                >
                                    Locate Nearest Partners
                                    <span className="arrow">→</span>
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Journey Sidebar */}
                        <aside className="profile-sidebar">
                            <div className="profile-journey-card">
                                <div className="journey-header">
                                    <div>
                                        <span className="small-label">YOUR JOURNEY</span>
                                        <h3>From need to next step</h3>
                                    </div>
                                    <div className="journey-badge">02 / 04</div>
                                </div>

                                <div className="profile-steps">
                                    <div className="profile-step">
                                        <div className="profile-step-icon" style={{ background: '#e5f0e9', color: 'var(--green)' }}>
                                            ✓
                                        </div>
                                        <div>
                                            <strong>Citizen Profile Intake</strong>
                                            <span>Completed</span>
                                        </div>
                                    </div>

                                    <div className="profile-step-line"></div>

                                    <div className="profile-step current">
                                        <div className="profile-step-icon">◎</div>
                                        <div>
                                            <strong>Statutory Scheme & Financials</strong>
                                            <span>You're here</span>
                                        </div>
                                    </div>

                                    <div className="profile-step-line"></div>

                                    <div className="profile-step">
                                        <div className="profile-step-icon">⌖</div>
                                        <div>
                                            <strong>Channel Partner Discovery</strong>
                                            <span>Next step</span>
                                        </div>
                                    </div>

                                    <div className="profile-step-line"></div>

                                    <div className="profile-step">
                                        <div className="profile-step-icon">📄</div>
                                        <div>
                                            <strong>Consolidated Action Plan</strong>
                                            <span>Final step</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-tip-card">
                                <span className="tip-label">"NO WRONG DOOR" PRINCIPLE</span>
                                <h4>Auditable Decision Making</h4>
                                <p>
                                    All recommendations and calculations are computed deterministically under NSFDC guidelines. If you switch to the alternative scheme, repayment estimates recalculate dynamically.
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
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
                    National Scheduled Castes Finance and Development Corporation • Prototype
                </div>
            </footer>
        </div>
    )
}

export default Result