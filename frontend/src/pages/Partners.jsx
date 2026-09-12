import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PartnerMap from '../components/PartnerMap'
import { SAMPLE_PARTNERS } from '../mock/samplePartners'
import '../styles/layout.css'
import '../styles/components.css'
import '../styles/responsive.css'

function sanitizeDistrict(district) {
    if (!district || typeof district !== 'string') return 'Rajkot'
    const lower = district.trim().toLowerCase()
    if (!lower || lower.includes('ass') || lower === 'test' || lower.length < 2) {
        return 'Rajkot'
    }
    return district.trim()
}

function Partners() {
    const navigate = useNavigate()

    const [selectedScheme, setSelectedScheme] = useState(null)
    const [profileData, setProfileData] = useState(null)
    const [selectedPartner, setSelectedPartner] = useState(null)

    // Trigger Leaflet Map Resize after mount so tiles load automatically
    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const storedScheme = sessionStorage.getItem('sahay_selected_scheme')
        if (storedScheme) {
            try {
                setSelectedScheme(JSON.parse(storedScheme))
            } catch (err) {
                console.error('Failed to parse sahay_selected_scheme', err)
            }
        }

        const storedProfile = sessionStorage.getItem('sahay_profile')
        if (storedProfile) {
            try {
                setProfileData(JSON.parse(storedProfile))
            } catch (err) {
                console.error('Failed to parse sahay_profile', err)
            }
        }
    }, [])

    const handlePartnerSelect = (partner) => {
        setSelectedPartner(partner)
        sessionStorage.setItem('sahay_selected_partner', JSON.stringify(partner))
    }

    const handleProceedToSummary = () => {
        if (selectedPartner) {
            sessionStorage.setItem('sahay_selected_partner', JSON.stringify(selectedPartner))
        }
        navigate('/summary')
    }

    const handleBackToResults = () => {
        navigate('/result')
    }

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

            {/* ================= MAIN WORKSPACE ================= */}
            <main style={{ maxWidth: '1420px', margin: '0 auto', padding: '30px 4% 60px' }}>
                {/* Context & Scheme Indicator Bar */}
                <div
                    className="profile-form-card"
                    style={{
                        marginBottom: '20px',
                        padding: '16px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '15px',
                        background: '#ffffff'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <div className="progress-indicator" style={{ padding: '6px 10px' }}>
                            <span>STEP 03</span> <strong>of 04</strong>
                        </div>
                        <div style={{ fontSize: '13px', color: '#17231d', fontWeight: '600' }}>
                            {selectedScheme ? (
                                <span>Active Scheme: <strong style={{ color: 'var(--green)' }}>{selectedScheme.name}</strong></span>
                            ) : (
                                <span>Active Scheme: <strong>PM-AJAY (Default)</strong></span>
                            )}
                            {profileData && (
                                <span style={{ marginLeft: '12px', color: '#68736d' }}>
                                    • District: <strong>{sanitizeDistrict(profileData.district)}, {profileData.state || 'Gujarat'}</strong>
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            className="secondary-btn"
                            style={{ padding: '7px 12px', fontSize: '12px' }}
                            onClick={handleBackToResults}
                        >
                            Change Scheme
                        </button>

                        <button
                            type="button"
                            className="primary-btn"
                            style={{ padding: '7px 14px', fontSize: '12px' }}
                            onClick={handleProceedToSummary}
                        >
                            Proceed to Summary →
                        </button>
                    </div>
                </div>

                {/* Pre-built PartnerMap Widget inside Page Wrapper */}
                <div className="partner-map-page-wrapper" style={{ marginBottom: '30px', position: 'relative' }}>
                    <style>{`
                        /* Contain partner map root & workspace cleanly without footer spill */
                        .partner-map-page-wrapper .pl-root {
                            overflow: hidden !important;
                            border-radius: 14px !important;
                            box-shadow: 0 18px 55px rgba(21, 53, 38, 0.1) !important;
                        }
                        .partner-map-page-wrapper .pl-workspace {
                            overflow: hidden !important;
                            border-radius: 12px !important;
                            margin: 20px !important;
                            height: 720px !important;
                        }
                        .partner-map-page-wrapper .pl-map-wrap {
                            position: relative !important;
                            overflow: hidden !important;
                        }

                        /* ── Left sidebar: fixed height + vertical scroll on card list ── */
                        .partner-map-page-wrapper .pl-sidebar {
                            display: flex !important;
                            flex-direction: column !important;
                            height: 100% !important;
                            overflow: hidden !important;
                        }

                        /* Search input row stays fixed */
                        .partner-map-page-wrapper .pl-sidebar__search {
                            flex: 0 0 auto !important;
                        }

                        /* Filter chips row: horizontal scroll, no wrap */
                        .partner-map-page-wrapper .pl-filters {
                            display: flex !important;
                            flex-wrap: nowrap !important;
                            overflow-x: auto !important;
                            overflow-y: hidden !important;
                            gap: 8px !important;
                            padding-bottom: 6px !important;
                            flex: 0 0 auto !important;
                            scrollbar-width: thin !important;
                            scrollbar-color: #087a4d #f2f4f7 !important;
                        }
                        .partner-map-page-wrapper .pl-filters::-webkit-scrollbar {
                            height: 4px !important;
                        }
                        .partner-map-page-wrapper .pl-filters::-webkit-scrollbar-thumb {
                            background-color: #087a4d !important;
                            border-radius: 4px !important;
                        }
                        .partner-map-page-wrapper .pl-filters button,
                        .partner-map-page-wrapper .pl-filters .pl-filter-btn {
                            flex-shrink: 0 !important;
                            white-space: nowrap !important;
                        }

                        /* Partner cards list: vertical scroll */
                        .partner-map-page-wrapper .pl-list {
                            flex: 1 1 auto !important;
                            overflow-y: auto !important;
                            overflow-x: hidden !important;
                            min-height: 0 !important;
                            padding-right: 4px !important;
                            scrollbar-width: thin !important;
                            scrollbar-color: #087a4d #f2f4f7 !important;
                        }
                        .partner-map-page-wrapper .pl-list::-webkit-scrollbar {
                            width: 5px !important;
                        }
                        .partner-map-page-wrapper .pl-list::-webkit-scrollbar-thumb {
                            background-color: #087a4d !important;
                            border-radius: 4px !important;
                        }
                        .partner-map-page-wrapper .pl-list::-webkit-scrollbar-track {
                            background-color: #f2f4f7 !important;
                        }

                        /* ── Popup detail card ── */
                        .partner-map-page-wrapper .pl-detail {
                            position: absolute !important;
                            z-index: 1000 !important;
                            bottom: 18px !important;
                            right: 18px !important;
                            width: min(380px, calc(100% - 36px)) !important;
                            max-height: calc(100% - 36px) !important;
                            display: flex !important;
                            flex-direction: column !important;
                            border-radius: 12px !important;
                            overflow: hidden !important;
                            color: #344054 !important;
                            background: rgba(255, 255, 255, 0.98) !important;
                            border: 1px solid rgba(21, 53, 38, 0.15) !important;
                            box-shadow: 0 16px 48px rgba(21, 53, 38, 0.22) !important;
                            backdrop-filter: blur(16px) !important;
                        }
                        .partner-map-page-wrapper .pl-detail__header {
                            flex: 0 0 auto !important;
                            background: #ffffff !important;
                            border-bottom: 1px solid #eaecf0 !important;
                            padding: 14px 17px 12px !important;
                        }
                        .partner-map-page-wrapper .pl-detail__body {
                            flex: 1 1 auto !important;
                            min-height: 0 !important;
                            max-height: 260px !important;
                            overflow-y: auto !important;
                            overflow-x: hidden !important;
                            padding: 12px 17px !important;
                            scrollbar-width: thin !important;
                            scrollbar-color: var(--pl-brand, #087a4d) #f2f4f7 !important;
                        }
                        .partner-map-page-wrapper .pl-detail__body::-webkit-scrollbar {
                            width: 6px !important;
                        }
                        .partner-map-page-wrapper .pl-detail__body::-webkit-scrollbar-thumb {
                            background-color: var(--pl-brand, #087a4d) !important;
                            border-radius: 4px !important;
                        }
                        .partner-map-page-wrapper .pl-detail__body::-webkit-scrollbar-track {
                            background-color: #f2f4f7 !important;
                        }
                        .partner-map-page-wrapper .pl-detail__actions {
                            flex: 0 0 auto !important;
                            background: #ffffff !important;
                            border-top: 1px solid #eaecf0 !important;
                            padding: 10px 17px 14px !important;
                        }
                        .partner-map-page-wrapper .leaflet-popup {
                            z-index: 950 !important;
                        }
                    `}</style>

                    <PartnerMap
                        partners={SAMPLE_PARTNERS}
                        height="760px"
                        autoLocate={false}
                        defaultCenter={{ latitude: 22.3039, longitude: 70.8022 }}
                        defaultZoom={13}
                        title="Find the right partner near you."
                        subtitle="Your recommended scheme, verified offices, and the clearest next step—all in one place."
                        onPartnerSelect={handlePartnerSelect}
                        onViewDetails={(partner) => {
                            handlePartnerSelect(partner)
                        }}
                    />
                </div>

                {/* Selected Partner Highlight & Next Step Bar */}
                {selectedPartner && (
                    <div
                        className="profile-form-card"
                        style={{
                            padding: '20px 24px',
                            borderColor: 'var(--green)',
                            boxShadow: '0 12px 35px rgba(23, 107, 77, 0.12)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span className="secure-mark">✓ SELECTED PARTNER OFFICE</span>
                                    {selectedPartner.verified && <span className="pl-verified">Authorized Partner</span>}
                                </div>
                                <h3 style={{ margin: '2px 0', fontSize: '17px', fontFamily: 'Manrope, sans-serif' }}>
                                    {selectedPartner.name}
                                </h3>
                                <p style={{ color: '#68736d', fontSize: '12px', margin: 0 }}>
                                    {selectedPartner.address || `${selectedPartner.district}, ${selectedPartner.state}`}
                                    {selectedPartner.phone && ` • Tel: ${selectedPartner.phone}`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="primary-btn profile-submit"
                                onClick={handleProceedToSummary}
                            >
                                Confirm Partner & View Summary
                                <span className="arrow">→</span>
                            </button>
                        </div>
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
                    Guidance platform • Prototype
                </div>
            </footer>
        </div>
    )
}

export default Partners