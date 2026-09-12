import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SAMPLE_SCHEMES } from '../mock/sampleRecommendation'
import '../styles/layout.css'
import '../styles/components.css'
import '../styles/responsive.css'

function Result() {
    const navigate = useNavigate()

    const [profileData, setProfileData] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [subsidyFilter, setSubsidyFilter] = useState('All')
    const [sortBy, setSortBy] = useState('matchScore')
    const [expandedSchemeId, setExpandedSchemeId] = useState(null)

    // Load stored profile from sessionStorage on mount
    useEffect(() => {
        const storedProfile = sessionStorage.getItem('sahay_profile')
        if (storedProfile) {
            try {
                const parsed = JSON.parse(storedProfile)
                setProfileData(parsed)
            } catch (err) {
                console.error('Failed to parse sahay_profile', err)
            }
        }
    }, [])

    const handleSelectScheme = (scheme) => {
        sessionStorage.setItem('sahay_selected_scheme', JSON.stringify(scheme))
        navigate('/partners')
    }

    const handleEditProfile = () => {
        navigate('/profile')
    }

    const toggleExpandScheme = (id) => {
        setExpandedSchemeId((prev) => (prev === id ? null : id))
    }

    // Dynamic filtering and sorting
    const filteredSchemes = SAMPLE_SCHEMES.map((scheme) => {
        let score = scheme.matchScore

        // Boost score if scheme purpose matches profile purpose
        if (profileData) {
            if (profileData.purpose === 'business' && scheme.category === 'Business') {
                score = Math.min(99, score + 4)
            }
            if (profileData.purpose === 'education' && scheme.category === 'Education') {
                score = Math.min(99, score + 8)
            }
            if (profileData.activity_type && scheme.suitableActivities.includes(profileData.activity_type)) {
                score = Math.min(99, score + 3)
            }
        }

        return { ...scheme, matchScore: score }
    }).filter((scheme) => {
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            const matchName = scheme.name.toLowerCase().includes(query)
            const matchCategory = scheme.categoryLabel.toLowerCase().includes(query)
            const matchBenefits = scheme.keyBenefits.some((b) => b.toLowerCase().includes(query))
            if (!matchName && !matchCategory && !matchBenefits) {
                return false
            }
        }

        // Category filter
        if (categoryFilter !== 'All') {
            if (categoryFilter === 'Business' && scheme.category !== 'Business') return false
            if (categoryFilter === 'Education' && scheme.category !== 'Education') return false
            if (categoryFilter === 'Small Business' && scheme.category !== 'Small Business') return false
        }

        // Subsidy filter
        if (subsidyFilter !== 'All') {
            const minSubsidy = Number(subsidyFilter)
            if (scheme.subsidyPercent < minSubsidy) return false
        }

        return true
    }).sort((a, b) => {
        if (sortBy === 'matchScore') {
            return b.matchScore - a.matchScore
        }
        if (sortBy === 'loanHighToLow') {
            return b.maxLoanAmount - a.maxLoanAmount
        }
        if (sortBy === 'loanLowToHigh') {
            return a.maxLoanAmount - b.maxLoanAmount
        }
        if (sortBy === 'subsidyHighToLow') {
            return b.subsidyPercent - a.subsidyPercent
        }
        return 0
    })

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
                            RECOMMENDED FOR YOU
                        </span>
                        <h1>
                            Suitable Schemes
                            <br />
                            <span>for your profile.</span>
                        </h1>
                        <p>
                            Based on your profile details, here are the government schemes and financial support options that best fit your need.
                        </p>
                    </div>

                    <div className="progress-indicator">
                        <span>STEP 02</span>
                        <strong>of 04</strong>
                    </div>
                </div>

                {/* Profile Summary Context Banner */}
                {profileData && (
                    <div className="profile-form-card" style={{ marginBottom: '25px', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', background: '#fbfcfb' }}>
                        <div>
                            <span className="small-label" style={{ marginBottom: '4px' }}>YOUR CURRENT PROFILE</span>
                            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '13px', color: '#17231d', fontWeight: '600', marginTop: '4px' }}>
                                <span>Income: <strong>₹{Number(profileData.annual_income || 0).toLocaleString('en-IN')}</strong></span>
                                <span>•</span>
                                <span>Purpose: <strong style={{ textTransform: 'capitalize' }}>{profileData.purpose || 'Not specified'}</strong></span>
                                <span>•</span>
                                <span>Cost: <strong>₹{Number(profileData.project_cost || 0).toLocaleString('en-IN')}</strong></span>
                                <span>•</span>
                                <span>Location: <strong>{profileData.district || 'District'}, {profileData.state || 'State'}</strong></span>
                                {profileData.has_sc_certificate === 'true' && (
                                    <>
                                        <span>•</span>
                                        <span className="pl-verified">✓ SC Certificate</span>
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
                            Edit Profile
                        </button>
                    </div>
                )}

                {/* Controls & Filter Bar */}
                <div className="profile-form-card" style={{ marginBottom: '30px', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Search & Sort Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '16px', alignItems: 'center' }}>
                            <div className="pl-search-wrap" style={{ margin: 0 }}>
                                <span>🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search schemes by name, category, or benefit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="pl-icon-button"
                                        onClick={() => setSearchQuery('')}
                                        aria-label="Clear search"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Sort Dropdown */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#48554d', whiteSpace: 'nowrap' }}>
                                    Sort by:
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ height: '42px', minWidth: '180px', borderRadius: '9px', border: '1px solid var(--line)', padding: '0 12px', fontSize: '12px', fontWeight: 600 }}
                                >
                                    <option value="matchScore">Highest Match Score</option>
                                    <option value="loanHighToLow">Loan Amount: High to Low</option>
                                    <option value="loanLowToHigh">Loan Amount: Low to High</option>
                                    <option value="subsidyHighToLow">Subsidy %: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Filter Chips & Controls Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
<div className="d-flex flex-nowrap overflow-x-auto pb-2 gap-2">
    <span className="sub-label" style={{ margin: 0 }}>Category:</span>
    <div className="pl-filters" style={{ padding: 0 }}>
        {['All', 'Business', 'Education', 'Small Business'].map((cat) => (
            <button
                key={cat}
                type="button"
                className={`text-nowrap ${categoryFilter === cat ? 'is-active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
            >
                {cat}
            </button>
        ))}
    </div>
</div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="sub-label" style={{ margin: 0 }}>Subsidy:</span>
                                <select
                                    value={subsidyFilter}
                                    onChange={(e) => setSubsidyFilter(e.target.value)}
                                    style={{ height: '36px', borderRadius: '8px', border: '1px solid var(--line)', padding: '0 10px', fontSize: '11px', fontWeight: 600 }}
                                >
                                    <option value="All">All Subsidies</option>
                                    <option value="30">30% or higher</option>
                                    <option value="20">20% or higher</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Two-Column Layout */}
                <div className="profile-layout">
                    {/* Left Column: Scheme Cards List */}
                    <div className="d-flex flex-column" style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#68736d' }}>
                                Showing <strong>{filteredSchemes.length}</strong> scheme recommendation{filteredSchemes.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                          <div style={{ flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden', minHeight: 0, paddingRight: '6px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {filteredSchemes.length === 0 ? (
                            <div className="profile-form-card pl-empty">
                                <span>🔍</span>
                                <strong>No schemes match your criteria</strong>
                                <p>Try clearing your search keyword or relaxing category filters.</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('')
                                        setCategoryFilter('All')
                                        setSubsidyFilter('All')
                                    }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            filteredSchemes.map((scheme, index) => {
                                const isExpanded = expandedSchemeId === scheme.id

                                return (
                                    <div
                                        key={scheme.id}
                                        className="profile-form-card"
                                        style={{
                                            borderColor: scheme.isTopMatch || index === 0 ? 'var(--green)' : 'var(--line)',
                                            boxShadow: scheme.isTopMatch || index === 0 ? '0 12px 35px rgba(23, 107, 77, 0.12)' : undefined
                                        }}
                                    >
                                        {/* Card Header Section */}
                                        <div className="form-section" style={{ gridTemplateColumns: 'auto 1fr', alignItems: 'start' }}>
                                            <div
                                                className="pl-card__number"
                                                style={{
                                                    background: scheme.isTopMatch || index === 0 ? 'var(--green)' : '#e4f3ea',
                                                    color: scheme.isTopMatch || index === 0 ? '#fff' : 'var(--pl-brand-dark)',
                                                    width: '40px',
                                                    height: '40px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                0{index + 1}
                                            </div>

                                            <div className="field-content">
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <span className="pl-scheme-chip">
                                                            {scheme.categoryLabel}
                                                        </span>
                                                        <span className="pl-scheme-chip" style={{ background: '#e5f0e9', color: 'var(--green-dark)' }}>
                                                            {scheme.subsidyPercent}% Subsidy
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span className="eyebrow" style={{ margin: 0, padding: '4px 10px', fontSize: '11px' }}>
                                                            <span className="eyebrow-dot"></span>
                                                            {scheme.matchScore}% Match
                                                        </span>
                                                    </div>
                                                </div>

                                                <label style={{ fontSize: '18px', lineHeight: '1.3' }}>
                                                    {scheme.name}
                                                </label>

                                                <p className="field-help" style={{ marginBottom: '14px', marginTop: '6px' }}>
                                                    {scheme.summary}
                                                </p>

                                                {/* Key Amount Summary Grid */}
                                                <div className="choice-grid" style={{ maxWidth: '100%', marginBottom: '15px' }}>
                                                    <div className="choice-button" style={{ cursor: 'default' }}>
                                                        <span className="choice-icon" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>
                                                            ₹
                                                        </span>
                                                        <div>
                                                            <div style={{ fontSize: '9px', color: '#68736d', textTransform: 'uppercase' }}>Loan Range</div>
                                                            <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{scheme.loanAmountText}</strong>
                                                        </div>
                                                    </div>

                                                    <div className="choice-button" style={{ cursor: 'default' }}>
                                                        <span className="choice-icon" style={{ background: '#fef3f2', color: '#b42318' }}>
                                                            ✦
                                                        </span>
                                                        <div>
                                                            <div style={{ fontSize: '9px', color: '#68736d', textTransform: 'uppercase' }}>Financial Assistance</div>
                                                            <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{scheme.subsidyAmountText}</strong>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Key Benefits Bullet List */}
                                                <div style={{ marginTop: '15px' }}>
                                                    <strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px', color: '#17231d' }}>
                                                        Key Scheme Benefits:
                                                    </strong>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '6px' }}>
                                                        {scheme.keyBenefits.map((benefit, i) => (
                                                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#48554d' }}>
                                                                <span className="secure-mark" style={{ marginTop: '2px' }}>✓</span>
                                                                <span>{benefit}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Expanded Eligibility Details */}
                                                {isExpanded && (
                                                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--line)' }}>
                                                        <strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px', color: '#17231d' }}>
                                                            Eligibility Requirements:
                                                        </strong>
                                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '6px' }}>
                                                            {scheme.eligibilityCriteria.map((req, i) => (
                                                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: '#68736d' }}>
                                                                    <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>•</span>
                                                                    <span>{req}</span>
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        <div className="pl-match-note" style={{ marginTop: '12px' }}>
                                                            <span>ℹ</span>
                                                            <p>
                                                                <strong>Why this scheme fits:</strong>
                                                                <span>
                                                                    Matches target purpose ({scheme.categoryLabel}) with {scheme.partnerCount} active channel partners ready to process applications in your region.
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Footer Actions */}
                                        <div className="form-footer">
                                            <div>
                                                <span className="secure-mark">✓</span>
                                                <span>
                                                    {scheme.partnerCount} Channel Partners Available
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    type="button"
                                                    className="secondary-btn"
                                                    style={{ padding: '10px 16px', fontSize: '12px' }}
                                                    onClick={() => toggleExpandScheme(scheme.id)}
                                                >
                                                    {isExpanded ? 'Hide Details' : 'Eligibility & Details'}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="primary-btn profile-submit"
                                                    onClick={() => handleSelectScheme(scheme)}
                                                >
                                                    View Partners
                                                    <span className="arrow">→</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                                              </div>
                        </div>

                    {/* Right Column: Journey & Guidance Sidebar */}
                    <aside className="profile-sidebar">
                        {/* Journey Card */}
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
                                        <strong>Tell us your need</strong>
                                        <span>Completed</span>
                                    </div>
                                </div>

                                <div className="profile-step-line"></div>

                                <div className="profile-step current">
                                    <div className="profile-step-icon">◎</div>
                                    <div>
                                        <strong>Find a suitable scheme</strong>
                                        <span>You're here</span>
                                    </div>
                                </div>

                                <div className="profile-step-line"></div>

                                <div className="profile-step">
                                    <div className="profile-step-icon">₹</div>
                                    <div>
                                        <strong>Understand the money</strong>
                                        <span>Next step</span>
                                    </div>
                                </div>

                                <div className="profile-step-line"></div>

                                <div className="profile-step">
                                    <div className="profile-step-icon">⌖</div>
                                    <div>
                                        <strong>Find a suitable partner</strong>
                                        <span>Final step</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guidance Tip Card */}
                        <div className="profile-tip-card">
                            <span className="tip-label">GUIDANCE NOTE</span>
                            <h4>No Wrong Door</h4>
                            <p>
                                Select any recommended scheme to view verified Channel Partners (Banks, SC-ST Corporations, and Facilitation Centers) near your location.
                            </p>
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

export default Result