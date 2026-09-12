import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PartnerMap from '../components/PartnerMap'
import { SAMPLE_PARTNERS } from '../mock/samplePartners'
import { getPartners } from '../services/api'
import Navbar from '../components/Navbar'
import AudioNarrator from '../components/AudioNarrator'
import { useAccessibility } from '../context/AccessibilityContext'
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
    const [partnersList, setPartnersList] = useState([])
    const [loading, setLoading] = useState(true)

    // Trigger Leaflet Map Resize after mount so tiles load automatically
    useEffect(() => {
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        let scheme = null
        let profile = null

        const storedScheme = sessionStorage.getItem('sahay_selected_scheme')
        if (storedScheme) {
            try {
                scheme = JSON.parse(storedScheme)
                setSelectedScheme(scheme)
            } catch (err) {
                console.error('Failed to parse sahay_selected_scheme', err)
            }
        }

        const storedProfile = sessionStorage.getItem('sahay_profile')
        if (storedProfile) {
            try {
                profile = JSON.parse(storedProfile)
                setProfileData(profile)
            } catch (err) {
                console.error('Failed to parse sahay_profile', err)
            }
        }

        // Fetch live partners from backend
        async function fetchLivePartners() {
            setLoading(true)
            const state = profile?.state || 'Gujarat'
            const district = sanitizeDistrict(profile?.district)
            const scheme_id = scheme?.id || 'term_loan'
            const lat = profile?.latitude || 22.3039
            const lon = profile?.longitude || 70.8022

            try {
                const res = await getPartners({ state, district, scheme_id, lat, lon })
                if (res && res.partners && res.partners.length > 0) {
                    setPartnersList(res.partners)
                    setSelectedPartner(res.partners[0])
                    sessionStorage.setItem('sahay_selected_partner', JSON.stringify(res.partners[0]))
                } else {
                    setPartnersList(SAMPLE_PARTNERS)
                    setSelectedPartner(SAMPLE_PARTNERS[0])
                    sessionStorage.setItem('sahay_selected_partner', JSON.stringify(SAMPLE_PARTNERS[0]))
                }
            } catch (err) {
                console.warn('Backend partners query failed, using offline partners data:', err)
                setPartnersList(SAMPLE_PARTNERS)
                setSelectedPartner(SAMPLE_PARTNERS[0])
                sessionStorage.setItem('sahay_selected_partner', JSON.stringify(SAMPLE_PARTNERS[0]))
            } finally {
                setLoading(false)
            }
        }

        fetchLivePartners()
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

    const { t, tTerm, language, sahajMode } = useAccessibility() || {
        t: (k) => k,
        tTerm: (s, p) => s,
        language: 'en',
        sahajMode: true
    }

    const getAudioText = () => {
        return `Find your nearest official State Channelising Agency and partner bank branch. GSCDC Rajkot is authorized to disburse concessional loans for your scheme. Never pay any fee or commission to middlemen — this government service is completely free.`
    }

    return (
        <div className="profile-page">
            {/* ================= NAVBAR ================= */}
            <Navbar />

            {/* ================= MAIN WORKSPACE ================= */}
            <main style={{ maxWidth: '1420px', margin: '0 auto', padding: '30px 4% 60px' }}>
                {/* Context & Scheme Indicator Bar */}
                <div
                    className="profile-form-card"
                    style={{
                        marginBottom: '16px',
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
                            <span>{t('step3of4')}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#17231d', fontWeight: '600' }}>
                            {selectedScheme ? (
                                <span>{t('activeScheme')}: <strong style={{ color: 'var(--green)' }}>{selectedScheme.name}</strong></span>
                            ) : (
                                <span>{t('activeScheme')}: <strong>Term Loan Scheme (NSFDC)</strong></span>
                            )}
                            {profileData && (
                                <span style={{ marginLeft: '12px', color: '#68736d' }}>
                                    • {t('servicingDistrict')}: <strong>{sanitizeDistrict(profileData.district)}, {profileData.state || 'Gujarat'}</strong>
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
                            {t('changeScheme')}
                        </button>

                        <button
                            type="button"
                            className="primary-btn"
                            style={{ padding: '7px 14px', fontSize: '12px' }}
                            onClick={handleProceedToSummary}
                        >
                            {t('proceedToSummary')}
                        </button>
                    </div>
                </div>

                {/* Priority 5: Anti-Middleman Shield Banner */}
                <div
                    style={{
                        marginBottom: '16px',
                        padding: '14px 20px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
                        border: '1.5px solid #fecaca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px',
                        boxShadow: '0 4px 14px rgba(220, 38, 38, 0.06)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            fontSize: '26px',
                            background: '#ffffff',
                            borderRadius: '50%',
                            width: '46px',
                            height: '46px',
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
                        <AudioNarrator text={getAudioText()} label={t('readAloud')} />
                        <span style={{ fontSize: '11px', color: '#b91c1c', background: '#ffffff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fecaca', fontWeight: 600 }}>
                            📞 Toll-Free: 1800-11-2001
                        </span>
                    </div>
                </div>

                {/* DL-007 Lineage & Prototype Transparency Banner */}
                <div
                    style={{
                        marginBottom: '20px',
                        padding: '10px 18px',
                        borderRadius: '8px',
                        background: '#eff8f3',
                        border: '1px solid #c8e9d6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                        fontSize: '12px',
                        color: '#1a5c38'
                    }}
                >
                    <div>
                        <strong>Geospatial Channel Partner Network:</strong> Filtered by accredited State Channelising Agencies (SCAs) and servicing banks in your district.
                    </div>
                    <span style={{ fontSize: '11px', color: '#3d7d59', background: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #c8e9d6' }}>
                        Prototype Notice: Branch liquidity metrics are illustrative mocks awaiting live CBS/Jan Samarth API sync (DL-007)
                    </span>
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

                        /* Left sidebar: fixed height + vertical scroll on card list */
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

                        /* Popup detail card */
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
                        partners={partnersList.length > 0 ? partnersList : SAMPLE_PARTNERS}
                        height="760px"
                        autoLocate={false}
                        defaultCenter={{ latitude: 22.3039, longitude: 70.8022 }}
                        defaultZoom={13}
                        title="Locate your nearest servicing Channel Partner."
                        subtitle="Verified State Channelising Agencies (SCAs) and Bank Branches authorized for your scheme."
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                    <span className="secure-mark">{t('selectedPartnerBadge')}</span>
                                    <span className="pl-verified">Authorized Agency</span>
                                    {selectedPartner.fund_available !== false && selectedPartner.no_overdues !== false && (
                                        <span style={{ fontSize: '11px', color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                            🛡️ {sahajMode ? t('sahajSafeOffice') : t('activeLendingQuota')} • {selectedPartner.npa_percentage != null ? `${selectedPartner.npa_percentage}% NPA` : t('cleanRecoveryAudit')}
                                        </span>
                                    )}
                                </div>
                                <h3 style={{ margin: '2px 0', fontSize: '18px', fontFamily: 'Manrope, sans-serif' }}>
                                    {selectedPartner.name}
                                </h3>
                                <p style={{ color: '#48554d', fontSize: '13px', margin: '4px 0 0' }}>
                                    {selectedPartner.address || `${selectedPartner.district}, ${selectedPartner.state}`}
                                    {selectedPartner.phone && ` • Tel: ${selectedPartner.phone}`}
                                    {selectedPartner.distance_km != null && ` • ${selectedPartner.distance_km} km away`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="primary-btn profile-submit"
                                onClick={handleProceedToSummary}
                            >
                                {t('confirmPartnerAction')}
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