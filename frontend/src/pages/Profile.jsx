import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AudioNarrator from '../components/AudioNarrator'
import { useAccessibility } from '../context/AccessibilityContext'
import '../styles/layout.css'
import '../styles/components.css'
import '../styles/responsive.css'

function Profile() {
    const navigate = useNavigate()
    const { t, language } = useAccessibility()

    const [formData, setFormData] = useState({
        has_sc_certificate: '',
        gender: '',
        annual_income: '',
        purpose: '',
        project_cost: '',
        activity_type: '',
        state: '',
        district: '',
    })

    const [error, setError] = useState('')

    // Hydrate existing profile data from sessionStorage if user clicked "Modify Profile"
    useState(() => {
        try {
            const saved = sessionStorage.getItem('sahay_profile')
            if (saved) {
                const parsed = JSON.parse(saved)
                setFormData((prev) => ({ ...prev, ...parsed }))
            }
        } catch (e) {
            console.error('Could not load existing profile', e)
        }
    })

    const handleChange = (field, value) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }))

        setError('')
    }

    const handleResetForm = () => {
        try {
            sessionStorage.removeItem('sahay_profile')
            sessionStorage.removeItem('sahay_selected_scheme')
            sessionStorage.removeItem('sahay_recommendation')
            sessionStorage.removeItem('sahay_calculation')
            sessionStorage.removeItem('sahay_selected_partner')
        } catch (e) {
            console.warn('Could not reset session', e)
        }
        setFormData({
            has_sc_certificate: '',
            gender: '',
            annual_income: '',
            purpose: '',
            project_cost: '',
            activity_type: '',
            state: '',
            district: '',
        })
        setError('')
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (
            !formData.has_sc_certificate ||
            !formData.gender ||
            !formData.annual_income ||
            !formData.purpose ||
            !formData.project_cost ||
            !formData.activity_type ||
            !formData.state ||
            !formData.district
        ) {
            setError('Please complete all the fields before continuing.')
            return
        }

        // Persist form data with coordinates to sessionStorage so Result/Partners pages can read it
        const payload = {
            ...formData,
            latitude: formData.latitude || (String(formData.district).toLowerCase().trim() === 'rajkot' ? 22.3039 : undefined),
            longitude: formData.longitude || (String(formData.district).toLowerCase().trim() === 'rajkot' ? 70.8022 : undefined),
        }
        sessionStorage.setItem('sahay_profile', JSON.stringify(payload))
        navigate('/result')
    }

    const narrationText = 'Welcome to Sahay. Please provide your SC certificate status, gender, household income, purpose, and project cost to evaluate your scheme.'

    return (
        <div className="profile-page">
            <Navbar />

            {/* ================= PROFILE ================= */}
            <main className="profile-main">

                <div className="profile-heading">
                    <div>
                        <span className="small-label">
                            YOUR PROFILE
                        </span>
                        <h1>
                            Tell us about your need.
                        </h1>
                        <p>
                            {t('profileSubtitle')}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div className="progress-indicator">
                            <span>STEP 01</span>
                            <strong>of 04</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AudioNarrator text={narrationText} />
                            <button
                                type="button"
                                onClick={handleResetForm}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    background: '#ffffff',
                                    color: '#4b5563',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                                title="Clear all fields to start fresh"
                            >
                                <span>🔄</span>
                                <span>Reset Form</span>
                            </button>
                        </div>
                    </div>
                </div>


                <div className="profile-layout">

                    {/* ================= FORM CARD ================= */}
                    <form
                        className="profile-form-card"
                        onSubmit={handleSubmit}
                    >

                        {/* SC certificate */}
                        <div className="form-section">

                            <div className="field-number">
                                01
                            </div>

                            <div className="field-content">

                                <label>
                                    {t('secCertificate')}
                                </label>

                                <p className="field-help">
                                    {t('secCertHelp')}
                                </p>

                                <div className="choice-grid">

                                    <button
                                        type="button"
                                        className={`choice-button ${formData.has_sc_certificate === 'true'
                                            ? 'selected'
                                            : ''
                                            }`}
                                        aria-pressed={formData.has_sc_certificate === 'true'}
                                        onClick={() =>
                                            handleChange(
                                                'has_sc_certificate',
                                                'true'
                                            )
                                        }
                                    >
                                        <span className="choice-icon">
                                            ✓
                                        </span>

                                        <span>
                                            {t('certYes')}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className={`choice-button ${formData.has_sc_certificate === 'false'
                                            ? 'selected'
                                            : ''
                                            }`}
                                        aria-pressed={formData.has_sc_certificate === 'false'}
                                        onClick={() =>
                                            handleChange(
                                                'has_sc_certificate',
                                                'false'
                                            )
                                        }
                                    >
                                        <span className="choice-icon">
                                            —
                                        </span>

                                        <span>
                                            {t('certNo')}
                                        </span>
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* Gender */}
                        <div className="form-section">

                            <div className="field-number">
                                02
                            </div>

                            <div className="field-content">

                                <label>
                                    {t('secGender')}
                                </label>

                                <p className="field-help">
                                    {t('secGenderHelp')}
                                </p>

                                <div className="choice-grid choice-grid-3">

                                    <button
                                        type="button"
                                        className={`choice-button ${formData.gender === 'female'
                                            ? 'selected'
                                            : ''
                                            }`}
                                        aria-pressed={formData.gender === 'female'}
                                        onClick={() =>
                                            handleChange(
                                                'gender',
                                                'female'
                                            )
                                        }
                                    >
                                        <span className="choice-icon">
                                            👩
                                        </span>

                                        <span>
                                            {t('genderFemale')}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className={`choice-button ${formData.gender === 'male'
                                            ? 'selected'
                                            : ''
                                            }`}
                                        aria-pressed={formData.gender === 'male'}
                                        onClick={() =>
                                            handleChange(
                                                'gender',
                                                'male'
                                            )
                                        }
                                    >
                                        <span className="choice-icon">
                                            👨
                                        </span>

                                        <span>
                                            {t('genderMale')}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className={`choice-button ${formData.gender === 'other'
                                            ? 'selected'
                                            : ''
                                            }`}
                                        aria-pressed={formData.gender === 'other'}
                                        onClick={() =>
                                            handleChange(
                                                'gender',
                                                'other'
                                            )
                                        }
                                    >
                                        <span className="choice-icon">
                                            ⚧
                                        </span>

                                        <span>
                                            {t('genderOther')}
                                        </span>
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* Income */}
                        <div className="form-section">

                            <div className="field-number">
                                03
                            </div>

                            <div className="field-content">

                                <label htmlFor="annual-income">
                                    {t('secIncome')}
                                </label>

                                <p className="field-help">
                                    {t('secIncomeHelp')}
                                </p>

                                <div className="money-input">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        id="annual-income"
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 300000"
                                        value={formData.annual_income}
                                        onChange={(event) =>
                                            handleChange(
                                                'annual_income',
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* Purpose */}
                        <div className="form-section">

                            <div className="field-number">
                                04
                            </div>

                            <div className="field-content">

                                <label>
                                    {t('secPurpose')}
                                </label>

                                <p className="field-help">
                                    {t('secPurposeHelp')}
                                </p>

                                <div className="purpose-grid">

                                    <button
                                        type="button"
                                        className={`purpose-card ${formData.purpose === 'business'
                                            ? 'selected'
                                            : ''
                                            }`}
                                        aria-pressed={formData.purpose === 'business'}
                                        onClick={() =>
                                            handleChange(
                                                'purpose',
                                                'business'
                                            )
                                        }
                                    >
                                        <span className="purpose-icon">
                                            🏪
                                        </span>

                                        <strong>
                                            {t('purposeBusiness')}
                                        </strong>

                                        <small>
                                            {t('purposeBusinessDesc')}
                                        </small>
                                    </button>


                                    <button
                                        type="button"
                                        className={`purpose-card ${formData.purpose === 'education'
                                            ? 'selected'
                                            : ''
                                            }`}
                                        aria-pressed={formData.purpose === 'education'}
                                        onClick={() =>
                                            handleChange(
                                                'purpose',
                                                'education'
                                            )
                                        }
                                    >
                                        <span className="purpose-icon">
                                            🎓
                                        </span>

                                        <strong>
                                            {t('purposeEducation')}
                                        </strong>

                                        <small>
                                            {t('purposeEducationDesc')}
                                        </small>
                                    </button>

                                </div>

                            </div>

                        </div>


                        {/* Project cost */}
                        <div className="form-section">

                            <div className="field-number">
                                05
                            </div>

                            <div className="field-content">

                                <label htmlFor="project-cost">
                                    {t('secCost')}
                                </label>

                                <p className="field-help">
                                    {t('secCostHelp')}
                                </p>

                                <div className="money-input">

                                    <span>
                                        ₹
                                    </span>

                                    <input
                                        id="project-cost"
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 380000"
                                        value={formData.project_cost}
                                        onChange={(event) =>
                                            handleChange(
                                                'project_cost',
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* Activity */}
                        <div className="form-section">

                            <div className="field-number">
                                06
                            </div>

                            <div className="field-content">

                                <label htmlFor="activity-type">
                                    {t('secActivity')}
                                </label>

                                <p className="field-help">
                                    {t('secActivityHelp')}
                                </p>

                                <select
                                    id="activity-type"
                                    value={formData.activity_type}
                                    onChange={(event) =>
                                        handleChange(
                                            'activity_type',
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        -- Select an activity --
                                    </option>

                                    {formData.purpose === 'education' ? (
                                        <>
                                            <option value="vocational">
                                                🛠️ Vocational / ITI / Skill Course
                                            </option>
                                            <option value="polytechnic">
                                                📐 Polytechnic / Technical Diploma
                                            </option>
                                            <option value="btech">
                                                🎓 Engineering / Higher Degree
                                            </option>
                                            <option value="medical">
                                                🩺 Medical / Healthcare Degree
                                            </option>
                                            <option value="other">
                                                📚 Other Education Course
                                            </option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="dairy">
                                                🐄 Dairy Farming & Animal Husbandry
                                            </option>
                                            <option value="solar">
                                                ☀️ Solar & Green Enterprise
                                            </option>
                                            <option value="organic">
                                                🌱 Organic Farming & Bio-waste
                                            </option>
                                            <option value="agriculture">
                                                🌾 Agriculture & Allied Activities
                                            </option>
                                            <option value="small_business">
                                                🏪 Small Business / Retail Kirana Shop
                                            </option>
                                            <option value="service">
                                                ⚙️ Service Workshop / Repair Garage
                                            </option>
                                            <option value="other">
                                                💼 Other Business Venture
                                            </option>
                                        </>
                                    )}
                                </select>

                            </div>

                        </div>


                        {/* Location */}
                        <div className="form-section">

                            <div className="field-number">
                                07
                            </div>

                            <div className="field-content">

                                <label>
                                    {t('secLocation')}
                                </label>

                                <p className="field-help">
                                    {t('secLocationHelp')}
                                </p>

                                <div className="location-grid">

                                    <div>
                                        <label
                                            className="sub-label"
                                            htmlFor="state"
                                        >
                                            State
                                        </label>

                                        <input
                                            id="state"
                                            type="text"
                                            placeholder="e.g. Gujarat"
                                            value={formData.state}
                                            onChange={(event) =>
                                                handleChange(
                                                    'state',
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label
                                            className="sub-label"
                                            htmlFor="district"
                                        >
                                            District
                                        </label>

                                        <input
                                            id="district"
                                            type="text"
                                            placeholder="e.g. Rajkot"
                                            value={formData.district}
                                            onChange={(event) =>
                                                handleChange(
                                                    'district',
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* Error */}
                        {error && (
                            <div className="form-error">
                                <span>!</span>
                                {error}
                            </div>
                        )}


                        {/* Submit */}
                        <div className="form-footer">

                            <div>
                                <span className="secure-mark">
                                    ✓
                                </span>

                                <span>
                                    Your information is used for guidance.
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="primary-btn profile-submit"
                            >
                                {t('submit')}
                                <span className="arrow">
                                    →
                                </span>
                            </button>

                        </div>

                    </form>


                    {/* ================= JOURNEY SIDEBAR ================= */}
                    <aside className="profile-sidebar">

                        <div className="profile-journey-card">

                            <div className="journey-header">

                                <div>
                                    <span className="small-label">
                                        YOUR JOURNEY
                                    </span>

                                    <h3>
                                        From need to next step
                                    </h3>
                                </div>

                                <div className="journey-badge">
                                    01 / 04
                                </div>

                            </div>


                            <div className="profile-steps">

                                <div className="profile-step current">

                                    <div className="profile-step-icon">
                                        ✦
                                    </div>

                                    <div>
                                        <strong>
                                            Tell us your need
                                        </strong>

                                        <span>
                                            You're here
                                        </span>
                                    </div>

                                </div>


                                <div className="profile-step-line"></div>


                                <div className="profile-step">

                                    <div className="profile-step-icon">
                                        ◎
                                    </div>

                                    <div>
                                        <strong>
                                            Find a suitable scheme
                                        </strong>

                                        <span>
                                            Understand why it fits
                                        </span>
                                    </div>

                                </div>


                                <div className="profile-step-line"></div>


                                <div className="profile-step">

                                    <div className="profile-step-icon">
                                        ₹
                                    </div>

                                    <div>
                                        <strong>
                                            Understand the money
                                        </strong>

                                        <span>
                                            Loan estimate
                                        </span>
                                    </div>

                                </div>


                                <div className="profile-step-line"></div>


                                <div className="profile-step">

                                    <div className="profile-step-icon">
                                        ⌖
                                    </div>

                                    <div>
                                        <strong>
                                            Find a suitable partner
                                        </strong>

                                        <span>
                                            Nearby options
                                        </span>
                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="profile-tip-card">

                            <span className="tip-label">
                                A SMALL TIP
                            </span>

                            <h4>
                                You don't need to know
                                the scheme name.
                            </h4>

                            <p>
                                Just tell us what you're trying
                                to do. We'll guide you from there.
                            </p>

                        </div>

                    </aside>

                </div>

            </main>


            {/* ================= FOOTER ================= */}
            <footer className="footer">

                <div className="footer-brand">

                    <div className="brand-logo small">
                        S
                    </div>

                    <div>
                        <strong>
                            Sahay
                        </strong>

                        <span>
                            Scheme Guidance Platform
                        </span>
                    </div>

                </div>

                <div className="footer-note">
                    Guidance platform • Prototype
                </div>

            </footer>

        </div>
    )
}

export default Profile